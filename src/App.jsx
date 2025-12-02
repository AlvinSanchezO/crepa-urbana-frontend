import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';

// Componente para proteger rutas (si no hay token, manda al login)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Ruta Protegida: Solo entran si tienen Token */}
        <Route 
          path="/menu" 
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;