import React, { useState, useEffect } from 'react';
import { NewAppointmentModal } from './NewItemModals';
import { mockDataService } from '../services/mockDataService';

interface AgendaModuleProps {
    onNavigate?: (tab: string) => void;
}

const AgendaModule: React.FC<AgendaModuleProps> = ({ onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        // Use MockDataService for Demo Mode consistency
        const data = await mockDataService.getAppointments();
        const mapped = data.map((a: any) => ({
          time: a.time,
          pet: a.pet || 'Pet desconhecido',
          species: a.species || '',
          tutor: a.tutor || 'Contato não informado',
          service: a.service,
          status: a.status,
          dateLabel: a.date ? ` (${a.date.split('-').reverse().slice(0, 2).join('/')})` : '', // Format DD/MM
          room: a.room || '',
          vet: a.vet || '',
          type: a.type || 'consulta',
        }));
        setAppointments(mapped);
      } catch (e) {
        console.error('Failed to load appointments', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();
  }, []);

  const handleNewAppointmentSaved = (appointment: any) => {
    setAppointments((prev) => [
      ...prev,
      {
        time: appointment.time,
        pet: appointment.pet,
        species: appointment.species || '',
        tutor: appointment.tutor || appointment.vet,
        service: appointment.service,
        status: appointment.status || 'confirmado',
        dateLabel: appointment.date ? ` (${appointment.date})` : '',
        room: appointment.room || '',
        vet: appointment.vet || '',
        type: appointment.type || 'consulta',
      },
    ]);
  };

  const getTypePillClasses = (type: string) => {
    if (type === 'consulta') return 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300';
    if (type === 'cirurgia') return 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-300';
    if (type === 'vacina') return 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-300';
    if (type === 'estetico') return 'bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300';
    if (type === 'retorno') return 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300';
    return 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300';
  };

  const getStatusPillClasses = (status: string) => {
    if (status === 'confirmado') return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300';
    if (status === 'em_espera') return 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300';
    if (status === 'atendido') return 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300';
    if (status === 'cancelado') return 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300';
    return 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Agenda</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Visão diária e semanal dos atendimentos da clínica.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span>Consulta</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Cirurgia</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Vacina</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500"></span>Estético</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span>Retorno</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 flex items-center text-xs">
            <button 
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-full transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Dia
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-full transition-all ${viewMode === 'week' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Semana
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Carregando agendamentos...</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {appointments.map((apt, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="w-16 flex flex-col items-center justify-center pt-1">
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">{apt.time}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">{apt.room}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getTypePillClasses(apt.type)}`}>
                          {apt.type}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{apt.pet}</h4>
                        <span className="text-xs text-slate-400">• {apt.species}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusPillClasses(apt.status)}`}>
                          {apt.status.replace('_', ' ')}
                        </span>
                        {/* Start Consultation Button - Connects to Clinical Module */}
                        {onNavigate && (
                            <button 
                                onClick={() => onNavigate('clinical')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 p-2 rounded-lg"
                                title="Iniciar Atendimento"
                            >
                                <i className="fas fa-stethoscope"></i>
                            </button>
                        )}
                        <button className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 p-1">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-user-circle text-slate-400"></i> {apt.tutor}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-user-md text-slate-400"></i> {apt.vet}
                      </span>
                      {apt.service && (
                         <span className="flex items-center gap-1">
                           <i className="fas fa-notes-medical text-slate-400"></i> {apt.service}
                         </span>
                      )}
                      {apt.dateLabel && (
                        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {apt.dateLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {appointments.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <i className="fas fa-calendar-times text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Sem agendamentos</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum atendimento agendado para este período.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <NewAppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleNewAppointmentSaved}
      />
    </div>
  );
};

export default AgendaModule;
