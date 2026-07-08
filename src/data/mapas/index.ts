import type { MapaDef } from './tipos';
import { CAMPUS } from './campus';
import { VESTIBULO } from './vestibulo';
import { CAFETERIA } from './cafeteria';
import { CAPILLA } from './capilla';
import { SALA_SISTEMAS } from './sala_sistemas';

export type { MapaDef, PuertaDef, DireccionJugador } from './tipos';

/**
 * Registro de zonas del juego. Para agregar una zona nueva:
 *  1. Crea src/data/mapas/<id>.ts con su MapaDef.
 *  2. Regístrala aquí.
 *  3. Conéctala con `puertas` desde otra zona.
 * Los NPCs se ubican con `posicion: { <id>: [x, y] }` en data/npcs.ts.
 */
export const MAPAS: Record<string, MapaDef> = {
  campus: CAMPUS,
  vestibulo: VESTIBULO,
  cafeteria: CAFETERIA,
  capilla: CAPILLA,
  sala_sistemas: SALA_SISTEMAS,
};

// sanidad en desarrollo: filas parejas y puertas apuntando a mapas existentes
Object.values(MAPAS).forEach((m) => {
  const ancho = m.grid[0].length;
  m.grid.forEach((fila, i) => {
    if (fila.length !== ancho) {
      throw new Error(`Mapa "${m.id}": la fila ${i} tiene ${fila.length} caracteres, se esperaban ${ancho}`);
    }
  });
  m.puertas?.forEach((p) => {
    if (!MAPAS[p.destino.mapa]) {
      throw new Error(`Mapa "${m.id}": puerta en (${p.x},${p.y}) apunta a mapa inexistente "${p.destino.mapa}"`);
    }
  });
});
