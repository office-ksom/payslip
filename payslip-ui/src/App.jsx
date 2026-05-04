import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import Paybill from './pages/Paybill';
import Reports from './pages/Reports';
import Backup from './pages/Backup';
import UserManagement from './pages/UserManagement';

import { useState, useEffect } from 'react';

// Placeholder Pages
const Overview = ({ user }) => (
  <div>
    <h1>Overview</h1>
    <div className="card">
      <p>Welcome to the KSoM Payslip generation portal.</p>
      {user && user.role === 'viewer' && (
        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
          You are signed in with read-only access. You can view and download your payslips from the <strong>Reports & Exports</strong> menu.
        </p>
      )}
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(res => {
      if (res.status === 401 || res.status === 403) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal) {
          window.location.href = '/cdn-cgi/access/login';
          return;
        }
      }
      if (res.ok) return res.json();
      return null;
    }).then(data => setUser(data));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview user={user} />} />
          <Route path="employees" element={<Employees user={user} />} />
          <Route path="paybill" element={<Paybill user={user} />} />
          <Route path="reports" element={<Reports user={user} />} />
          <Route path="settings" element={<Settings user={user} />} />
          <Route path="backup" element={<Backup user={user} />} />
          <Route path="users" element={<UserManagement user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
