import React from 'react';
import { FaSignInAlt } from 'react-icons/fa';

export default function Login() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <FaSignInAlt className="text-primary mb-3" style={{ fontSize: '2.5rem' }} />
      <h2>Login</h2>
      <form style={{ maxWidth: 320, width: '100%' }}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control" id="email" placeholder="Enter email" />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" id="password" placeholder="Password" />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
} 