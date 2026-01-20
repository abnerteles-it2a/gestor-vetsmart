import React, { useState } from 'react';

const TutorApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPet, setSelectedPet] = useState<any>(null);

  // Mock Data
  const tutorName = "João Silva";
  const pets = [
    { id: 1, name: "Luna", species: "Gato", breed: "Siamês", age: "3 anos", image: "🐱" },
    { id: 2, name: "Thor", species: "Cão", breed: "Golden Retriever", age: "5 anos", image: "🐶" }
  ];

  const appointments = [
    { id: 101, pet: "Luna", date: "Hoje, 14:00", type: "Consulta Geral", vet: "Dr. Ricardo", status: "confirmed" },
    { id: 102, pet: "Thor", date: "25 Jan, 09:00", type: "Vacinação", vet: "Dra. Ana", status: "pending" }
  ];

  const vaccines = [
    { id: 201, pet: "Luna", name: "V10", date: "10/01/2026", nextDue: "10/01/2027", status: "ok" },
    { id: 202, pet: "Thor", name: "Antirrábica", date: "15/05/2025", nextDue: "15/05/2026", status: "ok" }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="bg-blue-600 dark:bg-blue-800 p-6 pb-12 rounded-b-3xl text-white shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                    <span className="font-bold">JS</span>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Bem-vindo,</p>
                    <h2 className="text-xl font-bold">{tutorName}</h2>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className="fas fa-bell"></i>
                </button>
              </div>
              
              {/* Next Appointment Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mt-4">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/50 px-2 py-0.5 rounded">Próxima Visita</span>
                    <span className="text-xs opacity-80">Hoje, 14:00</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center text-xl shadow-sm">
                       🐱
                    </div>
                    <div>
                       <p className="font-bold text-lg leading-tight">Consulta - Luna</p>
                       <p className="text-sm opacity-80">Dr. Ricardo Silva</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 -mt-8 grid grid-cols-4 gap-4">
               {[
                 { icon: 'fa-calendar-plus', label: 'Agendar', color: 'bg-green-500' },
                 { icon: 'fa-file-medical', label: 'Exames', color: 'bg-purple-500' },
                 { icon: 'fa-syringe', label: 'Vacinas', color: 'bg-amber-500' },
                 { icon: 'fa-store', label: 'Loja', color: 'bg-pink-500' },
               ].map((action, idx) => (
                 <button 
                    key={idx} 
                    onClick={() => handleQuickAction(action.label)}
                    className="flex flex-col items-center gap-2 group"
                 >
                    <div className={`w-12 h-12 rounded-xl ${action.color} text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform`}>
                       <i className={`fas ${action.icon}`}></i>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{action.label}</span>
                 </button>
               ))}
            </div>

            {/* My Pets Carousel */}
            <div className="px-6 mt-2">
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Meus Pets</h3>
               <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {pets.map(pet => (
                    <div key={pet.id} className="min-w-[140px] bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                       <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl mb-3 shadow-inner">
                          {pet.image}
                       </div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-100">{pet.name}</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400">{pet.breed}</p>
                    </div>
                  ))}
                  <button className="min-w-[60px] flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                     <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400">
                        <i className="fas fa-plus"></i>
                     </div>
                     <span className="text-xs font-medium">Add</span>
                  </button>
               </div>
            </div>

            {/* Health Tips */}
            <div className="px-6">
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Dicas de Saúde</h3>
               <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                     <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">Verão</span>
                     <h4 className="font-bold text-lg mt-2 mb-1">Cuidados com o Calor</h4>
                     <p className="text-xs opacity-90 max-w-[80%]">Mantenha seu pet hidratado e evite passeios entre 10h e 16h.</p>
                  </div>
                  <i className="fas fa-sun absolute -right-4 -bottom-4 text-8xl opacity-20 text-yellow-300"></i>
               </div>
            </div>
          </div>
        );
      
      case 'appointments':
        return (
          <div className="p-6 pb-20 space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Agendamentos</h2>
             <div className="space-y-4">
                {appointments.map(app => (
                   <div key={app.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                      <div className="flex-col flex items-center justify-center w-12 text-center">
                         <span className="text-xs font-bold text-slate-400 uppercase">{app.date.split(',')[0]}</span>
                         <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{app.date.split(',')[1]}</span>
                      </div>
                      <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-800 dark:text-slate-100">{app.type}</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{app.pet} • {app.vet}</p>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${app.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                   </div>
                ))}
             </div>
             <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-transform">
                <i className="fas fa-plus mr-2"></i> Novo Agendamento
             </button>
          </div>
        );

      case 'profile':
        return (
          <div className="p-6 pb-20 space-y-6">
             <div className="flex flex-col items-center pt-8 pb-4">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 mb-4 border-4 border-white dark:border-slate-800 shadow-lg"></div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{tutorName}</h2>
                <p className="text-slate-500 dark:text-slate-400">Cliente desde 2024</p>
             </div>
             
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                {[
                  { icon: 'fa-user', label: 'Meus Dados' },
                  { icon: 'fa-credit-card', label: 'Pagamentos' },
                  { icon: 'fa-cog', label: 'Configurações' },
                  { icon: 'fa-question-circle', label: 'Ajuda' },
                ].map((item, idx) => (
                   <button key={idx} className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                         <i className={`fas ${item.icon}`}></i>
                      </div>
                      <span className="flex-1 text-left font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                      <i className="fas fa-chevron-right text-slate-300"></i>
                   </button>
                ))}
             </div>

             <button className="w-full py-3 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                Sair da Conta
             </button>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center items-start min-h-full bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
       {/* Mobile Device Frame Simulator */}
       <div className="w-full max-w-[375px] h-[812px] bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-[8px] border-slate-900 dark:border-slate-800 shadow-2xl overflow-hidden relative flex flex-col">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-xl z-50"></div>
          
          {/* Status Bar Mock */}
          <div className="h-12 flex justify-between items-center px-6 pt-2 text-xs font-bold text-slate-900 dark:text-slate-100 z-40 select-none">
             <span>9:41</span>
             <div className="flex gap-1">
                <i className="fas fa-signal"></i>
                <i className="fas fa-wifi"></i>
                <i className="fas fa-battery-full"></i>
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50 dark:bg-slate-900">
             {renderContent()}
          </div>

          {/* Bottom Navigation */}
          <div className="h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 relative z-40">
             {[
               { id: 'home', icon: 'fa-home', label: 'Início' },
               { id: 'appointments', icon: 'fa-calendar-alt', label: 'Agenda' },
               { id: 'profile', icon: 'fa-user', label: 'Perfil' },
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}
               >
                  <i className={`fas ${tab.icon} text-xl`}></i>
                  <span className="text-[10px] font-medium">{tab.label}</span>
               </button>
             ))}
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/20 dark:bg-slate-100/20 rounded-full"></div>
       </div>
       
       <div className="hidden md:block ml-12 max-w-sm mt-20">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">App do Tutor</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
             Visualize como seus clientes interagem com a clínica. O App do Tutor permite agendamentos, acesso a carteirinha de vacinação e acompanhamento do histórico clínico em tempo real.
          </p>
          <ul className="space-y-3 mb-8">
             {[
                'Agendamento Online Integrado',
                'Carteirinha Digital de Vacinação',
                'Notificações de Consultas',
                'Dicas de Saúde Personalizadas'
             ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                   <i className="fas fa-check-circle text-green-500"></i>
                   {item}
                </li>
             ))}
          </ul>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
             <i className="fas fa-info-circle mr-2"></i>
             Este é um preview interativo do PWA disponível para os tutores.
          </div>
       </div>
    </div>
  );
};

export default TutorApp;
