import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBarberAppointments } from '../services/api';  // Função para pegar agendamentos do barbeiro
import AppointmentDetails from '../components/AppointmentDetails';  // Componente que exibe os detalhes dos agendamentos
import './BarberPage.css'

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
    <div className="barber-page">
      <h1>Agendamentos do Barbeiro</h1>
      {appointments.length > 0 ? (
        <div className="appointment-list">
          {appointments.map((appointment) => {
            const appointmentId = appointment._id || appointment.id;
            if (!appointmentId) {
              console.error('Missing _id or id for appointment:', appointment);
              return null;
            }
  
            return (
              <AppointmentDetails 
                key={appointmentId} 
                appointment={appointment} 
              />
            );
          })}
        </div>
      ) : (
        <p className="no-appointments">Não há agendamentos para este barbeiro.</p>
      )}
    </div>
  );
  
};

export default BarberPage;
