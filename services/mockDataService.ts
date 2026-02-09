
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
  petId?: string;
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

// --- IN-MEMORY MOCK STORE (with LocalStorage persistence) ---
const loadFromStorage = (key: string, defaultData: any) => {
  try {
    const stored = localStorage.getItem(`vetpro_${key}`);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (e) {
    return defaultData;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`vetpro_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
};

const initialMockStore = {
  pets: [
    { id: '1', name: 'Rex', species: 'Cachorro', breed: 'Pastor Alemão', tutor: 'João Silva', tutorId: '1', weight: '30.5kg', birth_date: '2020-01-01', photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80', status: 'Ativo', total_spend: 1500.00, plan_name: 'Básico', visits_count: 5, last_visit: '2023-12-15' },
    { id: '2', name: 'Mia', species: 'Gato', breed: 'Siamês', tutor: 'João Silva', tutorId: '1', weight: '4.2kg', birth_date: '2021-06-15', photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80', status: 'Ativo', total_spend: 850.50, plan_name: 'Premium', visits_count: 3, last_visit: '2023-11-20' },
    { id: '3', name: 'Thor', species: 'Cachorro', breed: 'Bulldog', tutor: 'Maria Oliveira', tutorId: '2', weight: '12.0kg', birth_date: '2019-11-20', photo_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80', status: 'Ativo', total_spend: 200.00, plan_name: 'VIP', visits_count: 1, last_visit: '2024-01-10' },
    { id: '4', name: 'Luna', species: 'Gato', breed: 'Persa', tutor: 'Carlos Lima', tutorId: '3', weight: '3.8kg', birth_date: '2022-03-10', photo_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=150&q=80', status: 'Ativo', total_spend: 120.00, plan_name: 'Premium', visits_count: 2, last_visit: '2024-02-01' }
  ],
  appointments: [
    { id: '1', appointment_date: `${getToday()}T09:00:00`, pet_id: 1, pet_name: 'Rex', tutor_name: 'João Silva', type: 'consulta', status: 'agendado', vet_name: 'Dr. Ricardo', reason: 'Consulta de Rotina' },
    { id: '2', appointment_date: `${getToday()}T10:30:00`, pet_id: 2, pet_name: 'Mia', tutor_name: 'João Silva', type: 'vacina', status: 'concluido', vet_name: 'Dra. Fernanda', reason: 'Vacina V10' },
    { id: '3', appointment_date: `${getToday()}T14:00:00`, pet_id: 3, pet_name: 'Thor', tutor_name: 'Maria Oliveira', type: 'cirurgia', status: 'agendado', vet_name: 'Dr. Ricardo', reason: 'Castração' }
  ],
  sales: [
    { id: '1', sale_date: `${getToday()}T08:30:00`, total_amount: 150.00, payment_method: 'Pix', status: 'Concluído' },
    { id: '2', sale_date: `${getToday()}T09:15:00`, total_amount: 85.50, payment_method: 'Cartão Crédito', status: 'Concluído' }
  ],
  products: [
    { id: '1', name: 'Vacina V10', category: 'Vacinas', stock_quantity: 45, min_stock_level: 10, price: 85.00, sku: 'VAC-001' },
    { id: '2', name: 'Ração Royal Canin 10kg', category: 'Nutrição', stock_quantity: 24, min_stock_level: 15, price: 340.00, sku: 'NUT-002' },
    { id: '3', name: 'Bravecto Gatos', category: 'Fármacos', stock_quantity: 8, min_stock_level: 5, price: 180.00, sku: 'FAR-003' }
  ],
  tutors: [
    { id: '1', name: 'João Silva', phone: '(11) 99999-8888', email: 'joao@email.com' },
    { id: '2', name: 'Maria Oliveira', phone: '(11) 98888-7777', email: 'maria@email.com' },
    { id: '3', name: 'Carlos Lima', phone: '(11) 97777-6666', email: 'carlos@email.com' }
  ],
  surgeries: [
    { id: '1', pet_name: 'Thor', tutor_name: 'Maria Oliveira', procedure_name: 'Castração', vet_name: 'Dr. Ricardo', surgery_date: `${getToday()}T14:00:00`, status: 'agendado', checklist: { jejum: true, exames: true, termo: true, anestesia: false } }
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
  ] as MedicalRecord[],
  hospitalization: [
    { id: '1', name: 'Rex', species: 'Cachorro', tutor: 'João Silva', reason: 'Gastroenterite', admissionDate: '2023-12-14', nextMedication: '14:00', status: 'stable', bay: 'C-01' },
    { id: '2', name: 'Mia', species: 'Gato', tutor: 'João Silva', reason: 'Observação Pós-Cirúrgica', admissionDate: '2023-12-15', nextMedication: '16:00', status: 'recovering', bay: 'G-01' }
  ]
};

// Initialize or load from storage
let mockStore = {
  pets: loadFromStorage('pets', initialMockStore.pets),
  appointments: loadFromStorage('appointments', initialMockStore.appointments),
  sales: loadFromStorage('sales', initialMockStore.sales),
  products: loadFromStorage('products', initialMockStore.products),
  tutors: loadFromStorage('tutors', initialMockStore.tutors),
  surgeries: loadFromStorage('surgeries', initialMockStore.surgeries),
  medicalRecords: loadFromStorage('medicalRecords', initialMockStore.medicalRecords),
  hospitalization: loadFromStorage('hospitalization', initialMockStore.hospitalization)
};

class MockDataService {

  private calculateAge(birthDate: string): string {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  }

  // PETS
  async getPets(): Promise<Pet[]> {
    // Try API first, fallback to Local Store
    try {
      const response = await apiService.getPets();
      if (!response.data || response.data.length === 0) throw new Error("Empty API");
      
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
        photoUrl: p.photo_url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        tutorId: p.tutor_id?.toString()
      }));
    } catch (error) {
      console.warn('Backend unavailable, using Local Mock Data');
      return mockStore.pets.map((p: any) => ({
        ...p,
        age: this.calculateAge(p.birth_date),
        tutor: p.tutor || mockStore.tutors.find((t: any) => t.id === p.tutorId)?.name || 'N/A'
      }));
    }
  }

  async addPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    try {
        const apiPet = {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        weight: parseFloat(pet.weight.replace('kg', '')),
        birth_date: pet.birthDate || getToday(),
        tutor_id: pet.tutorId ? parseInt(pet.tutorId) : 1
        };
        const response = await apiService.createPet(apiPet);
        return { ...pet, id: response.data.id.toString() };
    } catch(e) {
        const newId = (mockStore.pets.length + 1).toString();
        const newPet = { ...pet, id: newId, status: 'Ativo', total_spend: 0, visits_count: 0 };
        mockStore.pets.push(newPet);
        saveToStorage('pets', mockStore.pets);
        return newPet as Pet;
    }
  }

  async updatePet(id: string, pet: Partial<Pet>): Promise<Pet> {
    try {
        const apiPet = {
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            weight: pet.weight ? parseFloat(pet.weight.replace('kg', '')) : undefined,
            birth_date: pet.birthDate,
            tutor_id: pet.tutorId ? parseInt(pet.tutorId) : undefined
        };
        const response = await apiService.updatePet(id, apiPet);
        return { ...pet, ...response.data, id: response.data.id.toString() };
    } catch(e) {
        const index = mockStore.pets.findIndex((p: any) => p.id === id);
        if (index !== -1) {
            mockStore.pets[index] = { ...mockStore.pets[index], ...pet };
            saveToStorage('pets', mockStore.pets);
            return mockStore.pets[index] as Pet;
        }
        throw new Error("Pet not found");
    }
  }

  // APPOINTMENTS
  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await apiService.getAppointments();
      if (!response.data || response.data.length === 0) throw new Error("Empty API");
      return response.data.map((a: any) => ({
        id: a.id.toString(),
        petId: a.pet_id?.toString(),
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
      console.warn('Backend unavailable, using Local Mock Data for Appointments');
      return mockStore.appointments.map((a: any) => ({
        id: a.id,
        petId: a.pet_id?.toString(),
        date: a.appointment_date.split('T')[0],
        time: new Date(a.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        pet: a.pet_name,
        species: mockStore.pets.find((p: any) => p.id === a.pet_id?.toString())?.species || 'N/A',
        tutor: a.tutor_name,
        service: a.reason || a.type,
        status: a.status,
        room: 'Sala 1',
        vet: a.vet_name || 'Dr. Ricardo',
        type: a.type
      }));
    }
  }

  async addAppointment(apt: Omit<Appointment, 'id'>): Promise<Appointment> {
    const newId = (mockStore.appointments.length + 1).toString();
    const newApt = {
        id: newId,
        appointment_date: `${apt.date}T${apt.time}:00`,
        pet_id: parseInt(apt.petId || '0'),
        pet_name: apt.pet,
        tutor_name: apt.tutor,
        type: apt.type,
        status: 'Agendado',
        vet_name: apt.vet,
        reason: apt.service
    };
    mockStore.appointments.push(newApt);
    saveToStorage('appointments', mockStore.appointments);
    return { ...apt, id: newId };
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
        console.warn('Backend unavailable, using Local Mock Data for Sales');
        return mockStore.sales.map((s: any) => ({
            id: s.id.toString(),
            date: new Date(s.sale_date).toLocaleString('pt-BR'),
            desc: `Venda #${s.id}`,
            value: Number(s.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            payment: s.payment_method,
            status: s.status
        }));
    }
  }

  async addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
     try {
         const apiSale = {
             total_amount: parseFloat(sale.value.replace('R$', '').replace('.', '').replace(',', '.').trim()),
             payment_method: sale.payment,
             status: sale.status
         };
         const response = await apiService.createSale(apiSale);
         return { ...sale, id: response.data.id.toString() };
     } catch (e) {
         console.warn('Backend unavailable, saving Sale locally');
         const newId = (mockStore.sales.length + 1).toString();
         const newSale = {
             id: newId,
             sale_date: new Date().toISOString(),
             total_amount: parseFloat(sale.value.replace('R$', '').replace('.', '').replace(',', '.').trim()),
             payment_method: sale.payment,
             status: sale.status
         };
         mockStore.sales.push(newSale);
         saveToStorage('sales', mockStore.sales);
         return { ...sale, id: newId };
     }
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
          console.warn('Backend unavailable, using Local Mock Data for Inventory');
          return mockStore.products.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            category: p.category,
            stock: p.stock_quantity,
            minStock: p.min_stock_level,
            price: Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            status: p.stock_quantity <= p.min_stock_level ? (p.stock_quantity === 0 ? 'critical' : 'warning') : 'ok',
            sku: p.sku
          }));
      }
  }

  async getInventoryForecast(): Promise<any> {
      try {
          const response = await apiService.getInventoryForecast();
          // If response.data is just the JSON from Vertex AI
          return response.data;
      } catch (e) {
          console.warn("Backend unavailable, using Local Mock Data for Forecast");
          // Simulate API call to AI service
          // In a real scenario, this would call apiService.getInventoryForecast()
          const criticalItems = mockStore.products.filter((p: any) => p.stock_quantity <= p.min_stock_level);
          
          if (criticalItems.length > 0) {
              return {
                  predictions: criticalItems.map((p: any) => ({
                      name: p.name,
                      reason: `Estoque atual (${p.stock_quantity}) abaixo do mínimo (${p.min_stock_level}). Alta saída prevista.`
                  }))
              };
          }
          
          return { predictions: [] };
      }
  }

  // MEDICAL RECORDS
  async getMedicalRecords(petId: string): Promise<MedicalRecord[]> {
      try {
          const response = await apiService.getMedicalRecords(petId);
          return response.data.map((r: any) => ({
              id: r.id.toString(),
              date: r.date.split('T')[0],
              petId: r.pet_id.toString(),
              vetName: r.vet_name || 'Veterinário',
              subjective: r.subjective,
              objective: r.objective,
              assessment: r.assessment,
              plan: r.plan,
              diagnosis: r.diagnosis,
              urgency: r.urgency
          }));
      } catch (e) {
          console.warn('Backend unavailable, using Local Mock Data for Medical Records');
          return mockStore.medicalRecords.filter((r: any) => r.petId === petId);
      }
  }

  async addMedicalRecord(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
      try {
          const apiRecord = {
              petId: record.petId,
              vetId: 1, // Default
              date: record.date,
              subjective: record.subjective,
              objective: record.objective,
              assessment: record.assessment,
              plan: record.plan,
              diagnosis: record.diagnosis,
              urgency: record.urgency
          };
          const response = await apiService.createMedicalRecord(apiRecord);
          const r = response.data;
          return {
              id: r.id.toString(),
              date: r.date.split('T')[0],
              petId: r.pet_id.toString(),
              vetName: 'Você',
              subjective: r.subjective,
              objective: r.objective,
              assessment: r.assessment,
              plan: r.plan,
              diagnosis: r.diagnosis,
              urgency: r.urgency
          };
      } catch (e) {
          const newId = (mockStore.medicalRecords.length + 1).toString();
          const newRecord = { ...record, id: newId };
          mockStore.medicalRecords.push(newRecord);
          saveToStorage('medicalRecords', mockStore.medicalRecords);
          return newRecord;
      }
  }

  // HOSPITALIZATION
  async getHospitalization(): Promise<any[]> {
      try {
          const response = await apiService.getHospitalizations();
          return response.data.map((h: any) => ({
              id: h.id.toString(),
              name: h.pet_name,
              species: h.species,
              tutor: h.tutor_name,
              reason: h.reason,
              admissionDate: h.admission_date.split('T')[0],
              nextMedication: h.next_medication_time ? new Date(h.next_medication_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '--:--',
              status: h.status,
              bay: h.bay
          }));
      } catch (e) {
          return mockStore.hospitalization;
      }
  }
}

export const mockDataService = new MockDataService();
