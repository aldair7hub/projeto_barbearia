// BarberSchedule.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBarberAppointments, getServices, createAppointment, getUserPoints, redeemFreeServiceChoice } from '../services/api';
import BarberCalendar from '../components/BarberCalendar'; // Importando o novo componente
import './BarberSchedule.css';

const BarberSchedule = () => {
  const { barberId } = useParams();
  const { state } = useLocation();
  const { fullname } = state || {};
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [points, setPoints] = useState(0);
  const [isFreeService, setIsFreeService] = useState(false);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const userID = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        return;
      }
    
      try {
        const data = await getBarberAppointments(token, barberId);
       
        if (data.error) {
          setError(data.error);
        } else {
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        console.error('Erro ao carregar a agenda:', error);
        setError('Erro ao carregar a agenda. Tente novamente mais tarde.');
      }
    };

    const fetchServices = async () => {
      if (!token) return;
      try {
        const serviceData = await getServices(token);
        setServices(serviceData.services || []);
      } catch (error) {
        setError('Erro ao carregar os serviços. Tente novamente mais tarde.');
        console.error('Erro:', error);
      }
    };

    const fetchUserPoints = async () => {
      if (!token) return;

      try {
        const data = await getUserPoints(token);
        if (data.error) {
          console.log('Erro ao buscar pontos:', data.error);
        } else {
          setPoints(data.points); // Atualiza o estado com os pontos
        }
      } catch (error) {
        console.error('Erro ao buscar pontos do usuário:', error);
      } finally {
        setLoadingPoints(false);
      }
    };

    fetchAppointments();
    fetchServices();
    fetchUserPoints();
  }, [barberId, token]);

  // Calcula os horários ocupados
  // Calcula os horários ocupados
  const bookedTimes = appointments.map(appointment => {
    const date = new Date(appointment.date);  // Converter para Date
    if (isNaN(date)) {
      console.error('Data inválida no agendamento:', appointment.date);
      return null;
    }

    // Formatar o horário de maneira legível (HH:mm)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;  // Ex: 17:30

    return {
      date: date.toDateString(), // Data no formato "Sun Nov 17 2024"
      time: formattedTime, // Horário no formato "HH:mm"
    };
  }).filter(item => item !== null); // Remover valores nulos

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedService) {
      setError('Por favor, selecione uma data e um serviço.');
      return;
    }

    const formattedDate = selectedDate.toISOString().slice(0, 19).replace('T', ' ');

    const isDateTaken = appointments.some((appointment) => appointment.date === formattedDate);
    if (isDateTaken) {
      setError('Já existe um agendamento para este horário.');
      return;
    }

    const appointmentData = {
      date: formattedDate,
      service_id: selectedService,
      barber_id: barberId,
    };

    if (isFreeService) {
      try {
        const data = await redeemFreeServiceChoice(token, selectedService, barberId);
        if (data.error) {
          setError('Erro ao resgatar o serviço gratuito.');
        } else {
          alert('Serviço gratuito resgatado com sucesso!');
          setSelectedDate(null);
          setSelectedService('');
          navigate(`/appointments/${userID}`);
        }
      } catch (error) {
        setError('Erro ao resgatar o serviço gratuito.');
      }
    } else {
      try {
        const data = await createAppointment(token, appointmentData);
        if (data.error) {
          setError(data.error);
        } else {
          alert('Agendamento realizado com sucesso!');
          setSelectedDate(null);
          setSelectedService('');
          navigate(`/appointments/${userID}`);
        }
      } catch (error) {
        setError('Erro ao criar o agendamento. Tente novamente mais tarde.');
      }
    }
  };

  // Calculando o número de serviços gratuitos disponíveis
  const freeServicesAvailable = Math.floor(points / 100); // Cada 100 pontos dá direito a 1 serviço gratuito

  return (
    <div>
      <h3>Agenda do Barbeiro: {fullname}</h3>
      {error && <div className="alert alert-danger" style={{ color: 'red' }}>{error}</div>}

      {/* Exibir quantos serviços gratuitos o usuário tem */}
      {freeServicesAvailable > 0 && !isFreeService && (
        <div className="center-container">
          <p>Você tem {freeServicesAvailable} serviço(s) gratuito(s) disponível(is).</p>
          <button 
            onClick={() => setIsFreeService(true)} 
            className="redeem-btn"
            disabled={freeServicesAvailable === 0}
          >
            Confirmar uso de serviço gratuito
          </button>
        </div>
      )}

      {/* Componente BarberCalendar */}
      <div className="center-container">
        <BarberCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          bookedTimes={bookedTimes}
        />
      </div>

      {selectedDate && (
        <div className="center-container">
          <h4>Escolha um serviço:</h4>
          <select 
            onChange={(e) => setSelectedService(e.target.value)} 
            value={selectedService}
          >
            <option value="">Selecione um serviço</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} - Duração: {service.duration} min - Valor: R${service.value}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Botão de confirmação */}
      <div className="center-container">
        <button
          className="submit-btn"
          onClick={handleConfirmAppointment}
          disabled={!selectedDate || !selectedService}>
          Confirmar Agendamento
        </button>
      </div>

      {selectedDate && (
        <div>
          <p>Data e horário selecionados: {selectedDate.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default BarberSchedule;
