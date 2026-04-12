import { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import OrdersView from './components/OrdersView';
import AboutView from './components/AboutView';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
        user={user}
      />
      
      <main style={{ 
        marginLeft: '300px', 
        padding: '40px', 
        width: 'calc(100% - 300px)',
        minHeight: '100vh'
      }}>
        {activeTab === 'dashboard' && <DashboardView token={user?.token} />}
        {activeTab === 'customers' && <CustomersView token={user?.token} />}
        {activeTab === 'orders' && <OrdersView token={user?.token} />}
        {activeTab === 'about' && <AboutView />}
        {activeTab === 'settings' && (
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 className="title-gradient">Ajustes</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Configuración del sistema.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
