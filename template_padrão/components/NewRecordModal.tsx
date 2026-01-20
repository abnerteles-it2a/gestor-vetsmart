import React, { useState, FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';

export interface RecordItem {
  id: string;
  name: string;
  category: string;
  status: string;
  owner: string;
  createdAt: string;
}

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (record: RecordItem) => void;
}

const NewRecordModal: React.FC<NewRecordModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Operacional');
  const [status, setStatus] = useState('Ativo');
  const [owner, setOwner] = useState('Usuário Exemplo');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      addToast('Informe ao menos o nome do registro.', 'warning');
      return;
    }

    const record: RecordItem = {
      id: Date.now().toString(),
      name: name.trim(),
      category,
      status,
      owner: owner.trim() || 'Usuário Exemplo',
      createdAt: new Date().toISOString()
    };

    onSaved(record);
    addToast('Registro criado com sucesso.', 'success');
    onClose();
    setName('');
    setCategory('Operacional');
    setStatus('Ativo');
    setOwner('Usuário Exemplo');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Novo registro padrão</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Nome
              </label>
              <input
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                placeholder="Ex: Contrato padrão, Cliente, Projeto"
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Categoria
                </label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  value={category}
                  onChange={event => setCategory(event.target.value)}
                >
                  <option>Operacional</option>
                  <option>Financeiro</option>
                  <option>Comercial</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  value={status}
                  onChange={event => setStatus(event.target.value)}
                >
                  <option>Ativo</option>
                  <option>Em análise</option>
                  <option>Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Responsável
              </label>
              <input
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                placeholder="Nome de quem criou ou gerencia o registro"
                value={owner}
                onChange={event => setOwner(event.target.value)}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all"
            >
              Salvar registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRecordModal;
