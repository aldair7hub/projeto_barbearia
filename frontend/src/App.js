import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import DashboardPage from './pages/DashboardPage';
import AppointmentPage from './pages/AppointmentPage';
import BarberSchedule from './pages/BarberSchedule';  // Importando a nova página de agenda
import BarberPage from './pages/BarberPage';  // Importando a BarberPage

// Componente de proteção de rota
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Verifica se há um token no localStorage
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Redireciona para o login se o usuário não estiver autenticado
  }

  return children; // Retorna os filhos (páginas) se o usuário estiver autenticado
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protege a rota /dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Protege a rota /appointment */}
          <Route 
            path="/appointments/:userID" 
            element={
              <ProtectedRoute>
                <AppointmentPage/>
              </ProtectedRoute>
            } 
          />

          {/* Nova rota para a agenda do barbeiro */}
          <Route 
            path="/barber/appointments/:barberId" 
            element={
              <ProtectedRoute>
                <BarberSchedule />
              </ProtectedRoute>
            } 
          />

          {/* Rota para a BarberPage */}
          <Route 
            path="/barberPage" 
            element={
              <ProtectedRoute>
                <BarberPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
