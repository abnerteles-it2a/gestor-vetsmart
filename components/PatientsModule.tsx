
import React, { useState, useEffect } from 'react';
import { NewPetModal } from './NewItemModals';
import { suggestCarePlan } from '../services/geminiService';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '../context/NavigationContext';
import { apiService } from '../services/api';

const PatientsModule: React.FC<{ directNavParams?: any }> = ({ directNavParams }) => {
  const { addToast } = useToast();
  const { navigationParams, navigateTo } = useNavigation();
  const [isNewPetModalOpen, setIsNewPetModalOpen] = useState(false);
  const [isSuggestingPlan, setIsSuggestingPlan] = useState<string | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScheduledToday, setFilterScheduledToday] = useState(false);
  const [petToEdit, setPetToEdit] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'vaccines' | 'history'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const [carePlanData, setCarePlanData] = useState<any>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

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

  // Prefer directNavParams (passed by ClinicalHub) over context params
  // to avoid race conditions when navigateTo triggers a remount
  useEffect(() => {
    const params = directNavParams || navigationParams;
    if (params && params.petId) {
      setSelectedPetId(params.petId);
      if (params.subTab) {
        setActiveTab(params.subTab);
      }
    }
  }, [directNavParams, navigationParams]);

  useEffect(() => {
    const loadPetsAndData = async () => {
      setIsLoading(true);
      try {
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
            const petAppointments = appointmentsData.filter((a: any) => String(a.pet_id) === String(p.id));
            const petSales = salesData.filter((s: any) => String(s.pet_id) === String(p.id));
            
            const visitsThisYear = petAppointments.filter((a: any) => {
                const d = new Date(a.appointment_date);
                return d.getFullYear() === currentYear && a.status === 'concluido';
            }).length;

            const pastAppointments = petAppointments
                .filter((a: any) => new Date(a.appointment_date) < new Date() && a.status === 'concluido')
                .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
            
            const lastVisit = pastAppointments.length > 0 
                ? new Date(pastAppointments[0].appointment_date).toLocaleDateString('pt-BR') 
                : 'N/A';

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
                appointments: petAppointments
            };
        });
        setPets(mappedPets);
      } catch (e) {
        console.error(e);
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
  };

  const filteredPets = pets.filter(pet => {
    if (filterScheduledToday) {
       const today = new Date().toISOString().split('T')[0];
       if (pet.nextAppointment !== today) return false;
    }
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
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">
      {!selectedPetId ? (
        <>
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Banco de Dados de Pacientes</h1>
              <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Gestão de Prontuários</p>
            </div>
            <button 
              onClick={() => setIsNewPetModalOpen(true)}
              className="omie-btn-primary"
            >
              <i className="fas fa-paw mr-2"></i> Novo Paciente
            </button>
          </div>

          <div className="omie-card p-6 flex flex-col gap-6 bg-white border-b-2 border-[#FF9F1C]">
             <div className="relative w-full max-w-2xl">
                <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                <input 
                  type="text"
                  placeholder="BUSCAR PACIENTE POR NOME, TUTOR OU RAÇA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  className="omie-input !pl-14 !py-4 !rounded-xl !text-sm !font-black !bg-slate-50 border-transparent focus:!bg-white"
                  autoFocus
                />
             </div>
             <div className="flex items-center gap-4">
               <label className="flex items-center gap-3 cursor-pointer select-none">
                 <input 
                   type="checkbox" 
                   checked={filterScheduledToday}
                   onChange={(e) => setFilterScheduledToday(e.target.checked)}
                   className="w-5 h-5 rounded border-slate-200 text-[#FF9F1C] focus:ring-[#FF9F1C]"
                 />
                 <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Apenas Agendados para Hoje</span>
               </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {isLoading ? (
                <div className="col-span-full py-20 text-center text-[11px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Sincronizando it2a Patients...</div>
             ) : filteredPets.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                  <i className="fas fa-ghost text-4xl text-slate-100 mb-6"></i>
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Nenhum paciente encontrado no ecossistema.</p>
                </div>
             ) : filteredPets.map(pet => (
                <div 
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className="omie-card group hover:border-[#FF9F1C] transition-all cursor-pointer bg-white"
                >
                   <div className="p-6">
                      <div className="flex gap-4 mb-6">
                         <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100 group-hover:border-[#FF9F1C]/30 transition-colors overflow-hidden">
                            {pet.photoUrl ? (
                              <img src={pet.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <i className="fas fa-paw text-slate-200"></i>
                            )}
                         </div>
                         <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-[#FF9F1C] uppercase tracking-widest mb-0.5">{pet.breed}</span>
                            <h4 className="text-lg font-black text-[#020617] uppercase tracking-tight truncate">{pet.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{pet.tutor}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-6">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Última Visita</p>
                          <p className="text-[11px] font-bold text-slate-800 uppercase">{pet.lastVisit}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Gastos</p>
                          <p className="text-[11px] font-bold text-emerald-500 uppercase">{pet.totalSpend}</p>
                        </div>
                      </div>
                      <button className="omie-btn-primary w-full !py-2.5 !px-0 shadow-none group-hover:shadow-lg transition-shadow">Acessar Prontuário</button>
                   </div>
                </div>
             ))}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-portal-enter">
          <div className="flex items-center gap-6 mb-4">
             <button 
               onClick={() => setSelectedPetId(null)}
               className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#FF9F1C] hover:border-[#FF9F1C] transition-all shadow-sm"
             >
               <i className="fas fa-arrow-left"></i>
             </button>
             <div className="flex flex-col gap-0.5">
                <h3 className="text-xl font-black text-[#020617] uppercase tracking-tight">{selectedPet?.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registro Central de Pacientes</p>
             </div>
          </div>

          <div className="omie-card bg-white overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF9F1C]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-100 p-1 shadow-inner overflow-hidden">
                  {selectedPet?.photoUrl ? (
                    <img src={selectedPet.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-100 text-4xl">
                      <i className="fas fa-paw"></i>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h4 className="text-4xl font-black text-[#020617] uppercase tracking-tighter">{selectedPet?.name}</h4>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">Paciente Ativo</span>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-dna text-[#FF9F1C] text-[10px]"></i>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedPet?.species} • {selectedPet?.breed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-calendar text-[#FF9F1C] text-[10px]"></i>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedPet?.age} • {selectedPet?.weight}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <button 
                  onClick={() => setPetToEdit(selectedPet)}
                  className="omie-btn-secondary !bg-white !px-8"
                >
                  <i className="fas fa-edit mr-2"></i> Editar Dados
                </button>
                <button 
                    onClick={() => handleSuggestPlan(selectedPet)}
                    disabled={!!isSuggestingPlan}
                    className="omie-btn-primary !bg-[#020617] !text-[#FF9F1C] border-none !px-8 shadow-xl"
                >
                    <i className={`fas ${isSuggestingPlan ? 'fa-circle-notch fa-spin' : 'fa-magic'} mr-2`}></i>
                    Plano IA
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 divide-x divide-slate-50 bg-white">
              <div className="p-8 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Visitas / Ano</p>
                <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">{selectedPet?.visitsThisYear}</p>
              </div>
              <div className="p-8 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Última Visita</p>
                <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">{selectedPet?.lastVisit}</p>
              </div>
              <div className="p-8 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ticket Médio</p>
                 <p className="text-2xl font-black text-emerald-500 uppercase tracking-tight">{selectedPet?.totalSpend}</p>
              </div>
              <div className="p-8 text-center bg-slate-50/50">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Próximo Agendamento</p>
                 <p className="text-2xl font-black text-[#FF9F1C] uppercase tracking-tight">
                    {selectedPet?.nextAppointment ? new Date(selectedPet.nextAppointment).toLocaleDateString('pt-BR') : '-'}
                 </p>
              </div>
            </div>

            <div className="flex border-b border-slate-50 px-10 gap-8 bg-white">
              {[
                { id: 'overview', label: 'Visão Geral' },
                { id: 'vaccines', label: 'Vacinas & Exames' },
                { id: 'history', label: 'Histórico Completo' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-6 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-[#FF9F1C] text-[#020617]' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-10 bg-slate-50/20">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-10">
                  <div className="omie-card p-8 bg-white border-none shadow-sm">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#020617] mb-6 flex items-center gap-3">
                      <i className="fas fa-user-circle text-[#FF9F1C]"></i> Cadastro do Tutor
                    </h4>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-4 border-b border-slate-50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</span>
                        <span className="text-sm font-bold text-[#020617] uppercase tracking-tight">{selectedPet?.tutor}</span>
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Corporativo</span>
                        <span className="text-sm font-bold text-slate-600">{selectedPet?.email || 'NÃO INFORMADO'}</span>
                      </div>
                       <div className="flex items-center justify-between py-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato Direto</span>
                        <span className="text-sm font-bold text-slate-600">{selectedPet?.phone || 'NÃO INFORMADO'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="omie-card p-8 bg-[#020617] border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9F1C]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#FF9F1C] mb-6 flex items-center gap-3 relative z-10">
                      <i className="fas fa-notes-medical"></i> Observações de Prontuário
                    </h4>
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-slate-300 text-[13px] leading-relaxed italic relative z-10">
                      "{selectedPet?.medicalHistory || "Nenhuma observação registrada neste prontuário it2a."}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NewPetModal 
        isOpen={isNewPetModalOpen || !!petToEdit}
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
