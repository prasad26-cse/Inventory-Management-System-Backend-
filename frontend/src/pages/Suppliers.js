import React from 'react';
import { FaTruck } from 'react-icons/fa';

const suppliers = [
  { id: 1, name: 'Supplier Corp', email: 'orders@supplier.com' },
  { id: 2, name: 'Acme Supplies', email: 'contact@acme.com' },
  { id: 3, name: 'Global Parts', email: 'info@globalparts.com' },
];

export default function Suppliers() {
  return (
    <div>
      <h2>Suppliers</h2>
      <table className="table table-hover">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id}>
              <td><FaTruck className="text-primary" /></td>
              <td>{s.name}</td>
              <td>{s.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 