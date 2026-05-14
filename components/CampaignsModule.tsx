import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';
import { KpiCard } from './KpiCard';
import { VaccineCampaignPanel } from './VaccineCampaignPanel';

const MODULE_COLOR = '#FF8F00';

const CampaignsModule: React.FC = () => {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInstruction, setUserInstruction] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft'>('all');
  const [activeSection, setActiveSection] = useState<'campaigns' | 'vaccines'>('campaigns');

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await apiService.getCampaigns();
        setCampaigns(response.data || []);
      } catch (e) {
        console.error('Failed to load campaigns', e);
      }
    };
    loadCampaigns();
  }, []);

  const handleGenerateCampaign = async () => {
    setIsGenerating(true);
    try {
      const response = await apiService.getSmartCampaigns(userInstruction);
      const aiResult = response.data;
      if (aiResult) {
        const campaignData = aiResult.campaigns ? aiResult.campaigns[0] : aiResult;
        if (!campaignData || (!campaignData.campaign_name && !campaignData.title)) {
          addToast('A IA gerou uma resposta incompleta. Tente refinar sua instrução.', 'warning');
          return;
        }
        const newCamp = {
          id: Date.now(),
          title: campaignData.campaign_name || campaignData.title || 'Campanha Personalizada',
          status: 'draft',
          target: campaignData.target_segments
            ? `Segmentos: ${campaignData.target_segments.map((s: any) => s.segment).join(', ')}`
            : `Sugestão IA: ${campaignData.target_audience || 'Geral'}`,
          sent: 0, opened: 0, converted: 0, roi: '-',
          date: 'Gerado agora',
          details: campaignData
        };
        setCampaigns(prev => [newCamp, ...prev]);
        addToast('Nova campanha gerada com sucesso!', 'success');
        setIsModalOpen(false);
        setUserInstruction('');
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

  const filteredCampaigns = campaigns.filter(c =>
    filterStatus === 'all' ? true : c.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    if (status === 'active') return { label: 'Em andamento', color: 'text-emerald-500' };
    if (status === 'draft') return { label: 'Rascunho', color: 'text-slate-400' };
    return { label: 'Concluída', color: 'text-[#00B4D8]' };
  };

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">

      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">CRM & Marketing</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Campanhas Inteligentes</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isGenerating}
            className="omie-btn-secondary"
          >
            <i className="fas fa-pen-to-square mr-2"></i>Criar Personalizada
          </button>
          <button
            onClick={() => { setUserInstruction(''); handleGenerateCampaign(); }}
            disabled={isGenerating}
            className="omie-btn-primary"
          >
            <i className={`fas ${isGenerating ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
            {isGenerating ? 'Gerando...' : 'Auto-Gerar IA'}
          </button>
        </div>
      </div>

      {/* Section switcher */}
      <div className="flex bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { id: 'campaigns', label: '📣 Campanhas CRM' },
          { id: 'vaccines',  label: '💉 Calendário Vacinal' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeSection === s.id
                ? 'bg-white text-[#FF8F00] shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>


      {/* Section content */}
      {activeSection === 'vaccines' ? (
        <VaccineCampaignPanel />
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard
              title="Receita Gerada (30d)"
              value="R$ 14.200,00"
              icon={<i className="fas fa-bullhorn" />}
              subtext="+12% conversão"
              subtextColor="text-emerald-500"
              color={MODULE_COLOR}
            />
            <KpiCard
              title="Mensagens Enviadas"
              value="1.240"
              icon={<i className="fas fa-envelope-open-text" />}
              subtext="68% open rate"
              subtextColor="text-[#00B4D8]"
              color={MODULE_COLOR}
            />
            <KpiCard
              title="Clientes Recuperados"
              value="45"
              icon={<i className="fas fa-users" />}
              subtext="Via reativação inteligente"
              subtextColor="text-slate-400"
              color={MODULE_COLOR}
            />
          </div>

          {/* AI Insight Bar */}
          <div className="omie-card bg-[#020617] p-8 flex items-center gap-8 relative overflow-hidden border-none text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8F00]/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-white/10 backdrop-blur-md shadow-xl">
              <i className="fas fa-robot text-[#FF8F00]" />
            </div>
            <div className="flex-1 relative z-10">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF8F00] mb-2">it2a CRM Intelligence</h4>
              <p className="text-[13px] font-bold text-slate-300 leading-relaxed max-w-2xl">
                "45 pacientes inativos há mais de 6 meses identificados. Campanha de reativação com desconto em banho &amp; tosa recomendada para semana que vem."
              </p>
            </div>
            <button className="omie-btn-primary !bg-[#FF8F00] !text-white shrink-0 relative z-10">
              Aplicar Sugestão
            </button>
          </div>

          {/* Table */}
          <div className="omie-table-container">
            <div className="omie-card-header flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Minhas Campanhas</h3>
              <div className="flex bg-slate-50 rounded-full p-1 border border-slate-100">
                {(['all', 'active', 'draft'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      filterStatus === s ? 'bg-[#020617] text-[#FF8F00]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {s === 'all' ? 'Todas' : s === 'active' ? 'Ativas' : 'Rascunho'}
                  </button>
                ))}
              </div>
            </div>
            <table className="omie-table">
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th>Público Alvo</th>
                  <th>Status</th>
                  <th>Conversões</th>
                  <th>ROI</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((camp) => {
                  const badge = getStatusBadge(camp.status);
                  return (
                    <tr key={camp.id} className="group">
                      <td>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#020617] uppercase tracking-tight group-hover:text-[#FF8F00] transition-colors">{camp.title}</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">{camp.date}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-bullseye text-slate-300 text-[10px]" />
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{camp.target}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${badge.color}`}>{badge.label}</span>
                        </div>
                      </td>
                      <td><span className="text-sm font-black text-[#020617] uppercase">{camp.converted}</span></td>
                      <td><span className="text-sm font-bold text-emerald-500 uppercase tracking-tight">{camp.roi}</span></td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => addToast('Edição não disponível no MVP', 'info')}
                            className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-[#FF8F00] hover:border-[#FF8F00] transition-all"
                          >
                            <i className="fas fa-edit text-[10px]" />
                          </button>
                          <button
                            onClick={() => addToast('Simulação: Campanha iniciada', 'success')}
                            className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-emerald-500 hover:border-emerald-500 transition-all"
                          >
                            <i className="fas fa-play text-[10px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-20">
                      <i className="fas fa-bullhorn text-4xl text-slate-100 mb-4 block" />
                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Nenhuma campanha encontrada.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="omie-modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="omie-modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="omie-modal-header">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Nova Campanha</p>
                    <h2 className="omie-modal-title text-2xl">Definir Objetivo</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                    <i className="fas fa-times text-xs" />
                  </button>
                </div>
                <div className="omie-modal-body">
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed mb-6">
                    Descreva o objetivo da campanha. A IA vai analisar sua base de clientes e criar a mensagem ideal.
                  </p>
                  <div>
                    <label className="omie-label">Instrução para a IA</label>
                    <textarea
                      value={userInstruction}
                      onChange={(e) => setUserInstruction(e.target.value)}
                      placeholder="Ex: Promoção de limpeza de tártaro para cães idosos..."
                      className="omie-input h-32 resize-none"
                    />
                  </div>
                </div>
                <div className="omie-modal-footer">
                  <button onClick={() => setIsModalOpen(false)} className="omie-btn-secondary">Cancelar</button>
                  <button
                    onClick={handleGenerateCampaign}
                    disabled={!userInstruction.trim() || isGenerating}
                    className="omie-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className={`fas ${isGenerating ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'} mr-2`} />
                    {isGenerating ? 'Gerando...' : 'Gerar Campanha'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CampaignsModule;
