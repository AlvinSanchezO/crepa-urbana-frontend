import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
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
  danger: '#ef4444',
  primary: '#3b82f6',
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validaciones visuales
  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value.length > 0 && value.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Mínimo 6 caracteres' }));
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación final
    if (!email || !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
      return;
    }
    if (!password || password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Contraseña inválida' }));
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      }

      toast.success('¡Bienvenido! Login exitoso 🎉');
      setTimeout(() => {
        window.location.href = '/menu';
      }, 1000);
    } catch (error) {
      toast.error('Credenciales incorrectas. Intenta de nuevo.');
      setErrors(prev => ({ ...prev, general: 'Email o contraseña incorrectos' }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  // Cargar email guardado
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const isFormValid = email && validateEmail(email) && password && password.length >= 6;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoración de fondo */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${THEME.gold}15 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-50%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${THEME.primary}15 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      {/* Card Principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
          border: `1px solid ${THEME.border}`,
          borderRadius: '20px',
          padding: '48px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 1px rgba(212, 175, 55, 0.3)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo/Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
              animation: 'pulse 2s infinite',
            }}
          >
            🌯
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: THEME.text,
              margin: 0,
              marginBottom: '8px',
            }}
          >
            Crepa Urbana
          </h1>
          <p
            style={{
              color: THEME.textMuted,
              fontSize: '13px',
              margin: 0,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Acceso Seguro
          </p>
        </motion.div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {/* Error General */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: `${THEME.danger}20`,
                border: `1px solid ${THEME.danger}`,
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: THEME.danger,
                fontSize: '13px',
              }}
            >
              <AlertCircle size={16} />
              {errors.general}
            </motion.div>
          )}

          {/* Input Email */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: '20px' }}
          >
            <label
              style={{
                display: 'block',
                color: THEME.textMuted,
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color={THEME.gold}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  background: THEME.darker,
                  border: `1.5px solid ${errors.email ? THEME.danger : email && validateEmail(email) ? THEME.success : THEME.border}`,
                  borderRadius: '10px',
                  color: THEME.text,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = THEME.gold;
                  e.target.style.boxShadow = `0 0 0 3px ${THEME.gold}20`;
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = errors.email
                    ? THEME.danger
                    : email && validateEmail(email)
                    ? THEME.success
                    : THEME.border;
                }}
              />
              {email && validateEmail(email) && (
                <CheckCircle
                  size={18}
                  color={THEME.success}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}
            </div>
            {errors.email && (
              <p
                style={{
                  color: THEME.danger,
                  fontSize: '12px',
                  marginTop: '4px',
                  margin: '4px 0 0 0',
                }}
              >
                {errors.email}
              </p>
            )}
          </motion.div>

          {/* Input Contraseña */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: '24px' }}
          >
            <label
              style={{
                display: 'block',
                color: THEME.textMuted,
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color={THEME.gold}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 44px',
                  background: THEME.darker,
                  border: `1.5px solid ${errors.password ? THEME.danger : password && password.length >= 6 ? THEME.success : THEME.border}`,
                  borderRadius: '10px',
                  color: THEME.text,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = THEME.gold;
                  e.target.style.boxShadow = `0 0 0 3px ${THEME.gold}20`;
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = errors.password
                    ? THEME.danger
                    : password && password.length >= 6
                    ? THEME.success
                    : THEME.border;
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: THEME.gold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p
                style={{
                  color: THEME.danger,
                  fontSize: '12px',
                  margin: '4px 0 0 0',
                }}
              >
                {errors.password}
              </p>
            )}
          </motion.div>

          {/* Remember Me Checkbox */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '28px',
              gap: '8px',
            }}
          >
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: THEME.gold,
              }}
            />
            <label
              htmlFor="rememberMe"
              style={{
                color: THEME.textMuted,
                fontSize: '13px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              Recuerda mi email
            </label>
          </motion.div>

          {/* Botón Submit */}
          <motion.button
            type="submit"
            disabled={!isFormValid || loading}
            whileHover={{ scale: isFormValid && !loading ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid && !loading ? 0.98 : 1 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              width: '100%',
              padding: '14px',
              background: isFormValid
                ? `linear-gradient(135deg, ${THEME.gold}, #c9a227)`
                : `linear-gradient(135deg, ${THEME.border}, ${THEME.border})`,
              color: isFormValid ? THEME.dark : THEME.textMuted,
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: isFormValid
                ? `0 10px 30px ${THEME.gold}40`
                : 'none',
            }}
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ display: 'inline-block' }}
              >
                ⟳
              </motion.span>
            ) : (
              'Acceder'
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            textAlign: 'center',
            padding: '20px 0 0',
            borderTop: `1px solid ${THEME.border}`,
          }}
        >
          <p
            style={{
              color: THEME.textMuted,
              fontSize: '12px',
              margin: 0,
            }}
          >
            ¿Problemas para acceder?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Contacta al administrador para recuperar tu contraseña');
              }}
              style={{
                color: THEME.gold,
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Recupera tu contraseña
            </a>
          </p>
        </motion.div>
      </motion.div>

      {/* CSS para animación pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default Login;