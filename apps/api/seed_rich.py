"""
Rich seed for Naboah Pulse — compelling demo data for tenant 'naboah'.
Run: cd apps/api && python3 seed_rich.py
"""
import os
from config import settings
from sqlalchemy import create_engine
from sqlmodel import Session, select
from db import init_db
from models import (
    Tenant, Channel, ChannelAccount, Contact, Conversation, Message,
    PipelineStage, Deal, Ticket,
)
import uuid
import random
from datetime import datetime, timedelta

TENANT_ID = "naboah"
engine = create_engine(settings.DATABASE_URL)


def ago(days: int = 0, hours: int = 0, minutes: int = 0) -> datetime:
    return datetime.utcnow() - timedelta(days=days, hours=hours, minutes=minutes)


CONTACTS = [
    {"name": "Maria Silva",     "email": "maria@techcorp.com",    "phone": "+5511991234567"},
    {"name": "João Mendes",     "email": "joao@agencia.io",       "phone": "+5521998765432"},
    {"name": "Ana Rodrigues",   "email": "ana.r@startup.com",     "phone": "+5531987654321"},
    {"name": "Carlos Eduardo",  "email": "carlos@globalcorp.com", "phone": "+5541976543210"},
    {"name": "Fernanda Lima",   "email": "fernanda@design.co",    "phone": "+5551965432109"},
    {"name": "Pedro Alves",     "email": "pedro@ecomm.shop",      "phone": "+5561954321098"},
    {"name": "Juliana Costa",   "email": "juliana@finance.br",    "phone": "+5571943210987"},
    {"name": "Rafael Torres",   "email": "rafael@consulting.io",  "phone": "+5581932109876"},
    {"name": "Beatriz Nunes",   "email": "bia@healthtech.com",    "phone": "+5591921098765"},
    {"name": "Thiago Rocha",    "email": "thiago@logistica.net",  "phone": "+5511910987654"},
    {"name": "Camila Ferreira", "email": "camila@edu.br",         "phone": "+5521909876543"},
    {"name": "Lucas Souza",     "email": "lucas@saas.co",         "phone": "+5531898765432"},
]

