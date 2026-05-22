
import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

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
    <div className="omie-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="omie-modal-content">
        <div className="omie-modal-header bg-white">
          <h3 className="omie-modal-title">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-[#FF9F1C] hover:bg-slate-50 transition-all border-none bg-transparent cursor-pointer"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        <form 
          className="flex flex-col flex-1 overflow-hidden"
          onSubmit={(e) => { 
            e.preventDefault(); 
            onSubmit({}); 
          }}
        >
          <div className="omie-modal-body bg-white custom-scrollbar">
            {children}
          </div>
          <div className="omie-modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="omie-btn-secondary !px-10"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="omie-btn-primary !px-12 shadow-2xl shadow-orange-500/20"
            >
              Confirmar Registro it2a
            </button>
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
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCpf('');
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
      // Geração automática de credenciais para o App Tutor
      const appPassword = Math.floor(100000 + Math.random() * 900000).toString();

      const payload = {
        name,
        cpf,
        phone,
        email,
        appPassword, // Senha provisória gerada para o App Tutor
      };

      const response = await apiService.createTutor(payload);
      const savedTutor = response.data;

      if (onSaved) {
        onSaved(savedTutor);
      }

      addToast(`Tutor cadastrado! Senha do App: ${appPassword}`, 'success');
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
      <div className="space-y-5">
        {error && (
          <div className="text-[11px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-3 animate-shake">
            {error}
          </div>
        )}
        <div>
          <label className="omie-label">Nome Completo</label>
          <input
            className="omie-input"
            placeholder="Ex: João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="omie-label">CPF (Login do App Tutor)</label>
          <input
            className="omie-input"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
        </div>
        <div>
          <label className="omie-label">Telefone de Contato</label>
          <input
            className="omie-input"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="omie-label">E-mail Corporativo</label>
          <input
            type="email"
            className="omie-input"
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
      apiService.getTutors().then(response => setTutorsList(response.data));
      
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
         const response = await apiService.updatePet(petToEdit.id, payload);
         savedPet = response.data;
         addToast('Pet atualizado com sucesso!', 'success');
      } else {
         const response = await apiService.createPet(payload);
         savedPet = response.data;
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
      <div className="grid grid-cols-2 gap-6">
        {error && (
          <div className="col-span-2 text-[11px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-3 animate-shake">
            {error}
          </div>
        )}

        <div className="col-span-2 flex justify-center mb-2">
           <div className="relative group">
             <div className="w-28 h-28 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
               {photo ? (
                 <img src={photo} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <i className="fas fa-camera text-3xl text-slate-300"></i>
               )}
             </div>
             <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl cursor-pointer transition-opacity">
                <i className="fas fa-upload text-white text-xl"></i>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
             </label>
           </div>
        </div>

        <div className="col-span-2">
          <label className="omie-label">Nome do Paciente</label>
          <input
            className="omie-input"
            placeholder="Ex: Tobias"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="omie-label">Espécie</label>
          <select
            className="omie-input"
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
          <label className="omie-label">Raça</label>
          <input
            className="omie-input"
            placeholder="Ex: Poodle"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />
        </div>
        <div>
          <label className="omie-label">Data de Nascimento</label>
          <input
            type="date"
            className="omie-input"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div>
          <label className="omie-label">Peso (kg)</label>
          <input
            type="number"
            step="0.1"
            className="omie-input"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="omie-label">Alergias e Restrições</label>
          <textarea
            className="omie-input resize-none"
            rows={3}
            placeholder="Descreva alergias conhecidas (opcional)"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="omie-label">Tutor Responsável</label>
          <div className="flex gap-3">
            <select
              className="omie-input flex-1"
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
              className="omie-btn-secondary whitespace-nowrap px-6"
              onClick={() => setIsTutorModalOpen(true)}
            >
              <i className="fas fa-plus mr-2"></i>
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
      apiService.getPets().then(response => setPetsList(response.data));
      setPatientId('');
      setReason('');
      setBayId('');
      setStatus('stable');
      setNextMedication('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!patientId || !reason || !bayId || !nextMedication) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    const selectedPet = petsList.find(p => p.id === patientId);
    if (!selectedPet) return;

    try {
      const payload = {
        pet_id: parseInt(patientId),
        bay: bayId,
        reason,
        status,
        next_medication_time: nextMedication, // Time string HH:mm, backend might need full timestamp or handle it
        notes: `Internação solicitada por motivo: ${reason}`
      };

      // Ensure next_medication_time is a valid timestamp if backend expects it
      // Backend definition: next_medication_time TIMESTAMP
      // So we should combine with today's date or handle it.
      // Let's assume we use today's date + time
      const todayStr = new Date().toISOString().split('T')[0];
      payload.next_medication_time = `${todayStr}T${nextMedication}:00`;

      const response = await apiService.createHospitalization(payload);
      
      onSaved(response.data);
      addToast('Paciente internado com sucesso!', 'success');
      onClose();
    } catch (e) {
      console.error(e);
      addToast('Erro ao internar paciente.', 'error');
      setError('Erro ao salvar no banco de dados.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Internar Paciente" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="omie-error-pill animate-shake">
            {error}
          </div>
        )}
        
        <div>
          <label className="omie-label">Paciente</label>
          <select
            className="omie-input"
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
          <label className="omie-label">Motivo da Internação</label>
          <input
            className="omie-input"
            placeholder="Ex: Pós-operatório, Desidratação..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="omie-label">Baia / Leito</label>
            <select
              className="omie-input"
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
            <label className="omie-label">Status Inicial</label>
            <select
              className="omie-input"
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
          <label className="omie-label">Próxima Medicação</label>
          <input
            type="time"
            className="omie-input"
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
      apiService.getPets().then(response => setPetsList(response.data));
      apiService.getVets().then(response => setVetsList(response.data));

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
      const selectedPetObj = petsList.find(p => p.name === pet); // Note: 'pet' state currently holds name, see select below
      const selectedVetObj = vetsList.find(v => v.name === vet); // 'vet' state holds name

      if (!selectedPetObj) {
        setError('Erro: Pet não encontrado na lista.');
        setIsSubmitting(false);
        return;
      }

      // Backend expects proper IDs
      const payload = {
        pet_id: selectedPetObj.id,
        vet_id: selectedVetObj ? selectedVetObj.id : null,
        appointment_date: `${date}T${time}:00`,
        type: service.toLowerCase().includes('vacina') ? 'Vacinação' : service.toLowerCase().includes('cirurgia') ? 'Cirurgia' : 'Consulta',
        reason: service, // Using service as reason for simplicity
        room: 'Sala 1', 
        status: 'agendado',
        notes
      };

      const savedAppointment = await apiService.createAppointment(payload);

      if (onSaved) {
        onSaved(savedAppointment.data);
      }

      addToast('Agendamento confirmado!', 'success');
      onClose();
    } catch (e) {
      console.error(e);
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
          <div className="omie-error-pill animate-shake">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="omie-label">Data</label>
            <input
              type="date"
              className="omie-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="omie-label">Horário</label>
            <input
              type="time"
              className="omie-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="omie-label">Pet / Paciente</label>
          <select
            className="omie-input"
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
          <label className="omie-label">Veterinário</label>
          <select
            className="omie-input"
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
          <label className="omie-label">Serviço</label>
          <select
            className="omie-input"
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
          <label className="omie-label">Observações</label>
          <textarea
            className="omie-input resize-none"
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
  const [petId, setPetId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [value, setValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pago');
  const [description, setDescription] = useState('');
  const [tutorsList, setTutorsList] = useState<any[]>([]);
  const [petsList, setPetsList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiService.getTutors().then(response => setTutorsList(response.data));
      apiService.getPets().then(response => setPetsList(response.data));
      setCustomer('');
      setPetId('');
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
      const selectedTutor = tutorsList.find(t => t.name === customer);
      
      const payload = {
        tutor_id: selectedTutor ? selectedTutor.id : null,
        pet_id: petId ? parseInt(petId) : null,
        total_amount: numericValue,
        payment_method: paymentMethod,
        status: status === 'Pago' ? 'concluido' : 'pendente',
        description,
        service_type: serviceType,
        items: []
      };

      const savedSale = await apiService.createSale(payload);

      if (onSaved) {
        onSaved(savedSale.data);
      }

      addToast('Venda registrada!', 'success');
      onClose();
    } catch (e) {
      console.error(e);
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
          <div className="omie-error-pill animate-shake">
            {error}
          </div>
        )}
        <div>
          <label className="omie-label">Cliente / Tutor</label>
           <select
            className="omie-input"
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
          <label className="omie-label">Pet (Opcional)</label>
          <select
            className="omie-input"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
          >
            <option value="">Selecione um pet</option>
            {petsList
              .filter(p => !customer || customer === 'Cliente Balcão' || p.tutor_name === customer || p.tutor === customer)
              .map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
              ))
            }
          </select>
        </div>
        <div>
          <label className="omie-label">Tipo de Serviço</label>
          <select
            className="omie-input"
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
            <label className="omie-label">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              className="omie-input"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div>
            <label className="omie-label">Forma de Pagamento</label>
            <select
              className="omie-input"
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
          <label className="omie-label">Status</label>
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="radio"
                className="accent-[#FF9F1C]"
                checked={status === 'Pago'}
                onChange={() => setStatus('Pago')}
              />
              Pago
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="radio"
                className="accent-[#FF9F1C]"
                checked={status === 'Pendente'}
                onChange={() => setStatus('Pendente')}
              />
              Pendente
            </label>
          </div>
        </div>
        <div>
          <label className="omie-label">Descrição</label>
          <textarea
            className="omie-input resize-none"
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
        stock_quantity: qty,
        min_stock_level: Math.max(1, Math.round(qty * 0.3)),
        price: priceNumber,
        sku,
        expiry_date: expirationDate || null,
        supplier // Added supplier if backend supports it in future (currently not in INSERT but good to have in payload)
      };

      const savedItem = await apiService.createProduct(payload);

      if (onSaved) {
        onSaved(savedItem.data);
      }

      addToast('Produto adicionado ao estoque!', 'success');
      onClose();
    } catch (e) {
      console.error(e);
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
          <div className="omie-error-pill animate-shake">
            {error}
          </div>
        )}
        <div>
          <label className="omie-label">Nome do Produto</label>
          <input
            className="omie-input"
            placeholder="Ex: Vacina V10"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="omie-label">Categoria</label>
            <select
              className="omie-input"
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
            <label className="omie-label">Preço Unitário (R$)</label>
            <input
              type="number"
              step="0.01"
              className="omie-input"
              placeholder="0,00"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="omie-label">Quantidade</label>
            <input
              type="number"
              className="omie-input"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="omie-label">Fornecedor</label>
            <input
              className="omie-input"
              placeholder="Nome do fornecedor"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="omie-label">Data de Validade</label>
            <input
              type="date"
              className="omie-input"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <div>
            <label className="omie-label">SKU / Código</label>
            <input
              className="omie-input"
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
