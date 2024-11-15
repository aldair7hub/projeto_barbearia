import React from 'react';

const AppointmentDetails = ({ appointment }) => {
  const { service_name, service_duration, user_name,service_value, date, status } = appointment;

  return (
    <div className="appointment-card">
      <h3>{service_name}</h3>
      <h3>{user_name}</h3>
      <p><strong>Data:</strong> {new Date(date).toLocaleString()}</p>
      <p><strong>Duração:</strong> {service_duration} minutos</p>
      <p><strong>Valor:</strong> R${service_value}</p>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
};

export default AppointmentDetails;
