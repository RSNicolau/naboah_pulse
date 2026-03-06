"""
Permission Engine — 5-layer validation cascade for AI skill execution.

Layers:
1. User permission — Does the triggering user have ai.skills.execute?
2. Role permission — Does the agent's role allow this skill category?
3. Department permission — Is the department active?
4. Agent permission — Is the skill in agent's skills or override list?
5. Daily limit — Has the agent exceeded max_executions_day?
"""

from datetime import datetime, date
from sqlmodel import Session, select, func
from pydantic import BaseModel
from typing import Optional

from models import Agent, AIRole, AIDepartment, AISkill, AIAgentExecution


class PermissionResult(BaseModel):
    allowed: bool
    blocked_by: Optional[str] = None  # user, role, department, agent, daily_limit
    reason: str
    checks: dict  # { user: bool, role: bool, department: bool, agent: bool, daily_limit: bool }


def check_permission(
    db: Session,
    agent_id: str,
    skill_id: str,
    user_id: str = "system",
    tenant_id: str = "naboah",
) -> PermissionResult:
    checks = {
        "user": False,
        "role": False,
        "department": False,
        "agent": False,
        "daily_limit": False,
    }

    # Load agent
    agent = db.get(Agent, agent_id)
    if not agent:
        return PermissionResult(
            allowed=False, blocked_by="agent",
            reason=f"Agent {agent_id} not found", checks=checks,
        )

    # Load skill
    skill = db.get(AISkill, skill_id)
    if not skill:
        return PermissionResult(
            allowed=False, blocked_by="agent",
            reason=f"Skill {skill_id} not found", checks=checks,
        )

    if not skill.is_active:
        return PermissionResult(
            allowed=False, blocked_by="agent",
            reason=f"Skill '{skill.name}' is inactive", checks=checks,
        )

    # ── Layer 1: User permission ──
    # In production, check user's CRMRole permissions for "ai.skills.execute"
    # For now, any authenticated user can trigger (user_id != empty)
    if not user_id:
        return PermissionResult(
            allowed=False, blocked_by="user",
            reason="No user context provided", checks=checks,
        )
    checks["user"] = True

    # ── Layer 2: Role permission ──
    if agent.role_id:
        role = db.get(AIRole, agent.role_id)
        if role:
            perms = role.permissions_json or []
            # Check for wildcard or specific category permission
            category_perm = f"ai.skills.{skill.category}"
            has_perm = (
                "ai.skills.*" in perms
                or category_perm in perms
                or "ai.*" in perms
            )
            if not has_perm:
                return PermissionResult(
                    allowed=False, blocked_by="role",
                    reason=f"Role '{role.name}' lacks permission '{category_perm}'",
                    checks=checks,
                )
    checks["role"] = True

    # ── Layer 3: Department permission ──
    if agent.department_id:
        dept = db.get(AIDepartment, agent.department_id)
        if dept and not dept.is_active:
            return PermissionResult(
                allowed=False, blocked_by="department",
                reason=f"Department '{dept.name}' is inactive",
                checks=checks,
            )
    checks["department"] = True

    # ── Layer 4: Agent skill access ──
    agent_skills = set(agent.skills_json or [])
    override_skills = set(agent.skill_override_json or [])
    all_agent_skills = agent_skills | override_skills

    # Check if agent has this skill's category or name in their skill list
    # Allow if agent has wildcard "*" or the specific skill category/name
    has_skill = (
        "*" in all_agent_skills
        or skill.category in all_agent_skills
        or skill.name in all_agent_skills
        or not all_agent_skills  # Empty = unrestricted
    )
    if not has_skill:
        return PermissionResult(
            allowed=False, blocked_by="agent",
            reason=f"Agent '{agent.name}' does not have skill '{skill.name}' assigned",
            checks=checks,
        )
    checks["agent"] = True

    # ── Layer 5: Daily execution limit ──
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_count = db.exec(
        select(func.count(AIAgentExecution.id)).where(
            AIAgentExecution.tenant_id == tenant_id,
            AIAgentExecution.agent_id == agent_id,
            AIAgentExecution.created_at >= today_start,
            AIAgentExecution.status != "blocked",
        )
    ).one()

    max_daily = agent.max_executions_day
    if agent.role_id:
        role = db.get(AIRole, agent.role_id)
        if role:
            max_daily = min(max_daily, role.max_executions_day)

    if today_count >= max_daily:
        return PermissionResult(
            allowed=False, blocked_by="daily_limit",
            reason=f"Agent exceeded daily limit ({today_count}/{max_daily})",
            checks=checks,
        )
    checks["daily_limit"] = True

    return PermissionResult(
        allowed=True, blocked_by=None,
        reason="All permission checks passed",
        checks=checks,
    )
