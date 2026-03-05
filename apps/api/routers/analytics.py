from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from db import get_session
from models import Message, Conversation, Contact, ChannelAccount, Channel, Deal, Ticket, ModerationEvent
from datetime import datetime, timedelta, date

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def get_dashboard_overview(db: Session = Depends(get_session)):
    # KPI counts
    all_convs = db.exec(select(Conversation)).all()
    all_msgs = db.exec(select(Message)).all()
    all_contacts = db.exec(select(Contact)).all()

    total_conversations = len(all_convs)
    open_conversations = sum(1 for c in all_convs if c.status == "open")
    total_messages = len(all_msgs)
    total_contacts = len(all_contacts)

    # Channel distribution
    channel_counts: dict[str, int] = {}
    for conv in all_convs:
        acct = db.get(ChannelAccount, conv.channel_account_id)
        ch_name = "Other"
        if acct:
            ch = db.get(Channel, acct.channel_id)
            if ch:
                ch_name = ch.name
        channel_counts[ch_name] = channel_counts.get(ch_name, 0) + 1

    channels = [
        {"name": k, "count": v}
        for k, v in sorted(channel_counts.items(), key=lambda x: -x[1])
    ]

    # Daily messages for last 7 days
    today = date.today()
    day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily_counts: dict[date, int] = {}
    cutoff = today - timedelta(days=6)
    for msg in all_msgs:
        if msg.created_at:
            d = msg.created_at.date()
            if d >= cutoff:
                daily_counts[d] = daily_counts.get(d, 0) + 1

    daily_messages = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        daily_messages.append({
            "day": day_labels[d.weekday()],
            "count": daily_counts.get(d, 0),
        })

    # Recent conversations (last 5)
    recent_convs = db.exec(
        select(Conversation, Contact)
        .join(Contact, Conversation.contact_id == Contact.id)
        .order_by(Conversation.updated_at.desc())
        .limit(5)
    ).all()

    recent_list = []
    for conv, contact in recent_convs:
        last_msg = db.exec(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        ).first()

        acct = db.get(ChannelAccount, conv.channel_account_id)
        ch_name = "Chat"
        if acct:
            ch = db.get(Channel, acct.channel_id)
            if ch:
                ch_name = ch.name

        recent_list.append({
            "id": conv.id,
            "contact_name": contact.name or contact.email or "Unknown",
            "channel": ch_name,
            "status": conv.status,
            "priority": conv.priority,
            "last_message": (last_msg.content[:80] if last_msg and last_msg.content else ""),
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        })

    # Sales & support KPIs
    all_deals = db.exec(select(Deal)).all()
    all_tickets = db.exec(select(Ticket)).all()
    open_deals = [d for d in all_deals if d.status == "open"]
    pipeline_value = sum(d.value for d in open_deals)
    open_tickets = sum(1 for t in all_tickets if t.status not in ("solved", "closed"))

    solved = sum(1 for c in all_convs if c.status == "closed")
    resolution_rate = round(solved / max(len(all_convs), 1) * 100, 1)

    high_churn = sum(1 for c in all_contacts if c.churn_risk_level == "high")

    # SLA at-risk tickets (due within 2h or already overdue)
    now = datetime.utcnow()
    sla_alerts = []
    for t in all_tickets:
        if t.status in ("solved", "closed"):
            continue
        if t.due_at:
            diff_h = (t.due_at - now).total_seconds() / 3600
            if diff_h <= 2:
                sla_alerts.append({
                    "id": t.id,
                    "subject": t.subject,
                    "priority": t.priority,
                    "overdue": diff_h < 0,
                    "due_in_hours": round(diff_h, 1),
                })
    sla_alerts.sort(key=lambda x: x["due_in_hours"])

    return {
        "kpis": {
            "total_conversations": total_conversations,
            "open_conversations": open_conversations,
            "total_messages": total_messages,
            "total_contacts": total_contacts,
            "pipeline_value": pipeline_value,
            "open_deals": len(open_deals),
            "open_tickets": open_tickets,
            "resolution_rate": resolution_rate,
            "high_churn_contacts": high_churn,
        },
        "channels": channels,
        "daily_messages": daily_messages,
        "recent_conversations": recent_list,
        "sla_alerts": sla_alerts[:5],
    }


