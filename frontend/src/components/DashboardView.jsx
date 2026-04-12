import React from 'react';
import { TrendingUp, Users, ClipboardCheck, Clock } from 'lucide-react';

import { api } from '../services/api';

const DashboardView = ({ token }) => {
  const [data, setData] = React.useState({
    todayOrders: 0,
    totalCustomers: 0,
    completionRate: 0,
    totalRevenue: 0,
    recentOrders: []
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await api.stats.getSummary(token);
        if (statsData && !statsData.error) {
          setData(statsData);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, [token]);

  const stats = [
    { label: 'Órdenes Hoy', value: data.todayOrders, icon: Clock, color: 'hsl(199, 89%, 48%)' },
    { label: 'Clientes Totales', value: data.totalCustomers, icon: Users, color: 'hsl(162, 84%, 39%)' },
    { label: 'Completadas', value: `${data.completionRate}%`, icon: ClipboardCheck, color: 'hsl(280, 67%, 60%)' },
    { label: 'Total Ingresos', value: `$${data.totalRevenue?.toLocaleString()}`, icon: TrendingUp, color: 'hsl(35, 92%, 50%)' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="title-gradient" style={{ fontSize: '2rem', fontWeight: '700' }}>Resumen del Sistema</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Bienvenido de nuevo al panel de control de ALLFIX.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ 
                background: `${stat.color}15`, 
                padding: '10px', 
                borderRadius: '12px' 
              }}>
                <stat.icon size={24} color={stat.color} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stat.value}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Órdenes Recientes</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <th style={{ paddingBottom: '16px' }}>Folio</th>
                <th style={{ paddingBottom: '16px' }}>Cliente</th>
                <th style={{ paddingBottom: '16px' }}>Equipo</th>
                <th style={{ paddingBottom: '16px' }}>Estado</th>
                <th style={{ paddingBottom: '16px', textAlign: 'right' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders?.length > 0 ? data.recentOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '16px 0', fontWeight: 'bold', color: 'var(--accent-primary)' }}>#{order.id}</td>
                  <td style={{ padding: '16px 0' }}>{order.customer_name}</td>
                  <td style={{ padding: '16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{order.equipment_type}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      background: 'hsla(199, 89%, 48%, 0.15)',
                      color: 'hsl(199, 89%, 48%)',
                      textTransform: 'uppercase'
                    }}>{order.status_name}</span>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay órdenes recientes para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