CONVERSATIONS_DATA = [
    # WhatsApp
    {"channel": "whatsapp", "ci": 0, "status": "open", "priority": "urgent", "intent": "support", "d": 0, "msgs": [
        ("inbound",  "contact", "Oi! Meu sistema caiu. Preciso de ajuda urgente!", 0, 30),
        ("outbound", "agent",   "Olá Maria! Verificando agora. Pode me informar seu ID de conta?", 0, 28),
        ("inbound",  "contact", "É a conta MC-4821. Estou sem acesso há 2 horas", 0, 25),
        ("outbound", "agent",   "Instabilidade identificada no servidor. Resolvendo em até 10 minutos.", 0, 20),
    ]},
    {"channel": "whatsapp", "ci": 1, "status": "open", "priority": "high", "intent": "sales", "d": 1, "msgs": [
        ("inbound",  "contact", "Quero saber mais sobre o plano Enterprise do Naboah Pulse", 1, 5),
        ("outbound", "user",    "Olá João! Temos uma proposta incrível para sua agência. Posso agendar uma call?", 1, 2),
        ("inbound",  "contact", "Quantos usuários suporta? E tem API?", 1, 0),
    ]},
    {"channel": "whatsapp", "ci": 2, "status": "pending", "priority": "medium", "intent": "support", "d": 2, "msgs": [
        ("inbound",  "contact", "Como configuro o bot para responder fora do horário?", 2, 10),
        ("outbound", "agent",   "Boa tarde Ana! Acesse: Configurações > Automações > Horário de Atendimento", 2, 8),
        ("inbound",  "contact", "Funcionou!! Obrigada! 🎉", 2, 2),
    ]},
    {"channel": "whatsapp", "ci": 3, "status": "closed", "priority": "low", "intent": "billing", "d": 5, "msgs": [
        ("inbound",  "contact", "Preciso da nota fiscal do último mês", 5, 120),
        ("outbound", "user",    "Olá Carlos! Enviando para seu email agora.", 5, 115),
        ("inbound",  "contact", "Recebi. Muito obrigado!", 5, 100),
    ]},
    # Instagram
    {"channel": "instagram", "ci": 4, "status": "open", "priority": "high", "intent": "sales", "d": 0, "msgs": [
        ("inbound",  "contact", "Vi vocês no Instagram! O que é o Naboah Pulse?", 0, 45),
        ("outbound", "agent",   "Oi Fernanda! Somos uma plataforma omnichannel com IA 🚀 Gerenciamos WhatsApp, Instagram e Email em um só lugar.", 0, 40),
        ("inbound",  "contact", "Tem integração nativa com Instagram mesmo?", 0, 35),
        ("outbound", "agent",   "Sim! DMs, comentários e stories em tempo real. Quer uma demo gratuita?", 0, 30),
        ("inbound",  "contact", "Quero! Como faço para agendar?", 0, 15),
    ]},
    {"channel": "instagram", "ci": 5, "status": "open", "priority": "medium", "intent": "support", "d": 3, "msgs": [
        ("inbound",  "contact", "Não estou conseguindo conectar minha conta do Instagram", 3, 6),
        ("outbound", "agent",   "Oi Pedro! Qual erro está aparecendo?", 3, 4),
        ("inbound",  "contact", "'Permissão negada pela API do Instagram' no passo 3", 3, 2),
    ]},
    {"channel": "instagram", "ci": 6, "status": "pending", "priority": "low", "intent": "general", "d": 4, "msgs": [
        ("inbound",  "contact", "Vocês têm algum tutorial em vídeo?", 4, 60),
        ("outbound", "user",    "Olá Juliana! Temos playlist completa no YouTube com 20+ vídeos!", 4, 55),
        ("inbound",  "contact", "Obrigada! Já encontrei 😊", 4, 50),
    ]},
    # Email
    {"channel": "email", "ci": 7, "status": "open", "priority": "urgent", "intent": "security", "d": 0, "msgs": [
        ("inbound",  "contact", "URGENT: Detected suspicious login attempts on my account from Brazil/SP", 0, 120),
        ("outbound", "agent",   "Hi Rafael! We've secured your account and blocked the suspicious IP. Please reset your password.", 0, 115),
        ("inbound",  "contact", "Done. Is my data safe?", 0, 100),
        ("outbound", "agent",   "Yes, no data was compromised. We recommend enabling 2FA at Security > Account Settings.", 0, 90),
    ]},
    {"channel": "email", "ci": 8, "status": "open", "priority": "medium", "intent": "billing", "d": 2, "msgs": [
        ("inbound",  "contact", "Gostaria de fazer o upgrade para o plano Pro", 2, 180),
        ("outbound", "user",    "Oi Beatriz! Posso te ajudar com isso agora. No Pro: 5 agentes IA, integrações ilimitadas e BI avançado.", 2, 175),
        ("inbound",  "contact", "Qual o valor mensal vs anual?", 2, 170),
        ("outbound", "user",    "Mensal: R$499/mês. Anual: R$399/mês (20% de desconto). Quer o link de checkout?", 2, 160),
    ]},
    {"channel": "email", "ci": 9, "status": "closed", "priority": "low", "intent": "general", "d": 6, "msgs": [
        ("inbound",  "contact", "Vocês oferecem treinamento para a equipe?", 6, 300),
        ("outbound", "user",    "Sim Thiago! Temos programa de onboarding completo com Customer Success dedicado.", 6, 290),
        ("inbound",  "contact", "Ótimo! Contratei o plano e já agendei o onboarding para semana que vem.", 6, 280),
    ]},
    {"channel": "email", "ci": 10, "status": "pending", "priority": "high", "intent": "technical", "d": 1, "msgs": [
        ("inbound",  "contact", "Preciso de ajuda com a API de webhooks — /webhook/messages não recebe eventos", 1, 240),
        ("outbound", "agent",   "Olá Camila! Verifiquei os logs. É um problema de autenticação no header Authorization.", 1, 220),
        ("inbound",  "contact", "Pode me enviar um exemplo correto?", 1, 210),
        ("outbound", "agent",   "Claro! Header: Authorization: Bearer {seu_token}. O token expira a cada 24h.", 1, 200),
        ("inbound",  "contact", "Funcionou! Muito obrigada!", 1, 180),
    ]},
    {"channel": "whatsapp", "ci": 11, "status": "open", "priority": "medium", "intent": "demo", "d": 0, "msgs": [
        ("inbound",  "contact", "Boa tarde! Vi o case da TechCorp. Quero agendar demo do Naboah Pulse", 0, 90),
        ("outbound", "agent",   "Olá Lucas! Temos horários essa semana. Quinta-feira às 10h funciona?", 0, 85),
        ("inbound",  "contact", "Perfeito! Confirmado.", 0, 80),
        ("outbound", "agent",   "Link de acesso enviado para lucas@saas.co. Até quinta! 🚀", 0, 75),
    ]},
]

