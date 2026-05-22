
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

// ─── Module definitions with gradient + glow ──────────────────────────────────
const MODULE_DEFS = [
  { id: 'dashboard',       label: 'Dashboard',      icon: 'fa-chart-pie',           gradient: 'linear-gradient(145deg,#0d3580,#3b82f6)', glow: 'rgba(59,130,246,0.5)' },
  { id: 'agenda',          label: 'Agenda',         icon: 'fa-calendar-alt',        gradient: 'linear-gradient(145deg,#3b0764,#a855f7)', glow: 'rgba(168,85,247,0.5)' },
  { id: 'patients',        label: 'Pacientes',      icon: 'fa-paw',                 gradient: 'linear-gradient(145deg,#880e4f,#ec4899)', glow: 'rgba(236,72,153,0.5)' },
  { id: 'clinical',        label: 'Clínica & IA',   icon: 'fa-stethoscope',         gradient: 'linear-gradient(145deg,#00695c,#34d399)', glow: 'rgba(52,211,153,0.5)' },
  { id: 'hospitalization', label: 'Internação',     icon: 'fa-bed',                 gradient: 'linear-gradient(145deg,#7f1d1d,#f87171)', glow: 'rgba(248,113,113,0.5)' },
  { id: 'surgery',         label: 'Cirurgia',       icon: 'fa-procedures',          gradient: 'linear-gradient(145deg,#1a0050,#7c3aed)', glow: 'rgba(124,58,237,0.5)' },
  { id: 'telemedicine',    label: 'Telemedicina',   icon: 'fa-video',               gradient: 'linear-gradient(145deg,#004d56,#22d3ee)', glow: 'rgba(34,211,238,0.5)' },
  { id: 'advanced-ai',     label: 'IA Avançada',    icon: 'fa-wand-magic-sparkles', gradient: 'linear-gradient(145deg,#0d1157,#6366f1)', glow: 'rgba(99,102,241,0.5)' },
  { id: 'inventory',       label: 'Estoque',        icon: 'fa-boxes-stacked',       gradient: 'linear-gradient(145deg,#0050a0,#0ea5e9)', glow: 'rgba(14,165,233,0.5)' },
  { id: 'sales',           label: 'Vendas & PDV',   icon: 'fa-cash-register',       gradient: 'linear-gradient(145deg,#7c2d00,#fb923c)', glow: 'rgba(251,146,60,0.5)'  },
  { id: 'campaigns',       label: 'CRM & Mkt',      icon: 'fa-bullhorn',            gradient: 'linear-gradient(145deg,#78350f,#fbbf24)', glow: 'rgba(251,191,36,0.5)'  },
  { id: 'financial',       label: 'Financeiro',     icon: 'fa-dollar-sign',         gradient: 'linear-gradient(145deg,#14532d,#4ade80)', glow: 'rgba(74,222,128,0.5)'  },
  { id: 'plans',           label: 'Planos Pet',     icon: 'fa-id-card',             gradient: 'linear-gradient(145deg,#831843,#f472b6)', glow: 'rgba(244,114,182,0.5)' },
  { id: 'reports',         label: 'Relatórios',     icon: 'fa-chart-bar',           gradient: 'linear-gradient(145deg,#1e293b,#64748b)', glow: 'rgba(100,116,139,0.5)' },
  { id: 'tutor-app',       label: 'App Tutor',      icon: 'fa-mobile-alt',          gradient: 'linear-gradient(145deg,#020617,#334155)', glow: 'rgba(51,65,85,0.5)'   },
  { id: 'calculator',      label: 'Calculadora',    icon: 'fa-calculator',          gradient: 'linear-gradient(145deg,#1e2a6e,#6366f1)', glow: 'rgba(99,102,241,0.5)' },
  { id: 'logout',          label: 'Sair',           icon: 'fa-power-off',           gradient: 'linear-gradient(145deg,#7f1d1d,#ef4444)', glow: 'rgba(239,68,68,0.5)'  },
];

