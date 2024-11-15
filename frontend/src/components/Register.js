import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');  // Mudança para email
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');  // Adicionar fullname
  const [role, setRole] = useState('user'); // Usuário ou barbeiro
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(email, password, fullname, role);  // Passar fullname
    if (result.msg === "User registered successfully!") {
      navigate('/login');
    } else {
      alert(result.msg || 'Erro ao registrar usuário');  // Melhorar mensagem de erro
    }
  };

  return (
    <div className="container">
      <h2>Criar Conta</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email"  // Mudança para email
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Nome Completo"  // Adicionar fullname
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
  );
};

export default Register;
