import React, { useState, useEffect } from 'react';
import { getUserAppointments } from '../services/api'; // Função para buscar os agendamentos do backend
import './AppointmentList.css'

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token'); // Token do usuário logado
  const userID = localStorage.getItem('user_id'); // Pegar o userID diretamente do localStorage

  // Função para buscar os agendamentos do usuário
  const fetchAppointments = async () => {
    if (!token || !userID) {
      setError('Token ou ID do usuário não encontrado. Faça login novamente.');
      return;
    }
  
    try {
      // Verifica se a URL está sendo formada corretamente
      const response = await getUserAppointments(token, userID); // Passa userID para a requisição corretamente
      if (response.error) {
        setError(response.error);
      } else {
        setAppointments(response.appointments || []);
      }
    } catch (error) {
      setError('Erro ao carregar os agendamentos. Tente novamente mais tarde.');
      console.error('Erro:', error);
    }
  };

  // Chama a função de buscar agendamentos quando o componente for montado
  useEffect(() => {
    fetchAppointments();
  }, [token, userID]);

  // Exibe um erro caso haja algum problema
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h3>Meus Agendamentos</h3>
      {appointments.length === 0 ? (
        <p>Você ainda não tem agendamentos.</p>
      ) : (
        <ul>
          {appointments.map((appointment, index) => (
            <li key={`${appointment.date}-${index}`}>
              {appointment.date} - {appointment.barber} - {appointment.service_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppointmentList;
