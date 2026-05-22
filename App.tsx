
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClinicalModule from './components/ClinicalModule';
import ClinicalHub from './components/ClinicalHub';
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
import HomeModule from './components/HomeModule';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import Login from './components/Login';
import SearchModal from './components/SearchModal';
import { NotificationCenter } from './components/NotificationCenter';
import SmartDoseCalculator from './components/SmartDoseCalculator';

const MainLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { activeTab, setActiveTab } = useNavigation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [moduleBreadcrumb, setModuleBreadcrumb] = useState<string | null>(null);
  const [moduleAccentColor, setModuleAccentColor] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const prevTabRef = React.useRef<string>('home');

  // Expose global setters so child modules can update breadcrumb & accent color
  React.useEffect(() => {
    (window as any).__setModuleBreadcrumb = setModuleBreadcrumb;
    (window as any).__setModuleAccentColor = setModuleAccentColor;
  }, []);

  // Reset both on tab change
  React.useEffect(() => {
    setModuleBreadcrumb(null);
    setModuleAccentColor(null);
  }, [activeTab]);

  // Reset to Home on every login
  const prevUserRef = React.useRef<any>(null);
  React.useEffect(() => {
    if (!prevUserRef.current && user) {
      // User just logged in — always go to Home
      setActiveTab('home');
      prevTabRef.current = 'home';
    }
    prevUserRef.current = user;
  }, [user]);

  // Splash screen: only when leaving Home
  React.useEffect(() => {
    if (prevTabRef.current === 'home' && activeTab !== 'home') {
      setShowSplash(true);
      const timer = setTimeout(() => setShowSplash(false), 900);
      prevTabRef.current = activeTab; // update BEFORE returning so it doesn't re-trigger
      return () => clearTimeout(timer);
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F7F9' }}>
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-3xl" style={{ color: '#1565C0' }}></i>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#78909C' }}>
            Carregando VetGrid...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':       return <Dashboard />;
      // All clinical sub-modules consolidated into ClinicalHub
      case 'clinical':        return <ClinicalHub initialTab="clinical" />;
      case 'patients':        return <ClinicalHub initialTab="patients" />;
      case 'hospitalization': return <ClinicalHub initialTab="hospitalization" />;
      case 'surgery':         return <ClinicalHub initialTab="surgery" />;
      case 'advanced-ai':     return <ClinicalHub initialTab="ai" />;
      case 'telemedicine':    return <TelemedicineModule />;
      case 'inventory':       return <InventoryModule />;
      case 'financial':       return <FinancialModule />;
      case 'agenda':          return <AgendaModule />;
      case 'sales':           return <SalesModule />;
      case 'campaigns':       return <CampaignsModule />;
      case 'plans':           return <PlansModule />;
      case 'tutor-app':       return <TutorApp />;
      case 'reports':         return <ReportsModule />;
      case 'calculator':      return <SmartDoseCalculator />;
      case 'home':            return <HomeModule />;
      default:                return <HomeModule />;
    }
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      dashboard:       'Visão Geral',
      agenda:          'Agenda de Consultas',
      // Clinical hub — all share same topbar title
      clinical:        'Clínica & IA',
      patients:        'Clínica & IA',
      hospitalization: 'Clínica & IA',
      surgery:         'Clínica & IA',
      'advanced-ai':   'Clínica & IA',
      telemedicine:    'Telemedicina',
      inventory:       'Estoque e Compras',
      sales:           'Vendas & Frente de Caixa',
      campaigns:       'Campanhas & CRM',
      plans:           'Planos de Saúde Pet',
      'tutor-app':     'App do Tutor (Preview)',
      reports:         'Relatórios e BI',
      calculator:      'Calculadora de Doses it2a',
      financial:       'Financeiro',
    };
    return titles[activeTab] || 'Início';
  };

  const getModuleColor = () => {
    const colors: Record<string, string> = {
      dashboard:       '#1565C0',
      agenda:          '#6A1B9A',
      // All clinical hub tabs use the same teal
      clinical:        '#00695C',
      patients:        '#00695C',
      hospitalization: '#00695C',
      surgery:         '#00695C',
      'advanced-ai':   '#00695C',
      telemedicine:    '#00838F',
      inventory:       '#0097A7',
      sales:           '#E65100',
      campaigns:       '#FF8F00',
      financial:       '#2E7D32',
      plans:           '#D81B60',
      reports:         '#37474F',
      'tutor-app':     '#020617',
      calculator:      '#3949AB',
    };
    return colors[activeTab] || '#1565C0';
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        /* Fixed spatial background — glass-sidebar and glass-topbar blur this photo.
           Each product keeps its own image. Swap the URL here to change the spatial bg. */
        backgroundImage: 'url("https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      
      {/* ===== OMIE-STYLE SIDEBAR (High Density) ===== */}
      {activeTab !== 'home' && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          moduleColor={getModuleColor()}
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
        />
      )}

      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{ '--module-color': moduleAccentColor ?? getModuleColor() } as React.CSSProperties}
      >
        {/* ===== OMIE-STYLE TOPBAR (it2a Portal) ===== */}
        <header
          className="omie-topbar no-print transition-all duration-300"
          style={activeTab === 'home'
            ? { background: 'transparent', backdropFilter: 'none', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }
            : {
                background: 'rgba(2, 6, 23, 0.82)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }
          }
        >
          <div className="omie-topbar-brand">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 bg-transparent border-none cursor-pointer text-white p-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-black tracking-tighter text-white">VetGrid</span>
                <span className="text-[9px] font-black text-white/25 uppercase tracking-widest hidden sm:inline">· by IT2A</span>
              </div>
              <span className="omie-topbar-sep"></span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                  {user?.name || 'ABNER TELES'}
                </span>
                <span className="text-[8px] font-black uppercase text-white/30">(TRIAL)</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6 text-white/50 text-[16px]">
              <i className="far fa-clock cursor-pointer hover:text-white transition-colors" />
              <i className="fas fa-search cursor-pointer hover:text-white transition-colors" onClick={() => setIsSearchOpen(true)} />
              <i className="fas fa-th cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('home')} />
              <NotificationCenter onNavigate={setActiveTab} />
              <i className="fas fa-cog cursor-pointer hover:text-white transition-colors" />
              <i className="fas fa-question-circle cursor-pointer hover:text-white transition-colors" />
            </div>

            <div 
              className="flex items-center gap-3 pl-6 border-l border-white/10 cursor-pointer group"
              onClick={() => { if(window.confirm('Sair do sistema?')) logout(); }}
              title="Clique para sair"
            >
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest group-hover:text-[#FF9F1C] transition-colors">
                {user?.name?.split(' ')[0] || 'Abner'}
              </span>
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 text-[10px] group-hover:bg-[#FF9F1C] transition-all">
                <i className="fas fa-user"></i>
              </div>
            </div>
          </div>
        </header>

        {/* ===== MODULE TAB BAR ===== */}
        {activeTab !== 'home' && (
          <div className="omie-module-bar no-print">
            <div
              className="omie-module-tab transition-colors duration-300"
              style={{ background: moduleAccentColor ?? getModuleColor() }}
            >
              {getTitle()}
              {moduleBreadcrumb && (
                <span className="ml-2 flex items-center gap-1.5 opacity-70">
                  <span className="text-[9px] font-black opacity-60">›</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{moduleBreadcrumb}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ===== MAIN CONTENT AREA ===== */}
        <main
          className="flex-1 overflow-y-auto flex flex-col relative"
          style={{
            '--module-color': moduleAccentColor ?? getModuleColor(),
            /* Solid content bg — keeps page readable over the spatial photo */
            background: activeTab === 'home' ? 'transparent' : '#F4F7F9',
          } as React.CSSProperties}
        >
          <div
            className={`flex-1 transition-all duration-300 ${activeTab === 'home' ? 'p-0' : 'p-8'}`}
          >
            {renderContent()}
          </div>
        </main>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* ===== SPLASH SCREEN (Home → Module transition) ===== */}
      {showSplash && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617]"
          style={{ animation: 'vetgridSplashIn 0.9s ease forwards' }}
        >
          <style>{`
            @keyframes vetgridSplashIn {
              0%   { opacity: 0; }
              15%  { opacity: 1; }
              75%  { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-4">
              <img
                src="/logo_white.png"
                alt="IT2A"
                className="h-10 w-auto object-contain opacity-90"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="h-10 w-px bg-white/10" />
              <div>
                <span className="text-[22px] font-black text-white tracking-tight leading-none">VetGrid</span>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">
                  Plataforma Enterprise · by IT2A
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <NavigationProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </NavigationProvider>
  </AuthProvider>
);

export default App;
