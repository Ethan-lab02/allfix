import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut,
  Smartphone,
  Info
} from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'customers', icon: Users, label: 'Clientes' },
    { id: 'orders', icon: ClipboardList, label: 'Órdenes' },
    { id: 'about', icon: Info, label: 'Acerca de' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <aside className="glass-card" style={{ 
      width: '260px', 
      height: 'calc(100vh - 40px)', 
      margin: '20px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', padding: '0 8px' }}>
        <div style={{ 
          background: 'var(--accent-primary)', 
          padding: '8px', 
          borderRadius: '12px',
          boxShadow: '0 0 15px hsla(199, 89%, 48%, 0.5)'
        }}>
          <Smartphone size={24} color="white" />
        </div>
        <h2 className="title-gradient" style={{ fontSize: '1.5rem', fontWeight: '700' }}>ALLFIX</h2>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              marginBottom: '8px',
              background: activeTab === item.id ? 'hsla(199, 89%, 48%, 0.1)' : 'transparent',
              color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderRadius: '12px',
              textAlign: 'left',
              border: 'none',
              fontSize: '1rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          color: 'hsla(0, 84%, 60%, 0.8)',
          background: 'transparent',
          border: 'none',
          marginTop: 'auto'
        }}
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </aside>
  );
};

export default Sidebar;
