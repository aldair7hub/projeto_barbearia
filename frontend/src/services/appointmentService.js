import api from './api';

export const getAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};
