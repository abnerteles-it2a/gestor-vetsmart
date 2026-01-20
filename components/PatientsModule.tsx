import React, { useState, useEffect } from 'react';
import { NewPetModal } from './NewItemModals';
import { suggestCarePlan } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

import { mockDataService } from '../services/mockDataService';

const PatientsModule: React.FC = () => {
  const { addToast } = useToast();
  const [isNewPetModalOpen, setIsNewPetModalOpen] = useState(false);
  const [isSuggestingPlan, setIsSuggestingPlan] = useState<string | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  
  // Search & Selection State
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScheduledToday, setFilterScheduledToday] = useState(false);
  const [petToEdit, setPetToEdit] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'vaccines' | 'history'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // AI Care Plan State
  const [carePlanData, setCarePlanData] = useState<any>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  useEffect(() => {
    const loadPets = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Use MockDataService instead of broken API fetch
        const data = await mockDataService.getPets();
        
        const mappedPets = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          species: p.species,
          breed: p.breed,
          tutor: p.tutor,
          age: p.age,
          weight: p.weight,
          status: p.status,
          phone: p.phone,
          email: p.email,
          visitsThisYear: p.visitsThisYear,
          lastVisit: p.lastVisit,
          nextAppointment: p.nextAppointment,
          totalSpend: p.totalSpend,
          plan: p.plan,
          photoUrl: p.photoUrl || null,
        }));
        setPets(mappedPets);
      } catch (e) {
        console.error(e);
        setLoadError('Erro ao carregar pets.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPets();
  }, []);

  const handleSuggestPlan = async (pet: any) => {
    setIsSuggestingPlan(pet.id);
    try {
        const plan = await suggestCarePlan(pet);
        setCarePlanData(plan);
        setIsPlanModalOpen(true);
        addToast(`Plano sugerido para ${pet.name} gerado!`, 'success');
    } catch (e) {
        addToast("Erro ao gerar plano. Tente novamente.", 'error');
    } finally {
        setIsSuggestingPlan(null);
    }
  };

  const handleNewPetSaved = (pet: any) => {
    setPets((prev) => {
      const index = prev.findIndex(p => p.id === pet.id);
      if (index >= 0) {
        const newPets = [...prev];
        newPets[index] = pet;
        return newPets;
      }
      return [...prev, pet];
    });
    setSelectedPetId(pet.id ?? pet.name);
    setFilterScheduledToday(false); // Disable filter to show new pet if necessary
    setSearchTerm('');
    setPetToEdit(null);
  };

  // Filter Logic
  const filteredPets = pets.filter(pet => {
    // 1. Filter by Scheduled Today
    if (filterScheduledToday) {
       // Dynamic date for Demo Mode consistency
       const today = new Date().toISOString().split('T')[0];
       if (pet.nextAppointment !== today) return false;
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        pet.name.toLowerCase().includes(term) ||
        pet.tutor.toLowerCase().includes(term) ||
        pet.species.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="space-y-6">
      {!selectedPetId ? (
        // SEARCH MODE
        <div className="space-y-6 animate-fadeIn">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Busca de Pacientes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Selecione um paciente para acessar o prontuário.</p>
            </div>
            <button 
              onClick={() => setIsNewPetModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <i className="fas fa-paw"></i> Novo Paciente
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
             {/* Search Input Area */}
             <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                <input 
                  type="text"
                  placeholder="Digite o nome do pet, tutor ou microchip..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  autoFocus
                />
             </div>

             {/* Filters */}
             <div className="flex items-center gap-2">
               <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none">
                 <input 
                   type="checkbox" 
                   checked={filterScheduledToday}
                   onChange={(e) => setFilterScheduledToday(e.target.checked)}
                   className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                 />
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    <i className="fas fa-calendar-day mr-2 text-blue-500"></i>
                    Agendados para Hoje
                 </span>
               </label>
               {filterScheduledToday && (
                 <span className="text-xs text-slate-400 animate-pulse">
                   Exibindo apenas pacientes com consulta hoje.
                 </span>
               )}
             </div>
          </div>

          {/* Results List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {isLoading && <p className="col-span-full text-center py-8 text-slate-500">Carregando...</p>}
             
             {!isLoading && filteredPets.length === 0 && (
               <div className="col-span-full text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                 <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                 <p className="text-lg font-medium">Nenhum paciente encontrado.</p>
                 <p className="text-sm mt-1">
                   {filterScheduledToday ? 'Tente desmarcar o filtro de "Agendados para Hoje".' : 'Verifique o nome digitado ou cadastre um novo paciente.'}
                 </p>
               </div>
             )}

             {filteredPets.map(pet => (
               <button 
                 key={pet.id}
                 onClick={() => setSelectedPetId(pet.id)}
                 className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left group"
               >
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors overflow-hidden">
                     {pet.photoUrl ? (
                       <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                     ) : (
                       pet.species === 'Gato' ? '🐱' : '🐶'
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">{pet.name}</h4>
                        {pet.nextAppointment && (
                          <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                            {pet.nextAppointment === '2026-01-19' ? 'Hoje' : pet.nextAppointment}
                          </span>
                        )}
                     </div>
                     <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Tutor: {pet.tutor}</p>
                     <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {pet.breed} • {pet.age}
                     </p>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-500 transition-colors"></i>
               </button>
             ))}
          </div>
        </div>
      ) : (
        // DETAIL MODE (Original UI)
        <div className="space-y-6 animate-fadeIn">
          {/* Back Header */}
          <div className="flex items-center gap-4 mb-2">
             <button 
               onClick={() => setSelectedPetId(null)}
               className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
             >
               <i className="fas fa-arrow-left"></i>
             </button>
             <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Voltar para Busca</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Visualizando prontuário de {selectedPet?.name}</p>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
            {/* Header do Pet */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-2xl shadow-inner overflow-hidden">
                  {selectedPet?.photoUrl ? (
                    <img src={selectedPet.photoUrl} alt={selectedPet.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedPet?.name?.[0] ?? 'P'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedPet?.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                        selectedPet?.status === 'Ativo'
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                      }`}
                    >
                      {selectedPet?.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span>{[selectedPet?.species, selectedPet?.breed].filter(Boolean).join(' • ')}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span>{selectedPet?.age}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span>{selectedPet?.weight || 'Peso N/A'}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        setPetToEdit(selectedPet);
                        setIsNewPetModalOpen(true);
                    }}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                      <i className="fas fa-edit mr-2"></i> Editar
                  </button>
                  <button 
                    onClick={() => selectedPet && handleSuggestPlan(selectedPet)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2"
                  >
                      <i className={`fas ${isSuggestingPlan === selectedPet?.id ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i> 
                      IA Plan
                  </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 overflow-x-auto">
              <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                  Resumo Geral
              </button>
              <button 
                  onClick={() => setActiveTab('vaccines')}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'vaccines' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                  <i className="fas fa-syringe"></i> Carteirinha Digital
              </button>
              <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                  <i className="fas fa-file-medical"></i> Histórico Clínico
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[400px]">
              {selectedPet && activeTab === 'overview' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-[0.16em] flex items-center gap-2">
                                  <i className="fas fa-user"></i> Dados do Tutor
                              </p>
                              <div>
                                  <p className="text-base text-slate-800 dark:text-slate-100 font-bold">{selectedPet.tutor}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1"><i className="fas fa-phone-alt w-4"></i> {selectedPet.phone || 'N/A'}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400"><i className="fas fa-envelope w-4"></i> {selectedPet.email || 'N/A'}</p>
                              </div>
                          </div>
                          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-[0.16em] flex items-center gap-2">
                                  <i className="fas fa-chart-line"></i> Engajamento
                              </p>
                              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                                  <li className="flex justify-between"><span>Consultas (Ano):</span> <span className="font-bold">{selectedPet.visitsThisYear ?? '–'}</span></li>
                                  <li className="flex justify-between"><span>Última visita:</span> <span className="font-bold">{selectedPet.lastVisit || '–'}</span></li>
                                  <li className="flex justify-between"><span>Plano:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{selectedPet.plan || 'Sem plano'}</span></li>
                              </ul>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h5 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              <i className="fas fa-bell text-amber-500"></i> Alertas e Pendências
                          </h5>
                          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4">
                              <ul className="space-y-2">
                                  <li className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                                      <i className="fas fa-exclamation-circle"></i> Vacina V10 vence em 15 dias (Sugerir agendamento)
                                  </li>
                                  <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-300">
                                      <i className="fas fa-times-circle"></i> Vermífugo atrasado há 5 dias
                                  </li>
                              </ul>
                          </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                          <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">IA Insights</h5>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                              Baseado no histórico de {selectedPet.name}, sugerimos:
                          </p>
                          <ul className="space-y-3">
                              <li className="flex gap-2 text-xs text-blue-800 dark:text-blue-200">
                                  <i className="fas fa-lightbulb mt-1"></i>
                                  <span>Agendar check-up geriátrico (idade avançada para a raça).</span>
                              </li>
                              <li className="flex gap-2 text-xs text-blue-800 dark:text-blue-200">
                                  <i className="fas fa-lightbulb mt-1"></i>
                                  <span>Oferecer plano Odontológico (histórico de tártaro).</span>
                              </li>
                          </ul>
                          <button 
                              onClick={() => handleSuggestPlan(selectedPet)}
                              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                          >
                              Gerar Novo Plano IA
                          </button>
                      </div>
                    </div>
                 </div>
              )}

              {selectedPet && activeTab === 'vaccines' && (
                  <div className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                  <i className="fas fa-shield-alt text-blue-500"></i> Monitoramento de Imunização
                              </h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                  O sistema utiliza IA para calcular automaticamente as próximas datas baseadas na bula dos fabricantes.
                              </p>
                          </div>
                          <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-purple-200 transition-colors whitespace-nowrap">
                              <i className="fas fa-robot"></i> Analisar Prazos (IA)
                          </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Vacinas */}
                          <div className="space-y-4">
                               <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                  <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                      <i className="fas fa-syringe"></i> Vacinas
                                  </h5>
                                  <button className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                                      + Nova Vacina
                                  </button>
                               </div>
                               <div className="space-y-3">
                                  {/* Example Vaccine Items */}
                                  <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                              <i className="fas fa-check"></i>
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">V10 (Polivalente)</p>
                                              <p className="text-xs text-slate-500 dark:text-slate-400">Aplicado: 10/01/2025 • Lote: 8829A</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vence em</p>
                                          <p className="text-sm font-bold text-green-600 dark:text-green-400">10/01/2026</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                              <i className="fas fa-clock"></i>
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Raiva (Antirrábica)</p>
                                              <p className="text-xs text-slate-500 dark:text-slate-400">Aplicado: 15/05/2024 • Lote: RV992</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vence em</p>
                                          <p className="text-sm font-bold text-orange-600 dark:text-orange-400">15/05/2025</p>
                                      </div>
                                  </div>
                               </div>
                          </div>

                          {/* Vermífugos */}
                          <div className="space-y-4">
                               <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                  <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                      <i className="fas fa-pills"></i> Vermífugos & Antipulgas
                                  </h5>
                                  <button className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                                      + Novo Registro
                                  </button>
                               </div>
                               <div className="space-y-3">
                                  <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                                              <i className="fas fa-exclamation"></i>
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Drontal Plus (10kg)</p>
                                              <p className="text-xs text-slate-500 dark:text-slate-400">Aplicado: 10/10/2025 • Peso: 12kg</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venceu em</p>
                                          <p className="text-sm font-bold text-red-600 dark:text-red-400">10/01/2026</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                                              <i className="fas fa-capsules"></i>
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Simparic (Antipulgas)</p>
                                              <p className="text-xs text-slate-500 dark:text-slate-400">Agendado: 25/01/2026</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Previsto</p>
                                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">25/01/2026</p>
                                      </div>
                                  </div>
                               </div>
                          </div>
                      </div>
                  </div>
              )}
              
              {selectedPet && activeTab === 'history' && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                          <i className="fas fa-history text-2xl opacity-50"></i>
                      </div>
                      <h5 className="font-bold text-slate-700 dark:text-slate-300">Histórico Clínico Completo</h5>
                      <p className="text-sm max-w-md text-center mt-2">Visualize todas as consultas, exames e cirurgias realizadas desde o primeiro atendimento.</p>
                      <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors">
                          Acessar Prontuário Completo
                      </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Care Plan Modal */}
      {isPlanModalOpen && carePlanData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <i className="fas fa-magic text-yellow-300"></i> Plano Preventivo Inteligente
                </h3>
                <p className="text-indigo-100 text-sm">Gerado via Vertex AI para {selectedPet?.name}</p>
              </div>
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
               <div className="space-y-4">
                  {carePlanData.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${
                         item.type === 'vacina' ? 'bg-green-100 text-green-600' :
                         item.type === 'exame' ? 'bg-blue-100 text-blue-600' :
                         item.type === 'vermifugo' ? 'bg-orange-100 text-orange-600' :
                         'bg-purple-100 text-purple-600'
                       }`}>
                         <i className={`fas ${
                           item.type === 'vacina' ? 'fa-syringe' :
                           item.type === 'exame' ? 'fa-microscope' :
                           item.type === 'vermifugo' ? 'fa-pills' :
                           'fa-shield-alt'
                         }`}></i>
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.description}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                             Sugerido para: <strong className="text-slate-700 dark:text-slate-300">{item.monthOffset === 0 ? 'Imediato' : `Daqui a ${item.monthOffset} meses`}</strong>
                          </p>
                       </div>
                       <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
               <button 
                 onClick={() => setIsPlanModalOpen(false)}
                 className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
               >
                 Fechar
               </button>
               <button 
                 onClick={() => {
                   setIsPlanModalOpen(false);
                   addToast('Plano salvo no histórico do paciente!', 'success');
                 }}
                 className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-colors flex items-center gap-2"
               >
                 <i className="fas fa-save"></i> Salvar Plano
               </button>
            </div>
          </div>
        </div>
      )}

      <NewPetModal
        isOpen={isNewPetModalOpen}
        onClose={() => {
            setIsNewPetModalOpen(false);
            setPetToEdit(null);
        }}
        onSaved={handleNewPetSaved}
        petToEdit={petToEdit}
      />
    </div>
  );
};

export default PatientsModule;
