import React, { useState } from 'react';
import { KpiCard } from './KpiCard';

const MODULE_COLOR = '#D81B60';

const PLANS = [
  {
    icon: 'fa-seedling', tier: 'Básico', price: 'R$ 89,90', subscribers: 32,
    color: '#37474F',
    features: ['2 consultas por ano', '10% de desconto em serviços', 'Vacinação básica'],
    badge: null,
  },
  {
    icon: 'fa-star', tier: 'Premium', price: 'R$ 149,90', subscribers: 10,
    color: MODULE_COLOR,
    features: ['Consultas ilimitadas', '20% de desconto em serviços', 'Vacinas incluídas', 'Telemedicina'],
    badge: 'Mais vendido',
  },
  {
    icon: 'fa-crown', tier: 'VIP', price: 'R$ 249,90', subscribers: 3,
    color: '#FF8F00',
    features: ['Consultas e vacinas ilimitadas', '30% de desconto em cirurgias', 'Telemedicina 24h', 'Nutricionista dedicado'],
    badge: 'Elite',
  },
];

const SUBSCRIBERS = [
  { pet: 'Luna', tutor: 'João Silva', plan: 'Premium', since: '01/08/2025', nextPayment: '14 dias', status: 'ativo' },
  { pet: 'Thor', tutor: 'Maria Santos', plan: 'Básico', since: '15/03/2025', nextPayment: '3 dias', status: 'ativo' },
  { pet: 'Mel', tutor: 'Carlos Oliveira', plan: 'VIP', since: '10/01/2026', nextPayment: '22 dias', status: 'ativo' },
  { pet: 'Buddy', tutor: 'Ana Costa', plan: 'Básico', since: '20/09/2024', nextPayment: 'Atrasado', status: 'atrasado' },
];

const PlansModule: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">

      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Receita Recorrente</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Planos de Saúde Pet</p>
        </div>
        <div className="flex gap-4">
          <button className="omie-btn-secondary">Exportar Assinantes</button>
          <button className="omie-btn-primary">
            <i className="fas fa-plus mr-2"></i>Novo Plano
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Assinantes Ativos"
          value="45"
          icon={<i className="fas fa-id-card"></i>}
          subtext="Pets com plano de saúde"
          subtextColor="text-slate-400"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Receita Recorrente (MRR)"
          value="R$ 6.750,00"
          icon={<i className="fas fa-money-bill-trend-up"></i>}
          subtext="Baseado nos planos ativos"
          subtextColor="text-emerald-500"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Churn Estimado"
          value="3,2%"
          icon={<i className="fas fa-arrow-trend-down"></i>}
          subtext="Últimos 90 dias"
          subtextColor="text-rose-500"
          color={MODULE_COLOR}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.tier}
            onClick={() => setSelectedPlan(selectedPlan === plan.tier ? null : plan.tier)}
            className={`omie-card cursor-pointer transition-all group relative overflow-hidden ${
              selectedPlan === plan.tier ? 'ring-2' : 'hover:shadow-lg'
            }`}
            style={selectedPlan === plan.tier ? { '--tw-ring-color': plan.color } as any : {}}
          >
            {plan.badge && (
              <div
                className="absolute top-4 right-4 px-3 py-1 text-[8px] font-black text-white uppercase tracking-widest rounded-full"
                style={{ background: plan.color }}
              >
                {plan.badge}
              </div>
            )}
            <div className="p-8">
              {/* Plan header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: plan.color }}
                >
                  <i className={`fas ${plan.icon} text-xl`}></i>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Plano</p>
                  <h3 className="text-xl font-black text-[#020617] uppercase tracking-tight">{plan.tier}</h3>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-black tracking-tighter" style={{ color: plan.color }}>{plan.price}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">/mês</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <i className="fas fa-check text-[10px]" style={{ color: plan.color }}></i>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {plan.subscribers} assinantes
                </span>
                <button
                  className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all"
                  style={{ color: plan.color, borderColor: plan.color + '40' }}
                >
                  Gerenciar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribers Table */}
      <div className="omie-table-container">
        <div className="omie-card-header">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Gestão de Assinantes</h3>
          <span className="px-3 py-1 bg-slate-50 text-[10px] font-black text-slate-400 rounded-full uppercase tracking-widest border border-slate-100">
            {SUBSCRIBERS.length} registros
          </span>
        </div>
        <table className="omie-table">
          <thead>
            <tr>
              <th>Pet / Tutor</th>
              <th>Plano</th>
              <th>Desde</th>
              <th>Próx. Pagamento</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {SUBSCRIBERS.map((sub, idx) => (
              <tr key={idx} className="group">
                <td>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#020617] uppercase tracking-tight group-hover:text-[#D81B60] transition-colors">{sub.pet}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">{sub.tutor}</span>
                  </div>
                </td>
                <td>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{
                      color: PLANS.find(p => p.tier === sub.plan)?.color || '#94a3b8',
                      background: (PLANS.find(p => p.tier === sub.plan)?.color || '#94a3b8') + '15'
                    }}
                  >
                    {sub.plan}
                  </span>
                </td>
                <td>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{sub.since}</span>
                </td>
                <td>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${sub.nextPayment === 'Atrasado' ? 'text-rose-500' : 'text-slate-600'}`}>
                    {sub.nextPayment}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'ativo' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${sub.status === 'ativo' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {sub.status}
                    </span>
                  </div>
                </td>
                <td className="text-right">
                  <button className="omie-btn-secondary !px-4 !py-1.5 !text-[9px]">Ver Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlansModule;