// ─── macOS-style squircle app icon ───────────────────────────────────────────
const AppIcon: React.FC<{ mod: typeof MODULE_DEFS[0]; onClick: () => void }> = ({ mod, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(6px, 0.8vw, 10px)',
        cursor: 'pointer',
        width: 'clamp(72px, 7vw, 96px)',
        transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'scale(1.12) translateY(-4px)' : 'scale(1)',
      }}
    >
      {/* Squircle */}
      <div
        style={{
          width: 'clamp(52px, 5.5vw, 72px)',
          height: 'clamp(52px, 5.5vw, 72px)',
          borderRadius: 'clamp(12px, 1.5vw, 18px)',
          background: mod.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: hovered
            ? `0 16px 40px -8px ${mod.glow}, 0 4px 12px rgba(0,0,0,0.4)`
            : '0 4px 16px rgba(0,0,0,0.35)',
          transition: 'box-shadow 0.2s ease',
          border: '1px solid rgba(255,255,255,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shine overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '45%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
          borderRadius: '18px 18px 50% 50%',
          pointerEvents: 'none',
        }} />
        {/* FontAwesome icon */}
        <i
          className={`fas ${mod.icon}`}
          style={{ width: 'clamp(20px, 2.5vw, 32px)', fontSize: 'clamp(16px, 2vw, 26px)' }}
        />
      </div>

      {/* Label */}
      <span style={{
        fontSize: 'clamp(9px, 0.9vw, 11px)',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.92)',
        textAlign: 'center',
        lineHeight: 1.3,
        textShadow: '0 1px 4px rgba(0,0,0,0.7)',
        letterSpacing: '0.01em',
        maxWidth: 'clamp(64px, 7vw, 88px)',
        wordBreak: 'break-word',
      }}>
        {mod.label}
      </span>
    </div>
  );
};

// ─── HomeModule ───────────────────────────────────────────────────────────────
const HomeModule: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigateTo } = useNavigation();

  const handleModuleClick = (id: string) => {
    if (id === 'logout') {
      if (window.confirm('Deseja realmente sair?')) logout();
    } else {
      navigateTo(id);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Dr.';

  return (
    <div
      style={{
        /* Each product keeps its own background image — VetSmart uses veterinary clinic */
        backgroundImage: 'url("https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        height: '100%',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(64px, 7vw + 40px, 72px) clamp(16px, 4vw, 48px) clamp(24px, 3vw, 40px)',
      }}
    >
      {/* ── Smoked glass overlay: diagonal 135° — left/top opaque, bottom-right transparent ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.85) 60%, rgba(15,23,42,0.4) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Greeting */}
        <div style={{ marginBottom: 40 }} className="animate-fade-in">
          <p style={{
            color: '#2DD4BF',
            fontSize: 'clamp(10px, 1vw, 13px)',
            fontWeight: 800,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            Olá, {firstName}!
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 'clamp(15px, 2vw, 22px)',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            Em que vamos trabalhar hoje?
          </p>
        </div>

        {/* Main layout: icon grid + info card */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(20px, 3vw, 40px)', alignItems: 'flex-start' }}>

          {/* macOS Launchpad-style icon grid */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(16px, 2.5vw, 28px) clamp(12px, 2vw, 20px)',
              flex: 1,
              minWidth: 'clamp(200px, 30vw, 280px)',
              alignContent: 'flex-start',
            }}
            className="animate-fade-in"
          >
            {MODULE_DEFS.map(mod => (
              <AppIcon
                key={mod.id}
                mod={mod}
                onClick={() => handleModuleClick(mod.id)}
              />
            ))}
          </div>

          {/* Info / Promo card */}
          <div
            style={{
              width: 'clamp(240px, 20vw, 300px)',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            className="animate-fade-in"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ color: 'white', fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' }}>VetGrid</span>
                <br />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise</span>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(145deg,#00695c,#34d399)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(52,211,153,0.4)',
              }}>
                <i className="fas fa-paw" style={{ color: 'white', fontSize: 16 }} />
              </div>
            </div>

            <h3 style={{
              color: '#2DD4BF',
              fontSize: 'clamp(14px, 1.5vw, 18px)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 10,
              textTransform: 'uppercase',
            }}>
              GESTÃO INTELIGENTE
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.6, marginBottom: 20 }}>
              Utilize a inteligência artificial para otimizar atendimentos, vendas e estoque da sua clínica veterinária.
            </p>

            <button
              className="omie-btn-primary w-full"
              style={{ padding: '12px 0', background: 'linear-gradient(135deg,#00695c,#0d9488)' }}
              onClick={() => navigateTo('advanced-ai')}
            >
              Acessar IA Avançada
            </button>

            {/* Quick stats */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Módulos disponíveis', value: `${MODULE_DEFS.length - 1}` },
                { label: 'Plataforma', value: 'Enterprise' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 48,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: 'white',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          opacity: 0.6,
        }}>
          <span>VetGrid Enterprise © 2026 · by IT2A</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span>Sistemas Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeModule;
