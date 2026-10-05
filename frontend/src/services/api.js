import axios from 'axios';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export const api = {
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return res.data;
  },

  analyzeFile: async (fileId) => {
    const res = await apiClient.post('/analyze', { file_id: fileId });
    return res.data;
  },

  getResults: async (analysisId) => {
    const res = await apiClient.get(`/results/${analysisId}`);
    return res.data;
  },

  getMetadata: async (analysisId) => {
    const res = await apiClient.get(`/metadata/${analysisId}`);
    return res.data;
  },

  getHistory: async () => {
    const res = await apiClient.get('/history');
    return res.data;
  },
};

export default api;
