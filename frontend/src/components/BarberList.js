import React, { useState, useEffect } from 'react';
import { getBarbers } from '../services/api';
import { useNavigate } from 'react-router-dom'; // Para navegação
import './BarberList.css'

const BarberList = () => {
  const [barbers, setBarbers] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const fetchBarbers = async () => {
      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        return;
      }

      try {
        const data = await getBarbers(token);
        if (data.error) {
          setError(data.error);
        } else {
          setBarbers(data.barbers || []);
        }
      } catch (error) {
        setError('Erro ao carregar barbeiros. Tente novamente mais tarde.');
      }
    };

    fetchBarbers();
  }, [token]);

  // Função para lidar com a seleção do barbeiro
  const handleBarberClick = (barberId, barberFullname) => {
    // Navegar para a página de agenda com o id e fullname do barbeiro usando o state
    navigate(`/barber/appointments/${barberId}`, { state: { fullname: barberFullname } });
  };

  return (
    <div className="barber-list-container">
      <h3>Barbeiros Disponíveis</h3>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <ul className="barber-list">
          {barbers.map((barber) => (
            <li 
              key={barber.id} 
              onClick={() => handleBarberClick(barber.id, barber.fullname)} 
              className="barber-item"
            >
              {barber.fullname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BarberList;
