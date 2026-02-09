
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigation } from '../context/NavigationContext';
import { apiService } from '../services/api';
import { getFinancialAudit, getHospitalizationRound } from '../services/vertexAiService';

const data = [
  { name: 'Seg', consultas: 12 },
  { name: 'Ter', consultas: 19 },
  { name: 'Qua', consultas: 15 },
  { name: 'Qui', consultas: 22 },
  { name: 'Sex', consultas: 30 },
  { name: 'Sáb', consultas: 10 },
];

const Dashboard: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [kpis, setKpis] = useState<any[]>([]);
  const [financialAudit, setFinancialAudit] = useState<any>(null);
  const [hospitalRound, setHospitalRound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [kpiRes, petsRes, salesRes, appointmentsRes] = await Promise.all([
          apiService.getDashboardKPIs(),
          apiService.getPets(),
          apiService.getSales(),
          apiService.getAppointments()
        ]);

        const kpiData = kpiRes.data;
        const pets = petsRes.data;
        const sales = salesRes.data;
        const appointments = appointmentsRes.data;

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // 1. Consultas Hoje & Ontem (Delta)
        const isSameDay = (d1: Date, d2: Date) => 
            d1.getDate() === d2.getDate() && 
            d1.getMonth() === d2.getMonth() && 
            d1.getFullYear() === d2.getFullYear();

        const appointmentsToday = appointments.filter((a: any) => isSameDay(new Date(a.appointment_date), today));
        const appointmentsYesterday = appointments.filter((a: any) => isSameDay(new Date(a.appointment_date), yesterday));
        
        const consultasHoje = appointmentsToday.length;
        const consultasOntem = appointmentsYesterday.length;
        const consultasDelta = consultasHoje - consultasOntem;
        const consultasDeltaStr = `${consultasDelta > 0 ? '+' : ''}${consultasDelta} vs ontem`;

        // 2. Faturamento Mês & Mês Passado (Delta)
        const salesThisMonth = sales.filter((s: any) => {
          const sDate = new Date(s.sale_date);
          return sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear;
        });
        const salesLastMonth = sales.filter((s: any) => {
            const sDate = new Date(s.sale_date);
            return sDate.getMonth() === lastMonth && sDate.getFullYear() === lastMonthYear;
        });

        const totalSales = salesThisMonth.reduce((acc: number, s: any) => acc + parseFloat(s.total_amount || 0), 0);
        const totalSalesLastMonth = salesLastMonth.reduce((acc: number, s: any) => acc + parseFloat(s.total_amount || 0), 0);
        
        let salesGrowth = 0;
        if (totalSalesLastMonth > 0) {
            salesGrowth = ((totalSales - totalSalesLastMonth) / totalSalesLastMonth) * 100;
        } else if (totalSales > 0) {
            salesGrowth = 100;
        }
        const salesDeltaStr = `${salesGrowth > 0 ? '+' : ''}${salesGrowth.toFixed(0)}% vs mês passado`;

        // 3. Estoque Crítico
        const criticalItems = kpiData.inventoryAlerts;

        // 4. Receita Hoje
        const salesToday = sales.filter((s: any) => isSameDay(new Date(s.sale_date), today));
        const receitaHoje = salesToday.reduce((acc: number, s: any) => acc + parseFloat(s.total_amount || 0), 0);

        // 5. Novos Pets (This Week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newPets = pets.filter((p: any) => new Date(p.created_at) >= oneWeekAgo).length;

        // 6. Ocupação (Estimated)
        // Assume 20 slots per day for demo purposes
        const occupancyRate = Math.round((consultasHoje / 20) * 100);

        // 7. No-Show Rate (Today vs Avg)
        const canceledToday = appointmentsToday.filter((a: any) => a.status === 'cancelado').length;
        const noShowRate = appointmentsToday.length > 0 ? Math.round((canceledToday / appointmentsToday.length) * 100) : 0;
        
        // Calculate average no-show rate for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30DaysAppointments = appointments.filter((a: any) => {
            const d = new Date(a.appointment_date);
            return d >= thirtyDaysAgo && d < today;
        });

        let avgNoShowRate = 0;
        if (last30DaysAppointments.length > 0) {
            const canceledLast30 = last30DaysAppointments.filter((a: any) => a.status === 'cancelado').length;
            avgNoShowRate = Math.round((canceledLast30 / last30DaysAppointments.length) * 100);
        }

        const noShowDelta = noShowRate - avgNoShowRate;
        const noShowDeltaStr = `${noShowDelta > 0 ? '+' : ''}${noShowDelta}% vs média (30d)`;

        // 8. Aniversariantes (Today)
        const birthdays = pets.filter((p: any) => {
          if (!p.birth_date) return false;
          const bdate = new Date(p.birth_date);
          // Adjust for timezone if needed, but simple match is fine for demo
          return bdate.getDate() === today.getDate() && bdate.getMonth() === today.getMonth();
        }).length;


        setKpis([
          {
            label: 'Consultas Hoje',
            value: consultasHoje.toString(),
            icon: 'fa-user-doctor', 
            badge: 'Agenda',
            iconClass: 'bg-blue-100 text-blue-600',
            delta: consultasDeltaStr,
            detail: `${appointmentsToday.filter((a: any) => a.status === 'agendado').length} em espera • ${appointmentsToday.filter((a: any) => a.status === 'concluido').length} concluídas`,
            trend: consultasDelta >= 0 ? 'up' : 'down' 
          },
          {
            label: 'Faturamento Mês', 
            value: totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: 'fa-sack-dollar', 
            badge: 'Financeiro',
            iconClass: 'bg-emerald-100 text-emerald-600',
            delta: salesDeltaStr,
            detail: `Ticket médio: ${(salesThisMonth.length > 0 ? totalSales / salesThisMonth.length : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
            trend: salesGrowth >= 0 ? 'up' : 'down'
          },
          {
            label: 'Novos Pets', 
            value: pets.length.toString(), // Show total base
            icon: 'fa-paw',
            badge: 'Base de Clientes',
            iconClass: 'bg-purple-100 text-purple-600',
            delta: `+${newPets} novos esta semana`,
            detail: 'Clientes ativos',
            trend: 'up'
          },
          {
            label: 'Alerta Estoque', 
            value: `${criticalItems} itens`,
            icon: 'fa-triangle-exclamation',
            badge: 'Estoque',
            iconClass: 'bg-amber-100 text-amber-600',
            delta: 'Itens críticos',
            detail: 'Sugestão: revisar compras',
            trend: criticalItems > 0 ? 'down' : 'neutral'
          },
          {
            label: 'Receita Hoje',
            value: receitaHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: 'fa-chart-line',
            badge: 'Financeiro',
            iconClass: 'bg-sky-100 text-sky-600',
            delta: 'Atualizado agora',
            detail: `${salesToday.length} vendas hoje`,
            trend: 'up'
          },
          {
            label: 'Ocupação da Agenda',
            value: `${occupancyRate}%`,
            icon: 'fa-calendar-check',
            badge: 'Produtividade',
            iconClass: 'bg-indigo-100 text-indigo-600',
            delta: occupancyRate > 80 ? 'Alta demanda' : 'Normal',
            detail: `${Math.max(0, 20 - consultasHoje)} horários livres hoje`,
            trend: 'neutral'
          },
          {
            label: 'Taxa de No-Show',
            value: `${noShowRate}%`, 
            icon: 'fa-user-slash', 
            badge: 'Qualidade',
            iconClass: 'bg-rose-100 text-rose-600',
            delta: noShowDeltaStr,
            detail: `${canceledToday} cancelamentos hoje`,
            trend: noShowDelta <= 0 ? 'up' : 'down' // Lower is better for no-show
          },
          {
            label: 'Aniversariantes',
            value: `${birthdays} pet${birthdays !== 1 ? 's' : ''}`,
            icon: 'fa-cake-candles', 
            badge: 'Relacionamento',
            iconClass: 'bg-pink-100 text-pink-600',
            delta: 'Hoje',
            detail: 'Enviar mensagem',
            trend: 'neutral'
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();

    // Load AI Audit independently with caching
    const loadAiData = async () => {
      const CACHE_KEY = 'vetpro_financial_audit';
      const CACHE_TS_KEY = 'vetpro_financial_audit_ts';
      const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTs = localStorage.getItem(CACHE_TS_KEY);
      const now = Date.now();

      setAiLoading(true);

      try {
        // 1. Financial Audit
        if (cachedData && cachedTs && (now - parseInt(cachedTs) < CACHE_DURATION)) {
          console.log('Using cached AI Audit data');
          setFinancialAudit(JSON.parse(cachedData));
        } else {
          const audit = await getFinancialAudit();
          setFinancialAudit(audit);
          localStorage.setItem(CACHE_KEY, JSON.stringify(audit));
          localStorage.setItem(CACHE_TS_KEY, now.toString());
        }

        // 2. Hospital Round
        let hospitalizationData = [];
        try {
           const hospRes = await apiService.getHospitalizations();
           hospitalizationData = hospRes.data;
        } catch (e) {
           console.warn('Failed to fetch hospitalizations, using empty list');
        }
        
        const round = await getHospitalizationRound(hospitalizationData);
        setHospitalRound(round);

      } catch (e) {
        console.warn('AI Audit/Round failed', e);
      } finally {
        setAiLoading(false);
      }
    };

    loadAiData();
  }, []);

  if (loading) return <div className="p-6 text-center text-slate-500">Carregando dados do dashboard...</div>;


  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 xl:gap-8">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`bg-white dark:bg-slate-900 p-4 lg:p-5 xl:p-6 2xl:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${kpi.iconClass.replace('bg-', 'bg-').replace('text-', 'bg-').split(' ')[1].replace('text-', 'bg-')}`}></div>
            <div className="flex items-start justify-between mb-2 lg:mb-3 xl:mb-4 2xl:mb-6 pl-2">
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 xl:w-13 xl:h-13 2xl:w-16 2xl:h-16 rounded-2xl flex items-center justify-center text-lg lg:text-xl xl:text-xl 2xl:text-3xl ${kpi.iconClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}
              >
                <i className={`fas ${kpi.icon}`}></i>
              </div>
              <span className="text-[9px] lg:text-[10px] xl:text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 xl:px-2.5 xl:py-1 2xl:px-3 2xl:py-1.5 rounded-full">
                {kpi.badge}
              </span>
            </div>

            <div className="space-y-1 xl:space-y-1.5 2xl:space-y-2">
              <p className="text-[9px] lg:text-[10px] xl:text-[11px] 2xl:text-sm font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {kpi.label}
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-xl lg:text-2xl xl:text-2xl 2xl:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                  {kpi.value}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-2 xl:mt-2.5 2xl:mt-3">
                <span className={`text-[10px] lg:text-xs xl:text-xs 2xl:text-sm font-bold px-1.5 py-0.5 xl:px-1.5 xl:py-0.5 2xl:px-2 2xl:py-1 rounded ${kpi.trend === 'down' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                    kpi.trend === 'neutral' ? 'bg-slate-50 text-slate-600 dark:bg-slate-800' :
                      'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                  }`}>
                  {kpi.delta.includes('+') || kpi.trend === 'up' ? '↗' : kpi.delta.includes('-') ? '↘' : '•'} {kpi.delta}
                </span>
              </div>
              <p className="text-[10px] lg:text-xs xl:text-xs 2xl:text-sm text-slate-400 dark:text-slate-500 mt-1 xl:mt-1.5 2xl:mt-2 pl-0.5 truncate">
                {kpi.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          {/* Weekly Appointments Chart */}
          <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm lg:text-base">Fluxo de Consultas Semanais</h3>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs lg:text-sm px-3 py-1 outline-none text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <option>Últimos 7 dias</option>
                <option>Último mês</option>
              </select>
            </div>
            <div className="h-56 lg:h-64 xl:h-72 w-full flex items-center justify-center min-h-[14rem] lg:min-h-[16rem]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#1e293b',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="consultas" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Side Panel (AI Insights or Notifications could go here) */}
         <div className="space-y-6">
            {financialAudit && (
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <i className="fas fa-robot text-indigo-200"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">VetSmart AI</h3>
                            <p className="text-xs text-indigo-200">Auditoria Financeira</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <p className="text-sm font-medium text-indigo-100 mb-1">Análise de Receita</p>
                            <p className="text-xs text-indigo-200 leading-relaxed">
                                {financialAudit.revenue_analysis || "Analisando dados financeiros..."}
                            </p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <p className="text-sm font-medium text-indigo-100 mb-1">Sugestões de Otimização</p>
                            <ul className="text-xs text-indigo-200 space-y-2">
                                {(financialAudit.optimization_suggestions || []).slice(0, 3).map((s: string, i: number) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="text-indigo-400">•</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
             {hospitalRound && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <i className="fas fa-notes-medical text-blue-600 dark:text-blue-400"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">Round Hospitalar</h3>
                            <p className="text-xs text-slate-500">Resumo de pacientes internados</p>
                        </div>
                    </div>
                     <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-300">
                         <p>{hospitalRound.summary}</p>
                         {hospitalRound.critical_cases?.length > 0 && (
                             <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                                 <strong className="text-red-700 dark:text-red-400 block mb-1">Atenção Necessária:</strong>
                                 <ul className="list-disc pl-4 space-y-1">
                                     {hospitalRound.critical_cases.map((c: string, i: number) => (
                                         <li key={i}>{c}</li>
                                     ))}
                                 </ul>
                             </div>
                         )}
                     </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
