from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
import time

class QuantumMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Pre-process
        response = await call_next(request)
        
        # Post-process: Inject Security Headers
        process_time = time.time() - start_time
        response.headers["X-Process-Time-Ms"] = str(round(process_time * 1000, 2))
        response.headers["X-Pulse-Quantum"] = "Active"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        
        # Cache Strategy for Statics
        if request.url.path.startswith("/static"):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        
        return response
