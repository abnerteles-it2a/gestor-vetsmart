import React, { useState } from 'react';

const TelemedicineModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'history'>('appointments');
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Mock data for appointments
  const appointments = [
    {
      id: 1,
      patientName: 'Thor',
      tutorName: 'Carlos Oliveira',
      time: '14:30',
      date: 'Hoje',
      status: 'confirmed',
      type: 'Retorno',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=150&h=150',
      symptoms: 'Acompanhamento pós-cirúrgico',
      link: 'https://meet.jit.si/vetsmart-thor-123'
    },
    {
      id: 2,
      patientName: 'Luna',
      tutorName: 'Ana Santos',
      time: '16:00',
      date: 'Hoje',
      status: 'pending',
      type: 'Primeira Consulta',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150&h=150',
      symptoms: 'Apatia e falta de apetite',
      link: 'https://meet.jit.si/vetsmart-luna-456'
    }
  ];

  const handleStartCall = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Telemedicina</h1>
          <p className="text-slate-500 dark:text-slate-400">Consultas remotas e acompanhamento digital</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <i className="fas fa-history mr-2"></i>
            Histórico
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
            <i className="fas fa-plus mr-2"></i>
            Nova Teleconsulta
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
              <i className="fas fa-video"></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Agendadas Hoje</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">4</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xl">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Realizadas</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">128</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tempo Médio</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">18 min</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Próximas Consultas</h2>
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={apt.image} alt={apt.patientName} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">{apt.patientName}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {apt.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tutor: {apt.tutorName}</p>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-calendar"></i> {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-clock"></i> {apt.time}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto flex flex-row sm:flex-col gap-2">
                  <button 
                    onClick={() => handleStartCall(apt)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-video"></i> Iniciar Vídeo
                  </button>
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
                    Detalhes
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-slate-800 dark:text-slate-200">Sintomas:</span> {apt.symptoms}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Sala de Espera Virtual</h3>
            <p className="text-indigo-100 text-sm mb-4">
              Compartilhe este link com seus pacientes para acesso direto à sala de espera.
            </p>
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/20 mb-4">
              <code className="text-xs flex-1 truncate">vetsmart.com/dr-ricardo/sala</code>
              <button className="text-indigo-200 hover:text-white transition-colors">
                <i className="fas fa-copy"></i>
              </button>
            </div>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">
              Configurar Sala
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Equipamentos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <div className="flex items-center gap-2">
                  <i className="fas fa-microphone"></i>
                  <span className="text-sm font-medium">Microfone</span>
                </div>
                <span className="text-xs font-bold uppercase">OK</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <div className="flex items-center gap-2">
                  <i className="fas fa-camera"></i>
                  <span className="text-sm font-medium">Câmera</span>
                </div>
                <span className="text-xs font-bold uppercase">OK</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                <div className="flex items-center gap-2">
                  <i className="fas fa-wifi"></i>
                  <span className="text-sm font-medium">Conexão</span>
                </div>
                <span className="text-xs font-bold uppercase">Instável</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Modal Simulation */}
      {isCallActive && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
          <header className="h-16 bg-slate-800 flex items-center justify-between px-6 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <div>
                <h3 className="text-white font-bold">{selectedAppointment.patientName}</h3>
                <p className="text-xs text-slate-400">{selectedAppointment.tutorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <i className="fas fa-clock"></i> 00:00
            </div>
          </header>
          
          <main className="flex-1 relative bg-black flex items-center justify-center">
            <div className="text-center text-slate-500">
              <i className="fas fa-user-circle text-6xl mb-4"></i>
              <p>Aguardando paciente entrar...</p>
            </div>
            
            {/* Self view */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg border border-slate-700 shadow-lg flex items-center justify-center">
              <span className="text-xs text-slate-500">Você</span>
            </div>
          </main>

          <footer className="h-20 bg-slate-800 flex items-center justify-center gap-4 px-6">
            <button className="w-12 h-12 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors flex items-center justify-center text-lg">
              <i className="fas fa-microphone-slash"></i>
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors flex items-center justify-center text-lg">
              <i className="fas fa-video-slash"></i>
            </button>
            <button 
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center text-2xl shadow-lg shadow-red-900/50"
            >
              <i className="fas fa-phone-slash"></i>
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors flex items-center justify-center text-lg">
              <i className="fas fa-desktop"></i>
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors flex items-center justify-center text-lg">
              <i className="fas fa-comment-alt"></i>
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default TelemedicineModule;
