import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRoles } from '../services/api'; // Importar a função de verificar o role
import './Navbar.css';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const userID = localStorage.getItem('user_id'); 
  const [role, setRole] = useState(null); // Estado para armazenar o role
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const navigate = useNavigate();

  // Função para checar o role do usuário
  useEffect(() => {
    const fetchUserRole = async () => {
      if (token) {
        try {
          const response = await getUserRoles(token);  // Faz a chamada para obter o role
          const userRole = response.role;  // Supondo que a resposta retorne o papel como `role`
          setRole(userRole);
          localStorage.setItem('role', userRole);  // Armazena o role no localStorage

          // Redirecionar para página de acordo com o role
          if (userRole === 'barber') {
            navigate(`/barberPage`);  // Se for barbeiro, redireciona para a página de agenda do barbeiro
          }

        } catch (error) {
          console.error("Erro ao buscar role do usuário:", error);
        } finally {
          setLoading(false); // Finaliza o carregamento após a verificação
        }
      } else {
        setLoading(false); // Se não houver token, não precisa esperar a verificação do role
      }
    };

    fetchUserRole();
  }, [token, userID, navigate]);  // Chama o useEffect quando o token muda

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');  // Remover o role do localStorage
    window.location.href = '/';
  };

  // Exibe "Carregando..." até que o role do usuário seja determinado
  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <nav>
      <div className="nav-links">
        {!token ? (
          <>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/">Home</Link> {/* Home agora abaixo do Login */}
          </>
        ) : (
          <>
            {role === 'user' && (
              <>
                <Link to="/dashboard">Agendar Serviços</Link>
                <Link to={`/appointments/${userID}`}>Meus Agendamentos</Link>
              </>
            )}
          </>
        )}
      </div>
      {token && (
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      )}
    </nav>
  );
};

export default Navbar;
