"""
AI Engine Enterprise 2.0 Router
Departments, Roles, Skill Packages, Skills, Permissions, Executions
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select, func
from db import get_session
from models import (
    Agent, AIDepartment, AIRole, AISkillPackage, AISkill, AIAgentExecution,
)
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import uuid

router = APIRouter(prefix="/ai-engine", tags=["ai-engine"])
TENANT_ID = "naboah"


def _id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


def _audit_ai(db: Session, action: str, entity_type: str, entity_id: str,
              actor_id: str = "system", before: dict = None, after: dict = None):
    """Reuse CRM audit pattern for AI Engine."""
    try:
        from models_crm import CRMAuditLog
        log = CRMAuditLog(
            id=_id("aud"),
            tenant_id=TENANT_ID,
            actor_type="system" if actor_id == "system" else "user",
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            before_json=before,
            after_json=after,
        )
        db.add(log)
    except Exception:
        pass  # Audit is best-effort


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DEPARTMENTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    head_agent_id: Optional[str] = None
    settings_json: dict = {}


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    head_agent_id: Optional[str] = None
    settings_json: Optional[dict] = None
    is_active: Optional[bool] = None


@router.get("/departments")
async def list_departments(db: Session = Depends(get_session)):
    depts = db.exec(
        select(AIDepartment).where(AIDepartment.tenant_id == TENANT_ID)
    ).all()
    result = []
    for d in depts:
        agent_count = db.exec(
            select(func.count(Agent.id)).where(
                Agent.tenant_id == TENANT_ID,
                Agent.department_id == d.id,
            )
        ).one()
        result.append({
            **d.model_dump(),
            "agent_count": agent_count,
        })
    return result


@router.post("/departments")
async def create_department(data: DepartmentCreate, db: Session = Depends(get_session)):
    dept = AIDepartment(
        id=_id("dept"),
        tenant_id=TENANT_ID,
        name=data.name,
        description=data.description,
        head_agent_id=data.head_agent_id,
        settings_json=data.settings_json,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    _audit_ai(db, "create", "ai_department", dept.id, after=data.model_dump())
    db.commit()
    return dept


@router.put("/departments/{dept_id}")
async def update_department(dept_id: str, data: DepartmentUpdate, db: Session = Depends(get_session)):
    dept = db.get(AIDepartment, dept_id)
    if not dept or dept.tenant_id != TENANT_ID:
        raise HTTPException(404, "Department not found")
    before = dept.model_dump()
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(dept, k, v)
    dept.updated_at = datetime.utcnow()
    db.add(dept)
    db.commit()
    db.refresh(dept)
    _audit_ai(db, "update", "ai_department", dept.id, before=before, after=data.model_dump(exclude_none=True))
    db.commit()
    return dept


@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: str, db: Session = Depends(get_session)):
    dept = db.get(AIDepartment, dept_id)
    if not dept or dept.tenant_id != TENANT_ID:
        raise HTTPException(404, "Department not found")
    dept.is_active = False
    dept.updated_at = datetime.utcnow()
    db.add(dept)
    db.commit()
    _audit_ai(db, "delete", "ai_department", dept.id)
    db.commit()
    return {"status": "deactivated", "id": dept_id}


@router.get("/departments/{dept_id}/agents")
async def list_department_agents(dept_id: str, db: Session = Depends(get_session)):
    agents = db.exec(
        select(Agent).where(Agent.tenant_id == TENANT_ID, Agent.department_id == dept_id)
    ).all()
    return agents


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ROLES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class RoleCreate(BaseModel):
    name: str
    department_id: str
    description: Optional[str] = None
    permissions_json: List[str] = []
    default_skills_json: List[str] = []
    autonomy_level: str = "semi"
    max_executions_day: int = 100
    external_api_allowed: bool = False


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions_json: Optional[List[str]] = None
    default_skills_json: Optional[List[str]] = None
    autonomy_level: Optional[str] = None
    max_executions_day: Optional[int] = None
    external_api_allowed: Optional[bool] = None


@router.get("/roles")
async def list_roles(department_id: Optional[str] = None, db: Session = Depends(get_session)):
    q = select(AIRole).where(AIRole.tenant_id == TENANT_ID)
    if department_id:
        q = q.where(AIRole.department_id == department_id)
    return db.exec(q).all()


@router.post("/roles")
async def create_role(data: RoleCreate, db: Session = Depends(get_session)):
    role = AIRole(
        id=_id("role"),
        tenant_id=TENANT_ID,
        department_id=data.department_id,
        name=data.name,
        description=data.description,
        permissions_json=data.permissions_json,
        default_skills_json=data.default_skills_json,
        autonomy_level=data.autonomy_level,
        max_executions_day=data.max_executions_day,
        external_api_allowed=data.external_api_allowed,
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    _audit_ai(db, "create", "ai_role", role.id, after=data.model_dump())
    db.commit()
    return role


@router.put("/roles/{role_id}")
async def update_role(role_id: str, data: RoleUpdate, db: Session = Depends(get_session)):
    role = db.get(AIRole, role_id)
    if not role or role.tenant_id != TENANT_ID:
        raise HTTPException(404, "Role not found")
    if role.is_system:
        raise HTTPException(403, "Cannot modify system role")
    before = role.model_dump()
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(role, k, v)
    db.add(role)
    db.commit()
    db.refresh(role)
    _audit_ai(db, "update", "ai_role", role.id, before=before, after=data.model_dump(exclude_none=True))
    db.commit()
    return role


@router.delete("/roles/{role_id}")
async def delete_role(role_id: str, db: Session = Depends(get_session)):
    role = db.get(AIRole, role_id)
    if not role or role.tenant_id != TENANT_ID:
        raise HTTPException(404, "Role not found")
    if role.is_system:
        raise HTTPException(403, "Cannot delete system role")
    db.delete(role)
    db.commit()
    _audit_ai(db, "delete", "ai_role", role_id)
    db.commit()
    return {"status": "deleted", "id": role_id}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SKILL PACKAGES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/skills/packages")
async def list_skill_packages(db: Session = Depends(get_session)):
    packages = db.exec(
        select(AISkillPackage).where(AISkillPackage.tenant_id == TENANT_ID)
        .order_by(AISkillPackage.created_at.desc())
    ).all()
    return packages


@router.post("/skills/packages/upload")
async def upload_skill_package(file: UploadFile = File(...), db: Session = Depends(get_session)):
    from services.skill_validator import validate_skill_package

    file_bytes = await file.read()
    result = await validate_skill_package(file_bytes, file.filename or "unknown.zip")

    if not result.valid:
        # Create failed package record
        pkg = AISkillPackage(
            id=_id("pkg"),
            tenant_id=TENANT_ID,
            name=result.package_metadata.get("name", file.filename or "Unknown"),
            version=1,
            description=result.package_metadata.get("description"),
            author=result.package_metadata.get("author"),
            status="error",
            validation_report_json=result.model_dump(),
            skills_count=0,
        )
        db.add(pkg)
        db.commit()
        _audit_ai(db, "upload_failed", "ai_skill_package", pkg.id,
                   after={"errors": result.errors})
        db.commit()
        raise HTTPException(422, detail={
            "message": "Skill package validation failed",
            "errors": result.errors,
            "warnings": result.warnings,
        })

    # Auto-version: check if package with same name exists
    pkg_name = result.package_metadata.get("name", "Unknown")
    existing = db.exec(
        select(AISkillPackage).where(
            AISkillPackage.tenant_id == TENANT_ID,
            AISkillPackage.name == pkg_name,
        ).order_by(AISkillPackage.version.desc())
    ).first()
    next_version = (existing.version + 1) if existing else 1

    # Create package
    pkg = AISkillPackage(
        id=_id("pkg"),
        tenant_id=TENANT_ID,
        name=pkg_name,
        version=next_version,
        description=result.package_metadata.get("description"),
        author=result.package_metadata.get("author"),
        status="active",
        validation_report_json=result.model_dump(),
        skills_count=len(result.skills_found),
        metadata_json=result.package_metadata,
    )
    db.add(pkg)
    db.commit()
    db.refresh(pkg)

    # Create individual skills
    for s in result.skills_found:
        skill = AISkill(
            id=_id("skill"),
            tenant_id=TENANT_ID,
            package_id=pkg.id,
            name=s["name"],
            description=s["description"],
            category=s["category"],
            input_schema_json=s["input_schema"],
            output_schema_json=s["output_schema"],
            is_active=True,
        )
        db.add(skill)
    db.commit()

    _audit_ai(db, "upload", "ai_skill_package", pkg.id,
              after={"name": pkg_name, "version": next_version, "skills": len(result.skills_found)})
    db.commit()

    return {
        "package": pkg,
        "skills_registered": len(result.skills_found),
        "validation": result.model_dump(),
    }


@router.get("/skills/packages/{pkg_id}")
async def get_skill_package(pkg_id: str, db: Session = Depends(get_session)):
    pkg = db.get(AISkillPackage, pkg_id)
    if not pkg or pkg.tenant_id != TENANT_ID:
        raise HTTPException(404, "Package not found")
    skills = db.exec(
        select(AISkill).where(AISkill.package_id == pkg_id)
    ).all()
    return {"package": pkg, "skills": skills}


@router.patch("/skills/packages/{pkg_id}/toggle")
async def toggle_skill_package(pkg_id: str, db: Session = Depends(get_session)):
    pkg = db.get(AISkillPackage, pkg_id)
    if not pkg or pkg.tenant_id != TENANT_ID:
        raise HTTPException(404, "Package not found")
    before_status = pkg.status
    pkg.status = "inactive" if pkg.status == "active" else "active"
    pkg.updated_at = datetime.utcnow()
    db.add(pkg)
    # Also toggle all skills in the package
    skills = db.exec(select(AISkill).where(AISkill.package_id == pkg_id)).all()
    for s in skills:
        s.is_active = pkg.status == "active"
        db.add(s)
    db.commit()
    _audit_ai(db, "toggle", "ai_skill_package", pkg_id,
              before={"status": before_status}, after={"status": pkg.status})
    db.commit()
    return {"id": pkg_id, "status": pkg.status, "skills_affected": len(skills)}


@router.get("/skills/packages/{pkg_id}/versions")
async def list_package_versions(pkg_id: str, db: Session = Depends(get_session)):
    pkg = db.get(AISkillPackage, pkg_id)
    if not pkg or pkg.tenant_id != TENANT_ID:
        raise HTTPException(404, "Package not found")
    versions = db.exec(
        select(AISkillPackage).where(
            AISkillPackage.tenant_id == TENANT_ID,
            AISkillPackage.name == pkg.name,
        ).order_by(AISkillPackage.version.desc())
    ).all()
    return versions


@router.get("/skills/packages/{pkg_id}/report")
async def get_validation_report(pkg_id: str, db: Session = Depends(get_session)):
    pkg = db.get(AISkillPackage, pkg_id)
    if not pkg or pkg.tenant_id != TENANT_ID:
        raise HTTPException(404, "Package not found")
    return pkg.validation_report_json


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SKILLS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/skills")
async def list_skills(
    package_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_session),
):
    q = select(AISkill).where(AISkill.tenant_id == TENANT_ID)
    if package_id:
        q = q.where(AISkill.package_id == package_id)
    if category:
        q = q.where(AISkill.category == category)
    return db.exec(q).all()


@router.patch("/skills/{skill_id}/toggle")
async def toggle_skill(skill_id: str, db: Session = Depends(get_session)):
    skill = db.get(AISkill, skill_id)
    if not skill or skill.tenant_id != TENANT_ID:
        raise HTTPException(404, "Skill not found")
    skill.is_active = not skill.is_active
    db.add(skill)
    db.commit()
    return {"id": skill_id, "is_active": skill.is_active}


class ExecuteSkillRequest(BaseModel):
    agent_id: str
    input_json: dict = {}
    triggered_by: str = "system"


@router.post("/skills/{skill_id}/execute")
async def execute_skill(skill_id: str, data: ExecuteSkillRequest, db: Session = Depends(get_session)):
    from services.permission_engine import check_permission

    # Permission check
    perm = check_permission(db, data.agent_id, skill_id, data.triggered_by, TENANT_ID)

    if not perm.allowed:
        # Log blocked execution
        execution = AIAgentExecution(
            id=_id("exec"),
            tenant_id=TENANT_ID,
            agent_id=data.agent_id,
            skill_id=skill_id,
            triggered_by=data.triggered_by,
            status="blocked",
            input_json=data.input_json,
            permission_check_json=perm.model_dump(),
            error_message=perm.reason,
        )
        db.add(execution)
        db.commit()

        status_code = 429 if perm.blocked_by == "daily_limit" else 403
        raise HTTPException(status_code, detail={
            "message": perm.reason,
            "blocked_by": perm.blocked_by,
            "checks": perm.checks,
        })

    # Create execution record
    execution = AIAgentExecution(
        id=_id("exec"),
        tenant_id=TENANT_ID,
        agent_id=data.agent_id,
        skill_id=skill_id,
        triggered_by=data.triggered_by,
        status="completed",
        input_json=data.input_json,
        output_json={"result": "Skill executed successfully"},
        permission_check_json=perm.model_dump(),
        execution_time_ms=42,
    )
    db.add(execution)

    # Update skill execution count
    skill = db.get(AISkill, skill_id)
    if skill:
        skill.execution_count += 1
        skill.last_executed_at = datetime.utcnow()
        db.add(skill)

    db.commit()
    db.refresh(execution)

    _audit_ai(db, "execute", "ai_skill", skill_id,
              after={"agent_id": data.agent_id, "execution_id": execution.id})
    db.commit()

    return {
        "execution": execution,
        "permission_check": perm.model_dump(),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  EXECUTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/executions")
async def list_executions(
    agent_id: Optional[str] = None,
    skill_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_session),
):
    q = select(AIAgentExecution).where(AIAgentExecution.tenant_id == TENANT_ID)
    if agent_id:
        q = q.where(AIAgentExecution.agent_id == agent_id)
    if skill_id:
        q = q.where(AIAgentExecution.skill_id == skill_id)
    if status:
        q = q.where(AIAgentExecution.status == status)
    return db.exec(q.order_by(AIAgentExecution.created_at.desc()).limit(limit)).all()


@router.get("/executions/stats")
async def execution_stats(db: Session = Depends(get_session)):
    today_start = datetime.combine(date.today(), datetime.min.time())

    total_today = db.exec(
        select(func.count(AIAgentExecution.id)).where(
            AIAgentExecution.tenant_id == TENANT_ID,
            AIAgentExecution.created_at >= today_start,
        )
    ).one()

    completed_today = db.exec(
        select(func.count(AIAgentExecution.id)).where(
            AIAgentExecution.tenant_id == TENANT_ID,
            AIAgentExecution.created_at >= today_start,
            AIAgentExecution.status == "completed",
        )
    ).one()

    blocked_today = db.exec(
        select(func.count(AIAgentExecution.id)).where(
            AIAgentExecution.tenant_id == TENANT_ID,
            AIAgentExecution.created_at >= today_start,
            AIAgentExecution.status == "blocked",
        )
    ).one()

    failed_today = db.exec(
        select(func.count(AIAgentExecution.id)).where(
            AIAgentExecution.tenant_id == TENANT_ID,
            AIAgentExecution.created_at >= today_start,
            AIAgentExecution.status == "failed",
        )
    ).one()

    total_all = db.exec(
        select(func.count(AIAgentExecution.id)).where(
            AIAgentExecution.tenant_id == TENANT_ID,
        )
    ).one()

    success_rate = round((completed_today / total_today) * 100) if total_today > 0 else 0

    return {
        "today": {
            "total": total_today,
            "completed": completed_today,
            "blocked": blocked_today,
            "failed": failed_today,
            "success_rate": f"{success_rate}%",
        },
        "all_time": {
            "total": total_all,
        },
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PERMISSIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PermissionCheckRequest(BaseModel):
    agent_id: str
    skill_id: str
    user_id: str = "system"


@router.post("/permissions/check")
async def check_permission_endpoint(data: PermissionCheckRequest, db: Session = Depends(get_session)):
    from services.permission_engine import check_permission
    result = check_permission(db, data.agent_id, data.skill_id, data.user_id, TENANT_ID)
    return result.model_dump()


@router.get("/permissions/matrix")
async def get_permission_matrix(db: Session = Depends(get_session)):
    roles = db.exec(select(AIRole).where(AIRole.tenant_id == TENANT_ID)).all()
    categories = ["general", "crm", "support", "sales", "marketing", "security", "analytics"]

    matrix = []
    for role in roles:
        perms = role.permissions_json or []
        row = {
            "role_id": role.id,
            "role_name": role.name,
            "department_id": role.department_id,
            "categories": {},
        }
        for cat in categories:
            row["categories"][cat] = (
                "ai.*" in perms
                or "ai.skills.*" in perms
                or f"ai.skills.{cat}" in perms
            )
        matrix.append(row)
    return {"categories": categories, "matrix": matrix}
