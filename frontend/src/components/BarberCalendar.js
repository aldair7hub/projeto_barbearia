import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BarberCalendar = ({ bookedTimes, setSelectedDate }) => {
  // Inicializar selectedDate com null para não ter nenhum dia marcado
  const [selectedDate, setLocalSelectedDate] = useState(null);

  // Função para formatar o horário em "HH:mm"
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  // Quando o usuário clica em um dia, essa função será chamada
  const handleDateChange = (date) => {
    setLocalSelectedDate(date); // Atualiza o estado local do componente
    setSelectedDate(date); // Chama o setSelectedDate do componente pai
  };

  return (
    <div>
      <h4>Escolha uma data e horário:</h4>
      <DatePicker
        selected={selectedDate}  // Nenhum dia marcado inicialmente
        onChange={handleDateChange}  // Atualiza a data selecionada
        showTimeSelect
        timeIntervals={30} // Intervalo de 30 minutos
        dateFormat="Pp"
        minDate={new Date()} // Não permitir datas no passado
        filterDate={(date) => {
          // Não bloqueia a data, só verifica se ela tem horários reservados.
          return true;
        }}
        filterTime={(time) => {
          const selectedDateString = selectedDate ? selectedDate.toDateString() : '';
          const formattedTime = formatTime(time); // Formatar o horário no formato HH:mm

          // Verifica se o horário está reservado para a data selecionada
          return !bookedTimes.some(booking => 
            booking.date === selectedDateString && booking.time === formattedTime
          );
        }}
        placeholderText="Escolha uma data"
        disabledKeyboardNavigation // Desabilitar navegação com o teclado
        customTimeInput={<input style={{ backgroundColor: 'lightgrey' }} />} // Adiciona estilo visual de bloqueio
      />
    </div>
  );
};

export default BarberCalendar;
