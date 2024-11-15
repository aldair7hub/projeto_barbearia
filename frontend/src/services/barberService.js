import api from './api';

export const getBarbers = async () => {
  const response = await api.get('/barber');
  return response.data;
};
