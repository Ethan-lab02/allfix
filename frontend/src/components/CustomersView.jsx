import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, MapPin, MoreVertical } from 'lucide-react';
import { api } from '../services/api';

const CustomersView = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await api.customers.getAll(token);
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleSave = async () => {
    try {
      let response;
      if (isEdit) {
        response = await api.customers.update(editingId, newCustomer, token);
      } else {
        response = await api.customers.create(newCustomer, token);
      }

      if (response && !response.error) {
        setShowModal(false);
        setNewCustomer({ name: '', phone: '', email: '', address: '' });
        setIsEdit(false);
        setEditingId(null);
        fetchCustomers();
      } else {
        alert('Error al guardar: ' + (response.error || 'Desconocido'));
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    }
  };

  const handleEdit = (customer) => {
    setNewCustomer({ 
      name: customer.name, 
      phone: customer.phone, 
      email: customer.email, 
      address: customer.address 
    });
    setEditingId(customer.id);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        const response = await api.customers.delete(id, token);
        if (response && !response.error) {
          fetchCustomers();
        } else {
          alert('Error al eliminar: ' + (response.error || 'Desconocido'));
        }
      } catch (err) {
        alert('Error de conexión al eliminar');
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '2rem', fontWeight: '700' }}>Clientes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administra la base de datos de tus clientes.</p>
        </div>
        <button className="btn-primary" onClick={() => { setIsEdit(false); setNewCustomer({ name: '', phone: '', email: '', address: '' }); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </header>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..." 
            style={{ paddingLeft: '44px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'hsla(210, 40%, 98%, 0.02)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '500' }}>Cliente</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '500' }}>Contacto</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '500' }}>Dirección</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition-smooth)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'hsla(199, 89%, 48%, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} color="var(--accent-primary)" />
                    </div>
                    <span style={{ fontWeight: '500' }}>{customer.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="var(--text-secondary)" /> {customer.phone}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} /> {customer.email}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--text-secondary)" /> {customer.address}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(customer)} style={{ background: 'hsla(199, 89%, 48%, 0.1)', color: 'var(--accent-primary)', padding: '6px 12px', fontSize: '0.8rem' }}>Editar</button>
                    <button onClick={() => handleDelete(customer.id)} style={{ background: 'hsla(0, 89%, 48%, 0.1)', color: '#ff4d4d', padding: '6px 12px', fontSize: '0.8rem' }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '500px', animation: 'scaleUp 0.3s ease-out' }}>
            <h2 style={{ marginBottom: '24px' }}>{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="text" 
                placeholder="Nombre completo" 
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Teléfono" 
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              />
              <textarea 
                placeholder="Dirección" 
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--glass-border)', 
                  background: 'hsla(210, 40%, 98%, 0.05)',
                  color: 'white',
                  fontFamily: 'var(--font-main)',
                  minHeight: '100px'
                }}
              ></textarea>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>{isEdit ? 'Actualizar' : 'Guardar'}</button>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, background: 'hsla(210, 40%, 98%, 0.1)', color: 'white' }}
                >Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;
