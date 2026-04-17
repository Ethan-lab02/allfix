import React from 'react';
import { TrendingUp, Users, ClipboardCheck, Clock, Calendar } from 'lucide-react';

import { api } from '../services/api';

const formatDateTime = (value) => {
  if (!value) return 'Sin definir';

  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DashboardView = ({ token }) => {
  const [data, setData] = React.useState({
    todayOrders: 0,
    totalCustomers: 0,
    completionRate: 0,
    totalRevenue: 0,
    recentOrders: [],
    upcomingOrdersCount: 0,
    upcomingOrdersList: [],
    todayOrdersList: [],
    completedOrdersList: []
  });
  const [modalType, setModalType] = React.useState(null); // 'today', 'upcoming', 'completed', 'revenue'
  const [showModal, setShowModal] = React.useState(false);

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
    { label: 'Órdenes Hoy', value: data.todayOrders, icon: Clock, color: 'hsl(199, 89%, 48%)', type: 'today' },
    { label: 'Próximas Órdenes', value: data.upcomingOrdersCount, icon: Calendar, color: 'hsl(162, 84%, 39%)', type: 'upcoming' },
    { label: 'Completadas', value: `${data.completionRate}%`, icon: ClipboardCheck, color: 'hsl(280, 67%, 60%)', type: 'completed' },
    { label: 'Total Ingresos', value: `$${data.totalRevenue?.toLocaleString()}`, icon: TrendingUp, color: 'hsl(35, 92%, 50%)', type: 'revenue' },
  ];

  const handleStatClick = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const getModalContent = () => {
    switch (modalType) {
      case 'today':
        return {
          title: 'Órdenes Recibidas Hoy',
          list: data.todayOrdersList || [],
          renderItem: (order) => (
            <div key={order.id} style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{order.folio || `#${order.id}`}</span>
                <p style={{ margin: '4px 0' }}>{order.customer_name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.equipment_type}</p>
              </div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontStyle: 'italic' }}>{order.status_name}</span>
            </div>
          )
        };
      case 'upcoming':
        return {
          title: 'Entregas Próximas (3 días)',
          list: data.upcomingOrdersList || [],
          renderItem: (order) => (
            <div key={order.id} style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{order.folio || `#${order.id}`}</span>
                <p style={{ margin: '4px 0' }}>{order.customer_name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.equipment_type}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                  {formatDateTime(order.delivery_date)}
                </p>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{order.status_name}</span>
              </div>
            </div>
          )
        };
      case 'completed':
        return {
          title: 'Órdenes Completadas (Últimas 20)',
          list: data.completedOrdersList || [],
          renderItem: (order) => (
            <div key={order.id} style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{order.folio || `#${order.id}`}</span>
                <p style={{ margin: '4px 0' }}>{order.customer_name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.equipment_type}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>Entregado: {formatDateTime(order.delivery_date)}</p>
                <p style={{ fontWeight: 'bold' }}>${order.total_cost}</p>
              </div>
            </div>
          )
        };
      case 'revenue':
        return {
          title: 'Detalle de Ingresos (Órdenes Entregadas)',
          list: data.completedOrdersList || [],
          renderItem: (order) => (
            <div key={order.id} style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{order.folio || `#${order.id}`} - {order.customer_name}</span>
              <span style={{ fontWeight: 'bold', color: 'hsl(35, 92%, 50%)' }}>+${order.total_cost}</span>
            </div>
          )
        };
      default:
        return { title: 'Información', list: [], renderItem: () => null };
    }
  };

  const modalContent = getModalContent();

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
          <div 
            key={i} 
            className="glass-card" 
            onClick={() => handleStatClick(stat.type)}
            style={{ 
              padding: '24px', 
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ 
                background: `${stat.color}15`, 
                padding: '10px', 
                borderRadius: '12px' 
              }}>
                <stat.icon size={24} color={stat.color} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--glass-bg)', padding: '2px 8px', borderRadius: '4px' }}>VER DETALLE</div>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stat.value}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 className="title-gradient" style={{ marginBottom: '24px' }}>{modalContent.title}</h2>
            <div style={{ display: 'grid', gap: '8px' }}>
              {modalContent.list.length > 0 ? modalContent.list.map(modalContent.renderItem) : (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No hay información disponible para este apartado.</p>
              )}
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '24px' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

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
                  <td style={{ padding: '16px 0', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{order.folio || `#${order.id}`}</td>
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
                    {formatDateTime(order.created_at)}
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
