import os
from config import settings

# Override DATABASE_URL if running from exec and DNS fails
if os.environ.get("DB_IP"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("db", os.environ.get("DB_IP"))

from sqlalchemy import create_engine
from sqlmodel import Session, select, SQLModel
from db import init_db
from models import Tenant, User, Role, Membership, Channel, ChannelAccount, Contact, Conversation, Message
from auth_utils import get_password_hash
import uuid
from datetime import datetime, timedelta

# Re-create engine with potentially updated URL
engine = create_engine(settings.DATABASE_URL)

def seed_data():
    init_db()
    with Session(engine) as session:
        # 1. Create Tenant
        tenant = session.get(Tenant, "acme")
        if not tenant:
            tenant = Tenant(id="acme", name="Acme Corp", plan="enterprise")
            session.add(tenant)
        
        # 2. Create User
        user = session.exec(select(User).where(User.email == "admin@acme.com")).first()
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email="admin@acme.com",
                name="Admin User",
                hashed_password=get_password_hash("password123")
            )
            session.add(user)
        
        # 3. Create Channel
        channel = session.get(Channel, "instagram")
        if not channel:
            channel = Channel(id="instagram", type="instagram", name="Instagram")
            session.add(channel)
        
        # 4. Create Channel Account
        account = session.exec(select(ChannelAccount).where(ChannelAccount.external_account_id == "acme_ig")).first()
        if not account:
            account = ChannelAccount(
                id=str(uuid.uuid4()),
                tenant_id=tenant.id,
                channel_id=channel.id,
                external_account_id="acme_ig",
                auth_blob_encrypted="{}",
                status="active"
            )
            session.add(account)
        
        session.commit()
        session.refresh(tenant)
        session.refresh(account)

        # 5. Create Contact
        contact = Contact(
            id=str(uuid.uuid4()),
            tenant_id=tenant.id,
            name="Alice Smith",
            email="alice@example.com"
        )
        session.add(contact)
        
        # 6. Create Conversation
        conv = Conversation(
            id=str(uuid.uuid4()),
            tenant_id=tenant.id,
            channel_account_id=account.id,
            contact_id=contact.id,
            external_thread_id="thread_123",
            status="open",
            priority="high",
            intent="support"
        )
        session.add(conv)
        
        session.commit()
        session.refresh(conv)

        # 7. Create Messages
        msg1 = Message(
            id=str(uuid.uuid4()),
            tenant_id=tenant.id,
            conversation_id=conv.id,
            external_message_id="msg_1",
            direction="inbound",
            sender_type="contact",
            content="Hello, I need help with my integration."
        )
        msg2 = Message(
            id=str(uuid.uuid4()),
            tenant_id=tenant.id,
            conversation_id=conv.id,
            external_message_id="msg_2",
            direction="outbound",
            sender_type="agent",
            content="Sure! Looking into it."
        )
        session.add(msg1)
        session.add(msg2)
        
        session.commit()

        # Phase 7: Agents & Playbooks
        pb1 = Playbook(
            id="pb_support_001",
            tenant_id=tenant.id,
            name="Standard Support Playbook",
            department="support",
            rules_json={"auto_reply": True, "escalate_on_anger": True},
            tone_of_voice="helpful"
        )
        pb2 = Playbook(
            id="pb_growth_001",
            tenant_id=tenant.id,
            name="Viral Growth Strategy",
            department="marketing",
            rules_json={"maximize_reach": True},
            tone_of_voice="witty"
        )
        session.add(pb1)
        session.add(pb2)
        session.commit()

        a1 = Agent(
            id="agent_jarvis_001",
            tenant_id=tenant.id,
            playbook_id=pb1.id,
            name="Jarvis Support",
            role="Customer Success",
            status="acting",
            intelligence_level="genius",
            capabilities_json=["inbox_reply", "sentiment_analysis"]
        )
        a2 = Agent(
            id="agent_aegis_001",
            tenant_id=tenant.id,
            playbook_id=pb2.id,
            name="Aegis Guardian",
            role="Security Officer",
            status="idle",
            intelligence_level="high",
            capabilities_json=["threat_blocking", "reputation_monitoring"]
        )
        session.add(a1)
        session.add(a2)
        session.commit()

        print("Database seeded successfully with Agents and Playbooks!")

        # Phase 8: Billing & Subscriptions
        plan_pro = SubscriptionPlan(
            id="plan_pro_001",
            name="Pro",
            price_monthly=199.0,
            price_yearly=1990.0,
            features_json={"ai_insights": True, "priority_support": True},
            max_tenants=5,
            max_agents=10,
            max_messages_monthly=50000
        )
        session.add(plan_pro)
        session.commit()

        quota = UsageQuota(
            id="quota_123",
            tenant_id=tenant.id,
            plan_id=plan_pro.id,
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30),
            messages_sent=12402,
            ai_credits_remaining=840.0
        )
        session.add(quota)

        tx = CreditTransaction(
            id="tx_001",
            tenant_id=tenant.id,
            amount=-199.0,
            type="purchase",
            description="Pro Plan Monthly Subscription"
        )
        session.add(tx)
        session.commit()

        print("Database seeded successfully with Billing data!")
        print("Seed completed successfully!")

if __name__ == "__main__":
    seed_data()
