
export enum PetSpecies {
  DOG = 'Cão',
  CAT = 'Gato',
  BIRD = 'Ave',
  OTHER = 'Outro'
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  weight: number;
  tutorId: string;
}

export interface Tutor {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface ConsultationRecord {
  id: string;
  petId: string;
  date: string;
  rawNotes: string;
  formattedNotes?: string;
  diagnosis?: string;
  recommendations?: string;
  aiGenerated: boolean;
}

export interface AIConsultationResponse {
  formattedNotes: string;
  hypotheses: string[];
  suggestedExams: string[];
  ownerInstructions: string;
}

export interface CarePlan {
  id: string;
  petId: string;
  title: string;
  items: {
    description: string;
    dueDate: string;
    type: 'VACCINE' | 'DEWORM' | 'GROOMING' | 'CHECKUP';
  }[];
}
