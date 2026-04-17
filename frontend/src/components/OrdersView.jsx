import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Clock, CheckCircle, Package, AlertCircle, Wrench, FileSearch, XCircle } from 'lucide-react';
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

const ACCESSORY_OPTIONS = ['SIM', 'Funda', 'Memoria', 'Cargador'];
const DELETABLE_STATUSES = ['terminado', 'entregado', 'cancelado'];

const StatusBadge = ({ status }) => {
  const configs = {
    'recibido': { color: 'hsl(199, 89%, 48%)', icon: Clock, label: 'Recibido' },
    'en diagnostico': { color: 'hsl(41, 92%, 56%)', icon: FileSearch, label: 'En Diagnostico' },
    'en reparacion': { color: 'hsl(24, 95%, 53%)', icon: Wrench, label: 'En Reparacion' },
    'retrasado': { color: 'hsl(0, 84%, 60%)', icon: AlertCircle, label: 'Retrasado' },
    'cancelado': { color: 'hsl(0, 0%, 55%)', icon: XCircle, label: 'Cancelado' },
    'terminado': { color: 'hsl(280, 67%, 60%)', icon: CheckCircle, label: 'Terminado' },
    'entregado': { color: 'hsl(162, 84%, 39%)', icon: Package, label: 'Entregado' },
  };

  const config = configs[status.toLowerCase()] || configs['recibido'];
  const Icon = config.icon;

  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px', 
      padding: '6px 12px', 
      borderRadius: '20px', 
      fontSize: '0.8rem', 
      fontWeight: '600',
      background: `${config.color}15`,
      color: config.color,
      border: `1px solid ${config.color}30`
    }}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

