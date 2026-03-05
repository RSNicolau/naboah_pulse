from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Product, Order, OrderItem, PaymentTransaction
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/commerce", tags=["commerce"])

TENANT_ID = "naboah"

class OrderCreate(BaseModel):
    contact_id: str
    items: List[dict] # {product_id, quantity}

@router.get("/products", response_model=List[Product])
async def list_products(db: Session = Depends(get_session)):
    products = db.exec(select(Product)).all()
    if not products:
        # Mock para demonstração
        return [
            Product(id="p1", tenant_id=TENANT_ID, name="iPhone 15 Pro", price=7999.00, sku="IPH-15-P", stock_quantity=10, image_url="https://placehold.co/100x100?text=iPhone"),
            Product(id="p2", tenant_id=TENANT_ID, name="MacBook Air M3", price=12499.00, sku="MAC-AIR-M3", stock_quantity=5, image_url="https://placehold.co/100x100?text=MacBook"),
        ]
    return products

@router.post("/orders")
async def create_order(data: OrderCreate, db: Session = Depends(get_session)):
    # Create Order + OrderItems in DB
    order_id = f"ord_{uuid.uuid4().hex[:8]}"

    # Calculate total from products
    total_amount = 0.0
    order_items = []
    for item in data.items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 1)

        product = db.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

        unit_price = product.price
        total_amount += unit_price * quantity

        order_items.append(OrderItem(
            id=f"oi_{uuid.uuid4().hex[:6]}",
            order_id=order_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price,
        ))

    order = Order(
        id=order_id,
        tenant_id=TENANT_ID,
        contact_id=data.contact_id,
        status="pending_payment",
        total_amount=total_amount,
        payment_link_url=f"https://checkout.naboah.com/pay/{order_id}",
    )
    db.add(order)

    for oi in order_items:
        db.add(oi)

    db.commit()
    db.refresh(order)

    return {
        "status": "order_created",
        "order_id": order.id,
        "total_amount": order.total_amount,
        "items_count": len(order_items),
        "payment_link": order.payment_link_url,
        "message": "Link de pagamento gerado com sucesso.",
    }

@router.get("/orders/{order_id}")
async def get_order_status(order_id: str, db: Session = Depends(get_session)):
    # Query Order from DB
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Get order items
    items = db.exec(
        select(OrderItem).where(OrderItem.order_id == order_id)
    ).all()

    items_list = []
    for oi in items:
        product = db.get(Product, oi.product_id)
        items_list.append({
            "id": oi.id,
            "product_id": oi.product_id,
            "product_name": product.name if product else "Unknown",
            "quantity": oi.quantity,
            "unit_price": oi.unit_price,
            "subtotal": oi.unit_price * oi.quantity,
        })

    return {
        "id": order.id,
        "contact_id": order.contact_id,
        "status": order.status,
        "total_amount": order.total_amount,
        "payment_link": order.payment_link_url,
        "items": items_list,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
    }

@router.post("/webhooks/payment")
async def handle_payment_webhook(payload: dict):
    # Simulação de processamento de webhook de pagamento
    return {"status": "received"}