DEALS_DATA = [
    {"title": "TechCorp - Enterprise Anual",      "value": 24000, "stage": "stg_4", "contact": "Maria Silva",    "email": "maria@techcorp.com",    "source": "whatsapp",  "score": 95, "d": 1},
    {"title": "SaaS Co - Enterprise Trial",       "value": 18000, "stage": "stg_4", "contact": "Lucas Souza",    "email": "lucas@saas.co",         "source": "whatsapp",  "score": 91, "d": 0},
    {"title": "EduTech - Pro Anual",              "value": 4800,  "stage": "stg_3", "contact": "Camila Ferreira","email": "camila@edu.br",          "source": "email",     "score": 88, "d": 1},
    {"title": "Agência Digital - Pro Anual",      "value": 8400,  "stage": "stg_3", "contact": "João Mendes",    "email": "joao@agencia.io",        "source": "email",     "score": 82, "d": 2},
    {"title": "Startup X - Pilot 3 meses",        "value": 3600,  "stage": "stg_3", "contact": "Ana Rodrigues",  "email": "ana.r@startup.com",      "source": "instagram", "score": 71, "d": 3},
    {"title": "Logística Brasil - Piloto",        "value": 9600,  "stage": "stg_2", "contact": "Thiago Rocha",   "email": "thiago@logistica.net",   "source": "whatsapp",  "score": 68, "d": 3},
    {"title": "Global Corp - 50 seats",           "value": 60000, "stage": "stg_2", "contact": "Carlos Eduardo", "email": "carlos@globalcorp.com",  "source": "email",     "score": 78, "d": 1},
    {"title": "Design Studio - Pro Mensal",       "value": 1200,  "stage": "stg_2", "contact": "Fernanda Lima",  "email": "fernanda@design.co",     "source": "instagram", "score": 65, "d": 4},
    {"title": "E-commerce Plus - Integração",     "value": 5400,  "stage": "stg_1", "contact": "Pedro Alves",    "email": "pedro@ecomm.shop",       "source": "whatsapp",  "score": 55, "d": 0},
    {"title": "HealthTech - Business Plan",       "value": 14400, "stage": "stg_1", "contact": "Beatriz Nunes",  "email": "bia@healthtech.com",      "source": "email",     "score": 60, "d": 2},
    {"title": "Consultoria ABC - Demo",           "value": 7200,  "stage": "stg_1", "contact": "Rafael Torres",  "email": "rafael@consulting.io",   "source": "email",     "score": 45, "d": 5},
]

TICKETS_DATA = [
    {
        "subject": "Bug crítico no upload de arquivos",
        "description": "Erro 500 ao fazer upload de arquivos acima de 10MB. Reproduzível consistentemente no Chrome e Firefox.",
        "priority": "high", "status": "open", "d": 1, "due_hours": 4,
    },
    {
        "subject": "Integração WhatsApp retornando 401",
        "description": "Após renovar token de longa duração, a API do WhatsApp retorna 401 Unauthorized. Token parece válido no console Meta.",
        "priority": "urgent", "status": "open", "d": 0, "due_hours": 2,
    },
    {
        "subject": "Automação não dispara fora do horário",
        "description": "Configurei horário 9h-18h mas o bot não responde após 18h. Testado múltiplas vezes.",
        "priority": "medium", "status": "new", "d": 0, "due_hours": 24,
    },
    {
        "subject": "Dúvida: exportação de relatórios CSV",
        "description": "Não consigo encontrar a opção de exportar relatórios de conversas em CSV. Já procurei em Analytics e Configurações.",
        "priority": "low", "status": "pending", "d": 3, "due_hours": 48,
    },
    {
        "subject": "Acesso multi-tenant para 3 empresas",
        "description": "Preciso gerenciar 3 empresas distintas no mesmo painel. O plano Pro atual suporta isso?",
        "priority": "low", "status": "new", "d": 4, "due_hours": 72,
    },
    {
        "subject": "Erro ao importar contatos via CSV",
        "description": "Importação falha com erro de validação nos campos phone e email. CSV foi gerado conforme template oficial.",
        "priority": "medium", "status": "open", "d": 2, "due_hours": 12,
    },
]


