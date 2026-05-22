import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  moduleColor?: string;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  moduleColor = '#0D9488',
  isExpanded,
  setIsExpanded,
}) => {
  const { user, logout } = useAuth();
  const [logoutBusy, setLogoutBusy] = useState(false);

  const menuItems = [
    { id: 'dashboard',    icon: 'fa-chart-pie',          label: 'Dashboard'    },
    { id: 'agenda',       icon: 'fa-calendar-alt',        label: 'Agenda'       },
    { id: 'clinical',     icon: 'fa-stethoscope',         label: 'Clínica & IA' },
    { id: 'telemedicine', icon: 'fa-video',               label: 'Telemedicina' },
    { id: 'inventory',    icon: 'fa-boxes-stacked',       label: 'Estoque'      },
    { id: 'sales',        icon: 'fa-cash-register',       label: 'Vendas & PDV' },
    { id: 'campaigns',    icon: 'fa-bullhorn',            label: 'CRM & Mkt'    },
    { id: 'financial',    icon: 'fa-dollar-sign',         label: 'Financeiro'   },
    { id: 'plans',        icon: 'fa-id-card',             label: 'Planos Pet'   },
    { id: 'reports',      icon: 'fa-chart-bar',           label: 'Relatórios'   },
    { id: 'tutor-app',    icon: 'fa-mobile-alt',          label: 'App Tutor'    },
    { id: 'calculator',   icon: 'fa-calculator',          label: 'Calculadora'  },
  ];

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      try {
        setLogoutBusy(true);
        logout();
      } finally {
        setLogoutBusy(false);
      }
    }
  };

  return (
    <aside
      className={`app-sidebar no-print hidden md:flex glass-sidebar ${
        isExpanded
          ? 'app-sidebar-expanded flex-col transition-all duration-300 h-screen sticky top-0 z-40 shrink-0 text-slate-300'
          : 'omie-sidebar'
      }`}
    >
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div
        className={`${
          !isExpanded
            ? 'h-16 flex items-center justify-center border-b border-white/5'
            : 'h-20 flex flex-col justify-center px-5 border-b border-slate-800'
        } shrink-0 cursor-pointer`}
        onClick={() => setActiveTab('home')}
        title="VetGrid Home"
      >
        {!isExpanded ? (
          <img
            src="/logo_white.png"
            alt="IT2A"
            className="w-12 h-12 object-contain opacity-95"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo_white.png"
              alt="IT2A"
              className="w-12 h-12 object-contain opacity-95"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex flex-col">
              <span className="block font-bold text-white text-[13px] leading-tight truncate tracking-tight uppercase">
                VetGrid
              </span>
              <span className="block text-[9px] text-slate-500 font-bold truncate uppercase tracking-[0.14em]">
                Enterprise Ecosystem
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── USER AVATAR ─────────────────────────────────────────── */}
      {user && (
        <div
          className={`shrink-0 ${
            !isExpanded ? 'px-2 py-2' : 'px-3 lg:px-5 py-2'
          } border-b border-slate-800`}
        >
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border border-slate-700"
                style={{ background: `${moduleColor}30`, color: moduleColor }}
              >
                {(user.name || user.email || 'V').charAt(0).toUpperCase()}
              </div>
              <p className="text-[11px] font-medium text-slate-400 truncate flex-1">
                {user.name || user.email || 'Usuário'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-700"
                style={{ background: `${moduleColor}30`, color: moduleColor }}
                title={user.name || user.email || 'Usuário'}
              >
                {(user.name || user.email || 'V').charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── COLLAPSE / EXPAND TOGGLE ────────────────────────────── */}
      <div className={`flex ${!isExpanded ? 'justify-center' : 'justify-end'} px-2 py-2 shrink-0`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          title={isExpanded ? 'Colapsar' : 'Expandir'}
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-left' : 'fa-chevron-right'} text-[11px]`} />
        </button>
      </div>

      {/* ── NAV ITEMS ────────────────────────────────────────────── */}
      <nav
        className={`flex-1 py-2 ${!isExpanded ? 'px-2' : 'px-3'} space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar-sidebar`}
      >
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;

          if (isExpanded) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-10 flex items-center px-3 gap-3 rounded-lg transition-all text-sm font-medium relative group cursor-pointer ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
                style={isActive ? { background: `${moduleColor}25` } : {}}
                title={item.label}
              >
                <i className={`fas ${item.icon} text-[14px] w-5 text-center shrink-0`} />
                <span className="whitespace-nowrap">{item.label}</span>
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: moduleColor }}
                  />
                )}
              </button>
            );
          } else {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="omie-sidebar-item cursor-pointer"
                style={{
                  height: '44px',
                  width: '44px',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  background: isActive ? moduleColor : 'transparent',
                  boxShadow: isActive ? `0 4px 12px -3px ${moduleColor}80` : undefined,
                }}
                title={item.label}
              >
                <i className={`fas ${item.icon}`} />
              </button>
            );
          }
        })}
      </nav>

      {/* ── LOGOUT ───────────────────────────────────────────────── */}
      <div className="mt-auto w-full border-t border-white/5 flex flex-col items-center py-2">
        {isExpanded ? (
          <button
            className="w-[calc(100%-16px)] mx-2 h-10 flex items-center px-3 gap-3 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            onClick={handleLogout}
            title="Sair"
          >
            <i className={`${logoutBusy ? 'fas fa-circle-notch fa-spin' : 'fas fa-power-off'} text-[14px] w-5 text-center shrink-0`} />
            <span className="whitespace-nowrap">Sair</span>
          </button>
        ) : (
          <button
            className="omie-sidebar-item cursor-pointer"
            style={{
              height: '44px',
              width: '44px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
            }}
            onClick={handleLogout}
            title="Sair"
          >
            <i className={logoutBusy ? 'fas fa-circle-notch fa-spin text-white' : 'fas fa-power-off text-rose-500 text-[15px]'} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
