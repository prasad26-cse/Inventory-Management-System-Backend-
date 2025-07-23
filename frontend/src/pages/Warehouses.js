import React from 'react';
import { FaWarehouse } from 'react-icons/fa';

const warehouses = [
  { id: 1, name: 'Main Warehouse', address: '123 Main St, City' },
  { id: 2, name: 'East Warehouse', address: '456 East Ave, City' },
  { id: 3, name: 'West Warehouse', address: '789 West Blvd, City' },
];

export default function Warehouses() {
  return (
    <div>
      <h2>Warehouses</h2>
      <ul className="list-group">
        {warehouses.map(w => (
          <li className="list-group-item d-flex align-items-center" key={w.id}>
            <FaWarehouse className="text-primary me-2" />
            <div>
              <div className="fw-bold">{w.name}</div>
              <div className="text-muted small">{w.address}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 