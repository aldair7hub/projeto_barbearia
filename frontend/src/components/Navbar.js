import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRoles, getUserPoints } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const userID = localStorage.getItem('user_id');
  const [role, setRole] = useState(null);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const roleResponse = await getUserRoles(token);
          const userRole = roleResponse.role;
          setRole(userRole);
          localStorage.setItem('role', userRole);

          const pointsResponse = await getUserPoints(token);
          const userPoints = pointsResponse.points;
          setPoints(userPoints);

          if (userRole === 'barber') {
            navigate(`/barberPage`);
          }
        } catch (error) {
          console.error("Erro ao buscar role ou pontos do usuário:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, userID, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <nav>
      <div className="nav-links">
        {!token ? (
          <>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/">Home</Link>
          </>
        ) : (
          <>
            {role === 'user' && (
              <>
                <Link to="/dashboard">Agendar Serviços</Link>
                <Link to={`/appointments/${userID}`}>Meus Agendamentos</Link>
                {points !== null && (
                  <div className="user-points">
                    <span>Pontos: {points}</span>
                  </div>
                )}
              </>
            )}
            {role === 'barber' && (
              <>
                <Link to="/barberPage">Página do Barbeiro</Link>
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
