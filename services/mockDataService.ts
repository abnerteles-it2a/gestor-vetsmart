
import { apiService } from './api';
import { Surgery } from '../types';

// Types
export interface MedicalRecord {
  id: string;
  date: string;
  petId: string;
  vetName: string;
  subjective: string; // S
  objective: string;  // O
  assessment: string; // A
  plan: string;       // P
  diagnosis?: string;
  urgency?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  tutor: string;
  age: string;
  weight: string;
  status: string;
  phone: string;
  email: string;
  visitsThisYear: number;
  lastVisit: string;
  nextAppointment: string | null;
  totalSpend: string;
  plan: string;
  birthDate?: string;
  allergies?: string;
  photoUrl?: string;
  medicalHistory?: MedicalRecord[];
  tutorId?: string;
}

export interface Appointment {
  id?: string;
  time: string;
  pet: string;
  species: string;
  tutor: string;
  service: string;
  status: string;
  room: string;
  vet: string;
  type: string;
  date?: string;
  dateLabel?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  date: string;
  desc: string;
  value: string;
  payment: string;
  status: string;
  customer?: string;
  serviceType?: string;
}

export interface InventoryItem {
  id?: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: string;
  status: 'critical' | 'warning' | 'ok';
  supplier?: string;
  expirationDate?: string;
  sku?: string;
}

export interface Tutor {
  id: string;
  name: string;
  phone: string;
  email: string;
  pets: string[]; // Pet IDs
}

export interface Vet {
  id: string;
  name: string;
  specialty: string;
}

// Date Helpers
const getToday = () => new Date().toISOString().split('T')[0];

