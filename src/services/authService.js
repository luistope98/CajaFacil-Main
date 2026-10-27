import api from './api';

export const authService = {
  login: async (phone, password) => {
    try {
      const response = await api.post('/auth/login', {
        phone,
        password
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión';
      throw new Error(message);
    }
  },
};