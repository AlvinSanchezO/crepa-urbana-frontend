import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import AdminProducts from './pages/AdminProducts';
import Kitchen from './pages/Kitchen';

// Componente para proteger rutas (si no hay token, manda al login)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Privadas (Requieren Token) */}
        
        {/* 1. Menú para Clientes */}
        <Route 
          path="/menu" 
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          } 
        />
        
        {/* 2. Panel de Administración de Productos (Admin) */}
        <Route 
          path="/admin-menu" 
          element={
            <PrivateRoute>
              <AdminProducts />
            </PrivateRoute>
          } 
        />

        {/* 3. Comandera de Cocina (KDS) */}
        <Route 
          path="/kitchen" 
          element={
            <PrivateRoute>
              <Kitchen />
            </PrivateRoute>
          } 
        />
        
        {/* Redirección por defecto (si entran a una ruta desconocida) */}
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;