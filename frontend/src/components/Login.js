import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { getUserRoles } from '../services/api';  // Importe a função
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    const result = await login(email, password);
    
    if (result.access_token) {
      // Armazenando o token e o user_id no localStorage
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user_id', result.user_id);  // Armazenando o ID do usuário

      // Usando a função getUserRoles para pegar o papel do usuário
      const token = result.access_token;
      const roleResult = await getUserRoles(token);

      if (roleResult.role === 'barber') {
        // Se for 'barber', redireciona para a barberPage
        navigate('/barberPage');
      } else {
        // Se for 'user', redireciona para o dashboard
        navigate('/dashboard');
      }
    } else {
      alert('Login falhou');
    }
  };

  return (
    <div className="container" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="e-mail" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit">Entre</button>
        </form>
        <p className="register-link">
          Não tem uma conta? <a href="/register">Registre-se aqui</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
