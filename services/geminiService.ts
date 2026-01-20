import { apiService } from "./api";
import { AIConsultationResponse } from "../types";

/**
 * Transforms raw vet notes into structured clinical data using Vertex AI via Backend.
 */
export const processClinicalNotes = async (
  pet: any, 
  history: string, 
  rawNotes: string
): Promise<AIConsultationResponse> => {
  try {
    const response = await apiService.structureClinicalNotes({ pet, history, rawNotes });
    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};

/**
 * Suggests a preventive care plan based on pet profile using Vertex AI.
 */
export const suggestCarePlan = async (pet: any): Promise<any> => {
  try {
    const response = await apiService.getCarePlan({ 
        species: pet.species, 
        breed: pet.breed, 
        age: pet.age 
    });
    return response.data;
  } catch (error) {
    console.error("AI Plan Error:", error);
    throw error;
  }
};
