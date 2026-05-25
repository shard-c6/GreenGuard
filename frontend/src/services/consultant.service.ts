import axios from 'axios';

const CONSULTANT_API_BASE = process.env.NEXT_PUBLIC_CONSULTANT_API_URL || 'http://localhost:5002/api';
const CONSULTANT_API_KEY = process.env.NEXT_PUBLIC_CONSULTANT_API_KEY || '';

const consultantApi = axios.create({
  baseURL: CONSULTANT_API_BASE,
  timeout: 60000, // Longer timeout for AI generation
  headers: {
    'x-api-key': CONSULTANT_API_KEY,
  },
});

// Request interceptor — attach JWT
consultantApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
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
   * Gets expert RAG advice from Gemini for a specific plant, supporting an optional image context file.
   */
  getExpertAdvice: async (
    scientificName: string, 
    query: string, 
    history: { role: string, content: string }[] = [],
    imageFile: File | null = null
  ) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('scientificName', scientificName);
      formData.append('query', query);
      formData.append('history', JSON.stringify(history));
      formData.append('image', imageFile);

      const response = await consultantApi.post('/consultant/expert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      const response = await consultantApi.post('/consultant/expert', {
        scientificName,
        query,
        history,
      });
      return response.data;
    }
  },
};

export default consultantApi;
