import React, { useState, useEffect } from 'react';
import { openWhatsApp, generateClinicMessage } from '../utils/whatsappUtils';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '../context/NavigationContext';
import { apiService } from '../services/api';
import { KpiCard } from './KpiCard';

const MODULE_COLOR = '#00838F';

const TelemedicineModule: React.FC = () => {
  const { addToast } = useToast();
  const { navigateTo } = useNavigation();
  const [activeTab, setActiveTab] = useState<'appointments' | 'history'>('appointments');
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, completed: 0, avgTime: '20 min' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb('Consultas do Dia');
    }
    const loadAppointments = async () => {
      try {
        const response = await apiService.getAppointments();
        const data = response.data;
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = data.filter((a: any) =>
          (a.type === 'consulta' || a.type === 'retorno') &&
          a.status !== 'cancelado' &&
          a.appointment_date?.startsWith(today)
        );
        const completedCount = data.filter((a: any) => a.status === 'atendido').length;
        const mapped = todayAppointments.map((a: any) => {
          const dateObj = new Date(a.appointment_date);
          return {
            id: a.id, petId: a.pet_id,
            patientName: a.pet_name || 'Paciente',
            tutorName: a.tutor_name || 'Tutor',
            time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: a.status === 'agendado' ? 'pending' : 'confirmed',
            type: a.type === 'consulta' ? 'Consulta' : 'Retorno',
            image: a.species === 'Gato'
              ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=80&h=80'
              : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=80&h=80',
            symptoms: a.reason || 'Não informado',
            roomName: `vetgrid-${(a.pet_name || 'pet').toLowerCase().replace(/\s+/g, '-')}-${a.id}`,
            tutorPhone: a.tutor_phone || ''
          };
        });
        setAppointments(mapped);
        setStats({ today: todayAppointments.length, completed: completedCount, avgTime: '20 min' });
      } catch (error) {
        console.error('Error loading telemedicine appointments', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();
  }, []);

  const handleTabChange = (tab: 'appointments' | 'history') => {
    setActiveTab(tab);
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb(tab === 'appointments' ? 'Consultas do Dia' : 'Histórico');
    }
  };

  const handleStartCall = (apt: any) => { setSelectedAppointment(apt); setIsCallActive(true); };
  const handleEndCall = () => { setIsCallActive(false); setSelectedAppointment(null); };
  const handleSendLink = (apt: any) => {
    const link = `https://meet.jit.si/${apt.roomName}`;
    const message = generateClinicMessage(apt.tutorName,
      `Sua teleconsulta para o(a) ${apt.patientName} começará em breve.\n\nAcesse:\n${link}\n\nEsteja pronto 5 min antes.`);
    openWhatsApp(apt.tutorPhone, message);
  };

  if (isLoading) return (
    <div className="p-10 text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">
      Sincronizando it2a Telemedicina...
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">

      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Consultas Remotas</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Telemedicina Veterinária</p>
        </div>
        <div className="flex gap-4">
          {/* Sub-tab toggle */}
          <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm self-center">
            {([
              { id: 'appointments', label: 'Hoje', icon: 'fa-video' },
              { id: 'history', label: 'Histórico', icon: 'fa-history' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  activeTab === tab.id ? 'text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
                style={activeTab === tab.id ? { background: MODULE_COLOR } : {}}
              >
                <i className={`fas ${tab.icon} text-[10px]`}></i>
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => addToast('Use a Agenda principal para agendar teleconsultas.', 'info')}
            className="omie-btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>Nova Teleconsulta
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          title="Agendadas Hoje"
          value={stats.today.toString()}
          icon={<i className="fas fa-video"></i>}
          subtext="Teleconsultas do dia"
          subtextColor="text-slate-400"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Realizadas"
          value={stats.completed.toString()}
          icon={<i className="fas fa-check-circle"></i>}
          subtext="Concluídas com sucesso"
          subtextColor="text-emerald-500"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Tempo Médio"
          value={stats.avgTime}
          icon={<i className="fas fa-clock"></i>}
          subtext="Por teleconsulta"
          subtextColor="text-slate-400"
          color={MODULE_COLOR}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Appointments table */}
        <div className="xl:col-span-2">
          <div className="omie-table-container">
            <div className="omie-card-header">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">
                {activeTab === 'appointments' ? 'Consultas do Dia' : 'Histórico de Consultas'}
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {appointments.length} registros
              </span>
            </div>

            {appointments.length === 0 ? (
              <div className="p-20 text-center">
                <i className="fas fa-video text-4xl text-slate-100 mb-4 block"></i>
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                  Nenhuma teleconsulta agendada para hoje.
                </span>
              </div>
            ) : (
              <div className="bg-white divide-y divide-slate-50">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center gap-6">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                      <img src={apt.image} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="text-[10px] font-black uppercase tracking-widest"
                          style={{ color: MODULE_COLOR }}
                        >{apt.type}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                        <h4 className="text-lg font-black text-[#020617] uppercase tracking-tight">{apt.patientName}</h4>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                          <i className="fas fa-user-circle text-[10px]"></i>{apt.tutorName}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                          <i className="fas fa-clock text-[10px]"></i>{apt.time}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${apt.status === 'confirmed' ? 'text-emerald-500' : 'text-[#FF9F1C]'}`}>
                          {apt.status === 'confirmed' ? '● Confirmado' : '○ Pendente'}
                        </span>
                      </div>
                      {apt.symptoms && apt.symptoms !== 'Não informado' && (
                        <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase italic truncate max-w-sm">
                          "{apt.symptoms}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {apt.petId && (
                        <button
                          onClick={() => navigateTo('patients', { petId: apt.petId, subTab: 'history' })}
                          className="omie-btn-secondary !px-4 !py-2 !text-[9px]"
                        >Prontuário</button>
                      )}
                      <button
                        onClick={() => handleSendLink(apt)}
                        className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-100 transition-all"
                        title="Enviar link WhatsApp"
                      >
                        <i className="fab fa-whatsapp text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleStartCall(apt)}
                        className="omie-btn-primary !px-5 !py-2 !text-[9px]"
                        style={{ background: MODULE_COLOR }}
                      >
                        <i className="fas fa-video mr-1"></i>Iniciar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-6">
          {/* Virtual waiting room */}
          <div className="omie-card bg-[#020617] border-none p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-[80px]" style={{ background: MODULE_COLOR + '30' }}></div>
            <div className="relative z-10">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: MODULE_COLOR }}>Sala de Espera Virtual</h3>
              <p className="text-[12px] font-bold text-slate-400 mb-6 leading-relaxed">
                Compartilhe este link com seus pacientes para acesso direto.
              </p>
              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 mb-6">
                <code className="text-[11px] flex-1 truncate text-slate-300">vetgrid.com/dr-ricardo/sala</code>
                <button
                  onClick={() => { navigator.clipboard.writeText('vetgrid.com/dr-ricardo/sala'); addToast('Link copiado!', 'success'); }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-copy text-xs"></i>
                </button>
              </div>
              <button className="omie-btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 w-full">
                Configurar Sala
              </button>
            </div>
          </div>

          {/* Equipment check */}
          <div className="omie-card">
            <div className="omie-card-header">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Verificação de Hardware</h3>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Microfone', status: 'OK', ok: true, icon: 'fa-microphone' },
                { label: 'Câmera', status: 'OK', ok: true, icon: 'fa-camera' },
                { label: 'Conexão', status: 'Instável', ok: false, icon: 'fa-wifi' },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${item.ok ? 'bg-emerald-50/50' : 'bg-[#FF9F1C]/5'}`}>
                  <div className="flex items-center gap-3">
                    <i className={`fas ${item.icon} text-sm ${item.ok ? 'text-emerald-500' : 'text-[#FF9F1C]'}`}></i>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.ok ? 'text-emerald-500' : 'text-[#FF9F1C]'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video call overlay */}
      {isCallActive && selectedAppointment && (
        <div className="fixed inset-0 z-[2000] bg-[#020617] flex flex-col">
          <header className="h-14 bg-black/50 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              <div>
                <h3 className="text-white font-black text-sm uppercase">{selectedAppointment.patientName}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{selectedAppointment.tutorName}</p>
              </div>
            </div>
            <button
              onClick={handleEndCall}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <i className="fas fa-phone-slash mr-2"></i>Encerrar
            </button>
          </header>
          <main className="flex-1 bg-black">
            <iframe
              src={`https://meet.jit.si/${selectedAppointment.roomName}#config.prejoinPageEnabled=false&userInfo.displayName="VetGrid Veterinário"`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-none"
              title="Telemedicina VetGrid"
            />
          </main>
        </div>
      )}
    </div>
  );
};

export default TelemedicineModule;
