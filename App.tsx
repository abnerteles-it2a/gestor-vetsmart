
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClinicalModule from './components/ClinicalModule';
import HospitalizationModule from './components/HospitalizationModule';
import SurgeryModule from './components/SurgeryModule';
import TelemedicineModule from './components/TelemedicineModule';
import AdvancedAiModule from './components/AdvancedAiModule';
import InventoryModule from './components/InventoryModule';
import FinancialModule from './components/FinancialModule';
import AgendaModule from './components/AgendaModule';
import PatientsModule from './components/PatientsModule';
import SalesModule from './components/SalesModule';
import ReportsModule from './components/ReportsModule';
import PlansModule from './components/PlansModule';
import CampaignsModule from './components/CampaignsModule';
import TutorApp from './components/TutorApp';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';

const MainLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    return false;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600"></i>
          <p>Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'clinical': return <ClinicalModule />;
      case 'hospitalization': return <HospitalizationModule />;
      case 'surgery': return <SurgeryModule />;
      case 'telemedicine': return <TelemedicineModule />;
      case 'advanced-ai': return <AdvancedAiModule />;
      case 'inventory': return <InventoryModule />;
      case 'financial': return <FinancialModule />;
      case 'agenda': return <AgendaModule onNavigate={setActiveTab} />;
      case 'patients': return <PatientsModule />;
      case 'sales': return <SalesModule />;
      case 'campaigns': return <CampaignsModule />;
      case 'plans': return <PlansModule />;
      case 'tutor-app': return <TutorApp />;
      case 'reports': return <ReportsModule />;
      default: return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch(activeTab) {
        case 'dashboard': return 'Visão Geral';
        case 'agenda': return 'Agenda de Consultas';
        case 'patients': return 'Cadastro de Pacientes';
        case 'clinical': return 'Prontuário & IA Clínica';
        case 'hospitalization': return 'Internação & Ronda';
        case 'surgery': return 'Centro Cirúrgico';
        case 'telemedicine': return 'Telemedicina';
        case 'advanced-ai': return 'Inteligência Artificial Veterinária';
        case 'inventory': return 'Gestão de Estoque';
        case 'sales': return 'Vendas & Frente de Caixa';
        case 'campaigns': return 'Campanhas & CRM';
        case 'plans': return 'Planos de Saúde Pet';
        case 'tutor-app': return 'App do Tutor (Preview)';
        case 'reports': return 'Relatórios e BI';
        default: return 'Início';
    }
  }

  return (
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">
                {getTitle()}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                Gestor Vetsmart - Gestão veterinária inteligente com IA
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Alternar modo escuro"
              >
                <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                {user.avatar || user.name.substring(0,2).toUpperCase()}
              </div>
              <button 
                onClick={logout}
                className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Sair do sistema"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            {renderContent()}
          </main>
          
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-[0.16em]">
              Gestor Vetsmart © 2026
            </p>
          </footer>
        </div>
      </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
