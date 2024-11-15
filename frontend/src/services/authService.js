import api from './api';

export const loginUser = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data.token;
};

export const registerUser = async (username, password, role) => {
  const response = await api.post('/auth/register', { username, password, role });
  return response.data;
};
