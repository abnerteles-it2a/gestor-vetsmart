import React, { useState } from 'react';
import { processClinicalNotes } from '../services/geminiService';
import { PetSpecies, AIConsultationResponse } from '../types';
import { NewPetModal } from './NewItemModals';
import { useToast } from '../context/ToastContext';

// Mock data simulating Agenda integration
const scheduledPatients = [
  { id: '1', name: 'Luna', species: PetSpecies.CAT, breed: 'Siamês', age: 3, weight: 4.2, tutor: 'João Silva', time: '09:00', status: 'waiting', reason: 'Vômito e Apatia' },
  { id: '2', name: 'Thor', species: PetSpecies.DOG, breed: 'Golden Ret.', age: 5, weight: 32, tutor: 'Maria Oliveira', time: '10:30', status: 'in_progress', reason: 'Vacinação V10' },
  { id: '3', name: 'Pipoca', species: PetSpecies.DOG, breed: 'Beagle', age: 2, weight: 12, tutor: 'Carlos Lima', time: '14:00', status: 'finished', reason: 'Retorno Cirúrgico' },
];

const ClinicalModule: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'anamnese' | 'exam' | 'diagnosis' | 'treatment'>('anamnese');
  const [selectedPetId, setSelectedPetId] = useState<string>('2'); // Default to 'Thor' (in progress)
  
  // State for clinical notes
  const [anamnese, setAnamnese] = useState('');
  const [examNotes, setExamNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<AIConsultationResponse | null>(null);
  const [isNewPetModalOpen, setIsNewPetModalOpen] = useState(false);

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
        {/* Patient Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${selectedPatient.species === PetSpecies.CAT ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'} rounded-2xl flex items-center justify-center shadow-sm`}>
                    <i className={`fas ${selectedPatient.species === PetSpecies.CAT ? 'fa-cat' : 'fa-dog'} text-3xl`}></i>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedPatient.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <span><i className="fas fa-user mr-1"></i> {selectedPatient.tutor}</span>
                        <span>•</span>
                        <span>{selectedPatient.breed}</span>
                        <span>•</span>
                        <span>{selectedPatient.age} anos</span>
                        <span>•</span>
                        <span>{selectedPatient.weight} kg</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                    <i className="fas fa-history mr-2 text-blue-500"></i> Histórico
                </button>
                <button 
                    onClick={handleGenerateAI}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-105 transition-all flex items-center gap-2"
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
                                <input type="text" placeholder="38.5" className="w-full bg-transparent font-bold text-lg outline-none text-slate-800 dark:text-slate-100" />
                                <span className="text-xs text-slate-400">°C</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Freq. Cardíaca</label>
                            <div className="flex items-center mt-1">
                                <input type="text" placeholder="120" className="w-full bg-transparent font-bold text-lg outline-none text-slate-800 dark:text-slate-100" />
                                <span className="text-xs text-slate-400">bpm</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Freq. Resp.</label>
                            <div className="flex items-center mt-1">
                                <input type="text" placeholder="30" className="w-full bg-transparent font-bold text-lg outline-none text-slate-800 dark:text-slate-100" />
                                <span className="text-xs text-slate-400">mpm</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">TPC</label>
                            <div className="flex items-center mt-1">
                                <input type="text" placeholder="2" className="w-full bg-transparent font-bold text-lg outline-none text-slate-800 dark:text-slate-100" />
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
                                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
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
                        <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                            Salvar Rascunho
                        </button>
                        <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center gap-2">
                            <i className="fas fa-check"></i> Finalizar Consulta
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalModule;
