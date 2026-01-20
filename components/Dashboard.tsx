
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockDataService } from '../services/mockDataService';

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
  const [loading, setLoading] = useState(true);

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
        const parseValue = (val: string) => parseFloat(val.replace('R$ ', '').replace('.', '').replace(',', '.'));
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
            icon: 'fa-stethoscope',
            badge: 'Consultas',
            iconClass: 'bg-blue-100 text-blue-600',
            delta: '+2 vs ontem',
            detail: `${appointmentsToday.filter(a => a.status === 'agendado').length} agendadas • ${appointmentsToday.filter(a => a.status === 'concluido').length} concluídas`,
          },
          {
            label: 'Faturamento Total',
            value: totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: 'fa-money-bill-trend-up',
            badge: 'Financeiro',
            iconClass: 'bg-emerald-100 text-emerald-600',
            delta: '+12% vs mês passado',
            detail: `Ticket médio: ${(totalSales / (sales.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
          },
          {
            label: 'Total de Pets',
            value: pets.length.toString(),
            icon: 'fa-paw',
            badge: 'Base de Clientes',
            iconClass: 'bg-purple-100 text-purple-600',
            delta: '+3 novos esta semana',
            detail: 'Clientes ativos',
          },
          {
            label: 'Alertas de Estoque',
            value: `${criticalItems} itens`,
            icon: 'fa-triangle-exclamation',
            badge: 'Estoque',
            iconClass: 'bg-amber-100 text-amber-600',
            delta: 'Itens críticos',
            detail: 'Sugestão: revisar compras',
          },
          {
            label: 'Receita Hoje',
            value: receitaHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: 'fa-chart-line',
            badge: 'Receita Hoje',
            iconClass: 'bg-sky-100 text-sky-600',
            delta: 'Vendas do dia',
            detail: `${salesToday.length} vendas registradas`,
          },
           {
            label: 'Ocupação da Agenda',
            value: '82%',
            icon: 'fa-calendar-check',
            badge: 'Agenda',
            iconClass: 'bg-indigo-100 text-indigo-600',
            delta: 'Alta ocupação',
            detail: '2 horários livres hoje',
          },
          {
            label: 'Taxa de No-Show',
            value: '0%',
            icon: 'fa-user-clock',
            badge: 'No-Show',
            iconClass: 'bg-rose-100 text-rose-600',
            delta: 'Excelente',
            detail: 'Nenhum cancelamento hoje',
          },
          {
            label: 'Aniversariantes',
            value: '1 pet',
            icon: 'fa-birthday-cake',
            badge: 'Relacionamento',
            iconClass: 'bg-pink-100 text-pink-600',
            delta: 'Hoje',
            detail: 'Enviar mensagem',
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <div className="p-6 text-center text-slate-500">Carregando dados do dashboard...</div>;


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${kpi.iconClass}`}
              >
                <i className={`fas ${kpi.icon}`}></i>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                {kpi.badge}
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-[0.16em]">
              {kpi.label}
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {kpi.value}
            </h3>
            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {kpi.delta}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {kpi.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Fluxo de Consultas Semanais</h3>
                <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-1 outline-none text-slate-700 dark:text-slate-200">
                  <option>Últimos 7 dias</option>
                  <option>Último mês</option>
                </select>
              </div>
              <div className="h-64 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}} 
                      contentStyle={{
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc'
                      }} 
                    />
                    <Bar dataKey="consultas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <i className="fas fa-users-viewfinder text-blue-500"></i> Análise de Fidelidade do Ecossistema
                    </h3>
                    <button className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">BI Completo</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Clientes Inativos (60d+)</p>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
                          <div className="h-full bg-amber-500" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">12 tutores • Última visita &gt; 6 meses</p>
                        <button className="mt-1 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                          Gerar Campanha Reativação
                        </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Clientes em Risco</p>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
                          <div className="h-full bg-yellow-400" style={{ width: '40%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">8 tutores • Última visita entre 3 e 6 meses</p>
                        <button className="mt-1 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                          Enviar Lembrete Automático
                        </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Clientes VIP</p>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
                          <div className="h-full bg-emerald-500" style={{ width: '85%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">24 tutores • Faturamento anual R$ 45.000</p>
                        <button className="mt-1 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                          Ver Benefícios VIP
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
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
