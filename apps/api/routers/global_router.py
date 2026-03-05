from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import RegionalTaxRule, Tenant
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime

router = APIRouter(prefix="/global", tags=["global"])

# Mock de taxas de câmbio (FX Rates)
FX_RATES = {
    "USD_BRL": 5.0,
    "EUR_BRL": 5.4,
    "USD_EUR": 0.92
}

@router.get("/fx-rates")
async def get_fx_rates():
    return {
        "base": "USD",
        "rates": FX_RATES,
        "pairs": [
            {"from": "USD", "to": "BRL", "rate": FX_RATES["USD_BRL"]},
            {"from": "EUR", "to": "BRL", "rate": FX_RATES["EUR_BRL"]},
            {"from": "USD", "to": "EUR", "rate": FX_RATES["USD_EUR"]},
        ],
        "source": "static",
        "updated_at": datetime.utcnow().isoformat(),
    }

@router.get("/i18n/{lang}")
async def get_translations(lang: str):
    translations = {
        "en": {
            "welcome": "Welcome to Naboah Pulse",
            "inbox": "Omnichannel Inbox",
            "synergy": "Synergy Canvas",
            "dashboard": "Dashboard",
            "settings": "Settings",
            "analytics": "Analytics",
            "agents": "AI Agents",
            "commerce": "Commerce",
            "shield": "Security Shield",
        },
        "pt": {
            "welcome": "Bem-vindo ao Naboah Pulse",
            "inbox": "Inbox Omnichannel",
            "synergy": "Canvas de Sinergia",
            "dashboard": "Painel",
            "settings": "Configuracoes",
            "analytics": "Analiticos",
            "agents": "Agentes IA",
            "commerce": "Comercio",
            "shield": "Escudo de Seguranca",
        },
        "es": {
            "welcome": "Bienvenido a Naboah Pulse",
            "inbox": "Bandeja de Entrada Omnicanal",
            "synergy": "Lienzo de Sinergia",
            "dashboard": "Panel",
            "settings": "Configuracion",
            "analytics": "Analitica",
            "agents": "Agentes IA",
            "commerce": "Comercio",
            "shield": "Escudo de Seguridad",
        }
    }
    data = translations.get(lang, translations["en"])
    return {
        "lang": lang if lang in translations else "en",
        "available_languages": list(translations.keys()),
        "translations": data,
    }

@router.post("/tax-rules")
async def create_tax_rule(rule: RegionalTaxRule, db: Session = Depends(get_session)):
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.get("/tax-rules/{country_code}")
async def list_tax_rules(country_code: str, db: Session = Depends(get_session)):
    return db.exec(select(RegionalTaxRule).where(RegionalTaxRule.country_code == country_code)).all()
