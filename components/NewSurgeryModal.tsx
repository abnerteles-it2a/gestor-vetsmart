import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Modal } from './NewItemModals';
import { apiService } from '../services/api';

interface NewSurgeryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (surgery: any) => void;
}

export const NewSurgeryModal: React.FC<NewSurgeryModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { addToast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedVetId, setSelectedVetId] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [procedure, setProcedure] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedPetId('');
      setSelectedVetId('');
      setTutorName('');
      setProcedure('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [petsRes, vetsRes] = await Promise.all([
        apiService.getPets(),
        apiService.getVets()
      ]);
      setPatients(petsRes.data);
      setVets(vetsRes.data);
    } catch (error) {
      console.error("Error loading data", error);
      addToast("Erro ao carregar dados", "error");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPetId(id);
    const patient = patients.find(p => p.id.toString() === id);
    if (patient) {
      setTutorName(patient.tutor_name || patient.tutor || '');
    } else {
      setTutorName('');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!selectedPetId || !procedure || !date || !time || !selectedVetId) {
      addToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        pet_id: parseInt(selectedPetId),
        vet_id: parseInt(selectedVetId),
        procedure_name: procedure,
        surgery_date: `${date}T${time}:00`,
        status: 'agendado',
        checklist: {
          jejum: false,
          exames: false,
          termo: false,
          anestesia: false,
        },
        notes: ''
      };

      const response = await apiService.createSurgery(payload);
      
      onSaved(response.data);
      addToast('Cirurgia agendada com sucesso!', 'success');
      onClose();
    } catch (e) {
      console.error(e);
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paciente *</label>
            <select
              required
              value={selectedPetId}
              onChange={handlePetChange}
              disabled={isLoadingData}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">Selecione um paciente...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tutor_name || p.tutor})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tutor</label>
            <input
              type="text"
              readOnly
              value={tutorName}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
              placeholder="Preenchido automaticamente"
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Veterinário Responsável *</label>
          <select
            required
            value={selectedVetId}
            onChange={(e) => setSelectedVetId(e.target.value)}
            disabled={isLoadingData}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="">Selecione um veterinário...</option>
            {vets.map(v => (
              <option key={v.id} value={v.id}>{v.name} ({v.role})</option>
            ))}
          </select>
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
