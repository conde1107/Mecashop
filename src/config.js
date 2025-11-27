// src/config.js
// Configuración centralizada de API para entornos dev y producción

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const API_SERVER_URL = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:3000';

export const API_BASE = API_BASE_URL;
export const API_URL = API_SERVER_URL;

console.log('🔧 API Configuration:', {
  API_BASE,
  API_URL,
  ENV: import.meta.env.VITE_API_BASE
});
