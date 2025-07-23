# StockFlow Inventory Management System

## Backend (FastAPI)

1. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```
2. Install dependencies:
   ```sh
   pip install -r backend/requirements.txt
   ```
3. Update `backend/database.py` with your MySQL username and password.
4. Run the backend:
   ```sh
   uvicorn backend.main:app --reload
   ```

## Frontend (React.js)

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend:
   ```sh
   npm start
   ```

## Database (MySQL)

1. Install MySQL if not already installed.
2. Run the schema script in your MySQL client:
   ```sh
   mysql -u <username> -p < schema.sql
   ```

## Access
- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

---

Update credentials and settings as needed for your environment. 

---

# Case Study: Inventory Management System for B2B SaaS

## Overview
"StockFlow" is a B2B inventory management platform for small businesses to track products across multiple warehouses and manage supplier relationships. This document covers code review, database design, and API implementation for the system.

---

## Part 1: Code Review & Debugging

### Problematic Endpoint (from prompt)
```python
@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json
    # Create new product
    product = Product(
        name=data['name'],
        sku=data['sku'],
        price=data['price'],
        warehouse_id=data['warehouse_id']
    )
    db.session.add(product)
    db.session.commit()
    # Update inventory count
    inventory = Inventory(
        product_id=product.id,
        warehouse_id=data['warehouse_id'],
        quantity=data['initial_quantity']
    )
    db.session.add(inventory)
    db.session.commit()
    return {"message": "Product created", "product_id": product.id}
```

### 1. Issues Identified
- **SKU Uniqueness Not Enforced:** No check for duplicate SKUs before creation.
- **Products in Multiple Warehouses:** The model assumes a product belongs to a single warehouse, but products can exist in multiple warehouses.
- **Price Data Type:** Price should be decimal, but may be passed as string/float without validation.
- **Missing/Optional Fields:** No handling for optional fields or missing data (e.g., initial_quantity).
- **No Transaction Handling:** If inventory creation fails, product is already committed.
- **No Error Handling:** No try/except or validation for required fields.
- **Business Logic:** Inventory should be managed separately from product creation.
- **No Supplier or Bundle Handling:** Not extensible for suppliers or bundles.

### 2. Impact in Production
- **Duplicate SKUs:** Can cause integrity errors or inconsistent product data.
- **Partial Data:** Product may be created without inventory if second commit fails.
- **Data Inconsistency:** Products tied to a single warehouse, breaking multi-warehouse logic.
- **Unclear Errors:** API may return 500 errors or partial success.
- **Difficult to Extend:** Hard to add suppliers, bundles, or other features.

### 3. Corrected Version (FastAPI Example)
```python
@app.post("/api/products", status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Check SKU uniqueness
    if db.query(Product).filter_by(sku=product.sku).first():
        raise HTTPException(status_code=400, detail="SKU must be unique")
    db_product = Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        is_bundle=product.is_bundle or False
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    # Optionally, create inventory records separately
    return {"message": "Product created", "product_id": db_product.id}
```
**Explanation:**
- Checks SKU uniqueness before creation.
- Does not tie product to a single warehouse.
- Handles price as decimal.
- Uses Pydantic for validation (see `schemas.py`).
- Inventory is managed separately, supporting multiple warehouses.
- Error handling with HTTPException.

---

## Part 2: Database Design

### Schema (see also `schema.sql`)
```sql
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE warehouses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    is_bundle BOOLEAN DEFAULT FALSE
);
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity INT NOT NULL,
    UNIQUE (product_id, warehouse_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);
CREATE TABLE inventory_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    `change` INT NOT NULL,
    reason VARCHAR(255),
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255)
);
CREATE TABLE product_bundles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bundle_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (bundle_id) REFERENCES products(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Gaps / Questions for Product Team
- How are sales tracked? (No sales table)
- How are low-stock thresholds set (per product, per warehouse, or global)?
- Can a product have multiple suppliers?
- How are bundles priced and inventoried?
- Do we need user authentication/roles?
- Should inventory changes be linked to specific users/actions?
- What is the expected scale (rows, companies, etc.)?

### Design Decisions
- **Indexes:** Unique constraints on SKU, composite unique on (product_id, warehouse_id) for inventory.
- **Foreign Keys:** Enforce referential integrity.
- **Extensibility:** Bundles, suppliers, and inventory history allow for future features.
- **Separation of Concerns:** Products, inventory, and suppliers are decoupled.

---

## Part 3: API Implementation (Low-Stock Alerts)

### Endpoint
`GET /api/companies/{company_id}/alerts/low-stock`

### Example Implementation (FastAPI, see `backend/main.py`)
```python
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
```

### Edge Cases Handled
- No warehouses for company: returns empty list.
- No products below threshold: returns empty list.
- Missing supplier: supplier info is null.
- Recent sales activity is mocked (should be implemented).

### Approach & Assumptions
- Assumes a `low_stock_threshold` field or uses a default.
- Assumes recent sales activity can be checked (not implemented in schema).
- Supplier info is mocked as the first supplier (should be linked per product).
- Days until stockout is mocked (should be calculated from sales data).

---

## Reasoning, Assumptions, and Questions
- **Assumptions:**
  - Each product has a unique SKU.
  - Products can exist in multiple warehouses.
  - Inventory is tracked per (product, warehouse).
  - Low-stock threshold is per product (can be extended).
  - Sales activity and supplier-product relationships are not fully implemented.
- **Questions for Product Team:**
  - How should sales be tracked and linked to inventory?
  - How are low-stock thresholds set and updated?
  - Can products have multiple suppliers?
  - How are bundles managed in inventory and sales?
  - What user roles and permissions are required?

---

**Prepared by:** Prasad Kabade

This document is ready for review and live discussion. 
