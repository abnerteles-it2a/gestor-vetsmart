import axios from 'axios';

const API_URL = '/api'; // O proxy do Vite redirecionará para http://localhost:3001

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vetsmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento global de erros (ex: 403 Forbidden)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Sessão expirada ou inválida. Deslogando usuário...');
      localStorage.removeItem('vetsmart_token');
      localStorage.removeItem('vetsmart_user');
      // Opcional: Redirecionar para login se estiver no browser
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),

  // Users / Vets
  getVets: () => api.get('/users/vets'),

  // Pets
  getPets: () => api.get('/pets'),
  createPet: (data: any) => api.post('/pets', data),
  updatePet: (id: string, data: any) => api.put(`/pets/${id}`, data),

  // Tutors
  getTutors: () => api.get('/tutors'),
  createTutor: (data: any) => api.post('/tutors', data),

  // Appointments
  getAppointments: () => api.get('/appointments'),
  createAppointment: (data: any) => api.post('/appointments', data),

  // Surgeries
  getSurgeries: () => api.get('/surgeries'),
  createSurgery: (data: any) => api.post('/surgeries', data),

  // Products (Inventory)
  getProducts: () => api.get('/products'),
  createProduct: (data: any) => api.post('/products', data),

  // Sales
  getSales: () => api.get('/sales'),
  createSale: (data: any) => api.post('/sales', data),

  // Campaigns
  getCampaigns: () => api.get('/campaigns'),
  createCampaign: (data: any) => api.post('/campaigns', data),

  // Dashboard
  getDashboardKPIs: () => api.get('/dashboard/kpis'),

  // Hospitalization
  getHospitalizations: () => api.get('/hospitalization'),
  createHospitalization: (data: any) => api.post('/hospitalization', data),
  updateHospitalization: (id: string, data: any) => api.put(`/hospitalization/${id}`, data),

  // Plans
  getPlans: () => api.get('/plans'),

  // AI Features
  getInventoryForecast: () => api.get('/ai/inventory-forecast'),
  getSmartCampaigns: (userInstruction?: string) => api.get('/ai/smart-campaigns', { params: { userInstruction } }),
  suggestTreatment: (data: any) => api.post('/ai/suggest-treatment', data),
  getHospitalizationRound: (patients: any[]) => api.post('/ai/hospitalization-round', { patients }),
  getFinancialInsights: () => api.get('/ai/financial-insights'),
  structureClinicalNotes: (data: any) => api.post('/ai/structure-clinical-notes', data),
  getCarePlan: (data: any) => api.post('/ai/care-plan', data),
  analyzeImage: (data: any) => api.post('/ai/analyze-image', data),
};

export default api;
