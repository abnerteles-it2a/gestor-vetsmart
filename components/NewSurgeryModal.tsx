import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Modal } from './NewItemModals';

interface NewSurgeryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (surgery: any) => void;
}

export const NewSurgeryModal: React.FC<NewSurgeryModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { addToast } = useToast();
  const [petName, setPetName] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [procedure, setProcedure] = useState('');
  const [vetName, setVetName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPetName('');
      setTutorName('');
      setProcedure('');
      setVetName('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!petName || !procedure || !date || !time) {
      addToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newSurgery = {
        id: Date.now().toString(),
        petName,
        tutorName,
        procedure,
        vetName,
        date,
        time,
        status: 'agendado',
        checklist: {
          jejum: false,
          exames: false,
          termo: false,
          anestesia: false,
        }
      };

      onSaved(newSurgery);
      addToast('Cirurgia agendada com sucesso!', 'success');
      onClose();
    } catch (e) {
      addToast('Erro ao agendar cirurgia.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Cirurgia" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Pet *</label>
            <input
              type="text"
              required
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ex: Thor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tutor</label>
            <input
              type="text"
              value={tutorName}
              onChange={(e) => setTutorName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ex: João Silva"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Procedimento *</label>
          <input
            type="text"
            required
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Ex: Castração"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Veterinário Responsável</label>
          <input
            type="text"
            value={vetName}
            onChange={(e) => setVetName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Ex: Dr. Ricardo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Horário *</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
