import axios from 'axios';

const CONSULTANT_API_BASE = process.env.NEXT_PUBLIC_CONSULTANT_API_URL || 'http://localhost:5002/api';

const consultantApi = axios.create({
  baseURL: CONSULTANT_API_BASE,
  timeout: 60000, // Longer timeout for AI generation
});

export const floraConsultantApi = {
  /**
   * Identifies a plant image via the Consultant microservice (PlantNet).
   */
  identify: async (formData: FormData) => {
    const response = await consultantApi.post('/consultant/identify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Gets expert RAG advice from Gemini for a specific plant.
   */
  getExpertAdvice: async (scientificName: string, query: string, history: { role: string, content: string }[] = []) => {
    const response = await consultantApi.post('/consultant/expert', {
      scientificName,
      query,
      history,
    });
    return response.data;
  },
};

export default consultantApi;
