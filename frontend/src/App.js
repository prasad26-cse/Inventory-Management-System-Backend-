import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxes, FaWarehouse, FaTruck, FaCubes, FaChartBar, FaSignInAlt, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Bundles from './pages/Bundles';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = { type: 'spring', duration: 0.5 };

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <FaHome /> },
  { to: '/products', label: 'Products', icon: <FaBoxes /> },
  { to: '/warehouses', label: 'Warehouses', icon: <FaWarehouse /> },
  { to: '/inventory', label: 'Inventory', icon: <FaCubes /> },
  { to: '/suppliers', label: 'Suppliers', icon: <FaTruck /> },
  { to: '/bundles', label: 'Bundles', icon: <FaBoxes /> },
  { to: '/reports', label: 'Reports', icon: <FaChartBar /> },
  { to: '/login', label: 'Login', icon: <FaSignInAlt /> },
];

const Sidebar = ({ open, onClose, isMobile }) => {
  const location = useLocation();
  return (
    <motion.div1
      className={`sidebar bg-dark text-light${open ? ' open' : ''}${isMobile ? ' mobile' : ''}`}
      initial={isMobile ? { x: -250 } : false}
      animate={isMobile && open ? { x: 0 } : isMobile ? { x: -250 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-header d-flex justify-content-between align-items-center">
        StockFlow
        {isMobile && (
          <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
            <FaTimes />
          </button>
        )}
      </div>
      <ul className="nav flex-column">
        {navLinks.map(link => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`nav-link text-light${location.pathname === link.to ? ' active' : ''}`}
              onClick={isMobile ? onClose : undefined}
            >
              {link.icon} {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const TopNav = ({ onMenuClick }) => (
  <nav className="topnav d-md-none navbar navbar-dark bg-dark">
    <button className="menu-btn" onClick={onMenuClick} aria-label="Open sidebar">
      <FaBars />
    </button>
    <span className="navbar-brand mx-auto">StockFlow</span>
  </nav>
);

const Page = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    className="page-content"
  >
    {children}
  </motion.div>
);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Detect mobile (width < 768px)
  const isMobile = window.innerWidth < 768;

  return (
    <Router>
      <div className="app-layout">
        {isMobile && <TopNav onMenuClick={() => setSidebarOpen(true)} />}
        <Sidebar open={!isMobile || sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/bundles" element={<Bundles />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </AnimatePresence>
        </main>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App; 