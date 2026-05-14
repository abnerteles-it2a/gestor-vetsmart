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
  const [inactiveCount, setInactiveCount] = useState(0);
  const [riskCount, setRiskCount] = useState(0);
  const [vipCount, setVipCount] = useState(0);

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

        // FIDELITY METRICS CALCULATION
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const inactiveCount = pets.filter((p: any) => {
            const lastAppt = appointments
                .filter((a: any) => String(a.pet_id) === String(p.id) && a.status === 'concluido')
                .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
            return lastAppt && new Date(lastAppt.appointment_date) < sixMonthsAgo;
        }).length;

        const riskCount = pets.filter((p: any) => {
            const lastAppt = appointments
                .filter((a: any) => String(a.pet_id) === String(p.id) && a.status === 'concluido')
                .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
            return lastAppt && new Date(lastAppt.appointment_date) < threeMonthsAgo && new Date(lastAppt.appointment_date) >= sixMonthsAgo;
        }).length;

        const vipCount = pets.filter((p: any) => {
            const petSales = sales.filter((s: any) => String(s.pet_id) === String(p.id));
            const totalSpent = petSales.reduce((acc: number, s: any) => acc + parseFloat(s.total_amount || 0), 0);
            return totalSpent > 2000; // VIP threshold: R$ 2000 spent
        }).length;

        setInactiveCount(inactiveCount);
        setRiskCount(riskCount);
        setVipCount(vipCount);

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
            colorHex: '#10B981'
          },
          {
            title: 'Consultas Hoje',
            value: consultasHoje.toString(),
            icon: <i className="fas fa-user-doctor"></i>, 
            subtext: `${consultasDelta > 0 ? '↑' : '↓'} ${Math.abs(consultasDelta)} vs ontem`,
            subtextColor: consultasDelta >= 0 ? "text-emerald-500" : "text-rose-500",
            colorHex: '#1565C0'
          },
          {
            title: 'Vendas Hoje',
            value: totalSalesToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: <i className="fas fa-cash-register"></i>,
            subtext: `${salesToday.length} transações processadas`,
            subtextColor: "text-blue-500",
            colorHex: '#E65100'
          },
          {
            title: 'Alerta Estoque', 
            value: `${criticalItems} itens`,
            icon: <i className="fas fa-triangle-exclamation"></i>,
            subtext: criticalItems > 0 ? 'Reposição necessária' : 'Nível estável',
            subtextColor: criticalItems > 0 ? "text-rose-500" : "text-emerald-500",
            colorHex: criticalItems > 0 ? '#EF4444' : '#10B981'
          },
          {
            title: 'Ticket Médio',
            value: ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: <i className="fas fa-receipt"></i>,
            subtext: 'Valor médio por atendimento',
            subtextColor: "text-slate-400",
            colorHex: '#FF9F1C'
          },
          {
            title: 'Consultas Mês',
            value: consultationsThisMonth.toString(),
            icon: <i className="fas fa-calendar-check"></i>,
            subtext: 'Volume total processado',
            subtextColor: "text-emerald-500",
            colorHex: '#6A1B9A'
          },
          {
            title: 'Base de Pets', 
            value: pets.length.toString(),
            icon: <i className="fas fa-paw"></i>,
            subtext: `+${newPets} novos esta semana`,
            subtextColor: "text-purple-400",
            colorHex: '#C2185B'
          },
          {
            title: 'Fidelidade (VIP)',
            value: vipCount.toString(),
            icon: <i className="fas fa-star"></i>,
            subtext: 'Pacientes de alta recorrência',
            subtextColor: "text-emerald-500",
            colorHex: '#00695C'
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
    <div className="flex flex-col gap-8 animate-portal-enter pb-10">
      {/* Header Info */}
      <div className="flex flex-col gap-1 px-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Dashboard Executivo</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Visão Geral da Operação</p>
      </div>

      {/* KPI Row - Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiList.slice(0, 4).map((kpi, idx) => (
          <KpiCard 
            key={idx}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            subtext={kpi.subtext}
            subtextColor={kpi.subtextColor}
            color={kpi.colorHex}
          />
        ))}
      </div>

      {/* Second KPI Row - Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiList.slice(4, 8).map((kpi, idx) => (
          <KpiCard 
            key={idx}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            subtext={kpi.subtext}
            subtextColor={kpi.subtextColor}
            color={kpi.colorHex}
          />
        ))}
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Weekly Performance Chart */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="omie-card">
            <div className="omie-card-header">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Fluxo de Atendimento Semanal</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Volume de Consultas it2a Clinical</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF9F1C]"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase">Consultas Realizadas</span>
              </div>
            </div>
            <div className="p-8 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Bar dataKey="consultas" fill="#FF9F1C" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VIP / Fidelity Section */}
            <div className="omie-card">
              <div className="omie-card-header">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Segmentação de Carteira</h3>
              </div>
              <div className="p-8 space-y-6">
                {[
                  { label: 'Clientes VIP', val: vipCount, color: 'bg-emerald-500', icon: 'fa-crown' },
                  { label: 'Em Risco', val: riskCount, color: 'bg-[#FF9F1C]', icon: 'fa-exclamation-triangle' },
                  { label: 'Inativos', val: inactiveCount, color: 'bg-rose-500', icon: 'fa-user-slash' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl ${item.color} text-white flex items-center justify-center shadow-lg`}>
                      <i className={`fas ${item.icon} text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xs font-black text-slate-800 uppercase">{item.val}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${Math.min((item.val / 100) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Action Card */}
            <div className="omie-card bg-[#020617] border-none p-10 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9F1C]/10 rounded-full -mr-16 -mt-16 blur-[80px]"></div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8 border border-white/10">
                <i className="fas fa-robot text-2xl text-[#FF9F1C]"></i>
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 text-[#FF9F1C]">it2a VetInsight AI</h3>
              <p className="text-[13px] font-bold text-slate-300 leading-relaxed mb-8 px-4 italic">
                "{financialAudit?.revenue_analysis?.substring(0, 140) || "Analisando performance financeira e propondo estratégias de crescimento it2a..."}..."
              </p>
              <button 
                onClick={() => navigateTo('campaigns')}
                className="omie-btn-primary w-full shadow-2xl shadow-orange-500/20"
              >
                Otimizar com IA
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Status & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="omie-card overflow-hidden">
            <div className="omie-card-header bg-[#020617] !border-white/5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Status Operacional</h3>
            </div>
            <div className="p-8 bg-[#020617] text-white space-y-8">
              {[
                { label: 'Consultórios', status: '4/4 LIVRES', color: 'text-emerald-400' },
                { label: 'Internação', status: '12/15 OCUPADOS', color: 'text-[#FF9F1C]' },
                { label: 'Centro Cirúrgico', status: 'SALA 1 EM USO', color: 'text-rose-400' },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center pb-6 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${stat.color}`}>{stat.status}</span>
                </div>
              ))}

              <div className="pt-8 mt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Carga de Trabalho</p>
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-full uppercase">Crítico</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Pico de Atendimento</p>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase">Mobilização de triagem recomendada imediatamente.</p>
              </div>
            </div>
          </div>

          <div className="omie-card">
            <div className="omie-card-header">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Alertas do Ecossistema</h3>
            </div>
            <div className="p-4 space-y-2">
              {[
                { type: 'estoque', msg: 'Estoque crítico: Vacina V10 (2 un)', icon: 'fa-box', color: 'text-rose-500' },
                { type: 'financeiro', msg: 'Aguardando conciliação: R$ 12.450', icon: 'fa-file-invoice-dollar', color: 'text-[#FF9F1C]' },
                { type: 'paciente', msg: 'Retorno pendente: Paciente #102', icon: 'fa-calendar-exclamation', color: 'text-[#00B4D8]' },
              ].map((alert, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 group-hover:bg-white transition-colors shadow-sm ${alert.color}`}>
                    <i className={`fas ${alert.icon} text-sm`}></i>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight flex-1 leading-tight">{alert.msg}</p>
                  <i className="fas fa-chevron-right text-[8px] text-slate-300"></i>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/30">
               <button className="omie-btn-secondary w-full">Ver Central de Alertas</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
