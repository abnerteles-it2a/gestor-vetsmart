
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
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import Login from './components/Login';

const MainLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { activeTab, setActiveTab, navigateTo } = useNavigation();
  
  // HOOKS MUST BE AT THE TOP LEVEL
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return window.localStorage.getItem('gestor_vetsmart_sidebar_collapsed') === '1';
    } catch {
      return false;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    return false;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('gestor_vetsmart_sidebar_collapsed', sidebarCollapsed ? '1' : '0');
    } catch {}
  }, [sidebarCollapsed]);

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

  // EARLY RETURNS AFTER HOOKS
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
      case 'agenda': return <AgendaModule />;
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
    <div className="min-h-screen bg-[#020617] flex justify-center">
      {/* Main App Container - Limited to 1920px (Full HD) */}
      <div className="w-full max-w-[1920px] bg-[#020617] min-h-screen relative flex">
        
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Right column: The PORTAL — rounded container that creates the premium frame */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#020617]">
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 rounded-tl-[2.5rem] lg:rounded-tl-[3.5rem] shadow-2xl shadow-indigo-950/20 overflow-hidden bg-mesh-grid transition-colors duration-500">
            <header className="h-16 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
              <div className="flex flex-col">
                <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-none tracking-tight">
                  {getTitle()}
                </h2>
                <p className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-wider">
                  Gestor Vetsmart • it2a Enterprise Ecosystem
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-glass"
                  aria-label="Alternar modo escuro"
                >
                  <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'} text-xs`}></i>
                </button>
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold border border-white dark:border-slate-700 shadow-sm text-sm">
                  {user.avatar || user.name.substring(0,2).toUpperCase()}
                </div>
              </div>
            </header>

            <main className="flex-1 p-4 md:p-8 animate-fade-in overflow-y-auto">
              {renderContent()}
            </main>
            
            <footer className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 p-4 text-center">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">
                it2a Enterprise Ecosystem © 2026 • Gestor Vetsmart
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <ToastProvider>
          <MainLayout />
        </ToastProvider>
      </NavigationProvider>
    </AuthProvider>
  );
};

export default App;
