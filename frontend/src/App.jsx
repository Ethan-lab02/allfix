import { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import OrdersView from './components/OrdersView';
import AboutView from './components/AboutView';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <button 
          onClick={toggleTheme}
          className="glass-card"
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          style={{
            width: '40px',
            height: '40px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontSize: '18px',
            color: 'var(--text-primary)'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {!user ? (
        <Login onLogin={setUser} />
      ) : (
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
      )}
    </div>
  );
}

export default App;
