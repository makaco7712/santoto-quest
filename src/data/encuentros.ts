import type { ConfigEncuentrosMapa } from '../state/types';

/**
 * Tablas de encuentros aleatorios por mapa — el "pasto alto" del campus.
 * Los tiles 'j' (jardines) y 'p' (celdas del parqueadero, poco iluminadas
 * de noche) disparan encuentros.
 *
 * Tipos:
 *  - duelo: un estudiante genérico te reta a trivia (requiere tener amigos).
 *  - hallazgo: encuentras un ítem en el suelo.
 *  - evento: micro-escena con decisión de una pregunta (vía diálogo).
 */
export const ENCUENTROS_POR_MAPA: Record<string, ConfigEncuentrosMapa> = {
  campus: {
    tiles: 'jp',
    probabilidad: 0.12,
    pasosMinimos: 6,
    encuentros: [
      // duelos espontáneos (el "combate salvaje")
      { tipo: 'duelo', dueloId: 'salvaje_primiparo', peso: 30 },
      { tipo: 'duelo', dueloId: 'salvaje_parciales', peso: 18 },
      { tipo: 'duelo', dueloId: 'salvaje_nono', peso: 10, franjas: ['atardecer', 'noche'] },
      // hallazgos
      { tipo: 'hallazgo', itemId: 'cafe', cantidad: 1, peso: 10 },
      { tipo: 'hallazgo', itemId: 'apuntes', cantidad: 1, peso: 12 },
      { tipo: 'hallazgo', itemId: 'almojabana', cantidad: 1, peso: 8 },
      // eventos de campus
      { tipo: 'evento', dialogoId: 'evento_perro', peso: 12 },
      { tipo: 'evento', dialogoId: 'evento_fotocopias', peso: 8 },
      { tipo: 'evento', dialogoId: 'evento_llovizna', peso: 6, franjas: ['tarde', 'atardecer', 'noche'] },
    ],
  },
};
