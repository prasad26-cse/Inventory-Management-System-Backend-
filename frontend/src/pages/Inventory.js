import React from 'react';

const inventory = [
  { id: 1, product: 'Widget A', warehouse: 'Main Warehouse', quantity: 34 },
  { id: 2, product: 'Gadget B', warehouse: 'East Warehouse', quantity: 12 },
  { id: 3, product: 'Thingamajig C', warehouse: 'West Warehouse', quantity: 0 },
];

export default function Inventory() {
  return (
    <div>
      <h2>Inventory</h2>
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Warehouse</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.id} className={item.quantity === 0 ? 'table-danger' : ''}>
              <td>{item.id}</td>
              <td>{item.product}</td>
              <td>{item.warehouse}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 