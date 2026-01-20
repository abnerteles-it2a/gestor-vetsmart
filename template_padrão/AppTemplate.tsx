import React, { useState, useEffect } from 'react';
import { ToastProvider } from '../context/ToastContext';
import SidebarTemplate from './components/SidebarTemplate';
import DashboardTemplate from './components/DashboardTemplate';
import RecordsModuleTemplate from './components/RecordsModuleTemplate';

type Tab = 'dashboard' | 'records' | 'analytics' | 'settings';

const AppTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTemplate />;
      case 'records':
        return <RecordsModuleTemplate />;
      case 'analytics':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Painel de Análises</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300 max-w-2xl">
              Espaço reservado para gráficos, KPIs e relatórios específicos de cada app do ecossistema Gestor.
            </p>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Configurações do App</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300 max-w-2xl">
              Área para configurações gerais, integrações, branding e preferências padrão do aplicativo.
            </p>
          </div>
        );
      default:
        return <DashboardTemplate />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Visão geral do app';
      case 'records':
        return 'Cadastros principais';
      case 'analytics':
        return 'Análises e indicadores';
      case 'settings':
        return 'Configurações do aplicativo';
      default:
        return 'Visão geral do app';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Layout padrão do ecossistema Gestor para visão executiva e insights de IA.';
      case 'records':
        return 'Estrutura base de listagens, filtros e modais de cadastro usados em todos os apps.';
      case 'analytics':
        return 'Área para BI, gráficos e indicadores específicos de cada domínio.';
      case 'settings':
        return 'Definições globais, integrações, times e identidade visual do produto.';
      default:
        return 'Layout padrão do ecossistema Gestor para visão executiva e insights de IA.';
    }
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <SidebarTemplate activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-8 sticky top-0 z-10">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">
                {getTitle()}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-[0.16em]">
                By IT2A Ecosystem • Template padrão de apps
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
                <p className="text-sm font-medium">Usuário Exemplo</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gestor Responsável</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                UE
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
                {getSubtitle()}
              </p>
              {renderContent()}
            </div>
          </main>

          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-[0.16em]">
              Gestor Template • By IT2A Ecosystem © 2026
            </p>
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
};

export default AppTemplate;
