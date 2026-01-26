
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockDataService } from '../services/mockDataService';
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
  const [kpis, setKpis] = useState<any[]>([]);
  const [financialAudit, setFinancialAudit] = useState<any>(null);
  const [hospitalRound, setHospitalRound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [pets, appointments, sales, inventory] = await Promise.all([
          mockDataService.getPets(),
          mockDataService.getAppointments(),
          mockDataService.getSales(),
          mockDataService.getInventory()
        ]);

        const today = new Date().toISOString().split('T')[0];

        // 1. Consultas Hoje
        const appointmentsToday = appointments.filter(a => a.date === today);
        const consultasHoje = appointmentsToday.length;

        // 2. Faturamento (Mock parse)
        const parseValue = (val: any) => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          // Remove R$, espaços (incluindo nbsp), pontos de milhar
          // Ex: "R$ 1.234,56" -> "1234.56"
          return parseFloat(val.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        };
        const totalSales = sales.reduce((acc, s) => acc + parseValue(s.value), 0);

        // 3. Estoque Crítico
        const criticalItems = inventory.filter(i => i.status === 'critical').length;

        // 4. Receita Hoje
        const salesToday = sales.filter(s => s.date && s.date.startsWith(today));
        const receitaHoje = salesToday.reduce((acc, s) => acc + parseValue(s.value), 0);

        setKpis([
          {
            label: 'Consultas Hoje',
            value: consultasHoje.toString(),
            icon: 'fa-user-doctor', // Changed to doctor icon
            badge: 'Agenda',
            iconClass: 'bg-blue-100 text-blue-600',
            delta: '+2 vs ontem',
            detail: `${appointmentsToday.filter(a => a.status === 'agendado').length} em espera • ${appointmentsToday.filter(a => a.status === 'concluido').length} concluídas`,
            trend: 'up' // Added trend indicator logic helper later
          },
          {
            label: 'Faturamento Mês', // Changed label
            value: totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: 'fa-sack-dollar', // Changed icon
            badge: 'Financeiro',
            iconClass: 'bg-emerald-100 text-emerald-600',
            delta: '+12% vs mês passado',
            detail: `Ticket médio: ${(totalSales / (sales.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
            trend: 'up'
          },
          {
            label: 'Novos Pets', // Changed label
            value: pets.length.toString(),
            icon: 'fa-paw',
            badge: 'Base de Clientes',
            iconClass: 'bg-purple-100 text-purple-600',
            delta: '+3 novos esta semana',
            detail: 'Clientes ativos',
            trend: 'up'
          },
          {
            label: 'Alerta Estoque', // Changed label
            value: `${criticalItems} itens`,
            icon: 'fa-triangle-exclamation',
            badge: 'Estoque',
            iconClass: 'bg-amber-100 text-amber-600',
            delta: 'Itens críticos',
            detail: 'Sugestão: revisar compras',
            trend: 'down'
          },
          {
            label: 'Receita Hoje',
            value: receitaHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: 'fa-chart-line',
            badge: 'Financeiro',
            iconClass: 'bg-sky-100 text-sky-600',
            delta: '+5% vs ontem',
            detail: `${salesToday.length} vendas registradas`,
            trend: 'up'
          },
          {
            label: 'Ocupação da Agenda',
            value: '82%',
            icon: 'fa-calendar-check',
            badge: 'Produtividade',
            iconClass: 'bg-indigo-100 text-indigo-600',
            delta: 'Alta demanda',
            detail: '2 horários livres hoje',
            trend: 'neutral'
          },
          {
            label: 'Taxa de No-Show',
            value: '2%', // Realism tweak
            icon: 'fa-user-slash', // Changed icon
            badge: 'Qualidade',
            iconClass: 'bg-rose-100 text-rose-600',
            delta: '-1% vs média',
            detail: '1 cancelamento hoje',
            trend: 'up' // positive outcome (lower is better)
          },
          {
            label: 'Aniversariantes',
            value: '1 pet',
            icon: 'fa-cake-candles', // Changed icon
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
      const CACHE_KEY = 'vetsmart_financial_audit';
      const CACHE_TS_KEY = 'vetsmart_financial_audit_ts';
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
        const hospitalizationData = await mockDataService.getHospitalization();
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
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${kpi.iconClass} group-hover:scale-110 transition-transform duration-300`}
              >
                <i className={`fas ${kpi.icon}`}></i>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
                {kpi.badge}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {kpi.label}
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                  {kpi.value}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${kpi.trend === 'down' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                    kpi.trend === 'neutral' ? 'bg-slate-50 text-slate-600 dark:bg-slate-800' :
                      'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                  }`}>
                  {kpi.delta.includes('+') || kpi.trend === 'up' ? '↗' : kpi.delta.includes('-') ? '↘' : '•'} {kpi.delta}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 pl-0.5">
                {kpi.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly Appointments Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Fluxo de Consultas Semanais</h3>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-1 outline-none text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <option>Últimos 7 dias</option>
                <option>Último mês</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
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

          {/* Fidelity Analysis - ENHANCED */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <i className="fas fa-bullseye text-blue-500"></i> Análise de Fidelidade
              </h3>
              <button className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                Ver BI Completo
              </button>
            </div>

            <div className="space-y-6">
              {/* Clientes Inativos */}
              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">⚠️ Clientes Inativos</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">12 <span className="text-sm font-normal text-slate-500">tutores</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">Última visita &gt; 6 meses</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="flex items-center gap-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg transition-colors shadow-sm shadow-amber-200 dark:shadow-none">
                    <i className="fas fa-paper-plane"></i> Gerar Campanha de Reativação
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

              {/* Clientes em Risco */}
              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">🟡 Clientes em Risco</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">08 <span className="text-sm font-normal text-slate-500">tutores</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">Visita 3-6 meses</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                    <i className="fas fa-bell"></i> Enviar Lembrete Automático
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

              {/* Clientes VIP */}
              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">⭐ Clientes VIP</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">24 <span className="text-sm font-normal text-slate-500">tutores</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">R$ 45k/ano</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                    <i className="fas fa-gift"></i> Ver Benefícios VIP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Hospital Ward Round - NEW FEATURE */}
          {aiLoading ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          ) : hospitalRound && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-purple-500 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600">
                    <i className="fas fa-bed-pulse"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Ronda Inteligente (24h)</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Monitoramento em Tempo Real</p>
                  </div>
                </div>
                <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>

              <div className="mb-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  <i className="fas fa-circle-info mr-1"></i> Resumo do Plantão
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {hospitalRound.round_summary}
                </p>
              </div>

              <div className="space-y-3">
                {hospitalRound.patient_analysis?.map((patient: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 relative">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{patient.patient_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${patient.risk_score > 7 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        Risco: {patient.risk_score}/10
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-2 leading-snug">
                      {patient.trend_alert}
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 py-1.5 rounded transition-colors">
                        Ver Prontuário
                      </button>
                      <button className="flex-1 text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 py-1.5 rounded transition-colors">
                        Confirmar Ação
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Financial Auditor */}
          {financialAudit && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-red-500 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600">
                    <i className="fas fa-magnifying-glass-dollar"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Auditoria Financeira</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">IA Ativa • Revenue Leakage</p>
                  </div>
                </div>
                <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
              </div>

              <div className="space-y-3">
                {financialAudit.leakage_alerts?.slice(0, 2).map((alert: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-2 leading-snug">
                      <i className="fas fa-triangle-exclamation text-amber-500 mr-1"></i> {alert.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        -{alert.estimated_loss}
                      </span>
                      <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline">
                        Resolver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-robot text-lg"></i>
              </div>
              <h3 className="font-bold">Insights da IA</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-blue-200 uppercase font-bold mb-1">Dica de Recorrência</p>
                <p className="text-sm">"Thor (Golden Retriever) está com vermífugo vencendo em 3 dias. Enviar lembrete via WhatsApp?"</p>
                <button className="mt-3 w-full bg-white text-blue-700 py-2 rounded-lg text-xs font-bold hover:bg-blue-50">Enviar agora</button>
              </div>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-blue-200 uppercase font-bold mb-1">Previsão de Estoque</p>
                <p className="text-sm">"Vacina V10 pode acabar em 5 dias se o ritmo de consultas continuar."</p>
                <button className="mt-3 w-full border border-white/30 text-white py-2 rounded-lg text-xs font-bold hover:bg-white/10">Ver estoque</button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Agendamentos Próximos</h4>
            <div className="space-y-4">
              {[
                { time: '09:00', pet: 'Luna', type: 'Gato' },
                { time: '10:30', pet: 'Thor', type: 'Cão' },
              ].map((app, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600 text-sm">{app.time}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{app.pet}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{app.type}</span>
                </div>
              ))}
              <button className="w-full text-xs font-bold text-slate-400 dark:text-slate-500 py-2 hover:text-blue-600 transition-colors uppercase tracking-widest">Ver Agenda Completa</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
