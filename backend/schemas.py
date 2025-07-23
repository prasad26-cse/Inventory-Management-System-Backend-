from pydantic import BaseModel
from typing import Optional, List
import datetime

class CompanyBase(BaseModel):
    name: str
class CompanyCreate(CompanyBase):
    pass
class Company(CompanyBase):
    id: int
    class Config:
        orm_mode = True

class WarehouseBase(BaseModel):
    name: str
    address: Optional[str]
    company_id: int
class WarehouseCreate(WarehouseBase):
    pass
class Warehouse(WarehouseBase):
    id: int
    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    is_bundle: Optional[bool] = False
class ProductCreate(ProductBase):
    pass
class Product(ProductBase):
    id: int
    class Config:
        orm_mode = True

class InventoryBase(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int
class InventoryCreate(InventoryBase):
    pass
class Inventory(InventoryBase):
    id: int
    class Config:
        orm_mode = True

class InventoryHistoryBase(BaseModel):
    inventory_id: int
    change: int
    reason: Optional[str]
    changed_at: Optional[datetime.datetime]
class InventoryHistoryCreate(InventoryHistoryBase):
    pass
class InventoryHistory(InventoryHistoryBase):
    id: int
    class Config:
        orm_mode = True

class SupplierBase(BaseModel):
    name: str
    contact_email: Optional[str]
class SupplierCreate(SupplierBase):
    pass
class Supplier(SupplierBase):
    id: int
    class Config:
        orm_mode = True

class ProductBundleBase(BaseModel):
    bundle_id: int
    product_id: int
    quantity: int
class ProductBundleCreate(ProductBundleBase):
    pass
class ProductBundle(ProductBundleBase):
    id: int
    class Config:
        orm_mode = True 