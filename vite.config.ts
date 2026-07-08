import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  // empaqueta TODO el juego en un único dist/index.html:
  // se puede abrir con doble clic, sin servidor ni internet
  plugins: [viteSingleFile({ deleteInlinedFiles: true })],
  server: { port: 5173, open: true },
  build: { outDir: 'dist' },
});
