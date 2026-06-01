import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ['leaflet-draw'],
  },
  resolve: {
  alias: {
    'leaflet-draw': 'leaflet-draw/dist/leaflet.draw.js',
  },
},


});