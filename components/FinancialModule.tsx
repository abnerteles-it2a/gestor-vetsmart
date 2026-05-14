
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { apiService } from '../services/api';
import { KpiCard } from './KpiCard';

const MODULE_COLOR = '#2E7D32';

const FinancialModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cashflow' | 'dre' | 'commissions'>('cashflow');

  const handleTabChange = (tab: 'cashflow' | 'dre' | 'commissions') => {
    setActiveTab(tab);
    const labels: Record<string, string> = {
      cashflow: 'Fluxo de Caixa',
      dre: 'DRE Gerencial',
      commissions: 'Comissões',
    };
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb(labels[tab]);
    }
  };

  React.useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb('Fluxo de Caixa');
    }
  }, []);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  
  // Real Data State
  const [dataCashFlow, setDataCashFlow] = useState<any[]>([]);
  const [dataDRE, setDataDRE] = useState<any[]>([]);
  const [dataCommissions, setDataCommissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadFinancialData = async () => {
      try {
        const response = await apiService.getFinancialDashboard();
        const { cashFlow, dre, commissions } = response.data;
        
        const formattedCashFlow = cashFlow.map((item: any) => ({
            name: item.name,
            entradas: parseFloat(item.entradas),
            saidas: parseFloat(item.saidas)
        }));

        const formattedCommissions = commissions.map((item: any) => ({
            name: item.name,
            valor: parseFloat(item.valor)
        }));

        setDataCashFlow(formattedCashFlow);
        setDataDRE(dre);
        setDataCommissions(formattedCommissions);
      } catch (error) {
        console.error("Error loading financial dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFinancialData();
  }, []);

  const handleAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const response = await apiService.getFinancialInsights();
      setAiInsights(response.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">
      
      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Controladoria & Finanças</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Fluxo de Caixa & Resultados</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleAiAnalysis}
            className="omie-btn-primary !bg-[#020617] !text-white border-none flex items-center gap-3 px-8 shadow-2xl shadow-indigo-500/20"
          >
            <i className={`fas ${isAiAnalyzing ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'} text-[#FF9F1C]`}></i> 
            <span className="uppercase tracking-widest text-[11px] font-black">{isAiAnalyzing ? 'Processando...' : 'Análise Preditiva IA'}</span>
          </button>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="omie-card p-1 flex bg-white border-none shadow-sm">
         {[
           { id: 'cashflow', label: 'Fluxo de Caixa', icon: 'fa-chart-line' },
           { id: 'dre', label: 'DRE Gerencial', icon: 'fa-file-invoice-dollar' },
           { id: 'commissions', label: 'Comissões', icon: 'fa-user-md' }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => handleTabChange(tab.id as any)}
             className={`flex-1 py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all ${
               activeTab === tab.id 
                 ? 'text-white shadow-lg' 
                 : 'text-slate-400 hover:text-slate-600'
             }`}
             style={activeTab === tab.id ? { background: MODULE_COLOR } : {}}
           >
             <i className={`fas ${tab.icon} text-sm`}></i>
             <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
           </button>
         ))}
      </div>

      {/* AI Dashboard Section */}
      {aiInsights && (
        <div className="omie-card bg-[#FF9F1C] p-10 border-none relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
           <div className="relative z-10 grid grid-cols-12 gap-8 items-center">
              <div className="col-span-1 flex justify-center">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#FF9F1C] text-3xl shadow-xl">
                    <i className="fas fa-lightbulb"></i>
                 </div>
              </div>
              <div className="col-span-11">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#020617] mb-4">it2a Financial Insights</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#020617]/40">Análise de Performance</p>
                       {aiInsights?.insights?.map((ins: string, i: number) => (
                         <p key={i} className="text-sm font-bold text-[#020617] leading-relaxed flex items-start gap-3">
                            <i className="fas fa-check-circle mt-1 opacity-40"></i>
                            {ins}
                         </p>
                       ))}
                    </div>
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#020617]/40">Plano de Ação</p>
                       {aiInsights?.recommendations?.map((rec: string, i: number) => (
                         <p key={i} className="text-sm font-bold text-[#020617] leading-relaxed flex items-start gap-3">
                            <i className="fas fa-arrow-right mt-1 opacity-40"></i>
                            {rec}
                         </p>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Content Area */}
      <div className="omie-card p-10 bg-white min-h-[500px]">

         {activeTab === 'cashflow' && (
           <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <KpiCard 
                    title="Entradas (30 dias)" 
                    value="R$ 142.450,00"
                    icon={<i className="fas fa-arrow-trend-up"></i>}
                    color="#10B981"
                 />
                 <KpiCard 
                    title="Saídas (30 dias)" 
                    value="R$ 84.120,00"
                    icon={<i className="fas fa-arrow-trend-down"></i>}
                    color="#EF4444"
                 />
                 <div className="omie-card !p-5 bg-[#020617] border-none flex flex-col justify-center gap-1 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9F1C]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1 z-10">Saldo Projetado it2a</span>
                    <span className="text-2xl font-black text-[#FF9F1C] tracking-tighter uppercase z-10">R$ 58.330,00</span>
                 </div>
              </div>

              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataCashFlow}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                       <Tooltip cursor={{ fill: '#F8FAFC' }} />
                       <Bar dataKey="entradas" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                       <Bar dataKey="saidas" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
         )}


         {activeTab === 'dre' && (
           <div className="grid grid-cols-2 gap-16">
              <div className="space-y-8">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-4">Detalhamento Gerencial</h4>
                 <div className="space-y-4">
                    {dataDRE.map((item, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-[#FF9F1C]/5 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                          </div>
                          <span className="text-sm font-black text-[#020617] uppercase tracking-tight">
                             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={dataDRE}
                             cx="50%"
                             cy="50%"
                             innerRadius={80}
                             outerRadius={120}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             {dataDRE.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-8">Distribuição de Receitas & Custos</p>
              </div>
           </div>
         )}

         {activeTab === 'commissions' && (
            <div className="space-y-8">
               <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Folha de Comissões</h4>
                  <span className="px-4 py-1 bg-slate-50 text-[10px] font-black text-slate-400 rounded-full uppercase tracking-widest">Referência: Janeiro 2026</span>
               </div>
               <div className="omie-table-container">
                  <table className="omie-table">
                     <thead>
                        <tr>
                           <th>Profissional</th>
                           <th>Faturamento</th>
                           <th>Taxa (%)</th>
                           <th>Líquido a Pagar</th>
                           <th className="text-right">Ações</th>
                        </tr>
                     </thead>
                     <tbody>
                        {dataCommissions.map((comm, idx) => (
                           <tr key={idx} className="group">
                              <td>
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#020617] font-black text-[10px] uppercase">{comm.name.substring(0,2)}</div>
                                    <span className="text-sm font-black text-[#020617] uppercase tracking-tight group-hover:text-[#FF9F1C] transition-colors">{comm.name}</span>
                                 </div>
                              </td>
                              <td className="text-sm font-bold text-slate-500">R$ {Math.floor(comm.valor * 5).toLocaleString()}</td>
                              <td className="text-sm font-bold text-slate-500">20%</td>
                              <td className="text-lg font-black text-emerald-500 tracking-tighter uppercase">
                                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comm.valor)}
                              </td>
                              <td className="text-right">
                                 <button className="omie-btn-primary !px-6 !py-2 !text-[9px] shadow-none">Pagar</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default FinancialModule;
