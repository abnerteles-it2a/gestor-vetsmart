import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '../context/NavigationContext';
import { NewSurgeryModal } from './NewSurgeryModal';
import { apiService } from '../services/api';

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
}

const SurgeryModule: React.FC = () => {
  const { addToast } = useToast();
  const { navigateTo } = useNavigation();
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'intraop' | 'postop'>('checklist');
  const [isNewSurgeryModalOpen, setIsNewSurgeryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          checklist: s.checklist || { jejum: false, exames: false, termo: false, anestesia: false }
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
            checklist: s.checklist || { jejum: false, exames: false, termo: false, anestesia: false }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-slate-800 dark:text-slate-100">Centro Cirúrgico</h3>
          <p className="text-xs md:text-sm xl:text-base text-slate-600 dark:text-slate-300">Gestão completa de procedimentos, equipe e materiais.</p>
        </div>
        <button 
          onClick={() => setIsNewSurgeryModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 xl:px-6 xl:py-3 rounded-xl font-semibold shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all flex items-center gap-2 text-xs md:text-sm xl:text-base"
        >
          <i className="fas fa-plus-circle"></i> Agendar Cirurgia
        </button>
      </div>

      <NewSurgeryModal 
        isOpen={isNewSurgeryModalOpen}
        onClose={() => setIsNewSurgeryModalOpen(false)}
        onSaved={handleNewSurgerySaved}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
        {/* Lista de Cirurgias */}
        <div className="xl:col-span-1 space-y-3 xl:space-y-4">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] xl:text-xs tracking-wider">Cronograma do Dia</h4>
            {surgeries.map(surgery => (
                <div 
                    key={surgery.id}
                    onClick={() => setSelectedSurgery(surgery)}
                    className={`p-3 xl:p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedSurgery?.id === surgery.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 ring-1 ring-blue-300 dark:ring-blue-600'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                >
                    <div className="flex justify-between items-start mb-1.5 xl:mb-2">
                        <span className={`px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-lg text-[10px] xl:text-xs font-bold uppercase ${getStatusColor(surgery.status)}`}>
                            {surgery.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] xl:text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <i className="fas fa-clock"></i> {surgery.time}
                        </span>
                    </div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm xl:text-base">{surgery.petName}</h5>
                    <p className="text-xs xl:text-sm text-slate-500 dark:text-slate-400 mb-1.5 xl:mb-2">{surgery.procedure}</p>
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
                    <div className="p-4 xl:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    {selectedSurgery.petName} <span className="text-sm xl:text-base 2xl:text-lg font-normal text-slate-500 dark:text-slate-400">({selectedSurgery.tutorName})</span>
                                </h2>
                                <p className="text-sm xl:text-sm 2xl:text-base font-semibold text-blue-600 dark:text-blue-400 mt-1">{selectedSurgery.procedure}</p>
                                {selectedSurgery.petId && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateTo('patients', { petId: selectedSurgery.petId, subTab: 'history' });
                                        }}
                                        className="mt-2 xl:mt-3 px-3 py-1.5 xl:px-4 xl:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-lg text-xs xl:text-sm font-bold hover:bg-blue-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <i className="fas fa-file-medical"></i> Ver Prontuário
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {selectedSurgery.status === 'agendado' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedSurgery.id, 'em_andamento')}
                                        className="px-3 py-1.5 xl:px-4 xl:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs xl:text-sm font-bold flex items-center gap-2"
                                    >
                                        <i className="fas fa-play"></i> Iniciar
                                    </button>
                                )}
                                {selectedSurgery.status === 'em_andamento' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedSurgery.id, 'recuperacao')}
                                        className="px-3 py-1.5 xl:px-4 xl:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs xl:text-sm font-bold flex items-center gap-2"
                                    >
                                        <i className="fas fa-procedures"></i> Pós-Op
                                    </button>
                                )}
                                {selectedSurgery.status === 'recuperacao' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedSurgery.id, 'concluido')}
                                        className="px-3 py-1.5 xl:px-4 xl:py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs xl:text-sm font-bold flex items-center gap-2"
                                    >
                                        <i className="fas fa-check"></i> Finalizar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 xl:px-6">
                        <button 
                            onClick={() => setActiveTab('checklist')}
                            className={`px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-bold border-b-2 transition-all ${activeTab === 'checklist' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            1. Pré-Operatório
                        </button>
                        <button 
                            onClick={() => setActiveTab('intraop')}
                            className={`px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-bold border-b-2 transition-all ${activeTab === 'intraop' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            2. Trans-Operatório
                        </button>
                        <button 
                            onClick={() => setActiveTab('postop')}
                            className={`px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-bold border-b-2 transition-all ${activeTab === 'postop' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            3. Pós-Operatório
                        </button>
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
                                </div>
                            </div>
                        )}

                        {activeTab === 'postop' && (
                            <div className="space-y-6">
                                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/20">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                        <i className="fas fa-file-medical-alt"></i>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Relatório Cirúrgico</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                                        A cirurgia ainda não foi finalizada. O relatório será gerado automaticamente pela IA após a conclusão do procedimento.
                                    </p>
                                    <button className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg font-bold text-sm cursor-not-allowed">
                                        Gerar Relatório (Aguardando)
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
