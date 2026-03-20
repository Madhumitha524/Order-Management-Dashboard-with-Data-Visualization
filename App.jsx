import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import CustomerOrderPage from './pages/CustomerOrderPage';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main style={{ flex: 1, overflow: 'auto' }}>
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'orders' && <CustomerOrderPage />}
        </main>
      </div>
    </ToastProvider>
  );
}
