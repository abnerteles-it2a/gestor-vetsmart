import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const [logoutBusy, setLogoutBusy] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'agenda', label: 'Agenda', icon: 'fa-calendar-alt' },
    { id: 'clinical', label: 'Prontuário', icon: 'fa-stethoscope' },
    { id: 'hospitalization', label: 'Internação', icon: 'fa-bed' },
    { id: 'surgery', label: 'Centro Cirúrgico', icon: 'fa-heartbeat' },
    { id: 'telemedicine', label: 'Telemedicina', icon: 'fa-video' },
    { id: 'tutor-app', label: 'App do Tutor', icon: 'fa-mobile-alt' },
    { id: 'advanced-ai', label: 'IA Veterinária', icon: 'fa-brain' },
    { id: 'patients', label: 'Pacientes', icon: 'fa-paw' },
    { id: 'inventory', label: 'Estoque', icon: 'fa-boxes' },
    { id: 'sales', label: 'Vendas/Caixa', icon: 'fa-cash-register' },
    { id: 'financial', label: 'Financeiro IA', icon: 'fa-chart-line' },
    { id: 'campaigns', label: 'Campanhas', icon: 'fa-bullhorn' },
    { id: 'plans', label: 'Planos', icon: 'fa-id-card' },
    { id: 'reports', label: 'Relatórios', icon: 'fa-file-invoice-dollar' },
  ];

  const handleLogout = async () => {
    try {
      setLogoutBusy(true);
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLogoutBusy(false);
    }
  };

  const navBtnClass = (id: string) => `w-full h-10 flex items-center ${collapsed ? 'justify-center' : 'px-3'} gap-3 rounded-lg transition-all text-sm font-medium relative group ${
    activeTab === id 
      ? 'bg-indigo-600/15 text-white shadow-sm' 
      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
  }`;

  return (
    <aside className={`app-sidebar no-print hidden md:flex ${collapsed ? 'md:w-16' : 'md:w-56 lg:w-64'} bg-[#020617] text-slate-300 flex flex-col transition-all duration-300 h-screen sticky top-0 border-r border-slate-800/50 z-40 shrink-0`}>
      {/* Brand header */}
      <div className={`${collapsed ? 'h-16' : 'h-20'} flex flex-col justify-center ${collapsed ? 'px-2' : 'px-5'} border-b border-slate-800/50 shrink-0`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-start'}`}>
          <img src="/logo.png" alt="IT2a" className={`${collapsed ? 'w-10 h-10' : 'w-12 h-12'} object-contain shrink-0 opacity-95`} />
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="block font-bold text-white text-[13px] leading-tight truncate tracking-tight uppercase">Gestor Vetsmart</span>
              <span className="block text-[9px] text-slate-500 font-bold truncate uppercase tracking-[0.14em]">Enterprise Ecosystem</span>
            </div>
          )}
        </div>
      </div>

      {/* User account block */}
      {user && (
        <div className={`shrink-0 ${collapsed ? 'px-2 py-2' : 'px-3 lg:px-5 py-3'} border-b border-slate-800/50`}>
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0 border border-slate-700">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <p className="text-[11px] font-medium text-slate-400 truncate flex-1">{user.email || user.name}</p>
              <button
                onClick={handleLogout}
                disabled={logoutBusy}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-all disabled:opacity-60 shrink-0"
                title="Sair da conta"
              >
                {logoutBusy ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 border border-slate-700" title={user.email || user.name}>
                  {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                disabled={logoutBusy}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-all disabled:opacity-60"
                title="Sair da conta"
              >
                {logoutBusy ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} px-2 py-1 shrink-0`}>
          <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
              title={collapsed ? 'Expandir' : 'Colapsar'}
          >
              <i className={`fas ${collapsed ? 'fa-indent' : 'fa-outdent'} text-[10px]`}></i>
          </button>
      </div>
      
      <nav className={`flex-1 py-1 ${collapsed ? 'px-2' : 'px-2 lg:px-3'} space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={navBtnClass(item.id)}
            title={item.label}
          >
            <i className={`fas ${item.icon} text-xl lg:text-sm w-5 text-center ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}></i>
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer Branding Area */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800/50 bg-[#020617] text-center">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">it2a Enterprise</span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
