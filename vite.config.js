import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin para reemplazar URLs de localhost en producción
function replaceLocalhostPlugin() {
  return {
    name: 'replace-localhost',
    transform(code, id) {
      if (id.endsWith('.jsx') || id.endsWith('.js')) {
        const apiBase = process.env.VITE_API_BASE || 'http://localhost:3000/api';
        const apiUrl = apiBase.replace('/api', '');
        
        // Reemplazar todas las instancias de localhost
        code = code.replace(/"http:\/\/localhost:3000\/api/g, `"${apiBase}`);
        code = code.replace(/'http:\/\/localhost:3000\/api/g, `'${apiBase}`);
        code = code.replace(/"http:\/\/localhost:3000/g, `"${apiUrl}`);
        code = code.replace(/'http:\/\/localhost:3000/g, `'${apiUrl}`);
      }
      return code;
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), replaceLocalhostPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
