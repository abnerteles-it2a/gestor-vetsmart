
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
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

  return (
    <aside className="w-[260px] bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 h-screen sticky top-0">
      <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img src="/logo_white.png" alt="Gestor Vetsmart" className="w-12 h-12 object-contain shrink-0" />
          <div className="overflow-hidden">
            <span className="block font-bold text-white text-sm leading-tight truncate">Gestor Vetsmart</span>
            <span className="block text-[10px] text-slate-400 font-medium truncate uppercase tracking-[0.12em]">By IT2A Ecosystem</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-6 text-center`}></i>
            <span className="hidden lg:block font-medium whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400">
          <i className="fas fa-sign-out-alt w-6 text-center"></i>
          <span className="hidden lg:block">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
