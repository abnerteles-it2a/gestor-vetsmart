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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const dataCashFlow = [
  { name: 'Seg', entradas: 4000, saidas: 2400 },
  { name: 'Ter', entradas: 3000, saidas: 1398 },
  { name: 'Qua', entradas: 2000, saidas: 9800 },
  { name: 'Qui', entradas: 2780, saidas: 3908 },
  { name: 'Sex', entradas: 1890, saidas: 4800 },
  { name: 'Sáb', entradas: 2390, saidas: 3800 },
  { name: 'Dom', entradas: 3490, saidas: 4300 },
];

const dataDRE = [
  { name: 'Receita Bruta', value: 150000, color: '#10b981' },
  { name: 'Custos Variáveis', value: 45000, color: '#f59e0b' },
  { name: 'Despesas Fixas', value: 30000, color: '#ef4444' },
  { name: 'Lucro Líquido', value: 75000, color: '#3b82f6' },
];

const dataCommissions = [
  { name: 'Dr. Silva', valor: 3500 },
  { name: 'Dra. Ana', valor: 4200 },
  { name: 'Dr. Pedro', valor: 2100 },
];

import { apiService } from '../services/api';

const FinancialModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cashflow' | 'dre' | 'commissions'>('cashflow');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const handleAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const response = await apiService.getFinancialInsights();
      setAiInsights(response.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      // Fallback mock for demo if API fails
      setAiInsights({
        insights: ["Aumento de 15% nas receitas.", "Custos operacionais estáveis."],
        recommendations: ["Investir em marketing.", "Renegociar fornecedores."]
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gestão Financeira Inteligente</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Controle total do fluxo de caixa e resultados da clínica.</p>
        </div>
        <button 
          onClick={handleAiAnalysis}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <i className={`fas ${isAiAnalyzing ? 'fa-spinner fa-spin' : 'fa-robot'}`}></i> 
          {isAiAnalyzing ? 'Analisando...' : 'CFO Virtual (IA)'}
        </button>
      </div>

      {/* AI Insights Card */}
      {(aiInsights || isAiAnalyzing) && (
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fas fa-brain text-9xl text-indigo-600 dark:text-indigo-400"></i>
        </div>
        <div className="relative z-10">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                <i className="fas fa-lightbulb text-yellow-500"></i> Insights do CFO Virtual
            </h4>
            {isAiAnalyzing ? (
                <p className="text-indigo-800 dark:text-indigo-200 animate-pulse">Analisando dados financeiros...</p>
            ) : (
                <div className="text-sm text-indigo-800 dark:text-indigo-200 max-w-3xl space-y-2">
                    {aiInsights?.insights?.map((insight: string, idx: number) => (
                        <p key={idx}><i className="fas fa-check-circle mr-2 text-indigo-500"></i>{insight}</p>
                    ))}
                    {aiInsights?.recommendations?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
                            <p className="font-bold mb-1">Recomendações:</p>
                            {aiInsights.recommendations.map((rec: string, idx: number) => (
                                <p key={idx} className="pl-4 border-l-2 border-indigo-400 mb-1">{rec}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('cashflow')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'cashflow' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
                <i className="fas fa-chart-line"></i> Fluxo de Caixa
            </button>
            <button 
                onClick={() => setActiveTab('dre')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'dre' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
                <i className="fas fa-file-invoice-dollar"></i> DRE Gerencial
            </button>
            <button 
                onClick={() => setActiveTab('commissions')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'commissions' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
                <i className="fas fa-user-md"></i> Comissões
            </button>
        </div>

        <div className="p-6">
            {activeTab === 'cashflow' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">Entradas (Hoje)</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">R$ 4.250,00</p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">Saídas (Hoje)</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">R$ 1.890,00</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Saldo Previsto</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">R$ 12.450,00</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataCashFlow}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="entradas" fill="#10b981" name="Entradas" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="saidas" fill="#ef4444" name="Saídas" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'dre' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">Demonstrativo de Resultados (Mês Atual)</h4>
                        <div className="space-y-2">
                            {dataDRE.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                            <p>
                                <i className="fas fa-info-circle mr-1"></i> 
                                O Lucro Líquido representa 50% da Receita Bruta, o que está acima da média de mercado (35-40%). Parabéns!
                            </p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center min-h-[300px]">
                         <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <PieChart>
                                <Pie
                                    data={dataDRE}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataDRE.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'commissions' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">Comissões a Pagar (Referência: Jan/2026)</h4>
                        <button className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">
                            <i className="fas fa-download mr-1"></i> Exportar Relatório
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase">
                                <tr>
                                    <th className="px-6 py-4">Profissional</th>
                                    <th className="px-6 py-4">Total Serviços</th>
                                    <th className="px-6 py-4">% Comissão</th>
                                    <th className="px-6 py-4">Valor a Pagar</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {dataCommissions.map((comm, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/70 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{comm.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">R$ {Math.floor(comm.valor * 5).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">20%</td>
                                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comm.valor)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-[10px] font-bold uppercase">
                                                Pendente
                                            </span>
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
    </div>
  );
};

export default FinancialModule;
