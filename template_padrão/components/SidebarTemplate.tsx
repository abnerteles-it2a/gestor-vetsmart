import React from 'react';

interface SidebarTemplateProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SidebarTemplate: React.FC<SidebarTemplateProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'records', label: 'Cadastros', icon: 'fa-table-list' },
    { id: 'analytics', label: 'Análises', icon: 'fa-chart-line' },
    { id: 'settings', label: 'Configurações', icon: 'fa-gear' }
  ];

  return (
    <aside className="w-[260px] bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 h-screen sticky top-0">
      <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img src="/logo_white.png" alt="Ecossistema Gestor" className="w-12 h-12 object-contain shrink-0" />
          <div className="overflow-hidden">
            <span className="block font-bold text-white text-sm leading-tight truncate">Gestor Template</span>
            <span className="block text-[10px] text-slate-400 font-medium truncate uppercase tracking-[0.12em]">
              By IT2A Ecosystem
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-sm font-medium ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i
              className={`fas ${item.icon} w-6 text-center ${
                activeTab === item.id ? 'text-white' : 'text-slate-400'
              }`}
            ></i>
            <span className="hidden lg:block whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 text-sm">
          <i className="fas fa-sign-out-alt w-6 text-center"></i>
          <span className="hidden lg:block">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarTemplate;

