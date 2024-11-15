import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBarberAppointments, getServices, createAppointment } from '../services/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './BarberSchedule.css';

const BarberSchedule = () => {
  const { barberId } = useParams(); // Pega o ID do barbeiro da URL
  const { state } = useLocation(); // Pega o state passado na navegação
  const { fullname } = state || {}; // Pega o fullname do barbeiro, se estiver disponível
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]); // Estado para armazenar os serviços
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Armazenar a data selecionada
  const [selectedService, setSelectedService] = useState(""); // Armazenar o ID do serviço selecionado
  const token = localStorage.getItem('token'); // Token do usuário
  const navigate = useNavigate(); // Para navegação após o agendamento
  const userID = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        return;
      }

      try {
        const data = await getBarberAppointments(token, barberId);
        console.log('Data recebida: ', data); // Adicione um log para ver o que está sendo retornado
        if (data.error) {
          setError(data.error);
        } else {
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        setError('Erro ao carregar a agenda. Tente novamente mais tarde.');
        console.error('Erro:', error); // Adicione log do erro
      }
    };

    const fetchServices = async () => {
      if (!token) return;
      try {
        const serviceData = await getServices(token);
        setServices(serviceData.services || []);
      } catch (error) {
        setError('Erro ao carregar os serviços. Tente novamente mais tarde.');
        console.error('Erro:', error); // Adicione log do erro
      }
    };

    fetchAppointments();
    fetchServices();
  }, [barberId, token]);

  // Filtrando os horários já agendados para desabilitar esses horários
  const bookedTimes = appointments.map(appointment => {
    const date = new Date(appointment.date);
    return {
      date: date.toDateString(), // Data sem o horário
      time: date.getHours() * 60 + date.getMinutes(), // Horário em minutos
    };
  });

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedService) {
      setError('Por favor, selecione uma data e um serviço.');
      return;
    }

    // Formatar a data para o formato "YYYY-MM-DD HH:MM:SS"
    const formattedDate = selectedDate.toISOString().slice(0, 19).replace('T', ' ');

    try {
      // Verificar se já existe um agendamento no horário selecionado
      const isDateTaken = appointments.some((appointment) => appointment.date === formattedDate);
      if (isDateTaken) {
        setError('Já existe um agendamento para este horário.');
        return;
      }

      // Crie o agendamento com os dados necessários
      const appointmentData = {
        date: formattedDate, // Enviando a data formatada
        service_id: selectedService, // Enviar o ID do serviço
        barber_id: barberId, // Usando o ID do barbeiro
      };

      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        return;
      }

      const data = await createAppointment(token, appointmentData); // Passando o token para a função
      if (data.error) {
        setError(data.error);
      } else {
        // Agendamento criado com sucesso
        setSelectedDate(null);
        setSelectedService(""); // Resetar para string vazia
        alert('Agendamento realizado com sucesso!');
        navigate(`/appointments/${userID}`);
      }
    } catch (error) {
      setError('Erro ao criar o agendamento. Tente novamente mais tarde.');
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      <h3>Agenda do Barbeiro: {fullname}</h3> {/* Mostrar o fullname se disponível */}
      {error && (
        <div className="alert alert-danger" style={{ color: 'red' }}>
          {error}
        </div>
      )}
      
      {/* Exibir o calendário */}
      <h4>Escolha uma data e horário:</h4>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        showTimeSelect
        timeIntervals={30} // Intervalo de 30 minutos
        dateFormat="Pp"
        minDate={new Date()} // Não permitir datas no passado
        filterDate={(date) => {
          if (!selectedDate) return true; // Se selectedDate for null, permita todas as datas

          const selectedDateString = selectedDate.toDateString(); // Pegue a data selecionada
          const selectedTimeInMinutes = selectedDate.getHours() * 60 + selectedDate.getMinutes();

          // Desabilitar se o horário da data já foi agendado
          return !bookedTimes.some(booking => booking.date === selectedDateString && booking.time === selectedTimeInMinutes);
        }}
        filterTime={(time) => {
          // Verifique se o horário já está reservado para a data selecionada
          const timeInMinutes = time.getHours() * 60 + time.getMinutes();
          const selectedDateString = selectedDate ? selectedDate.toDateString() : '';
          const isTimeBooked = bookedTimes.some(booking => 
            booking.date === selectedDateString && booking.time === timeInMinutes
          );
          
          // Desabilite a hora se estiver reservada
          return !isTimeBooked;
        }}
        placeholderText="Escolha uma data"
        disabledKeyboardNavigation // Desabilitar navegação com o teclado
        customTimeInput={<input style={{ backgroundColor: 'lightgrey' }} />} // Adiciona estilo visual de bloqueio
      />

      {/* Mostrar os serviços disponíveis após escolher uma data */}
      {selectedDate && (
        <div>
          <h4>Escolha um serviço:</h4>
          <select onChange={(e) => setSelectedService(e.target.value)} value={selectedService}>
            <option value="">Selecione um serviço</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} - Duração: {service.duration} min - Valor: R${service.value}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Confirmar agendamento */}
      <button className="submit-btn" onClick={handleConfirmAppointment} disabled={!selectedDate || !selectedService}>
        Confirmar Agendamento
      </button>

      {/* Exibir a data e o horário selecionados */}
      {selectedDate && (
        <div>
          <p>Data e horário selecionados: {selectedDate.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default BarberSchedule;
