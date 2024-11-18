import React, { useState, useEffect } from 'react';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [role, setRole] = useState('user');
  const [backgroundImage, setBackgroundImage] = useState('');  // Estado para armazenar a imagem de fundo
  const navigate = useNavigate();

  // Lista de imagens de fundo
  const backgroundImages = [
    '/images/01.jpg',
    '/images/02.jpg',
    '/images/03.jpg',
    '/images/04.jpg',
    '/images/05.jpg',
    '/images/06.jpg',
    '/images/07.jpg',
    '/images/08.jpg',
    '/images/09.jpg',
  ];

  // Função para escolher uma imagem aleatória
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[randomIndex];
  };

  useEffect(() => {
    // Define a imagem de fundo aleatória apenas uma vez na primeira renderização
    setBackgroundImage(getRandomImage());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(email, password, fullname, role);
    if (result.msg === "User registered successfully!") {
      navigate('/login');
    } else {
      alert(result.msg || 'Erro ao registrar usuário');
    }
  };

  return (
    <div className="container" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="login-form">
        <h2>Criar Conta</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Nome Completo" 
            value={fullname} 
            onChange={(e) => setFullname(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Usuário</option>
            <option value="barber">Barbeiro</option>
          </select>
          <button type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
