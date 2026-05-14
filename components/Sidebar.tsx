import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  moduleColor?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, moduleColor = '#FF9F1C' }) => {
  const { logout } = useAuth();
  const [logoutBusy, setLogoutBusy] = useState(false);

  const menuItems = [
    { id: 'dashboard',    icon: 'fa-chart-pie',          label: 'Dash'  },
    { id: 'agenda',       icon: 'fa-calendar-alt',        label: 'Agenda'},
    { id: 'clinical',     icon: 'fa-stethoscope',         label: 'Clin'  },
    { id: 'telemedicine', icon: 'fa-video',               label: 'Tele'  },
    { id: 'inventory',    icon: 'fa-boxes-stacked',       label: 'Estoq' },
    { id: 'sales',        icon: 'fa-cash-register',       label: 'Vend'  },
    { id: 'campaigns',    icon: 'fa-bullhorn',            label: 'CRM'   },
    { id: 'financial',    icon: 'fa-dollar-sign',         label: 'Finan' },
    { id: 'plans',        icon: 'fa-id-card',             label: 'Plan'  },
    { id: 'reports',      icon: 'fa-chart-bar',           label: 'Relat' },
    { id: 'tutor-app',    icon: 'fa-mobile-alt',          label: 'App'   },
    { id: 'calculator',   icon: 'fa-calculator',          label: 'Calc'  },
  ];

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      try {
        setLogoutBusy(true);
        await logout();
      } catch (error) {
        console.error("Logout failed", error);
      } finally {
        setLogoutBusy(false);
      }
    }
  };

  return (
    <aside className="omie-sidebar no-print flex-shrink-0">
      <div className="flex-1 flex flex-col items-center gap-0 overflow-y-auto custom-scrollbar-sidebar w-full">
        <div
          className="w-full h-12 flex items-center justify-center border-b border-white/5 mb-2 cursor-pointer"
          onClick={() => setActiveTab('home')}
          title="VetGrid Home"
        >
          <img
            src="/logo_white.png"
            alt="IT2A"
            className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`omie-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
            style={{
               flexDirection: 'column',
               gap: '4px',
               fontSize: '18px',
               ...(activeTab === item.id ? { background: moduleColor } : {})
            }}
          >
            <i className={`fas ${item.icon}`}></i>
            <span style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.6 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Logout button at bottom */}
      <div 
        className="omie-sidebar-item !h-16 border-t border-white/5" 
        onClick={handleLogout}
        title="Sair"
      >
        <i className={logoutBusy ? "fas fa-circle-notch fa-spin text-white" : "fas fa-power-off text-rose-500 text-[14px]"}></i>
      </div>
    </aside>
  );
};

export default Sidebar;
