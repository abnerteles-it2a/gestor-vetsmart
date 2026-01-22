
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
  structured_soap: {
    s: string;
    o: string;
    a: string;
    p: string;
  };
  suggested_billing: {
    item: string;
    confidence: string;
    reason: string;
  }[];
  prescription: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  owner_instructions: {
    title: string;
    text: string;
    whatsapp_format: string;
  };
  follow_up_suggestion?: string;
  
  // Legacy/Optional fields to maintain compatibility if needed
  diagnosis?: string;
  treatment?: string;
  formattedNotes?: string;
  hypotheses?: string[];
  suggestedExams?: string[];
  ownerInstructions?: string;
}

export interface Surgery {
  id: string;
  petName: string;
  tutorName: string;
  procedure: string;
  vetName: string;
  date: string;
  time: string;
  status: string;
  checklist: {
    jejum: boolean;
    exames: boolean;
    termo: boolean;
    anestesia: boolean;
  };
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
