import axios from 'axios';

const API_URL = 'http://0.0.0.0:5000'; // Substitua pela URL real da sua API

// Função genérica para fazer chamadas POST para a API
const postRequest = async (endpoint, data, token = '') => {
  try {
    const response = await axios.post(`${API_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',  // Condicional para enviar o token, se fornecido
      },
    });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error.response ? error.response.data : error.message);
    return { error: error.response?.data?.msg || 'Unknown error' };
  }
};

// Função genérica para fazer chamadas GET para a API
const getRequest = async (endpoint, token) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,  // Enviar o token aqui
      },
    });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error.response ? error.response.data : error.message);
    return { error: error.response?.data?.msg || 'Unknown error' };
  }
};

// Função genérica para fazer chamadas PUT para a API
const putRequest = async (endpoint, data, token) => {
  try {
    const response = await axios.put(`${API_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,  // Enviar o token aqui
      },
    });

    return response.data;
  } catch (error) {
    console.error('API request failed:', error.response ? error.response.data : error.message);
    return { error: error.response?.data?.msg || 'Unknown error' };
  }
};

// Função genérica para fazer chamadas DELETE para a API
const deleteRequest = async (endpoint, token) => {
  try {
    const response = await axios.delete(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,  // Enviar o token aqui
      },
    });

    return response.data;
  } catch (error) {
    console.error('API request failed:', error.response ? error.response.data : error.message);
    return { error: error.response?.data?.msg || 'Unknown error' };
  }
};

// Função para fazer login
export const login = (email, password) => {
  return postRequest('/user/login', { email, password });
};

// Função para registrar um usuário
export const register = (email, password, fullname, role) => {
  return postRequest('/user/register', { email, password, fullname, role});
};

// Função para pegar a lista de barbeiros
export const getBarbers = (token) => {
  return getRequest('/user/barbers', token);
};

// Função para pegar os serviços
export const getServices = (token) => {
  return getRequest('/service/list', token);
};

// Função para pegar os agendamentos do usuário
export const getAppointments = (token) => {
  return getRequest('/appointments/list', token);
};

// Função para criar um novo agendamento
export const createAppointment = (token, appointmentData) => {
  console.log(appointmentData)
  return postRequest('/appointments/add', appointmentData, token);  // Passando o token para o postRequest
};

// Função para atualizar um agendamento
export const updateAppointment = (token, appointmentId, appointmentData) => {
  return putRequest(`/appointments/edit/${appointmentId}`, appointmentData, token);
};

// Função para deletar um agendamento
export const deleteAppointment = (token, appointmentId) => {
  return deleteRequest(`/appointments/delete/${appointmentId}`, token);
};


export const getUserRoles = (token) => {
  return getRequest(`/user/check_role`, token);
};

export const getBarberAppointments = (token, barberId) => {
  return getRequest(`/user/appointments/barber/${barberId}`, token);
};

export const getUserAppointments = (token, userID) => {
  return getRequest(`/user/appointments/user/${userID}`, token);
}

export const getBarberId = async (username, token) => {
  try {
    const response = await getBarbers(token);  // Buscar a lista de barbeiros
    if (response.barbers) {  // Verificar se a chave "barbers" existe
      const barber = response.barbers.find((barber) => barber.username === username);
      return barber ? barber.id : null;  // Retornar o barber_id se encontrado
    } else {
      console.error('Barbers list not found in response:', response);
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar o id do barbeiro:', error);
    return null;
  }
};

