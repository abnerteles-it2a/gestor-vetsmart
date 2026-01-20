
import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { mockDataService } from '../services/mockDataService';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (data: any) => void;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({}); }}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all">Salvar Registro</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface NewTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (tutor: any) => void;
}

export const NewTutorModal: React.FC<NewTutorModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setEmail('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setError(null);

    if (!name.trim()) {
      setError('Nome obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        phone,
        email,
      };

      const savedTutor = await mockDataService.addTutor(payload);

      if (onSaved) {
        onSaved(savedTutor);
      }

      addToast('Tutor cadastrado com sucesso!', 'success');
      onClose();
    } catch (e) {
      addToast('Erro ao salvar. Tente novamente.', 'error');
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Tutor" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nome Completo</label>
          <input
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Telefone</label>
          <input
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

interface NewPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (pet: any) => void;
  petToEdit?: any;
}

export const NewPetModal: React.FC<NewPetModalProps> = ({ isOpen, onClose, onSaved, petToEdit }) => {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [tutor, setTutor] = useState('');
  const [tutorsList, setTutorsList] = useState<any[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load tutors for dropdown
      mockDataService.getTutors().then(setTutorsList);
      
      if (petToEdit) {
        setName(petToEdit.name || '');
        setSpecies(petToEdit.species || '');
        setBreed(petToEdit.breed || '');
        // Try to handle date format if needed, assuming ISO YYYY-MM-DD
        setBirthDate(petToEdit.birthDate || '');
        setWeight(petToEdit.weight ? String(petToEdit.weight).replace('kg', '').trim() : '');
        setAllergies(petToEdit.allergies || '');
        // Tutor logic might need refinement depending on if we have ID or Name
        setTutor(petToEdit.tutor || ''); 
        setPhoto(petToEdit.photoUrl || null);
      } else {
        setName('');
        setSpecies('');
        setBreed('');
        setBirthDate('');
        setWeight('');
        setAllergies('');
        setTutor('');
        setPhoto(null);
      }
      
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, petToEdit]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setError(null);

    if (!name.trim()) {
      setError('Nome obrigatório');
      return;
    }

    if (!species) {
      setError('Espécie obrigatória');
      return;
    }

    const weightNumber = weight ? parseFloat(weight) : 0;
    if (weight && weightNumber <= 0) {
      setError('Peso deve ser > 0');
      return;
    }

    setIsSubmitting(true);

    const calculateAge = (birthDate: string): string => {
      if (!birthDate) return 'Não inf.';
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 0) return '0 anos';
      if (age === 0) {
         let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
         if (today.getDate() < birth.getDate()) months--;
         return `${Math.max(0, months)} meses`;
      }
      return `${age} anos`;
    };

    try {
      const payload = {
        name,
        species,
        breed,
        birthDate,
        weight,
        allergies,
        tutor,
        age: calculateAge(birthDate),
        status: 'Ativo',
        phone: '', // Would come from tutor
        email: '', // Would come from tutor
        visitsThisYear: 0,
        lastVisit: 'Nunca',
        nextAppointment: null,
        totalSpend: 'R$ 0,00',
        plan: 'Básico',
        photoUrl: photo
      };

      let savedPet;
      if (petToEdit) {
         savedPet = await mockDataService.updatePet(petToEdit.id, payload);
         addToast('Pet atualizado com sucesso!', 'success');
      } else {
         savedPet = await mockDataService.addPet(payload);
         addToast('Pet adicionado com sucesso!', 'success');
      }

      if (onSaved) {
        onSaved(savedPet);
      }

      onClose();
    } catch (e) {
      addToast('Erro ao salvar. Tente novamente.', 'error');
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={petToEdit ? "Editar Paciente" : "Novo Paciente (Pet)"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {error && (
          <div className="col-span-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="col-span-2 flex justify-center mb-2">
           <div className="relative group">
             <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden">
               {photo ? (
                 <img src={photo} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <i className="fas fa-camera text-2xl text-slate-400"></i>
               )}
             </div>
             <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                <i className="fas fa-upload text-white"></i>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
             </label>
           </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nome do Pet</label>
          <input
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Tobias"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Espécie</label>
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="Cão">Cão</option>
            <option value="Gato">Gato</option>
            <option value="Coelho">Coelho</option>
            <option value="Pássaro">Pássaro</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Raça</label>
          <input
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Poodle"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Data de Nascimento</label>
          <input
            type="date"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Peso (kg)</label>
          <input
            type="number"
            step="0.1"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Alergias</label>
          <textarea
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Descreva alergias conhecidas (opcional)"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tutor</label>
          <div className="flex gap-2">
            <select
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={tutor}
              onChange={(e) => setTutor(e.target.value)}
            >
              <option value="">Selecione um tutor</option>
              {tutorsList.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
              onClick={() => setIsTutorModalOpen(true)}
            >
              Novo Tutor
            </button>
          </div>
        </div>
      </div>
    </Modal>
    {isTutorModalOpen && (
      <NewTutorModal
        isOpen={isTutorModalOpen}
        onClose={() => setIsTutorModalOpen(false)}
        onSaved={(newTutor) => {
          setTutorsList((prev) => [...prev, newTutor]);
          setTutor(newTutor.name);
        }}
      />
    )}
    </>
  );
};

interface NewAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (admission: any) => void;
  bays: { id: string; label: string; type: string }[];
}

export const NewAdmissionModal: React.FC<NewAdmissionModalProps> = ({ isOpen, onClose, onSaved, bays }) => {
  const { addToast } = useToast();
  const [patientId, setPatientId] = useState('');
  const [reason, setReason] = useState('');
  const [bayId, setBayId] = useState('');
  const [status, setStatus] = useState('stable');
  const [nextMedication, setNextMedication] = useState('');
  const [petsList, setPetsList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      mockDataService.getPets().then(setPetsList);
      setPatientId('');
      setReason('');
      setBayId('');
      setStatus('stable');
      setNextMedication('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!patientId || !reason || !bayId || !nextMedication) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    const selectedPet = petsList.find(p => p.id === patientId);
    if (!selectedPet) return;

    const admissionData = {
      id: selectedPet.id, // Using pet ID as admission ID for simplicity, or generate new
      name: selectedPet.name,
      species: selectedPet.species === 'Gato' ? 'Cat' : 'Dog', // Simple mapping
      tutor: selectedPet.tutor,
      reason,
      admissionDate: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      nextMedication,
      status,
      bay: bayId
    };

    onSaved(admissionData);
    addToast('Paciente internado com sucesso!', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Internar Paciente" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paciente</label>
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          >
            <option value="">Selecione o paciente</option>
            {petsList.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.name} ({pet.tutor})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo da Internação</label>
          <input
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Pós-operatório, Desidratação..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Baia / Leito</label>
            <select
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              value={bayId}
              onChange={(e) => setBayId(e.target.value)}
            >
              <option value="">Selecione</option>
              {bays.map(bay => (
                <option key={bay.id} value={bay.id}>{bay.label} ({bay.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Inicial</label>
            <select
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="stable">Estável</option>
              <option value="recovering">Em Recuperação</option>
              <option value="critical">Crítico</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Próxima Medicação</label>
          <input
            type="time"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            value={nextMedication}
            onChange={(e) => setNextMedication(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (appointment: any) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { addToast } = useToast();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [pet, setPet] = useState('');
  const [service, setService] = useState('');
  const [vet, setVet] = useState('');
  const [notes, setNotes] = useState('');
  const [petsList, setPetsList] = useState<any[]>([]);
  const [vetsList, setVetsList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      mockDataService.getPets().then(setPetsList);
      mockDataService.getVets().then(setVetsList);

      setDate('');
      setTime('');
      setPet('');
      setService('');
      setVet('');
      setNotes('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setError(null);

    if (!pet) {
      setError('Pet obrigatório');
      return;
    }
    if (!date) {
      setError('Data obrigatória');
      return;
    }
    if (!time) {
      setError('Horário obrigatório');
      return;
    }
    if (!vet) {
      setError('Veterinário obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPetObj = petsList.find(p => p.name === pet);
      const selectedVetObj = vetsList.find(v => v.name === vet);

      const payload = {
        date,
        time,
        pet,
        species: selectedPetObj?.species || '',
        tutor: selectedPetObj?.tutor || '',
        service,
        vet,
        room: 'Sala 1', // Mock logic
        type: service.toLowerCase().includes('vacina') ? 'vacina' : service.toLowerCase().includes('cirurgia') ? 'cirurgia' : 'consulta',
        status: 'confirmado',
        notes
      };

      const savedAppointment = await mockDataService.addAppointment(payload);

      if (onSaved) {
        onSaved(savedAppointment);
      }

      addToast('Agendamento confirmado!', 'success');
      onClose();
    } catch (e) {
      addToast('Erro ao salvar. Tente novamente.', 'error');
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Agendamento" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Data</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Horário</label>
            <input
              type="time"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Pet / Paciente</label>
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={pet}
            onChange={(e) => setPet(e.target.value)}
          >
            <option value="">Selecione</option>
            {petsList.map((p) => (
              <option key={p.id} value={p.name}>{p.name} ({p.species}) - {p.tutor}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Veterinário</label>
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={vet}
            onChange={(e) => setVet(e.target.value)}
          >
            <option value="">Selecione</option>
            {vetsList.map((v) => (
              <option key={v.id} value={v.name}>{v.name} - {v.specialty}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Serviço</label>
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="Consulta Geral">Consulta Geral</option>
            <option value="Vacinação">Vacinação</option>
            <option value="Cirurgia">Cirurgia</option>
            <option value="Banho/Tosa">Banho/Tosa</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Observações</label>
          <textarea
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Informações adicionais relevantes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (sale: any) => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { addToast } = useToast();
  const [customer, setCustomer] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [value, setValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pago');
  const [description, setDescription] = useState('');
  const [tutorsList, setTutorsList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      mockDataService.getTutors().then(setTutorsList);
      setCustomer('');
      setServiceType('');
      setValue('');
      setPaymentMethod('');
      setStatus('Pago');
      setDescription('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setError(null);

    if (!customer.trim() || !serviceType || !value || !paymentMethod || !description.trim()) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    const numericValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numericValue) || numericValue <= 0) {
      setError('Valor deve ser > 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
        desc: description,
        value: `R$ ${numericValue.toFixed(2).replace('.', ',')}`,
        payment: paymentMethod,
        status: status === 'Pago' ? 'concluído' : 'pendente',
        customer,
        serviceType
      };

      const savedSale = await mockDataService.addSale(payload);

      if (onSaved) {
        onSaved(savedSale);
      }

      addToast('Venda registrada!', 'success');
      onClose();
    } catch (e) {
      addToast('Erro ao salvar. Tente novamente.', 'error');
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nova Venda" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Cliente / Tutor</label>
           <select
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          >
            <option value="">Selecione</option>
            {tutorsList.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
            <option value="Cliente Balcão">Cliente Balcão (Avulso)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tipo de Serviço</label>
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="Consulta">Consulta</option>
            <option value="Cirurgia">Cirurgia</option>
            <option value="Banho">Banho</option>
            <option value="Venda de Produto">Venda de Produto</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Forma de Pagamento</label>
            <select
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão Débito">Cartão Débito</option>
              <option value="Cartão Crédito">Cartão Crédito</option>
              <option value="Pix">Pix</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                className="accent-blue-600"
                checked={status === 'Pago'}
                onChange={() => setStatus('Pago')}
              />
              Pago
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                className="accent-blue-600"
                checked={status === 'Pendente'}
                onChange={() => setStatus('Pendente')}
              />
              Pendente
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Descrição</label>
          <textarea
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Ex: Consulta + Vacina V10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

interface NewInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (item: any) => void;
}

export const NewInventoryModal: React.FC<NewInventoryModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [sku, setSku] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('');
      setQuantity('');
      setUnitPrice('');
      setSupplier('');
      setExpirationDate('');
      setSku('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setError(null);

    if (!name.trim() || !category || !quantity || !unitPrice) {
      setError('Nome, categoria, quantidade e preço são obrigatórios');
      return;
    }

    const qty = parseInt(quantity, 10);
    const priceNumber = parseFloat(unitPrice.replace(',', '.'));
    if (isNaN(qty) || qty <= 0) {
      setError('Quantidade deve ser > 0');
      return;
    }
    if (isNaN(priceNumber) || priceNumber <= 0) {
      setError('Preço deve ser > 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        category,
        stock: qty,
        minStock: Math.max(1, Math.round(qty * 0.3)),
        price: `R$ ${priceNumber.toFixed(2).replace('.', ',')}`,
        status: 'ok', // Default
        supplier,
        expirationDate,
        sku
      };

      // Mock status logic
      if (qty <= payload.minStock) payload.status = 'critical';
      else if (qty <= payload.minStock * 1.5) payload.status = 'warning';
      else payload.status = 'ok';

      const savedItem = await mockDataService.addItem(payload as any);

      if (onSaved) {
        onSaved(savedItem);
      }

      addToast('Produto adicionado ao estoque!', 'success');
      onClose();
    } catch (e) {
      addToast('Erro ao salvar. Tente novamente.', 'error');
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Item no Estoque" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nome do Produto</label>
          <input
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Vacina V10"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Categoria</label>
            <select
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Medicamento">Medicamento</option>
              <option value="Alimento">Alimento</option>
              <option value="Acessório">Acessório</option>
              <option value="Vacina">Vacina</option>
              <option value="Higiene">Higiene</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Preço Unitário (R$)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Quantidade</label>
            <input
              type="number"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Fornecedor</label>
            <input
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do fornecedor"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Data de Validade</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">SKU / Código</label>
            <input
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Opcional"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
