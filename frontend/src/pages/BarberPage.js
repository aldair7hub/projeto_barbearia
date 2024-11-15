import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBarberAppointments } from '../services/api';  // Função para pegar agendamentos do barbeiro
import AppointmentDetails from '../components/AppointmentDetails';  // Componente que exibe os detalhes dos agendamentos

const BarberPage = () => {
  const { barberId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id'); // Obtendo o user_id do localStorage

  useEffect(() => {
    const fetchAppointments = async () => {
      const data = await getBarberAppointments(token, userId);  // Chamada da API para agendamentos
      console.log('Fetched appointments:', data);  // Log para depuração
      setAppointments(data.appointments || []);  // Armazenando os agendamentos
    };

    fetchAppointments();
  }, [barberId, userId, token]);  // Dependências para atualizar a lista de agendamentos

  return (
    <div>
      <h1>Agendamentos do Barbeiro</h1>
      {appointments.length > 0 ? (
        <div>
          {appointments.map((appointment) => {
            // Garantir que a chave seja única, usando _id ou id
            const appointmentId = appointment._id || appointment.id;
            if (!appointmentId) {
              console.error('Missing _id or id for appointment:', appointment);
              return null; // Se não houver id, não renderiza o item
            }

            return (
              <AppointmentDetails 
                key={appointmentId}  // Garantindo que a chave seja única
                appointment={appointment} 
              />
            );
          })}
        </div>
      ) : (
        <p>Não há agendamentos para este barbeiro.</p>
      )}
    </div>
  );
};

export default BarberPage;
