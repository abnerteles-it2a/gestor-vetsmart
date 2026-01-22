import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

const CampaignsModule: React.FC = () => {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInstruction, setUserInstruction] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await apiService.getCampaigns();
        setCampaigns(response.data || []);
      } catch (e) {
        console.error('Failed to load campaigns', e);
        // Fallback or empty state handled by UI
      }
    };
    loadCampaigns();
  }, []);

  const handleGenerateCampaign = async () => {
    setIsGenerating(true);
    try {
        // Now sending userInstruction to the backend
        const response = await apiService.getSmartCampaigns(userInstruction);
        const aiResult = response.data;
        
        if (aiResult) {
             // Handle both single campaign object or list of campaigns
             const campaignData = aiResult.campaigns ? aiResult.campaigns[0] : aiResult;
             
             // Validate if we have meaningful data
             if (!campaignData || (!campaignData.campaign_name && !campaignData.title)) {
                 addToast('A IA gerou uma resposta incompleta. Tente refinar sua instrução.', 'warning');
                 return;
             }

             const newCamp = {
                id: Date.now(),
                title: campaignData.campaign_name || campaignData.title || 'Campanha Personalizada',
                status: 'draft',
                target: campaignData.target_segments 
                    ? `Segmentos: ${campaignData.target_segments.map((s:any) => s.segment).join(', ')}` 
                    : `Sugestão IA: ${campaignData.target_audience || 'Geral'}`,
                sent: 0,
                opened: 0,
                converted: 0,
                roi: '-',
                date: 'Gerado agora',
                // Store full AI details for viewing later if needed
                details: campaignData 
            };
            setCampaigns(prev => [newCamp, ...prev]);
            addToast('Nova campanha gerada com sucesso!', 'success');
            setIsModalOpen(false); // Close modal if open
            setUserInstruction(''); // Reset instruction
        } else {
             addToast('IA não encontrou sugestões relevantes no momento.', 'info');
        }
    } catch (e) {
        console.error(e);
        addToast('Erro ao conectar com a IA.', 'error');
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Campanhas Inteligentes</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Automação de CRM e Marketing via IA.</p>
        </div>
        
        <div className="flex gap-3">
            {/* New Button to Open Modal for Custom Campaign */}
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={isGenerating}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <i className="fas fa-pen-to-square"></i> 
              Criar Personalizada
            </button>

            <button 
              onClick={() => { setUserInstruction(''); handleGenerateCampaign(); }}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-robot'}`}></i> 
              {isGenerating ? 'Criando...' : 'Auto-Gerar (IA)'}
            </button>
        </div>
      </div>

      {/* Input Modal for Custom Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        <i className="fas fa-bullseye text-purple-600 mr-2"></i>
                        Definir Objetivo da Campanha
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Descreva qual campanha você quer criar. A IA vai analisar sua base de dados para encontrar o melhor público e criar a mensagem.
                </p>

                <textarea
                    value={userInstruction}
                    onChange={(e) => setUserInstruction(e.target.value)}
                    placeholder="Ex: Quero fazer uma promoção de limpeza de tártaro para cães idosos, ou uma semana da ração renal com desconto..."
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-700 dark:text-slate-200 mb-6"
                />

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleGenerateCampaign}
                        disabled={!userInstruction.trim() || isGenerating}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                        Gerar Campanha
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards for Campaigns */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-300">
                    <i className="fas fa-bullhorn text-xl"></i>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-500/20 px-2 py-1 rounded-full">+12% conv.</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">R$ 14.2k</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Receita gerada (30d)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300">
                    <i className="fas fa-envelope-open-text text-xl"></i>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/20 px-2 py-1 rounded-full">68% open rate</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">1.240</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mensagens enviadas</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300">
                    <i className="fas fa-users text-xl"></i>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/20 px-2 py-1 rounded-full">Reativação</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">45</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Clientes recuperados</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Minhas Campanhas</h4>
            <div className="flex gap-2">
                <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/20 dark:text-blue-300 rounded-lg">Todas</button>
                <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg">Ativas</button>
                <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg">Rascunhos</button>
            </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Campanha</th>
              <th className="px-6 py-4">Público Alvo</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Desempenho (Conv./ROI)</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {campaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/70 transition-all">
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{camp.title}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{camp.date}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    <i className="fas fa-bullseye text-slate-400 mr-2"></i>
                    {camp.target}
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        camp.status === 'active' ? 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-300' :
                        camp.status === 'draft' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                        'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
                    }`}>
                        {camp.status === 'active' ? 'Em andamento' : camp.status === 'draft' ? 'Rascunho' : 'Concluída'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{camp.converted} conversões</span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">{camp.roi}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => addToast('Edição não disponível no MVP', 'info')}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-2"
                      title="Editar Campanha"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => addToast('Simulação: Campanha iniciada', 'success')}
                      className="text-slate-400 hover:text-green-600 dark:hover:text-green-400 p-2"
                      title="Iniciar Campanha"
                    >
                      <i className="fas fa-play"></i>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignsModule;
