// components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { getUserRoles } from '../services/api';  // Importe a função
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
    <div className="container">
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
        <button type="submit">Login</button>
      </form>
      <p>
        Não tem uma conta? <a href="/register">Registre-se aqui</a>
      </p>
    </div>
  );
};

export default Login;