const OrdersView = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrderData, setEditOrderData] = useState({
    diagnosis: '',
    observations: '',
    total_cost: '',
    technician_id: '',
    status_id: ''
  });
  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    equipment_type: '',
    brand: '',
    model: '',
    problem_description: '',
    accessories: [],
    estimated_cost: '',
    technician_id: '',
    delivery_date: ''
  });

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchCustomers();
      fetchTechnicians();
      fetchStatuses();
    }
  }, [token]);

  const fetchStatuses = async () => {
    try {
      const data = await api.orders.getStatuses(token);
      if (Array.isArray(data)) setStatuses(data);
    } catch (err) {
      console.error('Error fetching statuses:', err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await api.orders.getTechnicians(token);
      if (Array.isArray(data)) setTechnicians(data);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      const data = await api.orders.getDetails(id, token);
      if (data && !data.error) {
        setSelectedOrder(data);
        setShowDetails(true);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchOrders = async () => {
    try {
      const data = await api.orders.getAll(token);
      if (data.error) {
        console.error('API Error (orders):', data.error);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchCustomers = async () => {
    console.log('OrdersView: Fetching customers with token:', token ? 'Present' : 'Missing');
    try {
      const data = await api.customers.getAll(token);
      if (data.error) {
        console.error('API Error (customers):', data.error);
        if (data.error.includes('expired') || data.error.includes('token')) {
          alert('Tu sesión ha expirado. Por favor, reinicia sesión.');
        }
      } else if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const toggleAccessory = (accessory) => {
    const currentAccessories = Array.isArray(newOrder.accessories) ? newOrder.accessories : [];
    const hasAccessory = currentAccessories.includes(accessory);

    setNewOrder({
      ...newOrder,
      accessories: hasAccessory
        ? currentAccessories.filter((item) => item !== accessory)
        : [...currentAccessories, accessory]
    });
  };

  const handleSave = async () => {
    try {
      const accessoriesArray = Array.isArray(newOrder.accessories)
        ? newOrder.accessories
        : String(newOrder.accessories || '').split(/[, \n]+/).filter(a => a.trim());
      const payload = new FormData();

      Object.entries({
        ...newOrder,
        accessories: JSON.stringify(accessoriesArray)
      }).forEach(([key, value]) => {
        payload.append(key, value ?? '');
      });

      selectedFiles.forEach((file) => {
        payload.append('photos', file);
      });

      const response = await api.orders.create(payload, token);
      if (response && !response.error) {
        setShowModal(false);
        setNewOrder({
          customer_id: '',
          equipment_type: '',
          brand: '',
          model: '',
          problem_description: '',
          accessories: [],
          estimated_cost: '',
          technician_id: '',
          delivery_date: ''
        });
        setSelectedFiles([]);
        fetchOrders();
        alert(`Orden creada correctamente. Folio generado: ${response.folio || `#${response.id}`}`);
      } else {
        alert('Error al guardar la orden: ' + (response.error || 'Desconocido'));
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    }
  };

  const handleStatusChange = async (orderId, newStatusId) => {
    try {
      const response = await api.orders.updateStatus(orderId, newStatusId, token);
      if (response && !response.error) {
        fetchOrders();
      } else {
        alert('Error al actualizar estado: ' + (response.error || 'Desconocido'));
      }
    } catch (err) {
      alert('Error de conexión al actualizar estado');
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await api.orders.update(selectedOrder.id, editOrderData, token);
      if (response && !response.error) {
        setShowEditModal(false);
        fetchOrders();
        // If details modal is open, refresh its data
        if (showDetails) {
          fetchOrderDetails(selectedOrder.id);
        }
      } else {
        alert('Error al actualizar la orden: ' + (response.error || 'Desconocido'));
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')) return;
    
    try {
      const response = await api.orders.delete(id, token);
      if (response && !response.error) {
        fetchOrders();
      } else {
        alert('Error al eliminar: ' + (response.error || 'Desconocido'));
      }
    } catch (err) {
      alert('Error de conexión al eliminar la orden');
    }
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setEditOrderData({
      diagnosis: order.diagnosis || '',
      observations: order.observations || '',
      total_cost: order.total_cost || 0,
      technician_id: order.technician_id || '',
      status_id: order.status_id || ''
    });
    setShowEditModal(true);
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id?.toString().includes(searchTerm) ||
    o.folio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '2rem', fontWeight: '700' }}>Órdenes de Servicio</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Seguimiento y gestión de reparaciones en tiempo real.</p>
        </div>
        <button className="btn-primary" onClick={() => { fetchCustomers(); setSelectedFiles([]); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} />
          Nueva Orden
        </button>
      </header>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por cliente o folio..." 
            style={{ paddingLeft: '44px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
          <div key={order.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'hsla(199, 89%, 48%, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent-primary)'
              }}>
                <ClipboardList size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '1px' }}>{order.folio || `#${order.id}`}</span>
                  <StatusBadge status={order.status_name || 'recibido'} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{order.customer_name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {order.equipment_type} - {order.brand}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <select 
                value={order.status_id}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                style={{ 
                  background: 'hsla(210, 40%, 98%, 0.05)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--glass-border)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {statuses.map((statusOption) => (
                  <option key={statusOption.id} value={statusOption.id} style={{ background: '#1a1a1a' }}>
                    {statusOption.name}
                  </option>
                ))}
              </select>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Ingreso: {formatDateTime(order.created_at)}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ 
                    background: 'hsla(199, 89%, 48%, 0.1)', 
                    color: 'var(--accent-primary)', 
                    padding: '8px 16px', 
                    borderRadius: '10px',
                    fontSize: '0.9rem' 
                  }} onClick={() => openEditModal(order)}>
                    Editar
                  </button>
                  <button style={{ 
                    background: 'hsla(210, 40%, 98%, 0.1)', 
                    color: 'var(--text-primary)', 
                    padding: '8px 16px', 
                    borderRadius: '10px',
                    fontSize: '0.9rem' 
                  }} onClick={() => fetchOrderDetails(order.id)}>
                    Ver Detalles
                  </button>
                  {DELETABLE_STATUSES.includes((order.status_name || '').toLowerCase()) && (
                    <button style={{ 
                      background: 'hsla(0, 84%, 60%, 0.1)', 
                      color: '#ff4d4d', 
                      padding: '8px 16px', 
                      borderRadius: '10px',
                      fontSize: '0.9rem' 
                    }} onClick={() => handleDelete(order.id)}>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No se encontraron órdenes de servicio.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="title-gradient" style={{ marginBottom: '24px' }}>Nueva Orden de Servicio</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cliente</label>
                  <select 
                    value={newOrder.customer_id}
                    onChange={(e) => setNewOrder({...newOrder, customer_id: e.target.value})}
                    className="glass-input"
                    style={{ background: 'hsla(0,0%,100%,0.1)', color: 'var(--text-primary)' }}
                  >
                    <option value="" style={{ background: '#1a1a1a' }}>Selecciona un cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#1a1a1a' }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Técnico Asignado</label>
                  <select 
                    value={newOrder.technician_id}
                    onChange={(e) => setNewOrder({...newOrder, technician_id: e.target.value})}
                    className="glass-input"
                  >
                    <option value="" style={{ background: '#1a1a1a' }}>Opcional...</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id} style={{ background: '#1a1a1a' }}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tipo de Equipo</label>
                  <input type="text" placeholder="Ej. Laptop" value={newOrder.equipment_type} onChange={e => setNewOrder({...newOrder, equipment_type: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Marca</label>
                  <input type="text" placeholder="Ej. Dell" value={newOrder.brand} onChange={e => setNewOrder({...newOrder, brand: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Modelo</label>
                  <input type="text" placeholder="Ej. Inspiron 15" value={newOrder.model} onChange={e => setNewOrder({...newOrder, model: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Descripción del Problema</label>
                <textarea 
                  placeholder="Detalles de la falla..."
                  value={newOrder.problem_description}
                  onChange={e => setNewOrder({...newOrder, problem_description: e.target.value})}
                  className="glass-input"
                  style={{ minHeight: '84px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Evidencias Fotográficas</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  className="glass-input"
                />
                <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} archivo(s): ${selectedFiles.map(file => file.name).join(', ')}`
                    : 'Selecciona hasta 5 imágenes desde tu computadora.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Accesorios</label>
                  <div className="accessory-switch-grid">
                    {ACCESSORY_OPTIONS.map((accessory) => {
                      const isActive = newOrder.accessories.includes(accessory);

                      return (
                        <button
                          key={accessory}
                          type="button"
                          className={`accessory-switch ${isActive ? 'is-active' : ''}`}
                          onClick={() => toggleAccessory(accessory)}
                        >
                          <span>{accessory}</span>
                          <span className="accessory-switch-track">
                            <span className="accessory-switch-thumb" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Activa todos los accesorios que llegaron con el equipo.
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Costo Estimado</label>
                  <input type="number" placeholder="$0.00" value={newOrder.estimated_cost} onChange={e => setNewOrder({...newOrder, estimated_cost: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fecha de Entrega (Promesa)</label>
                  <input 
                    type="datetime-local" 
                    value={newOrder.delivery_date} 
                    onChange={e => setNewOrder({...newOrder, delivery_date: e.target.value})} 
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Crear Orden</button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedFiles([]);
                  }}
                  style={{ flex: 1, background: 'hsla(210, 40%, 98%, 0.1)', color: 'var(--text-primary)', borderRadius: '12px' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110 }}>
          <div id="order-receipt" className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '800px', maxHeight: '95vh', overflowY: 'auto', background: '#ffffff', color: '#000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
              <div>
                <h1 style={{ margin: 0, color: 'hsl(199, 89%, 48%)' }}>ALLFIX BACALAR</h1>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#666' }}>Digital Management System - Reporte de Servicio</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0 }}>Folio {selectedOrder.folio || `#${selectedOrder.id}`}</h2>
                <p style={{ margin: '4px 0' }}>Ingreso: {formatDateTime(selectedOrder.created_at)}</p>
                {selectedOrder.delivery_date && (
                  <p style={{ margin: '4px 0', color: '#16a34a', fontWeight: 'bold' }}>Entrega programada/real: {formatDateTime(selectedOrder.delivery_date)}</p>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
              <div>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#888', marginBottom: '12px', borderBottom: '1px solid #ddd' }}>Datos del Cliente</h4>
                <p style={{ margin: '8px 0' }}><strong>Nombre:</strong> {selectedOrder.customer_name}</p>
                <p style={{ margin: '8px 0' }}><strong>Teléfono:</strong> {selectedOrder.customer_phone}</p>
                <p style={{ margin: '8px 0' }}><strong>Dirección:</strong> {selectedOrder.customer_address}</p>
              </div>
              <div>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#888', marginBottom: '12px', borderBottom: '1px solid #ddd' }}>Datos del Equipo</h4>
                <p style={{ margin: '8px 0' }}><strong>Equipo:</strong> {selectedOrder.equipment_type} {selectedOrder.brand}</p>
                <p style={{ margin: '8px 0' }}><strong>Modelo:</strong> {selectedOrder.model}</p>
              </div>
            </div>

            <div style={{ marginBottom: '30px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ marginTop: 0, color: '#1e293b' }}>Diagnóstico y Observaciones</h4>
              <p style={{ lineHeight: '1.6', color: '#334155' }}>{selectedOrder.diagnosis || 'Sin diagnóstico registrado.'}</p>
              {selectedOrder.observations && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Observaciones adicionales:</strong>
                  <p>{selectedOrder.observations}</p>
                </div>
              )}
              {selectedOrder.accessories?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Accesorios recibidos:</strong>
                  <p style={{ color: '#64748b' }}>{selectedOrder.accessories.join(', ')}</p>
                </div>
              )}
            </div>

            {selectedOrder.photos?.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>Evidencias Fotográficas</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {selectedOrder.photos.map((p, i) => (
                    <img key={i} src={p.url} alt="Evidencia" style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #eee', paddingTop: '20px' }}>
              <div>
                <p style={{ margin: '4px 0' }}><strong>Técnico:</strong> {selectedOrder.technician_name || 'Pendiente de asignación'}</p>
                <p style={{ margin: '4px 0' }}><strong>Recepcionista:</strong> {selectedOrder.receptionist_name}</p>
                <p style={{ margin: '8px 0' }}>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold',
                    background: 'hsl(199, 89%, 48%)',
                    color: 'white'
                  }}>ESTADO: {(selectedOrder.status_name || 'RECIBIDO').toUpperCase()}</span>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>Total: ${selectedOrder.total_cost}</h3>
              </div>
            </div>

            <div className="no-print" style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: '16px' }} 
                onClick={handlePrint}
              >Imprimir Comprobante</button>
              <button 
                onClick={() => setShowDetails(false)} 
                style={{ flex: 1, background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: 'bold' }}
              >Cerrar Vista</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120 }}>
          <div className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '500px' }}>
            <h2 className="title-gradient" style={{ marginBottom: '24px' }}>Actualizar Detalles del Servicio</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estado del Equipo</label>
                <select 
                  value={editOrderData.status_id}
                  onChange={(e) => setEditOrderData({...editOrderData, status_id: e.target.value})}
                  className="glass-input"
                  style={{ background: 'hsla(0,0%,100%,0.1)', color: 'var(--text-primary)', width: '100%' }}
                >
                  {statuses.map((statusOption) => (
                    <option key={statusOption.id} value={statusOption.id} style={{ background: '#1a1a1a' }}>
                      {statusOption.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Diagnóstico Técnico</label>
                <textarea 
                  placeholder="Escribe el diagnóstico detallado..."
                  value={editOrderData.diagnosis}
                  onChange={e => setEditOrderData({...editOrderData, diagnosis: e.target.value})}
                  style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Observaciones Internas</label>
                <textarea 
                  placeholder="Notas adicionales..."
                  value={editOrderData.observations}
                  onChange={e => setEditOrderData({...editOrderData, observations: e.target.value})}
                  style={{ width: '100%', height: '60px', padding: '12px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Técnico</label>
                  <select 
                    value={editOrderData.technician_id}
                    onChange={(e) => setEditOrderData({...editOrderData, technician_id: e.target.value})}
                    style={{ background: 'hsla(0,0%,100%,0.1)', color: 'var(--text-primary)', borderRadius: '12px', padding: '10px', border: '1px solid var(--glass-border)', width: '100%', fontSize: '0.9rem' }}
                  >
                    <option value="" style={{ background: '#1a1a1a' }}>Sin asignar</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id} style={{ background: '#1a1a1a' }}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Costo Final ($)</label>
                  <input 
                    type="number" 
                    value={editOrderData.total_cost} 
                    onChange={e => setEditOrderData({...editOrderData, total_cost: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleUpdate}>Guardar Cambios</button>
                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, background: 'hsla(210, 40%, 98%, 0.1)', color: 'var(--text-primary)', borderRadius: '12px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
