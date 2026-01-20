
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const ReportsModule: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('Mai');
  const [selectedPeriod, setSelectedPeriod] = useState('Ano');
  const [selectedService, setSelectedService] = useState('Todos');
  const [selectedVet, setSelectedVet] = useState('Todos');

  const revenueData = useMemo(() => {
    // Mock data logic influenced by filters
    const multiplier = selectedVet === 'Todos' ? 1 : 0.6;
    const baseValue = 15000 * multiplier;
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
    
    return months.map((m, i) => {
      let val = baseValue + (i * 2000);
      if (selectedMonth === m) val += 5000;
      if (selectedPeriod === 'Últimos 7 dias') val = val * 0.2;
      return { name: m, value: val };
    });
  }, [selectedMonth, selectedVet, selectedPeriod]);

  const categoryData = useMemo(() => {
    if (selectedService !== 'Todos') {
      return [{ name: selectedService, value: 100 }];
    }
    return [
      { name: 'Consultas', value: 45 },
      { name: 'Cirurgias', value: 15 },
      { name: 'Estética', value: 25 },
      { name: 'Produtos', value: 15 },
    ];
  }, [selectedService]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Relatórios & Performance</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">Análise detalhada de faturamento e serviços do ecossistema Gestor Vetsmart.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
          <i className="fas fa-file-pdf"></i> Exportar BI
        </button>
      </div>

      {/* Enhanced BI Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap gap-6 items-center">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Período</label>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-sm font-medium outline-none hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-slate-700 dark:text-slate-100"
          >
            <option>Últimos 7 dias</option>
            <option>Último mês</option>
            <option>Último trimestre</option>
            <option>Ano</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Mês</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-sm font-medium outline-none hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-slate-700 dark:text-slate-100"
          >
            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Serviço</label>
          <select 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-sm font-medium outline-none hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-slate-700 dark:text-slate-100"
          >
            <option>Todos</option>
            <option>Consultas</option>
            <option>Cirurgias</option>
            <option>Estética</option>
            <option>Produtos</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Veterinário</label>
          <select 
            value={selectedVet}
            onChange={(e) => setSelectedVet(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-sm font-medium outline-none hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-slate-700 dark:text-slate-100"
          >
            <option>Todos</option>
            <option>Dr. Ricardo Silva</option>
            <option>Dra. Juliana Mendes</option>
          </select>
        </div>

        <button 
          onClick={() => {
            setSelectedMonth('Mai');
            setSelectedPeriod('Ano');
            setSelectedService('Todos');
            setSelectedVet('Todos');
          }}
          className="mt-5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 transition-colors uppercase tracking-widest"
        >
          Resetar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2zl border border-slate-100 dark:border-slate-800 shadow-sm">
           <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center justify-between">
              Faturamento (R$)
              <span className="text-xs text-green-500 font-bold bg-green-50 dark:bg-green-500/20 rounded-lg px-2 py-1">Performance +24%</span>
           </h4>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={revenueData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2zl border border-slate-100 dark:border-slate-800 shadow-sm">
           <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Receita por Categoria</h4>
           <div className="h-72 flex items-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={categoryData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="space-y-3 shrink-0">
                {categoryData.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{cat.name}: <strong>{cat.value}%</strong></span>
                    </div>
                ))}
             </div>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2zl border border-slate-100 dark:border-slate-800 shadow-sm">
         <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <i className="fas fa-heartbeat text-red-500"></i> Métricas de Saúde do Negócio
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase mb-2">Churn Rate</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">2.4%</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '97.6%'}}></div>
                </div>
            </div>
            <div className="text-center p-4">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase mb-2">Retenção</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">92%</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '92%'}}></div>
                </div>
            </div>
            <div className="text-center p-4">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase mb-2">NPS</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">89</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: '89%'}}></div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsModule;