def seed():
    init_db()
    with Session(engine) as db:
        # Tenant
        tenant = db.get(Tenant, TENANT_ID)
        if not tenant:
            tenant = Tenant(id=TENANT_ID, name="Naboah", slug=TENANT_ID)
            db.add(tenant)
            db.commit()
            print(f"✓ Tenant '{TENANT_ID}' criado")
        else:
            print(f"✓ Tenant '{TENANT_ID}' já existe")

        # Channels
        for ch_type in ["whatsapp", "instagram", "email"]:
            if not db.get(Channel, ch_type):
                db.add(Channel(id=ch_type, type=ch_type, name=ch_type.capitalize()))
        db.commit()

        # Channel Accounts
        ca_map = {}
        for ch_type in ["whatsapp", "instagram", "email"]:
            ca_id = f"ca_{TENANT_ID}_{ch_type}"
            if not db.get(ChannelAccount, ca_id):
                db.add(ChannelAccount(
                    id=ca_id, tenant_id=TENANT_ID, channel_id=ch_type,
                    external_account_id=f"{TENANT_ID}_{ch_type}_001",
                    auth_blob_encrypted="{}", status="active",
                ))
            ca_map[ch_type] = ca_id
        db.commit()
        print("✓ Channels e channel accounts prontos")

        # Contacts
        contact_ids = []
        created_contacts = 0
        for i, c in enumerate(CONTACTS):
            cid = f"contact_{TENANT_ID}_{i}"
            if not db.get(Contact, cid):
                db.add(Contact(
                    id=cid, tenant_id=TENANT_ID,
                    name=c["name"], email=c["email"], phone=c["phone"],
                    health_score=round(random.uniform(60, 100), 1),
                    churn_risk_level=random.choice(["low", "low", "medium"]),
                ))
                created_contacts += 1
            contact_ids.append(cid)
        db.commit()
        print(f"✓ {created_contacts} contatos criados ({len(CONTACTS)} total)")

        # Conversations + Messages
        created_convs = 0
        for i, cv in enumerate(CONVERSATIONS_DATA):
            conv_id = f"conv_{TENANT_ID}_{i}"
            if not db.get(Conversation, conv_id):
                ts = ago(days=cv["d"])
                conv = Conversation(
                    id=conv_id, tenant_id=TENANT_ID,
                    channel_account_id=ca_map[cv["channel"]],
                    contact_id=contact_ids[cv["ci"]],
                    external_thread_id=f"thread_{TENANT_ID}_{i}",
                    status=cv["status"], priority=cv["priority"],
                    intent=cv.get("intent"),
                    created_at=ts, updated_at=ts,
                )
                db.add(conv)
                db.commit()
                for j, (direction, sender_type, content, d, m) in enumerate(cv["msgs"]):
                    db.add(Message(
                        id=f"msg_{TENANT_ID}_{i}_{j}",
                        tenant_id=TENANT_ID,
                        conversation_id=conv_id,
                        external_message_id=f"ext_{TENANT_ID}_{i}_{j}",
                        direction=direction, sender_type=sender_type,
                        content=content,
                        created_at=ago(days=d, minutes=m),
                    ))
                db.commit()
                created_convs += 1
        print(f"✓ {created_convs} conversas criadas com mensagens")

        # Pipeline Stages
        STAGES = [
            {"id": "stg_1", "name": "Lead Qualificado", "order": 1, "color": "#7B61FF"},
            {"id": "stg_2", "name": "Apresentação",     "order": 2, "color": "#8B5CF6"},
            {"id": "stg_3", "name": "Negociação",       "order": 3, "color": "#F59E0B"},
            {"id": "stg_4", "name": "Fechamento",       "order": 4, "color": "#22C55E"},
        ]
        for s in STAGES:
            if not db.get(PipelineStage, s["id"]):
                db.add(PipelineStage(
                    id=s["id"], tenant_id=TENANT_ID,
                    name=s["name"], order=s["order"], color=s["color"],
                ))
        db.commit()

        # Deals
        created_deals = 0
        for i, d in enumerate(DEALS_DATA):
            deal_id = f"deal_{TENANT_ID}_{i}"
            if not db.get(Deal, deal_id):
                db.add(Deal(
                    id=deal_id, tenant_id=TENANT_ID,
                    title=d["title"], value=d["value"],
                    stage_id=d["stage"],
                    contact_name=d["contact"],
                    contact_email=d["email"],
                    source=d["source"],
                    lead_score=d["score"],
                    created_at=ago(days=d["d"]),
                    updated_at=ago(days=d["d"]),
                ))
                created_deals += 1
        db.commit()
        print(f"✓ {created_deals} deals criados")

        # Tickets
        created_tickets = 0
        for i, t in enumerate(TICKETS_DATA):
            tick_id = f"tick_{TENANT_ID}_{i}"
            if not db.get(Ticket, tick_id):
                db.add(Ticket(
                    id=tick_id, tenant_id=TENANT_ID,
                    subject=t["subject"], description=t["description"],
                    priority=t["priority"], status=t["status"],
                    created_at=ago(days=t["d"]),
                    due_at=datetime.utcnow() + timedelta(hours=t["due_hours"]),
                ))
                created_tickets += 1
        db.commit()
        print(f"✓ {created_tickets} tickets criados")

        print("\n✅ Seed rico concluído para o tenant 'naboah'!")
        print(f"   {len(CONTACTS)} contatos | {len(CONVERSATIONS_DATA)} conversas | {len(DEALS_DATA)} deals | {len(TICKETS_DATA)} tickets")


if __name__ == "__main__":
    seed()
