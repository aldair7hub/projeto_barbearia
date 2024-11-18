import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Substitua pela URL real da sua API

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

// Função para pegar os pontos do usuário
export const getUserPoints = (token) => {
  return getRequest('/user/points', token);
};

// Função para resgatar um serviço gratuito
export const redeemFreeService = (token) => {
  return postRequest('/user/redeem_free_service', {}, token);
};

// Função para resgatar um serviço gratuito específico
export const redeemFreeServiceChoice = (token, serviceId, barberID) => {
  // Agora estamos enviando o barberID no corpo da requisição
  return postRequest(
    `/user/redeem_free_service/${serviceId}`, 
    { barber_id: barberID },  // Barber ID adicionado no corpo
    token
  );
};


export const completeAppointmentAndGetPoints = async (token, appointmentId) => {
  // Chama a função genérica postRequest com os parâmetros apropriados
  const response = await postRequest(
    '/user/complete_appointment', 
    { appointment_id: appointmentId }, 
    token
  );

  // Verifica se a resposta tem um status de sucesso e retorna os dados
  if (response.status === 'success') {
    return response; // Retorna os dados de sucesso, incluindo a mensagem
  } else {
    // Caso a resposta não seja de sucesso, retorna o erro
    return { error: response.msg || 'Erro ao completar o agendamento' };
  }
};




// Obter pontos do usuário
export const checkPoints = async (token) => {
  const pointsData = await getUserPoints(token);
  if (pointsData.error) {
    console.log('Erro ao buscar pontos:', pointsData.error);
    return;
  }

  const points = pointsData.points;
  //console.log('Pontos disponíveis:', points);

  if (points >= 100) {
    // Se o usuário tiver pontos suficientes, resgatar um serviço gratuito
    const freeServiceData = await redeemFreeService(token);
    if (freeServiceData.error) {
      console.log('Erro ao listar serviços gratuitos:', freeServiceData.error);
      return;
    }

    console.log('Serviços gratuitos disponíveis:', freeServiceData.services);
    // Escolher um serviço para resgatar
    const serviceId = freeServiceData.services[0]._id;  // Exemplo de selecionar o primeiro serviço
    const redeemResponse = await redeemFreeServiceChoice(token, serviceId);
    if (redeemResponse.error) {
      console.log('Erro ao resgatar o serviço gratuito:', redeemResponse.error);
    } else {
      console.log('Serviço gratuito resgatado com sucesso!', redeemResponse);
    }
  } else {
    console.log('Não tem pontos suficientes para resgatar um serviço gratuito.');
  }
};


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

