
import { apiService } from './api';

// Types
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
      console.error('Error fetching pets, falling back to empty list', error);
      return [];
    }
  }

  async addPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    try {
        // Map UI Pet to API Pet
        // We need tutor_id. The UI passes tutor name. This is a gap.
        // For now, we'll try to find a tutor or use a default.
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
        console.error('Error adding pet', e);
        throw e;
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
        console.error('Error updating pet', e);
        throw e;
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
        console.error('Error fetching appointments', error);
        return [];
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
          console.error('Error adding appointment', e);
          throw e;
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
        console.error('Error fetching sales', e);
        return [];
    }
  }

  async addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
      try {
          // Simplification for UI demo
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
          console.error('Error adding sale', e);
          throw e;
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
          console.error('Error fetching inventory', e);
          return [];
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
          console.error('Error adding product', e);
          throw e;
      }
  }

  // HELPERS
  async getVets(): Promise<Vet[]> {
      try {
          const response = await apiService.getVets();
          return response.data.map((v: any) => ({
              id: v.id.toString(),
              name: v.name,
              specialty: 'Geral' // Mocked as not in Users table yet
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
              pets: [] // Populate if needed
          }));
      } catch (e) {
          return [];
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
          throw e;
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
          console.error('Error fetching surgeries', e);
          return [];
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
          console.error('Error adding surgery', e);
          throw e;
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
