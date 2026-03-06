"""
Service-to-Service Auth — Validates API tokens for machine clients (OmniMind, etc.).
"""
import hashlib
from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from db import get_session
from models import ServiceToken

security = HTTPBearer()


def _hash_token(raw_token: str) -> str:
    """SHA-256 hash of the raw token for fast lookup."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


async def get_service_client(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_session),
) -> ServiceToken:
    """Validates a service-to-service Bearer token.
    Returns the ServiceToken record with integration_id and scopes."""
    token_hash = _hash_token(credentials.credentials)

    st = db.exec(
        select(ServiceToken).where(
            ServiceToken.token_hash == token_hash,
            ServiceToken.is_active == True,
        )
    ).first()

    if not st:
        raise HTTPException(status_code=401, detail="Invalid service token")

    # Check expiration
    if st.expires_at and st.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Service token expired")

    # Update last used
    st.last_used_at = datetime.utcnow()
    db.add(st)
    db.commit()

    return st


def require_scope(scope: str):
    """Dependency factory: checks the service token has a specific scope."""
    async def _checker(
        token: ServiceToken = Depends(get_service_client),
    ) -> ServiceToken:
        scopes = token.scopes_json or []
        if scope not in scopes and "*" not in scopes:
            raise HTTPException(
                status_code=403, detail=f"Missing required scope: {scope}"
            )
        return token
    return _checker
