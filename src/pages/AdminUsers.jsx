import { useEffect, useState } from 'react';
import api from '../api/axios'; // Usamos axios directo para simplificar imports

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      alert("Error cargando usuarios");
    }
  };

  const handleAdjust = async (user) => {
    const input = prompt(`Ajustar puntos para ${user.nombre}.\nIngresa la cantidad (ej: 50 para regalar, -20 para quitar):`);
    
    if (!input) return;
    const points = parseInt(input);
    if (isNaN(points)) return alert("Número inválido");

    try {
      await api.post('/loyalty/adjust', { userId: user.id, points });
      alert("¡Ajuste realizado!");
      loadUsers(); // Recargar para ver el nuevo saldo
    } catch (error) {
      alert("Error al ajustar puntos");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Gestión de Usuarios 👥</h1>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#2c3e50', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Nombre</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Teléfono</th>
            <th style={{ padding: '12px' }}>Puntos Actuales</th>
            <th style={{ padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{u.id}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.nombre}</td>
              <td style={{ padding: '12px', color: '#666' }}>{u.email}</td>
              <td style={{ padding: '12px' }}>{u.telefono}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  background: '#e67e22', color: 'white', 
                  padding: '4px 8px', borderRadius: '12px', 
                  fontSize: '0.9em', fontWeight: 'bold' 
                }}>
                  💎 {u.puntos_actuales}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <button 
                  onClick={() => handleAdjust(u)}
                  style={{ 
                    padding: '6px 12px', cursor: 'pointer',
                    background: '#3498db', color: 'white', 
                    border: 'none', borderRadius: '4px'
                  }}
                >
                  ⚖️ Ajustar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;