import React, { useState } from 'react';
import { completeAppointmentAndGetPoints } from '../services/api';  // Função para completar o agendamento e adicionar pontos
import './AppointmentDetails.css';

const AppointmentDetails = ({ appointment }) => {
  const { service_name, service_duration, user_name, service_value, date, status, _id } = appointment;

  const [setResponseStatus] = useState('');
  
  // Estado para controlar se o serviço foi concluído
  const [isCompleted, setIsCompleted] = useState(false);

  console.log(appointment);

  // Função para concluir o agendamento
  const handleCompleteAppointment = async () => {
    const token = localStorage.getItem('token');
    try {
      // Chama a função de completar o agendamento
      const response = await completeAppointmentAndGetPoints(token, _id);
  
      if (response.status === 'success') {
        // Exibe o alert de sucesso
        alert(response.msg);  // Alerta de sucesso
        setResponseStatus('success');
        
        // Marca o agendamento como completado e esconde o botão
        setIsCompleted(true);
      } else {
        // Exibe o alert de erro
        alert(response.msg || 'Houve um erro desconhecido.');  // Alerta de erro
        setResponseStatus('error');
      }
    } catch (error) {
      console.error('Erro ao concluir o agendamento:', error);
      // Exibe o alert de erro
      alert('Houve um erro ao concluir o agendamento.');  // Alerta de erro
      setResponseStatus('error');
    }
  };
  

  return (
    <div className="appointment-card">
      <h3>{service_name}</h3>
      <h3>{user_name}</h3>
      <p><strong>Data:</strong> {new Date(date).toLocaleString()}</p>
      <p><strong>Duração:</strong> {service_duration} minutos</p>
      <p><strong>Valor:</strong> R${service_value}</p>
      <p><strong>Status:</strong> {status}</p>
      
      {/* Só exibe o botão se o status for "scheduled" e o serviço não estiver completo */}
      {status === 'scheduled' && !isCompleted && (
        <button onClick={handleCompleteAppointment}>Serviço Concluído</button>
      )}
    </div>
  );
};

export default AppointmentDetails;
