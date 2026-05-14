import React, { useState, useEffect } from 'react';
import ClinicalModule from './ClinicalModule';
import PatientsModule from './PatientsModule';
import HospitalizationModule from './HospitalizationModule';
import SurgeryModule from './SurgeryModule';
import AdvancedAiModule from './AdvancedAiModule';
import { useNavigation } from '../context/NavigationContext';

type ClinicalTab = 'clinical' | 'patients' | 'hospitalization' | 'surgery' | 'ai';

interface TabConfig {
  id: ClinicalTab;
  label: string;
  icon: string;
  color: string;
  accent: string;
  desc: string;
}

const TABS: TabConfig[] = [
  {
    id: 'clinical',
    label: 'Atendimento',
    icon: 'fa-stethoscope',
    color: '#00695C',
    accent: 'border-[#00695C] text-[#00695C]',
    desc: 'Prontuário & Receitas',
  },
  {
    id: 'patients',
    label: 'Pacientes',
    icon: 'fa-paw',
    color: '#C2185B',
    accent: 'border-[#C2185B] text-[#C2185B]',
    desc: 'Cadastro & Prontuários',
  },
  {
    id: 'hospitalization',
    label: 'Internação',
    icon: 'fa-procedures',
    color: '#B71C1C',
    accent: 'border-[#B71C1C] text-[#B71C1C]',
    desc: 'Ronda & Monitoramento',
  },
  {
    id: 'surgery',
    label: 'Centro Cirúrgico',
    icon: 'fa-syringe',
    color: '#4527A0',
    accent: 'border-[#4527A0] text-[#4527A0]',
    desc: 'Agendamento & Checklist',
  },
  {
    id: 'ai',
    label: 'IA & Imagem',
    icon: 'fa-robot',
    color: '#1565C0',
    accent: 'border-[#1565C0] text-[#1565C0]',
    desc: 'VetVision & Prontuários',
  },
];

interface ClinicalHubProps {
  initialTab?: ClinicalTab;
}

const ClinicalHub: React.FC<ClinicalHubProps> = ({ initialTab = 'clinical' }) => {
  const [activeTab, setActiveTab] = useState<ClinicalTab>(initialTab);
  // Read navigationParams so we can pass them directly to PatientsModule
  const { navigationParams } = useNavigation();

  const current = TABS.find(t => t.id === activeTab)!;

  // Keep in sync when App re-renders hub with a different initialTab (deep-link)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Sync breadcrumb AND accent color into App's module bar on every tab change
  useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb(current.label);
    }
    if ((window as any).__setModuleAccentColor) {
      (window as any).__setModuleAccentColor(current.color);
    }
  }, [activeTab, current.label, current.color]);

  const renderContent = () => {
    switch (activeTab) {
      case 'clinical':        return <ClinicalModule />;
      // Pass navigationParams directly so PatientsModule can open the right pet
      // without relying on the context timing after remount
      case 'patients':        return <PatientsModule directNavParams={navigationParams} />;
      case 'hospitalization': return <HospitalizationModule />;
      case 'surgery':         return <SurgeryModule />;
      case 'ai':              return <AdvancedAiModule />;
    }
  };

  return (
    <div className="flex flex-col min-h-full animate-portal-enter">

      {/* ── Hub Tab Bar ── */}
      <div
        className="flex items-end gap-0 px-1 pt-2 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm"
      >
        {TABS.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group relative flex items-center gap-2.5 px-5 py-3.5
                text-[10px] font-black uppercase tracking-widest
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? `${tab.accent} bg-white`
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/80'
                }
              `}
              style={isActive ? { borderBottomColor: tab.color, color: tab.color } : {}}
            >
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: tab.color }}
                />
              )}
              <i className={`fas ${tab.icon} text-[11px]`} />
              <span>{tab.label}</span>

              {/* Tooltip on hover */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#020617] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                {tab.desc}
              </span>
            </button>
          );
        })}

        {/* Spacer + current context label */}
        <div className="ml-auto flex items-center gap-3 pb-2 pr-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border"
            style={{
              color: current.color,
              borderColor: current.color + '30',
              backgroundColor: current.color + '08',
            }}
          >
            <i className={`fas ${current.icon} text-[9px]`} />
            {current.desc}
          </div>
        </div>
      </div>

      {/* ── Module Content ── */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ClinicalHub;
