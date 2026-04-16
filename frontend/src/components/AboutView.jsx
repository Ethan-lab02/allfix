import React from 'react';
import { Info, Users, Smartphone, ShieldCheck } from 'lucide-react';

const AboutView = () => {
  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="title-gradient" style={{ fontSize: '2rem', fontWeight: '700' }}>Acerca de</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Información del proyecto y equipo de desarrollo.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'hsla(199, 89%, 48%, 0.15)', padding: '12px', borderRadius: '16px' }}>
              <Smartphone size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Sistema Gestor Digital</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            Este prototipo funcional ha sido desarrollado para optimizar la gestión de órdenes de servicio en 
            <strong> ALLFIX BACALAR</strong>. Implementa una arquitectura cliente-servidor orientada a servicios 
            con una interfaz moderna y segura.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '12px', background: 'hsla(162, 84%, 39%, 0.1)', color: 'var(--accent-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>Vite + React</span>
            <span style={{ padding: '6px 12px', borderRadius: '12px', background: 'hsla(199, 89%, 48%, 0.1)', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '600' }}>Node.js + Express</span>
            <span style={{ padding: '6px 12px', borderRadius: '12px', background: 'hsla(210, 40%, 98%, 0.1)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: '600' }}>PostgreSQL</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'hsla(162, 84%, 39%, 0.15)', padding: '12px', borderRadius: '16px' }}>
              <Users size={28} color="var(--accent-secondary)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Equipo de Trabajo</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-secondary)' }}></div>
              <span style={{ fontSize: '1.1rem' }}>Eliel Alegría Cruz</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-secondary)' }}></div>
              <span style={{ fontSize: '1.1rem' }}>Itamar Abdi May Avila</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginTop: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <ShieldCheck size={16} /> 
          Arquitectura orientada a servicios con protección JWT y encriptación Bcrypt.
        </p>
      </div>
    </div>
  );
};

export default AboutView;
