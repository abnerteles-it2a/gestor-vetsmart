import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';
import { PetSpecies } from '../types';

interface Patient {
  id: string;
  name: string;
  species: PetSpecies;
  tutor: string;
  reason: string;
  admissionDate: string;
  nextMedication: string;
  status: 'stable' | 'critical' | 'recovering';
  bay: string;
}

const initialPatients: Patient[] = [
  { id: '1', name: 'Rex', species: PetSpecies.DOG, tutor: 'Ana Costa', reason: 'Pós-op Ortopédico', admissionDate: '18/01 14:00', nextMedication: '16:00', status: 'recovering', bay: 'C-01' },
  { id: '2', name: 'Mia', species: PetSpecies.CAT, tutor: 'Pedro Santos', reason: 'Desidratação', admissionDate: '19/01 08:30', nextMedication: '15:30', status: 'stable', bay: 'G-01' },
  { id: '3', name: 'Bob', species: PetSpecies.DOG, tutor: 'Lucas Lima', reason: 'Gastroenterite', admissionDate: '19/01 10:00', nextMedication: '15:00', status: 'critical', bay: 'I-01' },
];

import { NewAdmissionModal } from './NewItemModals';

const HospitalizationModule: React.FC = () => {
  const { addToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedBay, setSelectedBay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  
  // Smart Round Modal State
  const [roundResult, setRoundResult] = useState<{ summary: string; critical_alerts: string[]; suggestions: string[] } | null>(null);
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);

  const bays = [
    { id: 'C-01', type: 'Canil', label: 'Canil 01' },
    { id: 'C-02', type: 'Canil', label: 'Canil 02' },
    { id: 'C-03', type: 'Canil', label: 'Canil 03' },
    { id: 'C-04', type: 'Canil', label: 'Canil 04' },
    { id: 'G-01', type: 'Gatil', label: 'Gatil 01' },
    { id: 'G-02', type: 'Gatil', label: 'Gatil 02' },
    { id: 'G-03', type: 'Gatil', label: 'Gatil 03' },
    { id: 'I-01', type: 'Isolamento', label: 'ISO 01' },
  ];

  const handleSmartRound = async () => {
    setIsProcessing(true);
    try {
        const response = await apiService.getHospitalizationRound(patients);
        setRoundResult(response.data);
        setIsRoundModalOpen(true);
        addToast("Ronda Inteligente concluída!", 'success');
    } catch (e: any) {
        console.error(e);
        const errorMessage = e.response?.data?.error || e.message || 'Erro desconhecido';
        addToast(`Erro ao realizar ronda inteligente: ${errorMessage}`, 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const getPatientInBay = (bayId: string) => patients.find(p => p.bay === bayId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'recovering': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Internação</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Monitoramento de pacientes e gestão de baias.</p>
        </div>
        <button 
          onClick={handleSmartRound}
          disabled={isProcessing}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-teal-200 dark:shadow-none hover:shadow-teal-300 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-clipboard-check'}`}></i> 
          {isProcessing ? 'Analisando...' : 'Ronda Inteligente IA'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mapa de Baias */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bays.map(bay => {
            const patient = getPatientInBay(bay.id);
            return (
              <div 
                key={bay.id}
                onClick={() => setSelectedBay(bay.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                  selectedBay === bay.id 
                    ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-900' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                } ${patient ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg ${
                    bay.type === 'Isolamento' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                    'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {bay.label}
                  </span>
                  {patient && (
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      patient.status === 'critical' ? 'bg-red-500' : 
                      patient.status === 'recovering' ? 'bg-blue-500' : 'bg-green-500'
                    }`} title={`Status: ${patient.status}`}></div>
                  )}
                </div>

                {patient ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${patient.species === PetSpecies.CAT ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                         <i className={`fas ${patient.species === PetSpecies.CAT ? 'fa-cat' : 'fa-dog'}`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{patient.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-20">{patient.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                      <i className="fas fa-clock text-blue-500"></i>
                      <span>Prox. Med: <strong>{patient.nextMedication}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                    <i className="fas fa-door-open text-2xl mb-1"></i>
                    <span className="text-xs font-medium">Livre</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Painel Lateral de Detalhes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm h-fit sticky top-24">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Detalhes da Baia
          </h4>
          
          {selectedBay ? (
            getPatientInBay(selectedBay) ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center mb-4">
                    <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-2">
                        <i className={`fas ${getPatientInBay(selectedBay)?.species === PetSpecies.CAT ? 'fa-cat text-orange-500' : 'fa-dog text-blue-500'}`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{getPatientInBay(selectedBay)?.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{getPatientInBay(selectedBay)?.tutor}</p>
                </div>

                <div className={`p-3 rounded-xl border ${getStatusColor(getPatientInBay(selectedBay)?.status || '')}`}>
                    <p className="text-xs font-bold uppercase opacity-70 mb-1">Status Clínico</p>
                    <p className="font-bold capitalize">{getPatientInBay(selectedBay)?.status === 'stable' ? 'Estável' : getPatientInBay(selectedBay)?.status === 'critical' ? 'Crítico' : 'Em Recuperação'}</p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Admissão</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{getPatientInBay(selectedBay)?.admissionDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Diagnóstico</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{getPatientInBay(selectedBay)?.reason}</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all mb-2">
                        <i className="fas fa-file-medical-alt mr-2"></i> Ver Prontuário
                    </button>
                    <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold transition-all">
                        <i className="fas fa-syringe mr-2"></i> Administrar Medicação
                    </button>
                </div>
              </div>
            ) : (
               <div className="text-center py-8 animate-in fade-in duration-300">
                  <i className="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Baia Livre</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Disponível para nova internação.</p>
                  <button 
                    onClick={() => setIsAdmissionModalOpen(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
                  >
                    <i className="fas fa-plus mr-2"></i> Internar Paciente
                  </button>
               </div>
            )
          ) : (
            <div className="text-center py-12 text-slate-400">
                <i className="fas fa-hand-pointer text-3xl mb-2"></i>
                <p>Selecione uma baia para ver detalhes.</p>
            </div>
          )}
        </div>
      </div>
      {/* Smart Round Modal */}
      {isRoundModalOpen && roundResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-200 dark:shadow-none">
                  <i className="fas fa-robot text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Relatório da Ronda IA</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Análise inteligente de pacientes internados</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRoundModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Summary Section */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 flex items-center gap-2">
                  <i className="fas fa-file-alt text-blue-500"></i> Resumo Geral
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {roundResult.summary}
                </p>
              </div>

              {/* Critical Alerts */}
              {roundResult.critical_alerts && roundResult.critical_alerts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i> Atenção Necessária
                  </h4>
                  {roundResult.critical_alerts.map((alert: any, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                      <i className="fas fa-circle-exclamation text-red-500 mt-1"></i>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {typeof alert === 'string' ? alert : `${alert.name} (${alert.bay || '?'}): ${alert.reason || 'Atenção necessária'}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {roundResult.suggestions && roundResult.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2">
                    <i className="fas fa-lightbulb"></i> Sugestões Clínicas
                  </h4>
                  <ul className="space-y-2">
                    {roundResult.suggestions.map((suggestion: any, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                        <i className="fas fa-check text-emerald-500 mt-1"></i>
                        <span>
                           {typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setIsRoundModalOpen(false)}
                className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admission Modal */}
      <NewAdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        onSaved={(newPatient) => setPatients(prev => [...prev, newPatient])}
        bays={bays.filter(b => !getPatientInBay(b.id))} // Only free bays
      />
    </div>
  );
};

export default HospitalizationModule;
