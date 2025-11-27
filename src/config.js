// src/config.js
// Configuración centralizada de API para entornos dev y producción

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Exportar también sin /api para casos donde se necesite la URL base
export const API_URL = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:3000';

console.log('🔧 API Configuration:', {
  API_BASE,
  API_URL,
  Environment: import.meta.env.MODE
});
