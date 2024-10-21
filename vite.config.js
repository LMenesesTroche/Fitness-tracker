import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // Esto asegura que los archivos se sirvan desde la raíz o la carpeta correcta
});
