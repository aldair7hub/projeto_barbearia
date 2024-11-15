import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <h1>Bem-vindo à Barbearia</h1>
      <p>Confira os nossos barbeiros e serviços.</p>
      <img src="/barber.jpg" alt="Barbearia" className="barber-image" />
    </div>
  );
};

export default HomePage;
