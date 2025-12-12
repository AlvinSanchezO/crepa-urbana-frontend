export const getApiUrl = () => {
  // En producción, usa la URL de Railway
  if (window.location.hostname.includes('railway.app')) {
    return 'https://crepa-urbana-backend-production.up.railway.app';
  }
  
  // En desarrollo, usa localhost
  return 'http://localhost:3000';
};
