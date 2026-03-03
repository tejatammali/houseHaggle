import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Property API
export const propertyAPI = {
  validateAddress: async (address) => {
    const response = await api.post('/properties/validate-address', { address });
    return response.data;
  },

  getPropertyData: async (address, listingPrice) => {
    const response = await api.post('/properties/property-data', {
      address,
      listing_price: listingPrice,
    });
    return response.data;
  },
};

// Analysis API
export const analysisAPI = {
  saveAnalysis: async (userId, propertyData, questionnaireData, report = null) => {
    const response = await api.post('/analysis/save-analysis', {
      user_id: userId,
      property_data: propertyData,
      questionnaire_data: questionnaireData,
      report: report,
    });
    return response.data;
  },

  generateReport: async (propertyData, questionnaireData) => {
    const response = await api.post('/analysis/generate-report', {
      property_data: propertyData,
      questionnaire_data: questionnaireData,
    });
    return response.data;
  },

  getUserAnalyses: async (userId) => {
    const response = await api.get(`/analysis/user-analyses/${userId}`);
    return response.data;
  },

  getAnalysis: async (analysisId) => {
    const response = await api.get(`/analysis/analysis/${analysisId}`);
    return response.data;
  },

  deleteAnalysis: async (analysisId) => {
    const response = await api.delete(`/analysis/analysis/${analysisId}`);
    return response.data;
  },
};

export default api;