// --- IN-MEMORY MOCK STORE ---
// This store allows the app to work without a backend (Demo Mode)
const mockStore = {
  pets: [
    { id: '1', name: 'Thor', species: 'Cachorro', breed: 'Golden Retriever', tutor: 'Ana Silva', weight: '25kg', birth_date: '2020-05-10', photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80', status: 'Ativo' },
    { id: '2', name: 'Luna', species: 'Gato', breed: 'Siamês', tutor: 'Carlos Oliveira', weight: '4kg', birth_date: '2019-08-15', photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80', status: 'Ativo' },
    { id: '3', name: 'Max', species: 'Cachorro', breed: 'Bulldog', tutor: 'Roberto Santos', weight: '12kg', birth_date: '2021-02-20', photo_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80', status: 'Ativo' }
  ],
  appointments: [
    { id: '1', appointment_date: `${getToday()}T09:00:00`, pet_name: 'Thor', tutor_name: 'Ana Silva', type: 'Consulta', status: 'Agendado', vet_name: 'Dr. Ricardo', reason: 'Vacinação' },
    { id: '2', appointment_date: `${getToday()}T10:30:00`, pet_name: 'Luna', tutor_name: 'Carlos Oliveira', type: 'Exame', status: 'Em Andamento', vet_name: 'Dra. Fernanda', reason: 'Check-up' }
  ],
  sales: [
    { id: '1', sale_date: `${getToday()}T08:30:00`, total_amount: 150.00, payment_method: 'Pix', status: 'Concluído' },
    { id: '2', sale_date: `${getToday()}T09:15:00`, total_amount: 85.50, payment_method: 'Cartão Crédito', status: 'Concluído' }
  ],
  products: [
    { id: '1', name: 'Vacina V10', category: 'Vacinas', stock_quantity: 45, min_stock_level: 10, price: 80.00, sku: 'VAC-001' },
    { id: '2', name: 'Antibiótico Plus', category: 'Medicamentos', stock_quantity: 8, min_stock_level: 15, price: 45.90, sku: 'MED-002' },
    { id: '3', name: 'Ração Premium 15kg', category: 'Alimentos', stock_quantity: 12, min_stock_level: 5, price: 280.00, sku: 'ALI-003' }
  ],
  tutors: [
    { id: '1', name: 'Ana Silva', phone: '(11) 98765-4321', email: 'ana@email.com' },
    { id: '2', name: 'Carlos Oliveira', phone: '(11) 91234-5678', email: 'carlos@email.com' }
  ],
  surgeries: [
    { id: '1', pet_name: 'Thor', tutor_name: 'Ana Silva', procedure_name: 'Castração', vet_name: 'Dr. Ricardo', surgery_date: `${getToday()}T14:00:00`, status: 'Agendado', checklist: { jejum: true, exames: true, termo: true, anestesia: false } }
  ],
  medicalRecords: [
    {
      id: '1',
      date: '2023-12-15',
      petId: '1',
      vetName: 'Dr. Ricardo',
      subjective: 'Tutor relata vômito há 2 dias.',
      objective: 'Desidratação leve, dor abdominal.',
      assessment: 'Gastroenterite',
      plan: 'Fluidoterapia e antiemético.',
      diagnosis: 'Gastroenterite',
      urgency: 'Média'
    }
  ] as MedicalRecord[]
};

class MockDataService {

  // PETS
  async getPets(): Promise<Pet[]> {
    try {
      const response = await apiService.getPets();
      return response.data.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        species: p.species,
        breed: p.breed,
        tutor: p.tutor_name || 'N/A',
        age: this.calculateAge(p.birth_date),
        weight: `${p.weight}kg`,
        status: 'Ativo',
        phone: p.phone || '(11) 99999-9999',
        email: p.email || 'email@exemplo.com',
        visitsThisYear: p.visits_count || 0,
        lastVisit: p.last_visit || getToday(),
        nextAppointment: p.next_appointment || null,
        totalSpend: Number(p.total_spend || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        plan: p.plan_name || 'Sem Plano',
        photoUrl: p.photo_url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
      }));
    } catch (error) {
      console.warn('Backend unavailable, returning empty list for Pets');
      return [];
    }
  }

  async addPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    const apiPet = {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      weight: parseFloat(pet.weight.replace('kg', '')),
      birth_date: pet.birthDate || getToday(),
      tutor_id: pet.tutorId ? parseInt(pet.tutorId) : 1
    };
    const response = await apiService.createPet(apiPet);
    const newPet = response.data;
    return {
      ...pet,
      id: newPet.id.toString()
    };
  }

  async updatePet(id: string, pet: Partial<Pet>): Promise<Pet> {
    const apiPet = {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      weight: pet.weight ? parseFloat(pet.weight.replace('kg', '')) : undefined,
      birth_date: pet.birthDate,
      allergies: pet.allergies
    };
    const response = await apiService.updatePet(id, apiPet);
    const updatedPet = response.data;
    return {
      ...pet,
      id: updatedPet.id.toString(),
      age: pet.birthDate ? this.calculateAge(pet.birthDate) : (pet.age || 'N/A'),
    } as Pet;
  }

  // APPOINTMENTS
  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await apiService.getAppointments();
      return response.data.map((a: any) => ({
        id: a.id.toString(),
        date: a.appointment_date.split('T')[0],
        time: new Date(a.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        pet: a.pet_name,
        species: a.species || 'N/A',
        tutor: a.tutor_name,
        service: a.reason || a.type,
        status: a.status,
        room: 'Sala 1',
        vet: a.vet_name || 'Dr. Ricardo',
        type: a.type
      }));
    } catch (error) {
      console.warn('Backend unavailable, returning empty appointments');
      return [];
    }
  }

  async addAppointment(apt: Omit<Appointment, 'id'>): Promise<Appointment> {
    const apiApt = {
      pet_id: parseInt(apt.pet), // Expecting ID here in a real scenario
      vet_id: 1,
      appointment_date: `${apt.date}T${apt.time}:00`,
      type: apt.type,
      reason: apt.service
    };
    const response = await apiService.createAppointment(apiApt);
    const newApt = response.data;
    return {
      ...apt,
      id: newApt.id.toString()
    };
  }

  // SALES
  async getSales(): Promise<Sale[]> {
    try {
      const response = await apiService.getSales();
      return response.data.map((s: any) => ({
        id: s.id.toString(),
        date: new Date(s.sale_date).toLocaleString('pt-BR'),
        desc: `Venda #${s.id}`,
        value: Number(s.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        payment: s.payment_method,
        status: s.status
      }));
    } catch (e) {
      return [];
    }
  }

  async addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
    const apiSale = {
      tutor_id: 1, // Defaulting for demo
      total_amount: parseFloat(sale.value.replace('R$', '').replace('.', '').replace(',', '.').trim()),
      payment_method: sale.payment,
      status: sale.status,
      items: []
    };
    const response = await apiService.createSale(apiSale);
    const newSale = response.data;
    return {
      ...sale,
      id: newSale.id.toString()
    };
  }

  // INVENTORY
  async getInventory(): Promise<InventoryItem[]> {
    try {
      const response = await apiService.getProducts();
      return response.data.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        category: p.category,
        stock: p.stock_quantity,
        minStock: p.min_stock_level,
        price: Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        status: p.stock_quantity <= p.min_stock_level ? (p.stock_quantity === 0 ? 'critical' : 'warning') : 'ok',
        sku: p.sku
      }));
    } catch (e) {
      return [];
    }
  }

  async addItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const apiProduct = {
      name: item.name,
      category: item.category,
      price: parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()),
      stock_quantity: item.stock,
      min_stock_level: item.minStock
    };
    const response = await apiService.createProduct(apiProduct);
    return { ...item, id: response.data.id.toString() };
  }

  // HELPERS
  async getVets(): Promise<Vet[]> {
    try {
      const response = await apiService.getVets();
      return response.data.map((v: any) => ({
        id: v.id.toString(),
        name: v.name,
        specialty: v.role === 'admin' ? 'Diretor Clínico' : 'Veterinário'
      }));
    } catch (e) {
      return [];
    }
  }

  async getTutors(): Promise<Tutor[]> {
    try {
      const response = await apiService.getTutors();
      return response.data.map((t: any) => ({
        id: t.id.toString(),
        name: t.name,
        phone: t.phone,
        email: t.email,
        pets: []
      }));
    } catch (e) {
      return [];
    }
  }

  async addTutor(tutor: Omit<Tutor, 'id' | 'pets'>): Promise<Tutor> {
    const response = await apiService.createTutor(tutor);
    return {
      ...tutor,
      id: response.data.id.toString(),
      pets: []
    };
  }

  // SURGERIES
  async getSurgeries(): Promise<Surgery[]> {
    try {
      const response = await apiService.getSurgeries();
      return response.data.map((s: any) => ({
        id: s.id.toString(),
        petName: s.pet_name,
        tutorName: s.tutor_name,
        procedure: s.procedure_name,
        vetName: s.vet_name,
        date: s.surgery_date.split('T')[0],
        time: new Date(s.surgery_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: s.status,
        checklist: s.checklist || { jejum: false, exames: false, termo: false, anestesia: false }
      }));
    } catch (e) {
      return [];
    }
  }

  async addSurgery(surgery: Surgery): Promise<Surgery> {
    const apiSurgery = {
      pet_id: parseInt(surgery.id) || 1, // Use surgery.petId if available
      vet_id: 1,
      procedure_name: surgery.procedure,
      surgery_date: `${surgery.date}T${surgery.time}:00`,
      status: surgery.status,
      checklist: surgery.checklist
    };
    const response = await apiService.createSurgery(apiSurgery);
    return { ...surgery, id: response.data.id.toString() };
  }

  // HOSPITALIZATION
  async getHospitalization(): Promise<any[]> {
    try {
      const response = await apiService.getHospitalizations();
      return response.data.map((p: any) => ({
        id: p.id.toString(),
        name: p.pet_name,
        species: p.species,
        tutor: p.tutor_name,
        reason: p.reason,
        admissionDate: new Date(p.admission_date).toLocaleString('pt-BR'),
        nextMedication: p.next_medication_time ? new Date(p.next_medication_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        status: p.status,
        bay: p.bay
      }));
    } catch (e) {
      return [];
    }
  }

  async addHospitalization(data: any): Promise<any> {
    const response = await apiService.createHospitalization(data);
    return response.data;
  }

  async updateHospitalization(id: string, data: any): Promise<any> {
    const response = await apiService.updateHospitalization(id, data);
    return response.data;
  }

  // AI
  async getInventoryForecast(): Promise<any> {
    try {
      const response = await apiService.getInventoryForecast();
      return response.data;
    } catch (e) {
      return { predictions: [] };
    }
  }

  // CAMPAIGNS
  async getCampaigns(): Promise<any[]> {
    try {
      const response = await apiService.getCampaigns();
      return response.data.map((c: any) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        target: c.target_audience,
        sent: c.metrics?.sent || 0,
        opened: c.metrics?.opened || 0,
        converted: c.metrics?.converted || 0,
        roi: c.metrics?.roi || '-',
        date: c.start_date ? new Date(c.start_date).toLocaleDateString('pt-BR') : 'Rascunho'
      }));
    } catch (e) {
      return [];
    }
  }

  async getSmartCampaigns(): Promise<any> {
    try {
      const response = await apiService.getSmartCampaigns();
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  // MEDICAL RECORDS
  async getMedicalRecords(petId: string): Promise<MedicalRecord[]> {
    try {
      // In a real app, we would have a specific endpoint
      const response = await apiService.getPets(); // Filtered by petId would be better
      const pet = response.data.find((p: any) => p.id.toString() === petId);
      return pet?.medical_history ? JSON.parse(pet.medical_history) : [];
    } catch (e) {
      return [];
    }
  }

  async saveMedicalRecord(record: Omit<MedicalRecord, 'id' | 'date'>): Promise<MedicalRecord> {
    // Update pet's medical history
    const response = await apiService.updatePet(record.petId, { medical_history: JSON.stringify(record) });
    return { ...record, id: Date.now().toString(), date: getToday() };
  }

  private calculateAge(birthDate: string): string {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    return `${years} anos`;
  }
}

export const mockDataService = new MockDataService();
