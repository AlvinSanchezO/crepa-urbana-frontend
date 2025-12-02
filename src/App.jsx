import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import AdminProducts from './pages/AdminProducts'; // <--- IMPORTAR

// ... (El componente PrivateRoute se queda igual) ...
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Privadas */}
        <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
        
        {/* NUEVA RUTA DE ADMIN */}
        <Route path="/admin-menu" element={<PrivateRoute><AdminProducts /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;