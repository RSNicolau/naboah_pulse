from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from db import get_session
from models import ProductSKU, Warehouse, InventoryMovement, ShippingOrder
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/commerce/v2", tags=["commerce_v2"])

TENANT_ID = "naboah"

class SKUCreate(BaseModel):
    name: str
    base_price: float
    barcode: Optional[str] = None
    is_digital: bool = False

@router.post("/skus")
async def create_sku(data: SKUCreate, db: Session = Depends(get_session)):
    sku = ProductSKU(
        id=f"sku_{uuid.uuid4().hex[:6]}",
        tenant_id=TENANT_ID, # Mock
        name=data.name,
        base_price=data.base_price,
        barcode=data.barcode,
        is_digital=data.is_digital
    )
    db.add(sku)
    db.commit()
    db.refresh(sku)
    return sku

@router.get("/inventory/stock")
async def get_total_stock(sku_id: Optional[str] = None, db: Session = Depends(get_session)):
    # Simulação de agregação de estoque por SKU/Warehouse
    query = select(InventoryMovement.sku_id, func.sum(InventoryMovement.quantity_change).label("total"))
    if sku_id:
        query = query.where(InventoryMovement.sku_id == sku_id)
    query = query.group_by(InventoryMovement.sku_id)
    return db.exec(query).all()

@router.post("/shipping/create")
async def create_shipping(order_id: str, carrier: str, db: Session = Depends(get_session)):
    shipping = ShippingOrder(
        id=f"shp_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID,
        order_id=order_id,
        carrier_name=carrier,
        status="pending",
        shipping_cost=25.0, # Mock logic
        estimated_delivery=datetime.utcnow() + timedelta(days=5)
    )
    db.add(shipping)
    db.commit()
    db.refresh(shipping)
    return shipping

@router.get("/shipping/{tracking_number}")
async def track_shipment(tracking_number: str, db: Session = Depends(get_session)):
    shipment = db.exec(select(ShippingOrder).where(ShippingOrder.tracking_number == tracking_number)).first()
    if not shipment:
         # Simulação de resposta de API externa de transportadora
         return {
             "tracking_number": tracking_number,
             "status": "in_transit",
             "last_event": "Perto de você: Saiu para entrega",
             "carrier": "Pulse Logistics Hub"
         }
    return shipment
