import React from 'react';

const DashboardTemplate: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indicador 1</p>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-600">
              <i className="fas fa-bolt text-sm"></i>
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">128</p>
          <p className="text-xs text-emerald-500 font-semibold mt-2">+12% vs período anterior</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indicador 2</p>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600">
              <i className="fas fa-users text-sm"></i>
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">64%</p>
          <p className="text-xs text-emerald-500 font-semibold mt-2">Taxa de retenção estimada</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indicador 3</p>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-50 text-amber-600">
              <i className="fas fa-triangle-exclamation text-sm"></i>
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">9</p>
          <p className="text-xs text-amber-500 font-semibold mt-2">Alertas em atenção</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 shadow-xl text-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Advisor de IA</p>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 text-white">
              <i className="fas fa-robot text-sm"></i>
            </span>
          </div>
          <p className="text-sm text-slate-200">
            Use este espaço para exibir recomendações inteligentes, alertas de risco ou oportunidades de receita
            identificadas pela IA do ecossistema Gestor.
          </p>
          <button className="mt-4 w-full py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">
            Ver recomendações detalhadas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <i className="fas fa-layer-group text-blue-500"></i>
              Pipeline principal do app
            </h3>
            <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
              Ver detalhes
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
            Use este card para exibir uma visão resumida das principais etapas ou funis do seu produto (por exemplo:
            cadastros, operações, aprovação, faturamento).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Etapa 1', 'Etapa 2', 'Etapa 3', 'Etapa 4'].map((step, index) => (
              <div key={step} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                  {step}
                </p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {index + 1}2
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                  Placeholder para métricas específicas desta etapa.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Atividades recentes</h3>
          <div className="space-y-3">
            {[
              { label: 'Novo cadastro criado', time: 'Há 5 minutos' },
              { label: 'Configuração atualizada', time: 'Há 18 minutos' },
              { label: 'Exportação de relatório', time: 'Há 1 hora' }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <i className="fas fa-circle-dot text-xs"></i>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.label}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.time}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  Ver
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTemplate;
