import React from 'react';
import { FaBoxes, FaWarehouse, FaTruck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const cards = [
  { icon: <FaBoxes />, label: 'Products', value: 128 },
  { icon: <FaWarehouse />, label: 'Warehouses', value: 5 },
  { icon: <FaTruck />, label: 'Suppliers', value: 12 },
];

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <div className="row">
        {cards.map((card, idx) => (
          <div className="col-md-4 mb-4" key={card.label}>
            <motion.div
              className="card text-center shadow-sm"
              whileHover={{ scale: 1.04 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="card-body">
                <div className="display-4 mb-2 text-primary">{card.icon}</div>
                <h5 className="card-title">{card.label}</h5>
                <p className="card-text h3">{card.value}</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
} 