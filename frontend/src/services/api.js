const API_URL = '/api';

export const api = {
  auth: {
    login: (credentials) => fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(res => res.json()),
    register: (data) => fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  },
  customers: {
    getAll: (token) => fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
    create: (data, token) => fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id, data, token) => fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id, token) => fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
  },
  orders: {
    getAll: (token) => fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
    create: (data, token) => fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    updateStatus: (id, status_id, token) => fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status_id })
    }).then(res => res.json()),
    update: (id, data, token) => fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    getTechnicians: (token) => fetch(`${API_URL}/orders/technicians`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
    getDetails: (id, token) => fetch(`${API_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
    delete: (id, token) => fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
  },
  stats: {
    getSummary: (token) => fetch(`${API_URL}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
  }
};
