import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Edit2, Plus, Minus, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const THEME = {
  dark: '#0f0f0f',
  darker: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2a2a2a',
  gold: '#d4af37',
  text: '#ffffff',
  textMuted: '#a0a0a0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  primary: '#3b82f6',
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setPoints(0);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setPoints(0);
  };

  const handleAdjust = async () => {
    if (!selectedUser || points === 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }

    try {
      await api.post('/loyalty/adjust', { userId: selectedUser.id, points });
      toast.success(`✅ Se ${points > 0 ? 'agregaron' : 'restaron'} ${Math.abs(points)} puntos a ${selectedUser.nombre}`);
      loadUsers();
      handleCloseModal();
    } catch (error) {
      toast.error('Error al ajustar puntos');
    }
  };

  const filteredUsers = users.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: THEME.text,
        }}
      >
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
          <Users size={48} color={THEME.gold} />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
        minHeight: '100vh',
        color: THEME.text,
        padding: '32px 20px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px' }}
        >
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            Gestión de Usuarios
          </h1>
          <p style={{ color: THEME.textMuted, margin: 0, fontSize: '14px' }}>
            Administra usuarios y ajusta puntos de lealtad
          </p>
        </motion.div>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '24px' }}
        >
          <input
            type="text"
            placeholder="Busca por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '12px 16px',
              background: THEME.card,
              border: `1.5px solid ${THEME.border}`,
              borderRadius: '10px',
              color: THEME.text,
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = THEME.gold;
              e.target.style.boxShadow = `0 0 0 3px ${THEME.gold}20`;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = THEME.border;
            }}
          />
        </motion.div>

        {/* TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
            border: `1px solid ${THEME.border}`,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${THEME.border}`, background: THEME.darker }}>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: THEME.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: THEME.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Nombre
                  </th>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: THEME.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: THEME.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Teléfono
                  </th>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: THEME.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Puntos
                  </th>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: THEME.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      borderBottom: `1px solid ${THEME.border}`,
                      transition: 'background 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = THEME.darker;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px', fontSize: '13px', color: THEME.textMuted }}>
                      #{user.id}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: THEME.text }}>
                      {user.nombre}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: THEME.textMuted }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: THEME.textMuted }}>
                      {user.telefono}
                    </td>
                    <td
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <span
                        style={{
                          background: `${THEME.gold}20`,
                          border: `1.5px solid ${THEME.gold}`,
                          color: THEME.gold,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          display: 'inline-block',
                        }}
                      >
                        ⭐ {user.puntos_actuales}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal(user)}
                        style={{
                          background: `linear-gradient(135deg, ${THEME.primary}, #2563eb)`,
                          border: 'none',
                          color: THEME.text,
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Edit2 size={14} /> Ajustar
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: THEME.textMuted,
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>😕</div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>No se encontraron usuarios</p>
            </div>
          )}
        </motion.div>

        {/* Resultados */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            color: THEME.textMuted,
            fontSize: '13px',
            marginTop: '16px',
          }}
        >
          Mostrando {filteredUsers.length} de {users.length} usuario{users.length !== 1 ? 's' : ''}
        </motion.p>
      </div>

      {/* MODAL PROFESIONAL */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
                border: `1px solid ${THEME.border}`,
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '450px',
                width: '90%',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                zIndex: 101,
              }}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: THEME.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} />
              </motion.button>

              {/* Header */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
                  Ajustar Puntos
                </h2>
                <p style={{ color: THEME.textMuted, margin: 0, fontSize: '13px' }}>
                  Usuario: <span style={{ color: THEME.gold, fontWeight: 'bold' }}>{selectedUser.nombre}</span>
                </p>
              </div>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: THEME.darker,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                  }}
                >
                  ⭐
                </span>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: THEME.textMuted }}>
                    Puntos Actuales
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: THEME.gold,
                    }}
                  >
                    {selectedUser.puntos_actuales}
                  </p>
                </div>
              </motion.div>

              {/* Input Label */}
              <label
                style={{
                  display: 'block',
                  color: THEME.textMuted,
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Cantidad a Ajustar
              </label>

              {/* Input Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPoints(points - 10)}
                  style={{
                    background: `${THEME.danger}20`,
                    border: `1.5px solid ${THEME.danger}`,
                    color: THEME.danger,
                    borderRadius: '10px',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '20px',
                  }}
                >
                  <Minus size={24} />
                </motion.button>

                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: THEME.darker,
                    border: `1.5px solid ${THEME.border}`,
                    borderRadius: '10px',
                    color: THEME.text,
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = THEME.gold;
                    e.target.style.boxShadow = `0 0 0 3px ${THEME.gold}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = THEME.border;
                  }}
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPoints(points + 10)}
                  style={{
                    background: `${THEME.success}20`,
                    border: `1.5px solid ${THEME.success}`,
                    color: THEME.success,
                    borderRadius: '10px',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '20px',
                  }}
                >
                  <Plus size={24} />
                </motion.button>
              </motion.div>

              {/* Preview */}
              {points !== 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: points > 0 ? `${THEME.success}10` : `${THEME.danger}10`,
                    border: `1px solid ${points > 0 ? THEME.success : THEME.danger}`,
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                  }}
                >
                  {points > 0 ? (
                    <>
                      <CheckCircle size={16} color={THEME.success} />
                      <span style={{ color: THEME.success }}>
                        Total nuevo: <b>{selectedUser.puntos_actuales + points}</b> puntos
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} color={THEME.danger} />
                      <span style={{ color: THEME.danger }}>
                        Total nuevo: <b>{selectedUser.puntos_actuales + points}</b> puntos
                      </span>
                    </>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: THEME.darker,
                    border: `1.5px solid ${THEME.border}`,
                    color: THEME.text,
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: points !== 0 ? 1.02 : 1 }}
                  whileTap={{ scale: points !== 0 ? 0.98 : 1 }}
                  onClick={handleAdjust}
                  disabled={points === 0}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background:
                      points !== 0
                        ? `linear-gradient(135deg, ${THEME.gold}, #c9a227)`
                        : THEME.border,
                    color: points !== 0 ? THEME.dark : THEME.textMuted,
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: points !== 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                  }}
                >
                  ✓ Confirmar Ajuste
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminUsers;