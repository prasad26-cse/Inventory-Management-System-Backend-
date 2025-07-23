from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models
from .database import engine, SessionLocal
from .schemas import Product as ProductSchema, ProductCreate
from typing import List

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "StockFlow Inventory Management API"}

@app.get("/api/products", response_model=dict)
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return {
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "price": float(p.price),
                "stock": sum(inv.quantity for inv in p.inventory)
            }
            for p in products
        ]
    }

@app.post("/api/products", status_code=status.HTTP_201_CREATED, response_model=dict)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Check SKU uniqueness
    if db.query(models.Product).filter_by(sku=product.sku).first():
        raise HTTPException(status_code=400, detail="SKU must be unique")
    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        is_bundle=product.is_bundle or False
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return {"message": "Product created", "product_id": db_product.id}

@app.put("/api/products/{product_id}", response_model=dict)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter_by(id=product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Check SKU uniqueness (if changed)
    if db_product.sku != product.sku and db.query(models.Product).filter_by(sku=product.sku).first():
        raise HTTPException(status_code=400, detail="SKU must be unique")
    db_product.name = product.name
    db_product.sku = product.sku
    db_product.price = product.price
    db_product.is_bundle = product.is_bundle or False
    db.commit()
    db.refresh(db_product)
    return {"message": "Product updated", "product_id": db_product.id}

@app.delete("/api/products/{product_id}", response_model=dict)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter_by(id=product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

@app.get("/api/companies/{company_id}/alerts/low-stock")
def get_low_stock_alerts(company_id: int):
    """
    Returns low-stock alerts for a company, including all required parameters.
    Business rules:
    - Low stock threshold varies by product type (assume a field or default)
    - Only alert for products with recent sales activity (mocked for now)
    - Must handle multiple warehouses per company
    - Include supplier information for reordering
    """
    db: Session = SessionLocal()
    alerts = []
    try:
        warehouses = db.query(models.Warehouse).filter_by(company_id=company_id).all()
        if not warehouses:
            return {"alerts": [], "total_alerts": 0}
        for warehouse in warehouses:
            inventory_items = db.query(models.Inventory).filter_by(warehouse_id=warehouse.id).all()
            for inv in inventory_items:
                product = db.query(models.Product).filter_by(id=inv.product_id).first()
                if not product:
                    continue
                # Assume threshold is a field on product, else use default
                threshold = getattr(product, 'low_stock_threshold', 20)
                # Mock: Only alert for products with recent sales activity
                recent_sales = True  # Replace with actual sales check
                if inv.quantity < threshold and recent_sales:
                    # Find supplier (mock: first supplier)
                    supplier = db.query(models.Supplier).first()
                    supplier_info = None
                    if supplier:
                        supplier_info = {
                            "id": supplier.id,
                            "name": supplier.name,
                            "contact_email": supplier.contact_email
                        }
                    # Estimate days until stockout (mock: 12)
                    days_until_stockout = 12  # Replace with actual calculation
                    alerts.append({
                        "product_id": product.id,
                        "product_name": product.name,
                        "sku": product.sku,
                        "warehouse_id": warehouse.id,
                        "warehouse_name": warehouse.name,
                        "current_stock": inv.quantity,
                        "threshold": threshold,
                        "days_until_stockout": days_until_stockout,
                        "supplier": supplier_info
                    })
        return {"alerts": alerts, "total_alerts": len(alerts)}
    finally:
        db.close() 