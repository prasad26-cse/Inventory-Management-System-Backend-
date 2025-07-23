import React from 'react';
import { FaBoxes } from 'react-icons/fa';

const bundles = [
  { id: 1, name: 'Starter Kit', products: 'Widget A, Gadget B', price: 39.99 },
  { id: 2, name: 'Pro Pack', products: 'Widget A, Thingamajig C', price: 49.99 },
];

export default function Bundles() {
  return (
    <div>
      <h2>Bundles</h2>
      <table className="table table-hover">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Products</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {bundles.map(b => (
            <tr key={b.id}>
              <td><FaBoxes className="text-primary" /></td>
              <td>{b.name}</td>
              <td>{b.products}</td>
              <td>${b.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 