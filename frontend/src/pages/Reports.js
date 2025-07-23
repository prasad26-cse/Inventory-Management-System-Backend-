import React from 'react';
import { FaChartBar } from 'react-icons/fa';

export default function Reports() {
  return (
    <div>
      <h2>Reports</h2>
      <div className="card p-4 mb-3">
        <div className="d-flex align-items-center mb-2">
          <FaChartBar className="text-primary me-2" />
          <span className="fw-bold">Monthly Inventory Report</span>
        </div>
        <div>Total Products Sold: 120</div>
        <div>Low Stock Alerts: 3</div>
        <div>Top Supplier: Supplier Corp</div>
      </div>
      <button className="btn btn-primary">Export as CSV</button>
    </div>
  );
} 