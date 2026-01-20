import React from 'react';

const PlansModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Planos de Saúde Pet</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Gestão de planos recorrentes, benefícios e receita previsível da clínica.
          </p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
          <i className="fas fa-plus"></i>
          Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Assinantes Ativos</p>
          <h4 className="text-3xl font-bold text-slate-800 dark:text-slate-100">45</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Pets com plano de saúde ativo</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Receita Recorrente Mensal</p>
          <h4 className="text-3xl font-bold text-slate-800 dark:text-slate-100">R$ 6.750,00</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Baseado nos planos ativos atuais</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Churn Estimado</p>
          <h4 className="text-3xl font-bold text-slate-800 dark:text-slate-100">3,2%</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Taxa de cancelamento dos últimos 90 dias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥉</span>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Plano</p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Básico</h4>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              32 assinantes
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">R$ 89,90<span className="text-sm font-medium text-slate-500 dark:text-slate-400">/mês</span></p>
          <ul className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>• 2 consultas por ano</li>
            <li>• 10% de desconto em serviços</li>
          </ul>
          <button className="mt-4 w-full text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 rounded-lg py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
            Ver detalhes do plano
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-amber-400 dark:border-amber-300 shadow-md flex flex-col relative">
          <span className="absolute -top-3 right-4 bg-amber-400 text-xs font-bold text-slate-900 px-3 py-1 rounded-full shadow">
            Mais vendido
          </span>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥈</span>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Plano</p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Premium</h4>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              10 assinantes
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">R$ 149,90<span className="text-sm font-medium text-slate-500 dark:text-slate-400">/mês</span></p>
          <ul className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>• Consultas ilimitadas</li>
            <li>• 20% de desconto em serviços</li>
            <li>• Vacinas incluídas</li>
          </ul>
          <button className="mt-4 w-full text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 rounded-lg py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
            Ver detalhes do plano
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥇</span>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Plano</p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">VIP</h4>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              3 assinantes
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">R$ 249,90<span className="text-sm font-medium text-slate-500 dark:text-slate-400">/mês</span></p>
          <ul className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>• Consultas e vacinas ilimitadas</li>
            <li>• 30% de desconto em cirurgias</li>
            <li>• Telemedicina 24h</li>
          </ul>
          <button className="mt-4 w-full text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 rounded-lg py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
            Ver detalhes do plano
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Gestão por Assinante</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Luna (João Silva)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plano Premium • desde 01/08/2025</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Próximo pagamento em 14 dias</p>
            </div>
            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansModule;

