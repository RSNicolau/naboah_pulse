from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Product, Order, OrderItem, PaymentTransaction
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/commerce", tags=["commerce"])

class OrderCreate(BaseModel):
    contact_id: str
    items: List[dict] # {product_id, quantity}

@router.get("/products", response_model=List[Product])
async def list_products(db: Session = Depends(get_session)):
    products = db.exec(select(Product)).all()
    if not products:
        # Mock para demonstração
        return [
            Product(id="p1", tenant_id="t1", name="iPhone 15 Pro", price=7999.00, sku="IPH-15-P", stock_quantity=10, image_url="https://placehold.co/100x100?text=iPhone"),
            Product(id="p2", tenant_id="t1", name="MacBook Air M3", price=12499.00, sku="MAC-AIR-M3", stock_quantity=5, image_url="https://placehold.co/100x100?text=MacBook"),
        ]
    return products

@router.post("/orders")
async def create_order(data: OrderCreate, db: Session = Depends(get_session)):
    order_id = f"ord_{uuid.uuid4().hex[:8]}"
    return {
        "status": "order_created",
        "order_id": order_id,
        "payment_link": f"https://checkout.naboah.com/pay/{order_id}",
        "message": "Link de pagamento gerado com sucesso."
    }

@router.get("/orders/{order_id}")
async def get_order_status(order_id: str, db: Session = Depends(get_session)):
    return {
        "id": order_id,
        "status": "pending_payment",
        "total": 7999.00,
        "customer": "Rodrigo Nicolau"
    }

@router.post("/webhooks/payment")
async def handle_payment_webhook(payload: dict):
    # Simulação de processamento de webhook de pagamento
    return {"status": "received"}
