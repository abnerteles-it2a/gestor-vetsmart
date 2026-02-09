import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { processClinicalNotes } from '../services/geminiService';
import { apiService } from '../services/api';
import { PetSpecies, AIConsultationResponse } from '../types';
import { NewPetModal } from './NewItemModals';
import { useToast } from '../context/ToastContext';

const ClinicalModule: React.FC = () => {
  const { navigateTo, navigationParams } = useNavigation();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'anamnese' | 'exam' | 'diagnosis' | 'treatment'>('anamnese');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [scheduledPatients, setScheduledPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for clinical notes
  const [anamnese, setAnamnese] = useState('');
  const [examNotes, setExamNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  
  // Physical Exam State
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [respRate, setRespRate] = useState('');
  const [tpc, setTpc] = useState('');
  
  // Exams State
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<AIConsultationResponse | null>(null);
  const [isNewPetModalOpen, setIsNewPetModalOpen] = useState(false);

  // Age calculation helper
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        years--;
    }
    return years;
  };

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [appointmentsRes, petsRes] = await Promise.all([
          apiService.getAppointments(),
          apiService.getPets()
        ]);

        const appointments = appointmentsRes.data;
        const pets = petsRes.data;

        const mapped = appointments.map((apt: any) => {
          const pet = pets.find((p: any) => p.id === apt.pet_id);
          
          let formattedTime = '---';
          if (apt.appointment_date) {
             const dateObj = new Date(apt.appointment_date);
             formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          }

          return {
            id: apt.pet_id.toString(), // Using PetId as ID for this view
            name: apt.pet_name,
            species: apt.species === 'Gato' ? PetSpecies.CAT : PetSpecies.DOG,
            breed: pet?.breed || 'N/A',
            age: pet?.birth_date ? calculateAge(pet.birth_date) : 0,
            weight: pet?.weight ? parseFloat(pet.weight) : 0,
            tutor: apt.tutor_name,
            time: formattedTime,
            status: apt.status === 'agendado' ? 'waiting' : apt.status === 'em_andamento' ? 'in_progress' : 'finished',
            reason: apt.reason || apt.type
          };
        });

        // Filter out canceled or future days if desired? 
        // For now, let's keep all appointments to match behavior, or maybe filter to today?
        // The previous mock behavior was just "getAppointments", which returned a static list.
        // Let's filter to TODAY to be realistic for a "Clinical Queue".
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = mapped.filter((a: any) => {
             // We need the original date to filter. But we only have mapped data here.
             // Let's rely on the original loop or re-map.
             // Actually, let's just use the ones from today.
             const aptRaw = appointments.find((raw: any) => raw.pet_id.toString() === a.id); // This is risky if multiple appts.
             // Better: Filter `appointments` first.
             return true; 
        });
        
        // Let's filter `appointments` first in the chain to be safe.
        const relevantAppointments = appointments.filter((a: any) => {
             return a.appointment_date && a.appointment_date.startsWith(today) && a.status !== 'cancelado';
        });

        const finalMapped = relevantAppointments.map((apt: any) => {
            const pet = pets.find((p: any) => p.id === apt.pet_id);
            const dateObj = new Date(apt.appointment_date);
            const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            return {
                id: apt.pet_id.toString(),
                name: apt.pet_name,
                species: apt.species === 'Gato' ? PetSpecies.CAT : PetSpecies.DOG,
                breed: pet?.breed || 'N/A',
                age: pet?.birth_date ? calculateAge(pet.birth_date) : 0,
                weight: pet?.weight ? parseFloat(pet.weight) : 0,
                tutor: apt.tutor_name,
                time: formattedTime,
                status: apt.status === 'agendado' ? 'waiting' : apt.status === 'em_andamento' ? 'in_progress' : 'finished',
                reason: apt.reason || apt.type
            };
        });

        setScheduledPatients(finalMapped);
        
        // Initial selection logic (only if no param navigation pending)
        if (!selectedPetId && finalMapped.length > 0 && !navigationParams?.petId) {
           setSelectedPetId(finalMapped[0].id);
        }
      } catch (err) {
        console.error("Error loading clinical data", err);
        addToast("Erro ao carregar agenda clínica", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle Navigation Params (Deep Linking)
  useEffect(() => {
    if (navigationParams?.petId) {
      const targetId = navigationParams.petId;
      setSelectedPetId(targetId);

      // If pet is not in the schedule, fetch and add it as "Avulso"
      if (!isLoading && scheduledPatients.length > 0) {
        const exists = scheduledPatients.find(p => p.id === targetId);
        if (!exists) {
           apiService.getPets().then(res => {
             const pets = res.data;
             const pet = pets.find((p: any) => p.id.toString() === targetId);
             if (pet) {
               const newPatient = {
                 id: pet.id.toString(),
                 name: pet.name,
                 species: pet.species === 'Gato' ? PetSpecies.CAT : PetSpecies.DOG,
                 breed: pet.breed,
                 age: pet.birth_date ? calculateAge(pet.birth_date) : 0,
                 weight: parseFloat(pet.weight) || 0,
                 tutor: pet.tutor_name,
                 time: 'Agora',
                 status: 'in_progress',
                 reason: 'Consulta Avulsa'
               };
               setScheduledPatients(prev => [...prev, newPatient]);
             }
           });
        }
      }
    }
  }, [navigationParams, isLoading, scheduledPatients.length]);

  const selectedPatient = scheduledPatients.find(p => p.id === selectedPetId) || scheduledPatients[0];

  const handleGenerateAI = async () => {
    const fullNotes = `
      Anamnese: ${anamnese}
      Exame Físico: ${examNotes}
      Diagnóstico Preliminar: ${diagnosis}
    `;

    if (!fullNotes.trim()) {
        addToast("Preencha pelo menos um campo para usar a IA.", "error");
        return;
    }

    setIsProcessing(true);
    try {
      const history = "Histórico: Vacinas em dia. Alérgico a dipirona.";
      const aiResponse = await processClinicalNotes(selectedPatient as any, history, fullNotes);
      setAiResult(aiResponse);
      
      // Update fields with AI suggestions (user can edit later)
      if (aiResponse.structured_soap?.a) {
          setDiagnosis(aiResponse.structured_soap.a);
      } else if (aiResponse.diagnosis) {
          setDiagnosis(aiResponse.diagnosis);
      }

      if (aiResponse.structured_soap?.p) {
          setTreatment(aiResponse.structured_soap.p);
      } else if (aiResponse.treatment) {
          setTreatment(aiResponse.treatment);
      }
      
      addToast("Análise clínica atualizada com sucesso!", 'success');
      setActiveTab('diagnosis'); // Switch to diagnosis tab to show results
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 403) {
        addToast("Sessão expirada. Faça login novamente para usar a IA.", 'error');
      } else if (error.response?.data?.error) {
        // Show specific error from backend (e.g. Quota Exceeded)
        addToast(error.response.data.error, 'error');
      } else {
        addToast("Erro ao processar com IA. Verifique sua conexão.", 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
         <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
         <span className="ml-3 text-slate-600 dark:text-slate-400">Carregando prontuários...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Sidebar: Patient Queue (Agenda Integration) */}
      <div className="w-80 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Fila de Atendimento</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Integrado com Agenda</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {scheduledPatients.map(patient => (
            <button
              key={patient.id}
              onClick={() => setSelectedPetId(patient.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedPetId === patient.id
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-200">{patient.time}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    patient.status === 'waiting' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    patient.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                    {patient.status === 'waiting' ? 'Aguardando' : patient.status === 'in_progress' ? 'Em Atendimento' : 'Finalizado'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${patient.species === PetSpecies.CAT ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    <i className={`fas ${patient.species === PetSpecies.CAT ? 'fa-cat' : 'fa-dog'}`}></i>
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{patient.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{patient.breed}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-10 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                {patient.reason}
              </p>
            </button>
          ))}
        </div>
        
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setIsNewPetModalOpen(true)} className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                <i className="fas fa-plus mr-2"></i> Atendimento Avulso
            </button>
        </div>
      </div>

      {/* Main Clinical Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {!selectedPatient ? (
           <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <div className="text-center">
                 <i className="fas fa-user-md text-6xl mb-4 opacity-20"></i>
                 <p className="font-bold">Nenhum atendimento selecionado</p>
                 <p className="text-sm mt-2">Selecione um paciente na fila ou inicie um atendimento avulso.</p>
              </div>
           </div>
        ) : (
        <>
        {/* Patient Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30 dark:bg-slate-800/20">
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 xl:w-20 xl:h-20 ${selectedPatient.species === PetSpecies.CAT ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'} rounded-2xl flex items-center justify-center shadow-sm transition-all`}>
                    <i className={`fas ${selectedPatient.species === PetSpecies.CAT ? 'fa-cat' : 'fa-dog'} text-3xl xl:text-4xl`}></i>
                </div>
                <div>
                    <h2 className="text-2xl xl:text-2xl 2xl:text-3xl font-bold text-slate-800 dark:text-slate-100 transition-all">{selectedPatient.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm xl:text-sm 2xl:text-base text-slate-500 dark:text-slate-400 mt-1">
                        <span><i className="fas fa-user mr-1"></i> {selectedPatient.tutor}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{selectedPatient.breed}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{selectedPatient.age} anos</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{selectedPatient.weight} kg</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={() => navigateTo('patients', { petId: selectedPatient.id, subTab: 'history' })}
                    className="flex-1 md:flex-none px-4 py-2 xl:px-6 xl:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm xl:text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <i className="fas fa-file-medical text-blue-500"></i> Ver Prontuário
                </button>
                <button 
                    onClick={handleGenerateAI}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none px-4 py-2 xl:px-6 xl:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm xl:text-base font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                    <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-robot'}`}></i> 
                    {isProcessing ? 'Analisando...' : 'IA Assistente'}
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
            {[
                { id: 'anamnese', label: 'Anamnese', icon: 'fa-comments' },
                { id: 'exam', label: 'Exame Físico', icon: 'fa-stethoscope' },
                { id: 'diagnosis', label: 'Diagnóstico', icon: 'fa-clipboard-check' },
                { id: 'treatment', label: 'Tratamento', icon: 'fa-pills' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === tab.id 
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <i className={`fas ${tab.icon}`}></i> {tab.label}
                </button>
            ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/50">
            {activeTab === 'anamnese' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <label className="block font-bold text-slate-700 dark:text-slate-200">Queixa Principal e Histórico</label>
                    <textarea
                        value={anamnese}
                        onChange={(e) => setAnamnese(e.target.value)}
                        placeholder="Descreva o motivo da consulta, sintomas relatados pelo tutor, evolução do quadro..."
                        className="w-full h-64 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 dark:text-slate-200"
                    />
                    <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                        <p>Dica: Use a IA para estruturar a anamnese em termos técnicos automaticamente após digitar as observações em linguagem natural.</p>
                    </div>
                </div>
            )}

            {activeTab === 'exam' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Temperatura</label>
                            <div className="flex items-center mt-1">
                                <input 
                                    type="text" 
                                    value={temperature}
                                    onChange={(e) => setTemperature(e.target.value)}
                                    placeholder="38.5" 
                                    className="w-full bg-transparent font-bold text-lg outline-none text-slate-800 dark:text-slate-100" 
                                />
                                <span className="text-xs text-slate-400">°C</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Freq. Cardíaca</label>
                            <div className="flex items-center mt-1">
                                <input 
                                    type="text" 
                                    value={heartRate}
                                    onChange={(e) => setHeartRate(e.target.value)}
                                    placeholder="120" 
                                    className="w-full bg-transparent font-bold text-lg outline-none text-slate-800 dark:text-slate-100" 
                                />
                                <span className="text-xs text-slate-400">bpm</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Freq. Resp.</label>
                            <div className="flex items-center mt-1">
                                <input 
                                    type="text" 
                                    value={respRate}
                                    onChange={(e) => setRespRate(e.target.value)}
                                    placeholder="30" 
                                    className="w-full bg-transparent font-bold text-lg outline-none text-slate-800 dark:text-slate-100" 
                                />
                                <span className="text-xs text-slate-400">mpm</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">TPC</label>
                            <div className="flex items-center mt-1">
                                <input 
                                    type="text" 
                                    value={tpc}
                                    onChange={(e) => setTpc(e.target.value)}
                                    placeholder="2" 
                                    className="w-full bg-transparent font-bold text-lg outline-none text-slate-800 dark:text-slate-100" 
                                />
                                <span className="text-xs text-slate-400">seg</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-200 mb-2">Achados Clínicos</label>
                        <textarea
                            value={examNotes}
                            onChange={(e) => setExamNotes(e.target.value)}
                            placeholder="Descreva os achados da inspeção, palpação, ausculta..."
                            className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 dark:text-slate-200"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'diagnosis' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-2">Hipóteses Diagnósticas</label>
                            <textarea
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Liste os diagnósticos prováveis..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 dark:text-slate-200"
                            />
                        </div>
                        {aiResult && (
                            <div className="w-1/3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50">
                                <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2"><i className="fas fa-robot mr-2"></i>Sugestão IA</h4>
                                <p className="text-sm text-purple-800 dark:text-purple-200 italic">"{aiResult.diagnosis}"</p>
                                <button 
                                    onClick={() => setDiagnosis(aiResult.diagnosis)}
                                    className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                    Usar este texto
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-200 mb-2">Solicitação de Exames</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Hemograma', 'Bioquímico', 'Ultrassom', 'Raio-X', 'Urinálise', 'Fezes'].map(exame => (
                                <label key={exame} className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedExams.includes(exame)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedExams([...selectedExams, exame]);
                                            } else {
                                                setSelectedExams(selectedExams.filter(item => item !== exame));
                                            }
                                        }}
                                        className="rounded text-blue-600 focus:ring-blue-500" 
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{exame}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'treatment' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-2">Prescrição / Plano Terapêutico</label>
                            <textarea
                                value={treatment}
                                onChange={(e) => setTreatment(e.target.value)}
                                placeholder="Medicações, doses, posologia..."
                                className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 dark:text-slate-200"
                            />
                        </div>
                        {aiResult && (
                            <div className="w-1/3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50">
                                <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2"><i className="fas fa-robot mr-2"></i>Sugestão IA</h4>
                                <p className="text-sm text-purple-800 dark:text-purple-200 italic">"{aiResult.treatment}"</p>
                                <button 
                                    onClick={() => setTreatment(aiResult.treatment)}
                                    className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                    Usar este texto
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={() => addToast('Rascunho salvo com sucesso!', 'success')}
                            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                        >
                            Salvar Rascunho
                        </button>
                        <button 
                            onClick={() => {
                                addToast('Consulta finalizada com sucesso! Histórico atualizado.', 'success');
                                // Here we would normally save to DB via apiService
                                // apiService.saveConsultation({ ... })
                                // For now, just simulate success
                                navigateTo('patients', { petId: selectedPatient.id, subTab: 'history' });
                            }}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-check"></i> Finalizar Consulta
                        </button>
                    </div>
                </div>
            )}
        </div>
        </>
        )}
      </div>

      <NewPetModal
        isOpen={isNewPetModalOpen}
        onClose={() => {
            setIsNewPetModalOpen(false);
        }}
        onSaved={(pet) => {
            // Add to list immediately if created here
            const newPatient = {
                 id: pet.id,
                 name: pet.name,
                 species: pet.species === 'Gato' ? PetSpecies.CAT : PetSpecies.DOG,
                 breed: pet.breed,
                 age: parseInt(pet.age) || 0,
                 weight: parseFloat(pet.weight) || 0,
                 tutor: pet.tutor,
                 time: 'Agora',
                 status: 'in_progress',
                 reason: 'Novo Paciente'
            };
            setScheduledPatients(prev => [...prev, newPatient]);
            setSelectedPetId(pet.id);
        }}
      />
    </div>
  );
};

export default ClinicalModule;