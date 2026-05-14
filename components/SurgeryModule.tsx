import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '../context/NavigationContext';
import { NewSurgeryModal } from './NewSurgeryModal';
import { apiService } from '../services/api';
import { KpiCard } from './KpiCard';

const MODULE_COLOR = '#C62828';

interface Surgery {
  id: string;
  petId?: string;
  petName: string;
  tutorName: string;
  procedure: string;
  vetName: string;
  date: string;
  time: string;
  status: 'agendado' | 'em_andamento' | 'recuperacao' | 'concluido';
  checklist: {
    jejum: boolean;
    exames: boolean;
    termo: boolean;
    anestesia: boolean;
  };
  room: string;
  intraopNotes?: string;
  report?: string;
}

const SurgeryModule: React.FC = () => {
  const { addToast } = useToast();
  const { navigateTo } = useNavigation();
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'intraop' | 'postop'>('checklist');
  const [isNewSurgeryModalOpen, setIsNewSurgeryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intraopNotes, setIntraopNotes] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');

  useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb('Cirurgias');
    }
    loadSurgeries();
  }, []);

  const loadSurgeries = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getSurgeries();
      const data = response.data;
      
      const mappedSurgeries: Surgery[] = data.map((s: any) => {
        const dateObj = new Date(s.surgery_date);
        return {
          id: s.id.toString(),
          petId: s.pet_id?.toString(),
          petName: s.pet_name || 'Desconhecido',
          tutorName: s.tutor_name || 'Desconhecido',
          procedure: s.procedure_name,
          vetName: s.vet_name || 'Não atribuído',
          date: dateObj.toLocaleDateString('pt-BR'),
          time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: s.status,
          checklist: s.checklist || { jejum: false, exames: false, termo: false, anestesia: false },
          room: s.room || 'Sala 1',
          intraopNotes: s.notes || '',
          report: s.report || ''
        };
      });

      setSurgeries(mappedSurgeries);
      if (mappedSurgeries.length > 0 && !selectedSurgery) {
        // Optionally select the first one
        // setSelectedSurgery(mappedSurgeries[0]);
      }
    } catch (error) {
      console.error("Error loading surgeries:", error);
      addToast("Erro ao carregar cirurgias", "error");
    } finally {
      setIsLoading(false);
    }
  };


  const getStatusColor = (status: Surgery['status']) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'recuperacao': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'concluido': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleStatusChange = (id: string, newStatus: Surgery['status']) => {
    setSurgeries(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    if (selectedSurgery?.id === id) {
      setSelectedSurgery(prev => prev ? { ...prev, status: newStatus } : null);
    }
    addToast(`Status da cirurgia atualizado para: ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const toggleChecklist = (item: keyof Surgery['checklist']) => {
    if (!selectedSurgery) return;
    const updatedSurgery = {
        ...selectedSurgery,
        checklist: {
            ...selectedSurgery.checklist,
            [item]: !selectedSurgery.checklist[item]
        }
    };
    setSelectedSurgery(updatedSurgery);
    setSurgeries(prev => prev.map(s => s.id === updatedSurgery.id ? updatedSurgery : s));
  };

  const handleNewSurgerySaved = async (surgery: any) => {
    try {
        // Map the frontend model to the backend expected payload
        const payload = {
            pet_id: surgery.petId,
            procedure_name: surgery.procedure,
            surgery_date: `${surgery.date}T${surgery.time}:00`,
            vet_name: surgery.vetName,
            status: surgery.status
        };

        const response = await apiService.createSurgery(payload);
        
        // Add the returned surgery to the list
        const s = response.data;
        const dateObj = new Date(s.surgery_date);
        
        const newSurgery: Surgery = {
            id: s.id.toString(),
            petId: s.pet_id?.toString(),
            petName: s.pet_name || surgery.petName, // Fallback if backend doesn't return joined fields immediately
            tutorName: s.tutor_name || surgery.tutorName,
            procedure: s.procedure_name,
            vetName: s.vet_name || 'Não atribuído',
            date: dateObj.toLocaleDateString('pt-BR'),
            time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: s.status,
            checklist: s.checklist || { jejum: false, exames: false, termo: false, anestesia: false },
            room: s.room || 'Sala 1'
        };

        setSurgeries(prev => [...prev, newSurgery]);
        setIsNewSurgeryModalOpen(false);
        addToast('Cirurgia agendada com sucesso', 'success');
        
        // Refresh list to be sure
        loadSurgeries();
    } catch (error) {
        console.error("Error creating surgery:", error);
        addToast("Erro ao criar cirurgia", "error");
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedSurgery) return;
    setIsProcessing(true);
    try {
        const payload = {
            pet: { name: selectedSurgery.petName, species: 'Desconhecida' },
            rawNotes: `Cirurgia: ${selectedSurgery.procedure}. Notas Intra-operatórias: ${intraopNotes}`,
            history: `Tutor: ${selectedSurgery.tutorName}. Veterinário: ${selectedSurgery.vetName}`
        };
        const response = await apiService.structureClinicalNotes(payload);
        const reportText = response.data.diagnosis + "\n\n" + response.data.treatment + "\n\n" + response.data.owner_instructions.text;
        setGeneratedReport(reportText);
        addToast('Relatório Cirúrgico gerado pela IA it2a!', 'success');
    } catch (error) {
        console.error(error);
        addToast('Erro ao gerar relatório com IA.', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const rooms = [
    { id: 'Sala 1', status: surgeries.find(s => s.room === 'Sala 1' && s.status === 'em_andamento') ? 'ocupado' : 'livre' },
    { id: 'Sala 2', status: surgeries.find(s => s.room === 'Sala 2' && s.status === 'em_andamento') ? 'ocupado' : 'livre' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">

      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Procedimentos</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Centro Cirúrgico</p>
        </div>
        <button
          onClick={() => setIsNewSurgeryModalOpen(true)}
          className="omie-btn-primary"
          style={{ background: MODULE_COLOR }}
        >
          <i className="fas fa-plus-circle mr-2"></i>Agendar Ciru&shy;rgia
        </button>
      </div>

      <NewSurgeryModal
        isOpen={isNewSurgeryModalOpen}
        onClose={() => setIsNewSurgeryModalOpen(false)}
        onSaved={handleNewSurgerySaved}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KpiCard
          title="Total Hoje"
          value={surgeries.length.toString()}
          icon={<i className="fas fa-scalpel"></i>}
          subtext="Procedimentos agendados"
          subtextColor="text-slate-400"
          color={MODULE_COLOR}
        />
        {rooms.map(room => (
          <KpiCard
            key={room.id}
            title={room.id}
            value={room.status === 'ocupado' ? 'Ocupada' : 'Livre'}
            icon={<i className="fas fa-hospital"></i>}
            subtext={room.status === 'ocupado' ? 'Em procedimento' : 'Disponível'}
            subtextColor={room.status === 'ocupado' ? 'text-rose-500' : 'text-emerald-500'}
            color={room.status === 'ocupado' ? '#EF4444' : '#10B981'}
          />
        ))}
        <KpiCard
          title="Em Recuperação"
          value={surgeries.filter(s => s.status === 'recuperacao').length.toString()}
          icon={<i className="fas fa-procedures"></i>}
          subtext="Pós-operatório ativo"
          subtextColor="text-[#FF9F1C]"
          color="#7B1FA2"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
        {/* Lista de Cirurgias */}
        <div className="xl:col-span-1 space-y-3 xl:space-y-4">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] xl:text-xs tracking-wider">Cronograma do Dia</h4>
            {surgeries.map(surgery => (
                <div 
                    key={surgery.id}
                    onClick={() => setSelectedSurgery(surgery)}
                    className={`p-3 xl:p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedSurgery?.id === surgery.id
                            ? 'shadow-lg ring-1'
                            : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                    style={selectedSurgery?.id === surgery.id ? {
                      background: `${MODULE_COLOR}10`,
                      borderColor: MODULE_COLOR,
                      ['--tw-ring-color' as any]: MODULE_COLOR
                    } : {}}
                >
                    <div className="flex justify-between items-start mb-1.5 xl:mb-2">
                        <span className={`px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-lg text-[10px] xl:text-xs font-bold uppercase ${getStatusColor(surgery.status)}`}>
                            {surgery.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] xl:text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <i className="fas fa-clock"></i> {surgery.time}
                        </span>
                    </div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm xl:text-sm 2xl:text-base">{surgery.petName}</h5>
                    <p className="text-xs xl:text-xs 2xl:text-sm text-slate-500 dark:text-slate-400 mb-1.5 xl:mb-2">{surgery.procedure}</p>
                    <div className="flex items-center gap-2 text-[10px] xl:text-xs text-slate-600 dark:text-slate-300">
                        <i className="fas fa-user-md"></i> {surgery.vetName.split(' ')[0]}...
                    </div>
                </div>
            ))}
        </div>

        {/* Detalhes da Cirurgia */}
        <div className="xl:col-span-2">
            {selectedSurgery ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 xl:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h2 className="text-xl xl:text-xl 2xl:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    {selectedSurgery.petName} <span className="text-sm xl:text-sm 2xl:text-base font-normal text-slate-500 dark:text-slate-400">({selectedSurgery.tutorName})</span>
                                </h2>
                                <p className="text-sm xl:text-sm 2xl:text-base font-semibold text-blue-600 dark:text-blue-400 mt-1">{selectedSurgery.procedure}</p>
                                {selectedSurgery.petId && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateTo('patients', { petId: selectedSurgery.petId, subTab: 'history' });
                                        }}
                                        className="mt-2 xl:mt-2.5 px-3 py-1.5 xl:px-4 xl:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-lg text-xs xl:text-xs 2xl:text-sm font-bold hover:bg-blue-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <i className="fas fa-file-medical"></i> Ver Prontuário
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {selectedSurgery.status === 'agendado' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedSurgery.id, 'em_andamento')}
                                        className="omie-btn-primary !px-4 !py-2 !text-[10px] !rounded-lg shadow-none"
                                        style={{ background: '#2E7D32' }}
                                    >
                                        <i className="fas fa-play mr-1"></i> Iniciar
                                    </button>
                                )}
                                {selectedSurgery.status === 'em_andamento' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedSurgery.id, 'recuperacao')}
                                        className="omie-btn-primary !px-4 !py-2 !text-[10px] !rounded-lg shadow-none"
                                        style={{ background: '#4527A0' }}
                                    >
                                        <i className="fas fa-procedures mr-1"></i> Pós-Op
                                    </button>
                                )}
                                {selectedSurgery.status === 'recuperacao' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedSurgery.id, 'concluido')}
                                        className="omie-btn-primary !px-4 !py-2 !text-[10px] !rounded-lg shadow-none"
                                        style={{ background: '#020617' }}
                                    >
                                        <i className="fas fa-check mr-1"></i> Finalizar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs with MODULE_COLOR */}
                    <div className="flex border-b border-slate-100 px-5">
                        {(['checklist', 'intraop', 'postop'] as const).map((tab, i) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3.5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                              activeTab === tab
                                ? 'border-b-[3px] text-white'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                            style={activeTab === tab ? { borderBottomColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
                          >
                            {i + 1}. {tab === 'checklist' ? 'Pré-Operatório' : tab === 'intraop' ? 'Trans-Operatório' : 'Pós-Operatório'}
                          </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-4 xl:p-6 flex-1 overflow-y-auto">
                        {activeTab === 'checklist' && (
                            <div className="space-y-6">
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800/30 rounded-xl p-4 flex items-start gap-3">
                                    <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 mt-1"></i>
                                    <div>
                                        <h5 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">Protocolo de Segurança</h5>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300">Confirme todos os itens antes de iniciar a indução anestésica.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div 
                                        onClick={() => toggleChecklist('jejum')}
                                        className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between ${
                                            selectedSurgery.checklist.jejum 
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedSurgery.checklist.jejum ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                {selectedSurgery.checklist.jejum && <i className="fas fa-check text-xs"></i>}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">Jejum 12h Confirmado</span>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => toggleChecklist('exames')}
                                        className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between ${
                                            selectedSurgery.checklist.exames 
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedSurgery.checklist.exames ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                {selectedSurgery.checklist.exames && <i className="fas fa-check text-xs"></i>}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">Exames Pré-Op OK</span>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => toggleChecklist('termo')}
                                        className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between ${
                                            selectedSurgery.checklist.termo 
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedSurgery.checklist.termo ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                {selectedSurgery.checklist.termo && <i className="fas fa-check text-xs"></i>}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">Termo Assinado</span>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => toggleChecklist('anestesia')}
                                        className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between ${
                                            selectedSurgery.checklist.anestesia 
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedSurgery.checklist.anestesia ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                {selectedSurgery.checklist.anestesia && <i className="fas fa-check text-xs"></i>}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">Avaliação Anestésica</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'intraop' && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h5 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <i className="fas fa-pump-medical text-blue-500"></i> Monitoramento e Materiais
                                    </h5>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Materiais Consumidos</span>
                                            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">+ Adicionar</button>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>• Fio Nylon 3-0</span>
                                                <span className="font-mono">1 un</span>
                                            </li>
                                            <li className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>• Propofol Ampola</span>
                                                <span className="font-mono">1.5 un</span>
                                            </li>
                                            <li className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>• Campo Cirúrgico Estéril</span>
                                                <span className="font-mono">1 un</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Início Cirurgia</p>
                                            <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">{selectedSurgery.time}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Tempo Decorrido</p>
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">--:--</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notas Intra-operatórias (Anotação Rápida)</label>
                                        <textarea 
                                            value={intraopNotes}
                                            onChange={(e) => setIntraopNotes(e.target.value)}
                                            placeholder="Relate intercorrências, técnica utilizada, sutura..."
                                            className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'postop' && (
                            <div className="space-y-6">
                                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/20">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                        <i className="fas fa-file-medical-alt"></i>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Relatório Cirúrgico IA</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                                        {generatedReport ? "Relatório gerado com sucesso pela it2a Intelligence." : "Utilize a inteligência artificial para estruturar o relatório completo baseado nas notas intra-operatórias."}
                                    </p>
                                    
                                    {generatedReport ? (
                                        <div className="text-left bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner mb-6 max-h-96 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">{generatedReport}</pre>
                                        </div>
                                    ) : null}

                                    <button 
                                        onClick={handleGenerateReport}
                                        disabled={isProcessing || !intraopNotes}
                                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 mx-auto ${
                                            isProcessing || !intraopNotes 
                                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' 
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                        }`}
                                    >
                                        <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                                        {isProcessing ? 'Gerando...' : generatedReport ? 'Regerar Relatório' : 'Gerar Relatório com IA'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col items-center justify-center p-12 text-center opacity-50">
                    <i className="fas fa-user-md text-6xl text-slate-300 dark:text-slate-700 mb-4"></i>
                    <h3 className="text-xl font-bold text-slate-400 dark:text-slate-600">Selecione uma cirurgia</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-600 mt-2">Clique na lista ao lado para ver detalhes</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SurgeryModule;
