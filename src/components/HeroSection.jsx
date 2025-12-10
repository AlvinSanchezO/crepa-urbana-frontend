import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Zap } from 'lucide-react';

const THEME = {
  dark: '#0f0f0f',
  darker: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2a2a2a',
  gold: '#d4af37',
  text: '#ffffff',
  textMuted: '#a0a0a0',
  success: '#10b981',
  primary: '#3b82f6',
};

function HeroSection({ user }) {
  const navigate = useNavigate();

  const stats = [
    { icon: '🌮', label: '+500 Crepas', value: 'Servidas' },
    { icon: '⭐', label: '4.9/5', value: 'Calificación' },
    { icon: '🚀', label: '15 min', value: 'Entrega' },
  ];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoraciones de fondo */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${THEME.gold}15 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${THEME.primary}15 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '80px 20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px',
            alignItems: 'center',
            '@media (min-width: 1024px)': {
              gridTemplateColumns: '1fr 1fr',
            },
          }}
        >
          {/* LEFT: TEXT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: `${THEME.gold}20`,
                border: `1px solid ${THEME.gold}`,
                padding: '10px 16px',
                borderRadius: '20px',
                marginBottom: '20px',
                fontSize: '13px',
                fontWeight: '600',
                color: THEME.gold,
              }}
            >
              <Zap size={14} />
              Ahora disponible en tu zona
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                fontWeight: '900',
                lineHeight: '1.2',
                marginBottom: '16px',
                background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.text})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Crepas Artesanales Urbanas
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                color: THEME.textMuted,
                lineHeight: '1.6',
                marginBottom: '32px',
                maxWidth: '500px',
              }}
            >
              Sabores únicos elaborados con ingredientes premium. Desde lo clásico hasta creaciones modernas que enamorarán tu paladar.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '48px',
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/menu')}
                style={{
                  background: `linear-gradient(135deg, ${THEME.gold}, #c9a227)`,
                  color: THEME.dark,
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 10px 30px ${THEME.gold}40`,
                }}
              >
                Ver Menú
                <ChevronRight size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'transparent',
                  color: THEME.text,
                  border: `1.5px solid ${THEME.border}`,
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Ver Promociones
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '24px',
              }}
            >
              {stats.map((stat, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '13px', color: THEME.textMuted, marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: THEME.gold }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              display: 'none',
              '@media (min-width: 1024px)': {
                display: 'block',
              },
            }}
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              style={{
                background: `linear-gradient(135deg, ${THEME.gold}20, ${THEME.primary}20)`,
                borderRadius: '20px',
                padding: '40px',
                textAlign: 'center',
                border: `1px solid ${THEME.border}`,
              }}
            >
              <div style={{ fontSize: '180px', lineHeight: '1' }}>🌮</div>
              <p style={{ color: THEME.textMuted, fontSize: '14px', marginTop: '16px' }}>
                Nuestras crepas premium
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div
        style={{
          height: '100px',
          background: `linear-gradient(to bottom, ${THEME.dark}00, ${THEME.darker})`,
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}

export default HeroSection;
