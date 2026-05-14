
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { KpiCard } from './KpiCard';

const MODULE_COLOR = '#37474F';
const CHART_COLORS = ['#37474F', '#1565C0', '#00695C', '#E65100'];

const ReportsModule: React.FC = () => {
  const { addToast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('Ano');
  const [selectedService, setSelectedService] = useState('Todos');
  const [selectedVet, setSelectedVet] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<{ revenueData: any[]; categoryData: any[] } | null>(null);

  useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb('Faturamento');
    }
    const loadData = async () => {
      try {
        const response = await apiService.getFinancialDashboard();
        setApiData(response.data);
      } catch (error) {
        addToast('Erro ao carregar dados dos relatórios', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const revenueData = useMemo(() => {
    if (!apiData?.revenueData) return [];
    let data = [...apiData.revenueData];
    if (selectedVet !== 'Todos') data = data.map(d => ({ ...d, value: d.value * 0.6 }));
    if (selectedPeriod === 'Últimos 7 dias') data = data.slice(-1).map(d => ({ ...d, value: d.value / 4 }));
    return data;
  }, [apiData, selectedVet, selectedPeriod]);

  const categoryData = useMemo(() => {
    if (!apiData?.categoryData) return [];
    if (selectedService !== 'Todos') return apiData.categoryData.filter((c: any) => c.name === selectedService);
    return apiData.categoryData;
  }, [apiData, selectedService]);

  const totalRevenue = useMemo(() =>
    revenueData.reduce((acc, d) => acc + (d.value || 0), 0), [revenueData]);

  if (loading) return (
    <div className="p-10 text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">
      Sincronizando it2a BI Reports...
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">

      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Business Intelligence</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Relatórios &amp; Performance</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => addToast('Exportação PDF em processamento...', 'info')}
            className="omie-btn-secondary"
          >
            <i className="fas fa-file-pdf mr-2"></i>Exportar BI
          </button>
          <button className="omie-btn-primary">
            <i className="fas fa-wand-magic-sparkles mr-2"></i>Análise IA
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KpiCard
          title="Faturamento Total"
          value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<i className="fas fa-chart-line"></i>}
          subtext="Período selecionado"
          subtextColor="text-slate-400"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Churn Rate"
          value="2.4%"
          icon={<i className="fas fa-arrow-trend-down"></i>}
          subtext="Meta: < 5%"
          subtextColor="text-emerald-500"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Retenção"
          value="92%"
          icon={<i className="fas fa-users"></i>}
          subtext="Clientes recorrentes"
          subtextColor="text-emerald-500"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="NPS Score"
          value="89"
          icon={<i className="fas fa-star"></i>}
          subtext="Satisfação geral"
          subtextColor="text-emerald-500"
          color={MODULE_COLOR}
        />
      </div>

      {/* Filters bar */}
      <div className="omie-card p-5 flex flex-wrap items-end gap-8">
        <div className="flex flex-col gap-2">
          <label className="omie-label">Período</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="omie-input !py-2 !text-[11px] !font-black !uppercase !tracking-widest min-w-[160px]"
          >
            {['Últimos 7 dias', 'Último mês', 'Último trimestre', 'Ano'].map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="omie-label">Serviço</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="omie-input !py-2 !text-[11px] !font-black !uppercase !tracking-widest min-w-[160px]"
          >
            {['Todos', 'Consultas', 'Cirurgias', 'Estética', 'Produtos'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="omie-label">Veterinário</label>
          <select
            value={selectedVet}
            onChange={(e) => setSelectedVet(e.target.value)}
            className="omie-input !py-2 !text-[11px] !font-black !uppercase !tracking-widest min-w-[180px]"
          >
            {['Todos', 'Dr. Ricardo Silva', 'Dra. Juliana Mendes'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setSelectedPeriod('Ano'); setSelectedService('Todos'); setSelectedVet('Todos'); }}
          className="text-[10px] font-black text-slate-400 hover:text-[#FF9F1C] uppercase tracking-widest transition-colors mb-0.5"
        >
          <i className="fas fa-rotate-left mr-1"></i>Resetar
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-8 omie-card">
          <div className="omie-card-header">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Faturamento por Período</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">it2a BI Analytics</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
              Performance +24%
            </span>
          </div>
          <div className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" fill={MODULE_COLOR} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-4 omie-card">
          <div className="omie-card-header">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Receita por Categoria</h3>
          </div>
          <div className="p-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={5} dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{cat.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-[#020617] uppercase">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Business Health Metrics */}
      <div className="omie-card">
        <div className="omie-card-header">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">
            <i className="fas fa-heartbeat mr-2" style={{ color: MODULE_COLOR }}></i>
            Métricas de Saúde do Negócio
          </h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { label: 'Churn Rate', value: '2.4%', fill: '#10B981', pct: 97.6 },
            { label: 'Retenção de Clientes', value: '92%', fill: '#1565C0', pct: 92 },
            { label: 'NPS Score', value: '89', fill: MODULE_COLOR, pct: 89 },
          ].map(item => (
            <div key={item.label} className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
                <span className="text-2xl font-black text-[#020617] tracking-tighter">{item.value}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.pct}%`, background: item.fill }}
                ></div>
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.pct}% do máximo</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;
