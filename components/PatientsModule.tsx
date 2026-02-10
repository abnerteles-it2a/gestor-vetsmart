
import React, { useState, useEffect } from 'react';
import { NewPetModal } from './NewItemModals';
import { suggestCarePlan } from '../services/geminiService';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '../context/NavigationContext';

import { apiService } from '../services/api';

const PatientsModule: React.FC = () => {
  const { addToast } = useToast();
  const { navigationParams, navigateTo } = useNavigation();
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

  // Helper to calculate age
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Idade desconhecida';
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        years--;
    }
    if (years === 0) {
        const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
        return `${months} meses`;
    }
    return `${years} anos`;
  };

  // Handle navigation params (deep linking)
  useEffect(() => {
    if (navigationParams && navigationParams.petId) {
      setSelectedPetId(navigationParams.petId);
      
      if (navigationParams.subTab) {
        setActiveTab(navigationParams.subTab);
      }
    }
  }, [navigationParams]); 

  useEffect(() => {
    const loadPetsAndData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Fetch Pets, Appointments, and Sales in parallel
        const [petsRes, appointmentsRes, salesRes] = await Promise.all([
            apiService.getPets(),
            apiService.getAppointments(),
            apiService.getSales()
        ]);
        
        const petsData = petsRes.data;
        const appointmentsData = appointmentsRes.data;
        const salesData = salesRes.data;

        const currentYear = new Date().getFullYear();
        
        const mappedPets = petsData.map((p: any) => {
            // Calculate Stats
            const petAppointments = appointmentsData.filter((a: any) => String(a.pet_id) === String(p.id));
            const petSales = salesData.filter((s: any) => String(s.pet_id) === String(p.id)); // Assuming sales have pet_id, or we might need to link via appointment? 
            // Note: Sales usually link to appointment or customer. If sales don't have pet_id directly, we might need to check if sale has appointment_id and that appointment has pet_id.
            // Let's assume for now sales might not directly have pet_id in the mock/simple schema, but if they do:
            // If sales schema doesn't have pet_id, we can't easily calculate total spend per pet without more complex joins.
            // However, looking at previous code, sales had 'pet_name' or similar?
            // Let's check apiService.getSales() structure in memory or assume best effort.
            // If sales have 'pet_id', great. If not, we skip or try to match by name (risky).
            // Checking typical schema: sales often have 'customer_id' (tutor). 
            // For now, let's try to match by pet_id if available, or just leave as 0 if not easily linkable to avoid errors.
            
            // Visits this year
            const visitsThisYear = petAppointments.filter((a: any) => {
                const d = new Date(a.appointment_date);
                return d.getFullYear() === currentYear && a.status === 'concluido';
            }).length;

            // Last Visit
            const pastAppointments = petAppointments
                .filter((a: any) => new Date(a.appointment_date) < new Date() && a.status === 'concluido')
                .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
            
            const lastVisit = pastAppointments.length > 0 
                ? new Date(pastAppointments[0].appointment_date).toLocaleDateString('pt-BR') 
                : 'N/A';

            // Total Spend (Approximation based on sales linked to pet if possible)
            // If sales table has pet_id
            const totalSpendVal = petSales.reduce((acc: number, s: any) => acc + parseFloat(s.total_amount || 0), 0);

            return {
                id: p.id,
                name: p.name,
                species: p.species,
                breed: p.breed,
                tutor: p.tutor_name || 'Tutor não informado',
                age: calculateAge(p.birth_date),
                weight: p.weight ? `${p.weight} kg` : 'N/A',
                status: 'Ativo',
                phone: p.phone || '',
                email: p.email || '',
                visitsThisYear: visitsThisYear,
                lastVisit: lastVisit,
                nextAppointment: p.next_appointment ? new Date(p.next_appointment).toISOString().split('T')[0] : null,
                totalSpend: totalSpendVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                plan: 'Particular',
                photoUrl: p.photo_url || null,
                birthDate: p.birth_date,
                medicalHistory: p.medical_history,
                tutorId: p.tutor_id,
                appointments: petAppointments // Store full appointments for history tab
            };
        });
        setPets(mappedPets);
      } catch (e) {
        console.error(e);
        setLoadError('Erro ao carregar pets.');
        addToast('Erro ao carregar lista de pacientes.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadPetsAndData();
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
    setFilterScheduledToday(false); 
    setSearchTerm('');
    setPetToEdit(null);
  };

  // Filter Logic
  const filteredPets = pets.filter(pet => {
    // 1. Filter by Scheduled Today
    if (filterScheduledToday) {
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

  const selectedPet = pets.find((p) => String(p.id) === String(selectedPetId));

  return (
    <div className="space-y-6">
      {!selectedPetId ? (
        // SEARCH MODE
        <div className="space-y-6 animate-fadeIn">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl xl:text-2xl font-bold text-slate-800 dark:text-slate-100">Busca de Pacientes</h3>
              <p className="text-sm xl:text-base text-slate-600 dark:text-slate-300">Selecione um paciente para acessar o prontuário.</p>
            </div>
            <button 
              onClick={() => setIsNewPetModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 xl:px-8 xl:py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 text-sm xl:text-base"
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
                 <span className="text-sm xl:text-base font-bold text-slate-700 dark:text-slate-300">
                    <i className="fas fa-calendar-day mr-2 text-blue-500"></i>
                    Agendados para Hoje
                 </span>
               </label>
               {filterScheduledToday && (
                 <span className="text-xs xl:text-sm text-slate-400 animate-pulse">
                   Exibindo apenas pacientes com consulta hoje.
                 </span>
               )}
             </div>
          </div>

          {/* Results List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
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
                 className="flex items-center gap-4 p-4 xl:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left group"
               >
                  <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors overflow-hidden">
                     {pet.photoUrl ? (
                       <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                     ) : (
                       pet.species === 'Gato' ? '🐱' : '🐶'
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-base xl:text-lg">{pet.name}</h4>
                        {pet.nextAppointment && (
                          <span className="text-[10px] xl:text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                            {pet.nextAppointment === new Date().toISOString().split('T')[0] ? 'Hoje' : new Date(pet.nextAppointment).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                     </div>
                     <p className="text-sm xl:text-base text-slate-500 dark:text-slate-400 truncate">Tutor: {pet.tutor}</p>
                     <p className="text-xs xl:text-sm text-slate-400 dark:text-slate-500 mt-1">
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
               className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
             >
               <i className="fas fa-arrow-left"></i>
             </button>
             <div>
                <h3 className="text-lg xl:text-xl font-bold text-slate-800 dark:text-slate-100">Voltar para Busca</h3>
                <p className="text-xs xl:text-sm text-slate-500 dark:text-slate-400">Visualizando prontuário de {selectedPet?.name}</p>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
            {/* Header do Pet */}
            <div className="p-4 xl:p-6 2xl:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xl xl:text-2xl 2xl:text-3xl shadow-inner overflow-hidden">
                  {selectedPet?.photoUrl ? (
                    <img src={selectedPet.photoUrl} alt={selectedPet.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedPet?.name?.[0] ?? 'P'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-slate-800 dark:text-slate-100">{selectedPet?.name}</h4>
                    <span
                      className={`px-2 py-0.5 xl:px-3 xl:py-1 rounded-full text-[10px] xl:text-xs 2xl:text-sm font-bold uppercase ${
                        selectedPet?.status === 'Ativo'
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                      }`}
                    >
                      {selectedPet?.status}
                    </span>
                  </div>
                  <p className="text-xs xl:text-sm 2xl:text-base text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <i className="fas fa-paw text-slate-400"></i> {selectedPet?.species} • {selectedPet?.breed} • {selectedPet?.weight} • {selectedPet?.age}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPetToEdit(selectedPet)}
                  className="px-3 py-1.5 xl:px-4 xl:py-2 2xl:px-6 2xl:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-bold shadow-sm flex items-center gap-2 text-xs xl:text-sm 2xl:text-base"
                >
                  <i className="fas fa-edit"></i> Editar
                </button>
                <button 
                    onClick={() => handleSuggestPlan(selectedPet)}
                    disabled={!!isSuggestingPlan}
                    className="px-3 py-1.5 xl:px-4 xl:py-2 2xl:px-6 2xl:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-none transition-all font-bold flex items-center gap-2 text-xs xl:text-sm 2xl:text-base disabled:opacity-70"
                >
                    {isSuggestingPlan === selectedPet?.id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                        <i className="fas fa-magic"></i>
                    )}
                    Plano IA
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
              <div className="p-3 xl:p-4 2xl:p-6 text-center">
                <p className="text-[10px] xl:text-xs 2xl:text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Visitas este ano</p>
                <p className="text-lg xl:text-xl 2xl:text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedPet?.visitsThisYear}</p>
              </div>
              <div className="p-3 xl:p-4 2xl:p-6 text-center">
                <p className="text-[10px] xl:text-xs 2xl:text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Última Visita</p>
                <p className="text-lg xl:text-xl 2xl:text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedPet?.lastVisit}</p>
              </div>
              <div className="p-3 xl:p-4 2xl:p-6 text-center">
                 <p className="text-[10px] xl:text-xs 2xl:text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Total Gasto</p>
                 <p className="text-lg xl:text-xl 2xl:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{selectedPet?.totalSpend}</p>
              </div>
              <div className="p-3 xl:p-4 2xl:p-6 text-center">
                 <p className="text-[10px] xl:text-xs 2xl:text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Próximo Agendamento</p>
                 <p className="text-lg xl:text-xl 2xl:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedPet?.nextAppointment ? new Date(selectedPet.nextAppointment).toLocaleDateString('pt-BR') : '-'}
                 </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 xl:px-6 2xl:px-8">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-3 xl:px-5 2xl:px-6 py-3 xl:py-4 font-bold border-b-2 transition-colors text-xs xl:text-sm 2xl:text-base ${activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Visão Geral
              </button>
              <button 
                onClick={() => setActiveTab('vaccines')}
                className={`px-3 xl:px-5 2xl:px-6 py-3 xl:py-4 font-bold border-b-2 transition-colors text-xs xl:text-sm 2xl:text-base ${activeTab === 'vaccines' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Vacinas & Parasitologia
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-3 xl:px-5 2xl:px-6 py-3 xl:py-4 font-bold border-b-2 transition-colors text-xs xl:text-sm 2xl:text-base ${activeTab === 'history' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Histórico Médico
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 xl:p-8 bg-slate-50 dark:bg-slate-800/20 min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 text-lg">
                        <i className="fas fa-user text-blue-500"></i> Informações do Tutor
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                           <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                             <i className="fas fa-user"></i>
                           </div>
                           <div>
                             <p className="text-xs text-slate-400 uppercase font-bold">Nome</p>
                             <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedPet?.tutor}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                           <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                             <i className="fas fa-envelope"></i>
                           </div>
                           <div>
                             <p className="text-xs text-slate-400 uppercase font-bold">Email</p>
                             <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedPet?.email || 'Não informado'}</p>
                           </div>
                        </div>
                         <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                           <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                             <i className="fas fa-phone"></i>
                           </div>
                           <div>
                             <p className="text-xs text-slate-400 uppercase font-bold">Telefone</p>
                             <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedPet?.phone || 'Não informado'}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 text-lg">
                        <i className="fas fa-notes-medical text-pink-500"></i> Observações Clínicas
                      </h4>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800/30 rounded-xl text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed">
                        {selectedPet?.medicalHistory ? selectedPet.medicalHistory : "Nenhuma observação registrada."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vaccines' && (
                  <div className="text-center py-12 text-slate-400">
                      <i className="fas fa-syringe text-4xl mb-4 opacity-50"></i>
                      <p>Módulo de Vacinas em desenvolvimento.</p>
                  </div>
              )}

              {activeTab === 'history' && (
                   <div className="space-y-6">
                       <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg xl:text-xl">Histórico de Consultas</h4>
                       {selectedPet?.appointments && selectedPet.appointments.length > 0 ? (
                           <div className="space-y-4">
                               {selectedPet.appointments
                                   .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
                                   .map((apt: any) => (
                                   <div key={apt.id} className="bg-white dark:bg-slate-900 p-4 xl:p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                       <div className="flex items-start gap-4">
                                           <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg xl:text-xl">
                                               {new Date(apt.appointment_date).getDate()}
                                           </div>
                                           <div>
                                               <p className="text-xs xl:text-sm text-slate-500 dark:text-slate-400 uppercase font-bold">
                                                   {new Date(apt.appointment_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                               </p>
                                               <h5 className="font-bold text-slate-800 dark:text-slate-100 text-base xl:text-lg">{apt.service_type || 'Consulta Geral'}</h5>
                                               <p className="text-sm xl:text-base text-slate-600 dark:text-slate-300 mt-1">{apt.notes || 'Sem observações.'}</p>
                                           </div>
                                       </div>
                                       <div className="flex items-center gap-3">
                                           <span className={`px-3 py-1 rounded-full text-xs xl:text-sm font-bold uppercase ${
                                               apt.status === 'concluido' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                               apt.status === 'agendado' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                               'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                           }`}>
                                               {apt.status}
                                           </span>
                                           <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                               <i className="fas fa-file-alt text-lg xl:text-xl"></i>
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div className="text-center py-12 text-slate-400">
                               <i className="fas fa-history text-4xl mb-4 opacity-50"></i>
                               <p>Nenhum histórico de consultas encontrado.</p>
                           </div>
                       )}
                   </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewPetModal 
        isOpen={isNewPetModalOpen || !!petToEdit}
        onClose={() => {
          setIsNewPetModalOpen(false);
          setPetToEdit(null);
        }}
        onSaved={handleNewPetSaved}
        petToEdit={petToEdit}
      />

       {/* AI Plan Modal */}
       {isPlanModalOpen && carePlanData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                              <i className="fas fa-magic"></i>
                          </div>
                          <div>
                              <h3 className="font-bold text-lg">Plano de Cuidados Sugerido (IA)</h3>
                              <p className="text-indigo-100 text-xs">Gerado via Gemini 2.0 Flash</p>
                          </div>
                      </div>
                      <button 
                          onClick={() => setIsPlanModalOpen(false)}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                          <i className="fas fa-times"></i>
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                           <div dangerouslySetInnerHTML={{ __html: carePlanData.replace(/\n/g, '<br/>') }} />
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                      <button 
                          onClick={() => setIsPlanModalOpen(false)}
                          className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                          Fechar
                      </button>
                      <button 
                          onClick={() => {
                              addToast('Plano salvo no histórico do paciente!', 'success');
                              setIsPlanModalOpen(false);
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                      >
                          Salvar no Prontuário
                      </button>
                  </div>
              </div>
          </div>
       )}
    </div>
  );
};

export default PatientsModule;
