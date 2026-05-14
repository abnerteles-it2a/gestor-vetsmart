
import React, { useState, useEffect } from 'react';
import { NewAppointmentModal } from './NewItemModals';
import { apiService } from '../services/api';
import { useNavigation } from '../context/NavigationContext';

const MODULE_COLOR = '#6A1B9A';

const AgendaModule: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb('Agenda');
    }
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getAppointments();
        const data = response.data;
        
        const mapped = data.map((a: any) => {
          const dateObj = new Date(a.appointment_date);
          const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const dateLabel = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          
          return {
            id: a.id,
            time: time,
            petId: a.pet_id,
            pet: a.pet_name || 'Pet desconhecido',
            species: a.species || '',
            tutor: a.tutor_name || 'Contato não informado',
            service: a.reason || a.type,
            status: a.status,
            dateLabel: ` (${dateLabel})`,
            room: a.room || 'Sala 1',
            vet: a.vet_name || 'Veterinário',
            type: a.type || 'consulta',
            rawDate: a.appointment_date
          };
        });
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

  const getStatusColor = (status: string) => {
    if (status === 'confirmado') return 'emerald-500';
    if (status === 'em_espera') return '#FF9F1C';
    if (status === 'atendido') return 'blue-500';
    if (status === 'cancelado') return 'rose-500';
    return 'slate-400';
  };

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">
      
      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Planejamento it2a</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Agenda de Atendimentos</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm self-center h-fit">
             <button 
               onClick={() => setViewMode('day')}
               className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'day' ? 'text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               style={viewMode === 'day' ? { background: MODULE_COLOR } : {}}
             >
               Dia
             </button>
             <button 
               onClick={() => setViewMode('week')}
               className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               style={viewMode === 'week' ? { background: MODULE_COLOR } : {}}
             >
               Semana
             </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="omie-btn-primary"
          >
            <i className="fas fa-calendar-plus mr-2"></i> Agendar
          </button>
        </div>
      </div>

      <div className="omie-card overflow-hidden">
        <div className="omie-card-header !bg-slate-50/50">
           <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Compromissos do Período</h3>
        </div>
        
        {isLoading ? (
          <div className="p-20 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Sincronizando it2a Agenda...</div>
        ) : (
          <div className="bg-white divide-y divide-slate-50">
            {appointments.map((apt, idx) => (
              <div key={idx} className="p-8 hover:bg-slate-50/50 transition-all group flex items-center gap-10">
                <div className="w-24 flex flex-col items-center justify-center border-r border-slate-100 pr-10">
                  <span className="text-2xl font-black tracking-tight transition-colors leading-none" style={{ color: '#020617' }}>{apt.time}</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">{apt.room}</span>
                </div>
                
                <div className="flex-1 flex flex-col gap-1">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: MODULE_COLOR }}>{apt.type}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <h4 className="text-lg font-black text-[#020617] uppercase tracking-tight">{apt.pet}</h4>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">({apt.species})</span>
                   </div>
                   <div className="flex items-center gap-6 mt-1">
                      <div className="flex items-center gap-2">
                         <i className="fas fa-user-circle text-slate-300 text-[10px]"></i>
                         <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{apt.tutor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <i className="fas fa-user-md text-slate-300 text-[10px]"></i>
                         <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{apt.vet}</span>
                      </div>
                      {apt.service && (
                         <div className="flex items-center gap-2">
                            <i className="fas fa-notes-medical text-slate-300 text-[10px]"></i>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight italic">{apt.service}</span>
                         </div>
                      )}
                   </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusColor(apt.status) }}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: getStatusColor(apt.status) }}>
                        {apt.status.replace('_', ' ')}
                      </span>
                   </div>
                   <button 
                      onClick={() => apt.petId && navigateTo('patients', { petId: apt.petId, subTab: 'history' })}
                      className="omie-btn-secondary !px-6 !py-2 !text-[9px]"
                   >
                      Prontuário
                   </button>
                   <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-[#FF9F1C] hover:border-[#FF9F1C] transition-all">
                      <i className="fas fa-ellipsis-v text-[10px]"></i>
                   </button>
                </div>
              </div>
            ))}
            
            {appointments.length === 0 && (
              <div className="p-20 text-center">
                <i className="fas fa-calendar-times text-4xl text-slate-100 mb-6"></i>
                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Agenda vazia para este período.</h3>
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
