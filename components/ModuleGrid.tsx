
import React from 'react';
import ModuleTile from './ModuleTile';
import { useNavigation } from '../context/NavigationContext';

const modules = [
  { id: 'agenda', title: 'Agenda', icon: 'fas fa-calendar-alt', color: '#f37021' },
  { id: 'patients', title: 'Pacientes', icon: 'fas fa-paw', color: '#00a0e3' },
  { id: 'clinical', title: 'Clínica', icon: 'fas fa-stethoscope', color: '#58b947' },
  { id: 'financial', title: 'Financeiro', icon: 'fas fa-dollar-sign', color: '#662d91' },
  { id: 'inventory', title: 'Estoque', icon: 'fas fa-boxes', color: '#e91e63' },
  { id: 'sales', title: 'Vendas', icon: 'fas fa-shopping-cart', color: '#ff9800' },
  { id: 'hospitalization', title: 'Internação', icon: 'fas fa-hospital', color: '#2196f3' },
  { id: 'surgery', title: 'Cirurgia', icon: 'fas fa-scalpel', color: '#4caf50' },
  { id: 'advanced-ai', title: 'IA Clínica', icon: 'fas fa-brain', color: '#9c27b0' },
  { id: 'reports', title: 'BI & Relatórios', icon: 'fas fa-chart-pie', color: '#607d8b' },
];

const ModuleGrid: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg tracking-tight">
          VetGrid
        </h1>
        <p className="text-white/80 font-bold uppercase tracking-[0.3em] text-sm">
          Escolha um módulo para começar
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {modules.map((mod) => (
          <ModuleTile
            key={mod.id}
            id={mod.id}
            title={mod.title}
            icon={mod.icon}
            color={mod.color}
            onClick={navigateTo}
          />
        ))}
      </div>
    </div>
  );
};

export default ModuleGrid;
