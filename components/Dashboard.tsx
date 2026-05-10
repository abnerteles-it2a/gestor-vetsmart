import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigation } from '../context/NavigationContext';
import { apiService } from '../services/api';
import { getFinancialAudit } from '../services/vertexAiService';
import { KpiCard } from './KpiCard';

const Dashboard: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [kpiList, setKpiList] = useState<any[]>([]);
  const [financialAudit, setFinancialAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

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

        // Process Weekly Appointments
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d;
        });

        const weeklyStats = last7Days.map(date => {
            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
            const count = appointments.filter((a: any) => {
                const aDate = new Date(a.appointment_date);
                return aDate.getDate() === date.getDate() && 
                       aDate.getMonth() === date.getMonth() && 
                       aDate.getFullYear() === date.getFullYear();
            }).length;
            
            return {
                name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                consultas: count,
                fullDate: date.toISOString()
            };
        });
        setWeeklyData(weeklyStats);

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const isSameDay = (d1: Date, d2: Date) => 
            d1.getDate() === d2.getDate() && 
            d1.getMonth() === d2.getMonth() && 
            d1.getFullYear() === d2.getFullYear();

        const appointmentsToday = appointments.filter((a: any) => isSameDay(new Date(a.appointment_date), today));
        const appointmentsYesterday = appointments.filter((a: any) => isSameDay(new Date(a.appointment_date), yesterday));
        
        const consultasHoje = appointmentsToday.length;
        const consultasOntem = appointmentsYesterday.length;
        const consultasDelta = consultasHoje - consultasOntem;

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

        const criticalItems = kpiData.inventoryAlerts;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newPets = pets.filter((p: any) => new Date(p.created_at) >= oneWeekAgo).length;

        const salesToday = sales.filter((s: any) => isSameDay(new Date(s.sale_date), today));
        const totalSalesToday = salesToday.reduce((acc: number, s: any) => acc + parseFloat(s.total_amount || 0), 0);
        
        const consultationsThisMonth = appointments.filter((a: any) => {
            const aDate = new Date(a.appointment_date);
            return aDate.getMonth() === currentMonth && aDate.getFullYear() === currentYear;
        }).length;

        const ticketMedio = totalSales / (salesThisMonth.length || 1);

        setKpiList([
          {
            title: 'Faturamento Mês', 
            value: totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: <i className="fas fa-sack-dollar"></i>, 
            subtext: `${salesGrowth > 0 ? '↑' : '↓'} ${Math.abs(salesGrowth).toFixed(0)}% vs mês passado`,
            subtextColor: salesGrowth >= 0 ? "text-emerald-500" : "text-rose-500",
            color: 'indigo'
          },
          {
            title: 'Consultas Hoje',
            value: consultasHoje.toString(),
            icon: <i className="fas fa-user-doctor"></i>, 
            subtext: `${consultasDelta > 0 ? '↑' : '↓'} ${Math.abs(consultasDelta)} vs ontem`,
            subtextColor: consultasDelta >= 0 ? "text-emerald-500" : "text-rose-500",
            color: 'blue'
          },
          {
            title: 'Vendas Hoje',
            value: totalSalesToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: <i className="fas fa-cash-register"></i>,
            subtext: `${salesToday.length} transações processadas`,
            subtextColor: "text-blue-500",
            color: 'green'
          },
          {
            title: 'Alerta Estoque', 
            value: `${criticalItems} itens`,
            icon: <i className="fas fa-triangle-exclamation"></i>,
            subtext: criticalItems > 0 ? 'Reposição necessária' : 'Nível estável',
            subtextColor: criticalItems > 0 ? "text-rose-500" : "text-emerald-500",
            color: 'rose'
          },
          {
            title: 'Ticket Médio',
            value: ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: <i className="fas fa-receipt"></i>,
            subtext: 'Valor médio por atendimento',
            subtextColor: "text-slate-400",
            color: 'amber'
          },
          {
            title: 'Consultas Mês',
            value: consultationsThisMonth.toString(),
            icon: <i className="fas fa-calendar-check"></i>,
            subtext: 'Volume total processado',
            subtextColor: "text-emerald-500",
            color: 'blue'
          },
          {
            title: 'Base de Pets', 
            value: pets.length.toString(),
            icon: <i className="fas fa-paw"></i>,
            subtext: `+${newPets} novos esta semana`,
            subtextColor: "text-indigo-400",
            color: 'indigo'
          },
          {
            title: 'Novos Pets (7d)',
            value: newPets.toString(),
            icon: <i className="fas fa-plus-circle"></i>,
            subtext: 'Crescimento da base pet',
            subtextColor: "text-emerald-500",
            color: 'green'
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();

    const loadAiData = async () => {
      setAiLoading(true);
      try {
        const audit = await getFinancialAudit();
        setFinancialAudit(audit);
      } catch (e) {
        console.warn('AI Audit failed', e);
      } finally {
        setAiLoading(false);
      }
    };

    loadAiData();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse font-bold uppercase tracking-widest text-[10px]">Sincronizando Ecossistema...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col gap-1 px-1">
          <h1 className="text-label-caps !text-slate-400">Dashboard Executivo</h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Inteligência Veterinária em Tempo Real</p>
      </div>

      {/* Section: Overview Operacional */}
      <section aria-labelledby="overview-title">
          <div className="flex items-center justify-between mb-6 px-1">
              <h2 id="overview-title" className="text-label-caps !text-slate-400">Visão Geral de Operação</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiList.map((kpi, idx) => (
              <KpiCard 
                key={idx}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                subtext={kpi.subtext}
                subtextColor={kpi.subtextColor}
                color={kpi.color as any}
                variant={idx === 0 ? 'primary' : 'standard'}
              />
            ))}
          </div>
      </section>

      {/* Section: Fluxo e Inteligência Veterinária */}
      <section aria-labelledby="flow-title">
          <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex flex-col gap-1">
                  <h2 id="flow-title" className="text-label-caps !text-slate-400">Projeção e Inteligência Veterinária</h2>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Análise de Atendimento e Performance AI</p>
              </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Chart Column */}
              <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-xl">
                      <div className="flex items-center justify-between mb-8">
                          <div>
                              <h3 className="font-black text-slate-800 dark:text-slate-100 text-[12px] uppercase tracking-[0.15em]">Fluxo de Atendimento</h3>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Volume semanal de consultas e procedimentos</p>
                          </div>
                          <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase px-4 py-2 outline-none text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all tracking-widest">
                              <option>Últimos 7 dias</option>
                              <option>Último mês</option>
                          </select>
                      </div>
                      <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={weeklyData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.05} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                  <Tooltip
                                      cursor={{ fill: '#f1f5f9', opacity: 0.3 }}
                                      contentStyle={{
                                          borderRadius: '1rem',
                                          border: 'none',
                                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15)',
                                          backgroundColor: '#0f172a',
                                          color: '#f8fafc',
                                          fontSize: '10px',
                                          fontWeight: 800,
                                          padding: '12px 16px'
                                      }}
                                  />
                                  <Bar dataKey="consultas" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>

              {/* AI VetInsight Column */}
              <div className="xl:col-span-1">
                  <div className="bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-900/20 p-8 text-white relative overflow-hidden group h-full flex flex-col min-h-[450px]">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
                      
                      <div className="flex items-center gap-4 mb-8 relative z-10">
                          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                              <i className="fas fa-brain text-white text-2xl"></i>
                          </div>
                          <div>
                              <h3 className="font-black text-[14px] uppercase tracking-[0.2em]">it2a VetInsight</h3>
                              <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-[0.1em] opacity-80">IA Auditoria & Estratégia</p>
                          </div>
                      </div>

                      <div className="space-y-6 relative z-10 flex-1">
                          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-sm transition-all hover:bg-white/15">
                              <p className="text-[10px] font-black uppercase text-indigo-100 mb-3 tracking-[0.15em] opacity-90">Análise de Receita</p>
                              <p className="text-[13px] text-indigo-50 leading-relaxed font-medium">
                                  {financialAudit?.revenue_analysis || "Sincronizando modelos de IA para análise de fluxo..."}
                              </p>
                          </div>
                          
                          <div className="bg-slate-900/30 rounded-2xl p-6 backdrop-blur-md border border-white/5 shadow-inner">
                              <p className="text-[10px] font-black uppercase text-indigo-100 mb-4 tracking-[0.15em] opacity-90">Ações Recomendadas</p>
                              <ul className="text-[12px] text-indigo-100 space-y-4">
                                  {(financialAudit?.optimization_suggestions || [
                                    "Aguardando processamento de dados...",
                                    "Analisando ticket médio histórico...",
                                    "Verificando gargalos de estoque..."
                                  ]).slice(0, 3).map((s: string, i: number) => (
                                      <li key={i} className="flex gap-4 items-start">
                                          <span className="w-2 h-2 rounded-full bg-indigo-300 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(165,180,252,0.5)]"></span>
                                          <span className="font-medium opacity-90 leading-snug">{s}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-white/10 relative z-10 text-center">
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200 opacity-60">it2a Enterprise Ecosystem</span>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Section: Gestão Operacional & Fluxo Clínico */}
      <section aria-labelledby="ops-title">
          <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex flex-col gap-1">
                  <h2 id="ops-title" className="text-label-caps !text-slate-400">Fluxo Clínico e Operações</h2>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Gestão de Pacientes e Atividade Recente</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">Módulo VetPro</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Replicating the dual-chart/list pattern from the reference */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg">
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-[0.15em] mb-6">Últimos Atendimentos</h3>
                  {/* Placeholder for List component to match Receivables/Payables density */}
                  <div className="space-y-4">
                      {[1,2,3,4,5].map(i => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                      <i className="fas fa-paw text-[10px]"></i>
                                  </div>
                                  <div>
                                      <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 leading-none">Paciente #{100+i}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Consulta Clínica</p>
                                  </div>
                              </div>
                              <span className="text-[10px] font-black text-slate-500">HOJE</span>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg">
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-[0.15em] mb-6">Evolução de Cadastro</h3>
                  <div className="h-64 w-full">
                      {/* Sub-chart to match the "FinancialProgression" feel */}
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData}>
                              <XAxis dataKey="name" hide />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff', fontSize: '10px' }}
                              />
                              <Bar dataKey="consultas" fill="#3b82f6" opacity={0.6} radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
};

export default Dashboard;
