from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Boolean, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Company(Base):
    __tablename__ = 'companies'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    warehouses = relationship('Warehouse', back_populates='company')

class Warehouse(Base):
    __tablename__ = 'warehouses'
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(String(255))
    company = relationship('Company', back_populates='warehouses')
    inventory = relationship('Inventory', back_populates='warehouse')

class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False)
    price = Column(DECIMAL(10,2), nullable=False)
    is_bundle = Column(Boolean, default=False)
    inventory = relationship('Inventory', back_populates='product')
    # Specify foreign_keys for bundles relationship
    bundles = relationship('ProductBundle', back_populates='bundle', foreign_keys='ProductBundle.bundle_id')

class Inventory(Base):
    __tablename__ = 'inventory'
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    product = relationship('Product', back_populates='inventory')
    warehouse = relationship('Warehouse', back_populates='inventory')
    history = relationship('InventoryHistory', back_populates='inventory')

class InventoryHistory(Base):
    __tablename__ = 'inventory_history'
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey('inventory.id'), nullable=False)
    change = Column(Integer, nullable=False)
    reason = Column(String(255))
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)
    inventory = relationship('Inventory', back_populates='history')

class Supplier(Base):
    __tablename__ = 'suppliers'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_email = Column(String(255))

class ProductBundle(Base):
    __tablename__ = 'product_bundles'
    id = Column(Integer, primary_key=True, index=True)
    bundle_id = Column(Integer, ForeignKey('products.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    # Specify foreign_keys for bundle and product relationships
    bundle = relationship('Product', foreign_keys=[bundle_id], back_populates='bundles')
    product = relationship('Product', foreign_keys=[product_id]) 