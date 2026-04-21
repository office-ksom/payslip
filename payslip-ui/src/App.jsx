import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import Paybill from './pages/Paybill';
import Reports from './pages/Reports';

// Placeholder Pages
const Overview = () => <div><h1>Overview</h1><div className="card"><p>Welcome to the KSoM Payslip generation portal.</p></div></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="employees" element={<Employees />} />
          <Route path="paybill" element={<Paybill />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
