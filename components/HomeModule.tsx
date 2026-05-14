
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

const HomeModule: React.FC = () => {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();

  // VetGrid modules mapped to a vibrant mosaic grid
  const allModules = [
    { id: 'dashboard',       label: 'Dashboard',             icon: 'fa-chart-pie',        color: '#1565C0', size: 'large' },
    { id: 'agenda',          label: 'Agenda',                icon: 'fa-calendar-alt',     color: '#6A1B9A', size: 'normal' },
    { id: 'patients',        label: 'Pacientes',             icon: 'fa-paw',              color: '#C2185B', size: 'normal' },
    { id: 'clinical',        label: 'Clínica & IA',          icon: 'fa-stethoscope',      color: '#00695C', size: 'large' },
    { id: 'hospitalization', label: 'Internação',            icon: 'fa-bed',              color: '#B71C1C', size: 'normal' },
    { id: 'surgery',         icon: 'fa-procedures',       color: '#4527A0', size: 'normal' },
    { id: 'telemedicine',    icon: 'fa-video',            color: '#00838F', size: 'normal' },
    { id: 'advanced-ai',     icon: 'fa-wand-magic-sparkles', color: '#1A237E', size: 'large' },
    { id: 'inventory',       label: 'Estoque',               icon: 'fa-boxes-stacked',    color: '#0097A7', size: 'normal' },
    { id: 'sales',           label: 'Vendas & PDV',          icon: 'fa-cash-register',    color: '#E65100', size: 'large' },
    { id: 'campaigns',       label: 'CRM & Mkt',             icon: 'fa-bullhorn',         color: '#FF8F00', size: 'normal' },
    { id: 'financial',       label: 'Financeiro',            icon: 'fa-dollar-sign',      color: '#2E7D32', size: 'large' },
    { id: 'plans',           label: 'Planos Pet',            icon: 'fa-id-card',          color: '#D81B60', size: 'normal' },
    { id: 'reports',         label: 'Relatórios',            icon: 'fa-chart-bar',        color: '#37474F', size: 'normal' },
    { id: 'tutor-app',       label: 'App Tutor',             icon: 'fa-mobile-alt',       color: '#020617', size: 'normal' },
    { id: 'calculator',      label: 'Calculadora',           icon: 'fa-calculator',       color: '#3949AB', size: 'normal' },
  ];

  return (
    <div
      className="omie-home-container"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px'
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(2,6,23,0.95) 30%, rgba(2,6,23,0.4) 100%)',
        zIndex: 1
      }}></div>

      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 32 }} className="animate-fade-in">
          <p style={{ color: '#FF9F1C', fontSize: 14, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Olá, {user?.name?.split(' ')[0] || 'Dr.'}!
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 400 }}>
            Em que nós vamos trabalhar hoje?
          </p>
        </div>

        {/* Mosaic Grid + Promo Card Container */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '40px', 
          alignItems: 'flex-start'
        }}>
          {/* Mosaic Grid */}
          <div
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gridAutoRows: '130px',
              gap: '12px',
              flex: 1,
              minWidth: '300px',
            }}
            className="animate-fade-in stagger-1"
          >
            {allModules.map(mod => (
              <div
                key={mod.id}
                className="omie-module-card group"
                style={{ 
                  backgroundColor: mod.color,
                  gridColumn: mod.size === 'large' ? 'span 2' : 'span 1',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => navigateTo(mod.id)}
              >
                <i className={`fas ${mod.icon} group-hover:scale-110 transition-transform`} style={{ fontSize: '28px', color: 'white', opacity: 0.9 }}></i>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 900, 
                  color: 'white',
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em',
                  lineHeight: '1.2' 
                }}>
                  {mod.label}
                </span>
              </div>
            ))}
          </div>

          {/* Promo card */}
          <div
            style={{
              width: 320,
              flexShrink: 0,
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            className="animate-fade-in stagger-3"
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'white', fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' }}>VetGrid</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Enterprise</span>
              </div>
            </div>
            <h3 style={{ color: '#FF9F1C', fontSize: 20, fontWeight: 900, lineHeight: 1.1, marginBottom: 12, textTransform: 'uppercase', tracking: '0.05em' }}>
              GESTÃO INTELIGENTE
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.6, marginBottom: 24 }}>
              Utilize a inteligência artificial para otimizar atendimentos, vendas e estoque da sua clínica.
            </p>
            <button
              className="omie-btn-primary w-full"
              style={{ padding: '14px 0' }}
              onClick={() => navigateTo('advanced-ai')}
            >
              Acessar Auditoria AI
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9F1C' }}></div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 48,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 10,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          <span>VetGrid Enterprise © 2026</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
            <span>Sistemas Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeModule;