@router.get("/summary")
async def get_summary(db: Session = Depends(get_session)):
    TENANT_ID = "naboah"

    # Real counts from DB
    total_contacts = len(db.exec(select(Contact).where(Contact.tenant_id == TENANT_ID)).all())
    total_messages = len(db.exec(select(Message).where(Message.tenant_id == TENANT_ID)).all())
    total_deals = db.exec(select(Deal).where(Deal.tenant_id == TENANT_ID)).all()
    won_deals = [d for d in total_deals if d.status == "won"]

    # Conversion rate: won deals / total deals
    conversion_rate = round(len(won_deals) / max(len(total_deals), 1) * 100, 1)

    # Average risk score from contacts
    all_contacts = db.exec(select(Contact).where(Contact.tenant_id == TENANT_ID)).all()
    risk_scores = [c.health_score for c in all_contacts if c.health_score is not None]
    avg_risk = round((100 - (sum(risk_scores) / max(len(risk_scores), 1))) / 100, 2)  # invert health to risk
    risk_status = "low" if avg_risk < 0.3 else ("medium" if avg_risk < 0.6 else "high")

    # Threats blocked = moderation events with action != "none"
    threats_blocked = len(db.exec(
        select(ModerationEvent).where(
            ModerationEvent.tenant_id == TENANT_ID,
            ModerationEvent.action_taken != "none"
        )
    ).all())

    return {
        "active_customers": total_contacts,
        "active_customers_change": 0,
        "threats_blocked": threats_blocked,
        "threats_blocked_change": 0,
        "avg_risk_score": avg_risk,
        "avg_risk_score_status": risk_status,
        "conversion_rate": conversion_rate,
        "conversion_rate_change": 0,
    }


@router.get("/channel-performance")
async def get_channel_performance(db: Session = Depends(get_session)):
    TENANT_ID = "naboah"

    # Get all channel accounts for this tenant, then count messages per channel
    channel_accounts = db.exec(
        select(ChannelAccount).where(ChannelAccount.tenant_id == TENANT_ID)
    ).all()

    channel_msg_counts: dict[str, int] = {}
    for ca in channel_accounts:
        ch = db.get(Channel, ca.channel_id)
        ch_name = ch.name if ch else "Other"

        # Count messages in conversations linked to this channel account
        conversations = db.exec(
            select(Conversation).where(
                Conversation.channel_account_id == ca.id,
                Conversation.tenant_id == TENANT_ID,
            )
        ).all()
        for conv in conversations:
            msg_count = len(db.exec(
                select(Message).where(Message.conversation_id == conv.id)
            ).all())
            channel_msg_counts[ch_name] = channel_msg_counts.get(ch_name, 0) + msg_count

    # Convert to percentage-like values
    total = max(sum(channel_msg_counts.values()), 1)
    result = [
        {"name": name, "value": round(count / total * 100)}
        for name, count in sorted(channel_msg_counts.items(), key=lambda x: -x[1])
    ]

    return result if result else [{"name": "No data", "value": 0}]


@router.get("/reports")
async def get_reports(db: Session = Depends(get_session)):
    all_convs = db.exec(select(Conversation)).all()
    all_msgs = db.exec(select(Message)).all()
    all_contacts = db.exec(select(Contact)).all()
    all_deals = db.exec(select(Deal)).all()
    all_tickets = db.exec(select(Ticket)).all()

    # By status
    status_dist = {}
    for c in all_convs:
        status_dist[c.status] = status_dist.get(c.status, 0) + 1

    # By channel
    channel_dist: dict[str, int] = {}
    for conv in all_convs:
        acct = db.get(ChannelAccount, conv.channel_account_id)
        ch_name = "Other"
        if acct:
            ch = db.get(Channel, acct.channel_id)
            if ch:
                ch_name = ch.name.capitalize()
        channel_dist[ch_name] = channel_dist.get(ch_name, 0) + 1

    # By priority
    priority_dist = {}
    for c in all_convs:
        priority_dist[c.priority] = priority_dist.get(c.priority, 0) + 1

    # Daily messages last 30 days
    today = date.today()
    daily: dict[str, int] = {}
    cutoff = today - timedelta(days=29)
    for msg in all_msgs:
        if msg.created_at:
            d = msg.created_at.date()
            if d >= cutoff:
                daily[str(d)] = daily.get(str(d), 0) + 1

    daily_messages = [
        {"date": str(today - timedelta(days=i)), "count": daily.get(str(today - timedelta(days=i)), 0)}
        for i in range(29, -1, -1)
    ]

    # Summary
    solved = sum(1 for c in all_convs if c.status == "closed")
    total = max(len(all_convs), 1)
    resolution_rate = round(solved / total * 100, 1)

    conv_msg_counts: dict[str, int] = {}
    for m in all_msgs:
        conv_msg_counts[m.conversation_id] = conv_msg_counts.get(m.conversation_id, 0) + 1
    avg_msgs = round(sum(conv_msg_counts.values()) / max(len(conv_msg_counts), 1), 1)

    open_deals = [d for d in all_deals if d.status == "open"]
    pipeline_value = sum(d.value for d in open_deals)

    tickets_open = sum(1 for t in all_tickets if t.status not in ("solved", "closed"))

    return {
        "summary": {
            "total_conversations": len(all_convs),
            "total_messages": len(all_msgs),
            "total_contacts": len(all_contacts),
            "resolution_rate": f"{resolution_rate}%",
            "avg_messages_per_conversation": avg_msgs,
            "pipeline_value": pipeline_value,
            "open_deals": len(open_deals),
            "open_tickets": tickets_open,
        },
        "by_status": [{"status": k, "count": v} for k, v in status_dist.items()],
        "by_channel": [{"channel": k, "count": v} for k, v in sorted(channel_dist.items(), key=lambda x: -x[1])],
        "by_priority": [{"priority": k, "count": v} for k, v in priority_dist.items()],
        "daily_messages": daily_messages,
    }
