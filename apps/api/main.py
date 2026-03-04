import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from db import init_db, get_session
from models import Tenant, User, Role, Membership, AuditLog
from auth_utils import get_password_hash, create_access_token
from routers import auth, tenants, inbox, content, moderation, integrations, analytics, agents, billing, search, live, reports, sso, apihub, compliance, flows, sales, support, marketplace, enterprise, voice, community, agents_team, perception, commerce, insights, workflows_v2, shield, visionary, widgets, neural, synergy, desktop, global_router, developer, enterprise_v2, commerce_v2, insights_v3, intake, strategy, creative, automation, ads, observability, contacts, settings, notifications
from middleware.quantum_middleware import QuantumMiddleware

app = FastAPI(title="Naboah Pulse API")

_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]
if os.getenv("FRONTEND_URL"):
    _origins.append(os.environ["FRONTEND_URL"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(QuantumMiddleware)

app.include_router(auth.router)
app.include_router(tenants.router)
app.include_router(inbox.router)
app.include_router(content.router)
app.include_router(moderation.router)
app.include_router(integrations.router)
app.include_router(analytics.router)
app.include_router(agents.router)
app.include_router(billing.router)
app.include_router(search.router)
app.include_router(live.router)
app.include_router(reports.router)
app.include_router(sso.router)
app.include_router(apihub.router)
app.include_router(compliance.router)
app.include_router(flows.router)
app.include_router(sales.router)
app.include_router(support.router)
app.include_router(marketplace.router)
app.include_router(enterprise.router)
app.include_router(voice.router)
app.include_router(community.router)
app.include_router(agents_team.router)
app.include_router(perception.router)
app.include_router(commerce.router)
app.include_router(insights.router)
app.include_router(workflows_v2.router)
app.include_router(shield.router)
app.include_router(visionary.router)
app.include_router(widgets.router)
app.include_router(neural.router)
app.include_router(synergy.router)
app.include_router(desktop.router)
app.include_router(global_router.router)
app.include_router(developer.router)
app.include_router(enterprise_v2.router)
app.include_router(commerce_v2.router)
app.include_router(insights_v3.router)
app.include_router(intake.router)
app.include_router(strategy.router)
app.include_router(creative.router)
app.include_router(automation.router)
app.include_router(ads.router)
app.include_router(observability.router)
app.include_router(contacts.router)
app.include_router(settings.router)
app.include_router(notifications.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
async def root():
    return {"message": "Naboah Pulse API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Auth & Tenant Placeholder Routes
@app.post("/auth/register")
async def register(user_data: dict, db: Session = Depends(get_session)):
    # Simple register logic
    return {"message": "User registered"}

@app.post("/auth/login")
async def login(login_data: dict, db: Session = Depends(get_session)):
    # Simple login logic
    return {"access_token": "token", "token_type": "bearer"}
