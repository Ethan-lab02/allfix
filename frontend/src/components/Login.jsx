import React, { useState } from 'react';
import { LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('3'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const response = await api.auth.login({ email, password });
        if (response.error) {
          setError('Credenciales inválidas. ¿Ya te registraste?');
        } else {
          onLogin({ ...response.user, token: response.token });
        }
      } else {
        const response = await api.auth.register({ name, email, password, role_id: role });
        if (response.error) {
          setError('Error al registrar: ' + response.error);
        } else {
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-card" style={{ padding: '40px', maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'hsla(199, 89%, 48%, 0.15)', borderRadius: '16px', marginBottom: '16px' }}>
            <ShieldCheck size={32} color="hsl(199, 89%, 48%)" />
          </div>
          <h1 className="title-gradient" style={{ fontSize: '2rem', fontWeight: '700' }}>ALLFIX</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Acceso al Sistema Gestor' : 'Crear una nueva cuenta'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'hsla(0, 84%, 60%, 0.1)', 
            border: '1px solid hsla(0, 84%, 60%, 0.2)', 
            padding: '12px', 
            borderRadius: '12px', 
            color: 'hsla(0, 84%, 60%, 0.9)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Juan Pérez" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rol del Usuario</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--glass-border)', 
                    background: 'hsla(210, 40%, 98%, 0.05)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-main)'
                  }}
                >
                  <option value="1" style={{ background: '#1a1a1a' }}>Administrador</option>
                  <option value="2" style={{ background: '#1a1a1a' }}>Técnico</option>
                  <option value="3" style={{ background: '#1a1a1a' }}>Recepcionista</option>
                </select>
              </div>
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              placeholder="admin@allfix.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {isLogin ? <LogIn size={20} /> : null}
            {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', color: 'var(--accent-primary)', marginLeft: '8px', padding: '0', fontWeight: '700' }}
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
