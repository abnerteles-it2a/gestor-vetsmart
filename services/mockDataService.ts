
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
        status: 'Ativo', // Mocked
        phone: '(11) 99999-9999', // Would need join
        email: 'email@exemplo.com', // Would need join
        visitsThisYear: Math.floor(Math.random() * 10), // Mocked
        lastVisit: getToday(), // Mocked
        nextAppointment: null,
        totalSpend: 'R$ 0,00', // Mocked
        plan: 'Básico', // Mocked
        photoUrl: p.photo_url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
      }));
    } catch (error) {
      console.warn('Backend unavailable, using mock data for Pets');
      return mockStore.pets.map(p => {
        // Find associated tutor to get real mock phone
        const tutor = mockStore.tutors.find(t => t.name === p.tutor);
        
        return {
          id: p.id,
          name: p.name,
          species: p.species,
          breed: p.breed,
          tutor: p.tutor,
          age: this.calculateAge(p.birth_date),
          weight: p.weight,
          status: p.status,
          phone: tutor ? tutor.phone : '(11) 99999-9999',
          email: tutor ? tutor.email : 'mock@email.com',
          visitsThisYear: 5,
          lastVisit: getToday(),
          nextAppointment: null,
          totalSpend: 'R$ 0,00',
          plan: 'Premium',
          photoUrl: p.photo_url
        };
      });
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
            tutor_id: 1 // Default to first tutor for demo/ MVP
        };
        const response = await apiService.createPet(apiPet);
        const newPet = response.data;
        return {
            ...pet,
            id: newPet.id.toString()
        };
    } catch (e) {
        console.warn('Backend unavailable, adding to mock store');
        const newId = (mockStore.pets.length + 1).toString();
        const newPet = {
          id: newId,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          tutor: pet.tutor || 'Tutor Mock',
          weight: pet.weight,
          birth_date: pet.birthDate || getToday(),
          photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80',
          status: 'Ativo'
        };
        mockStore.pets.push(newPet);
        return { ...pet, id: newId };
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
            allergies: pet.allergies
        };
        const response = await apiService.updatePet(id, apiPet);
        const updatedPet = response.data;
        return {
            ...pet,
            id: updatedPet.id.toString(),
            age: pet.birthDate ? this.calculateAge(pet.birthDate) : (pet.age || 'N/A'),
        } as Pet;
    } catch (e) {
        console.warn('Backend unavailable, updating mock store');
        const index = mockStore.pets.findIndex(p => p.id === id);
        if (index !== -1) {
            mockStore.pets[index] = { ...mockStore.pets[index], ...pet };
            return { ...mockStore.pets[index] } as any;
        }
        return pet as Pet;
    }
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
            room: 'Sala 1', // Mocked
            vet: a.vet_name || 'Dr. Ricardo',
            type: a.type
        }));
    } catch (error) {
        console.warn('Backend unavailable, using mock appointments');
        return mockStore.appointments.map(a => ({
            id: a.id,
            date: a.appointment_date.split('T')[0],
            time: new Date(a.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            pet: a.pet_name,
            species: 'Canino',
            tutor: a.tutor_name,
            service: a.reason,
            status: a.status,
            room: 'Sala 1',
            vet: a.vet_name,
            type: a.type
        }));
    }
  }

  async addAppointment(apt: Omit<Appointment, 'id'>): Promise<Appointment> {
      try {
          const apiApt = {
              pet_id: 1, // Mocked/Default for MVP
              vet_id: 1, // Mocked/Default
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
      } catch (e) {
          console.warn('Backend unavailable, adding mock appointment');
          const newId = (mockStore.appointments.length + 1).toString();
          mockStore.appointments.push({
              id: newId,
              appointment_date: `${apt.date}T${apt.time}:00`,
              pet_name: apt.pet,
              tutor_name: apt.tutor,
              type: apt.type,
              status: apt.status,
              vet_name: apt.vet,
              reason: apt.service
          });
          return { ...apt, id: newId };
      }
  }

  // SALES
  async getSales(): Promise<Sale[]> {
    try {
        const response = await apiService.getSales();
        return response.data.map((s: any) => ({
            id: s.id.toString(),
            date: new Date(s.sale_date).toLocaleString('pt-BR'),
            desc: `Venda #${s.id}`, // Detail missing in list
            value: Number(s.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            payment: s.payment_method,
            status: s.status
        }));
    } catch (e) {
        console.warn('Backend unavailable, using mock sales');
        return mockStore.sales.map(s => ({
            id: s.id,
            date: new Date(s.sale_date).toLocaleString('pt-BR'),
            desc: `Venda #${s.id}`,
            value: s.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            payment: s.payment_method,
            status: s.status
        }));
    }
  }

  async addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
      try {
          const apiSale = {
              user_id: 1,
              tutor_id: 1,
              total_amount: parseFloat(sale.value.replace('R$', '').replace('.', '').replace(',', '.').trim()),
              payment_method: sale.payment,
              status: sale.status,
              items: [] // UI doesn't pass items yet in this call
          };
          const response = await apiService.createSale(apiSale);
          const newSale = response.data;
          return {
              ...sale,
              id: newSale.id.toString()
          };
      } catch (e) {
          console.warn('Backend unavailable, adding mock sale');
          const newId = (mockStore.sales.length + 1).toString();
          mockStore.sales.push({
              id: newId,
              sale_date: new Date().toISOString(),
              total_amount: parseFloat(sale.value.replace('R$', '').replace('.', '').replace(',', '.').trim()),
              payment_method: sale.payment,
              status: sale.status
          });
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
          console.warn('Backend unavailable, using mock inventory');
          return mockStore.products.map(p => ({
              id: p.id,
              name: p.name,
              category: p.category,
              stock: p.stock_quantity,
              minStock: p.min_stock_level,
              price: p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
              status: p.stock_quantity <= p.min_stock_level ? (p.stock_quantity === 0 ? 'critical' : 'warning') : 'ok',
              sku: p.sku
          }));
      }
  }

  async addItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
      try {
          const apiProduct = {
              name: item.name,
              category: item.category,
              price: parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()),
              stock_quantity: item.stock,
              min_stock_level: item.minStock
          };
          const response = await apiService.createProduct(apiProduct);
          const newProduct = response.data;
          return {
              ...item,
              id: newProduct.id.toString()
          };
      } catch (e) {
          console.warn('Backend unavailable, adding mock product');
          const newId = (mockStore.products.length + 1).toString();
          mockStore.products.push({
              id: newId,
              name: item.name,
              category: item.category,
              stock_quantity: item.stock,
              min_stock_level: item.minStock,
              price: parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()),
              sku: item.sku
          });
          return { ...item, id: newId };
      }
  }

  // HELPERS
  async getVets(): Promise<Vet[]> {
      try {
          const response = await apiService.getVets();
          return response.data.map((v: any) => ({
              id: v.id.toString(),
              name: v.name,
              specialty: 'Geral' 
          }));
      } catch (e) {
          return [
            { id: '1', name: 'Dr. Ricardo', specialty: 'Cirurgião' },
            { id: '2', name: 'Dra. Fernanda', specialty: 'Clínica Geral' }
          ];
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
          return mockStore.tutors.map(t => ({...t, pets: []}));
      }
  }

  async addTutor(tutor: Omit<Tutor, 'id' | 'pets'>): Promise<Tutor> {
      try {
          const response = await apiService.createTutor(tutor);
          return {
              ...tutor,
              id: response.data.id.toString(),
              pets: []
          };
      } catch (e) {
          const newId = (mockStore.tutors.length + 1).toString();
          mockStore.tutors.push({ id: newId, ...tutor });
          return { ...tutor, id: newId, pets: [] };
      }
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
          console.warn('Backend unavailable, using mock surgeries');
          return mockStore.surgeries.map(s => ({
              id: s.id,
              petName: s.pet_name,
              tutorName: s.tutor_name,
              procedure: s.procedure_name,
              vetName: s.vet_name,
              date: s.surgery_date.split('T')[0],
              time: new Date(s.surgery_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              status: s.status,
              checklist: s.checklist
          }));
      }
  }

  async addSurgery(surgery: Surgery): Promise<Surgery> {
      try {
          const apiSurgery = {
              pet_id: 1, // Mocked
              vet_id: 1, // Mocked
              procedure_name: surgery.procedure,
              surgery_date: `${surgery.date}T${surgery.time}:00`,
              status: surgery.status,
              checklist: surgery.checklist
          };
          const response = await apiService.createSurgery(apiSurgery);
          const newSurgery = response.data;
          return {
              ...surgery,
              id: newSurgery.id.toString()
          };
      } catch (e) {
          console.warn('Backend unavailable, adding mock surgery');
          const newId = (mockStore.surgeries.length + 1).toString();
          mockStore.surgeries.push({
              id: newId,
              pet_name: surgery.petName,
              tutor_name: surgery.tutorName,
              procedure_name: surgery.procedure,
              vet_name: surgery.vetName,
              surgery_date: `${surgery.date}T${surgery.time}:00`,
              status: surgery.status,
              checklist: surgery.checklist
          });
          return { ...surgery, id: newId };
      }
  }

  // AI
  async getInventoryForecast(): Promise<any> {
    try {
        const response = await apiService.getInventoryForecast();
        return response.data;
    } catch (e) {
        console.error('Error fetching AI forecast', e);
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
      // In a real app, this would call apiService.getMedicalRecords(petId)
      // For now, return from mockStore
      return mockStore.medicalRecords.filter(r => r.petId === petId);
    } catch (e) {
      console.warn('Backend unavailable, using mock medical records');
      return [];
    }
  }

  async saveMedicalRecord(record: Omit<MedicalRecord, 'id' | 'date'>): Promise<MedicalRecord> {
    try {
      // In a real app, this would call apiService.createMedicalRecord(record)
      // For now, add to mockStore
      const newId = (mockStore.medicalRecords.length + 1).toString();
      const newRecord = {
        ...record,
        id: newId,
        date: getToday()
      };
      mockStore.medicalRecords.push(newRecord);
      console.log('Medical Record Saved:', newRecord);
      return newRecord;
    } catch (e) {
      console.warn('Backend unavailable, adding mock medical record');
      const newId = (mockStore.medicalRecords.length + 1).toString();
      const newRecord = {
        ...record,
        id: newId,
        date: getToday()
      };
      mockStore.medicalRecords.push(newRecord);
      return newRecord;
    }
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
