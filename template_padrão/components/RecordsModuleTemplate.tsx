import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import NewRecordModal, { RecordItem } from './NewRecordModal';

const initialRecords: RecordItem[] = [
  {
    id: '1',
    name: 'Cliente exemplo',
    category: 'Comercial',
    status: 'Ativo',
    owner: 'Usuário Exemplo',
    createdAt: '2026-01-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Contrato recorrente',
    category: 'Financeiro',
    status: 'Em análise',
    owner: 'Usuário Exemplo',
    createdAt: '2026-01-05T14:30:00Z'
  }
];

const RecordsModuleTemplate: React.FC = () => {
  const { addToast } = useToast();
  const [records, setRecords] = useState<RecordItem[]>(initialRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaved = (record: RecordItem) => {
    setRecords(previous => [...previous, record]);
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cadastros padrão</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Exemplo de módulo de cadastro com tabela, ações e modais reutilizáveis para qualquer app do ecossistema Gestor.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            onClick={() => addToast('Ação de exportar deve ser implementada por app.', 'info')}
          >
            <i className="fas fa-download mr-2"></i>
            Exportar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <i className="fas fa-plus mr-2"></i>
            Novo registro
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Responsável</th>
              <th className="px-6 py-4">Criado em</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {records.map(record => (
              <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/70 transition-all">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{record.name}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">ID: {record.id}</span>
                  </div>
                </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{record.category}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      record.status === 'Ativo'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : record.status === 'Em análise'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{record.owner}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {formatDate(record.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 text-slate-300 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => addToast('Ação de edição deve ser implementada por app.', 'info')}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      onClick={() => addToast('Ação de exclusão deve ser implementada por app.', 'warning')}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default RecordsModuleTemplate;
