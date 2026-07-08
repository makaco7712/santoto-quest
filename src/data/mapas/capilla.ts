import type { MapaDef } from './tipos';

/**
 * Capilla del campus — el "Centro Pokémon" del juego.
 * Fray Tomás restaura la energía del equipo gratis. Lore dominico real.
 * SECRETO: el vitral se ve distinto de noche...
 *
 * LEYENDA extra: z altar · v vitral
 */
export const CAPILLA: MapaDef = {
  id: 'capilla',
  nombre: 'Capilla — Santo Tomás de Aquino',
  interior: true,
  tema: 'interior',
  prohibidoCorrer: true,
  grid: [
    'WWWWWvvWWWWW',
    'WxffffffffxW',
    'WffffzzffffW',
    'WffffffffffW',
    'WbbffffffbbW',
    'WffffffffffW',
    'WbbffffffbbW',
    'WffffffffffW',
    'WbbffffffbbW',
    'WffffffffffW',
    'WffffffffffW',
    'WWWWW__WWWWW',
  ],
  solidos: 'Wxzvb',
  interaccionesPorChar: {
    z: 'altar_mirar',
    b: 'banca_capilla',
  },
  interacciones: [
    // el vitral cambia según la hora real
    { x: 5, y: 0, reglas: [{ si: { franja: ['noche'] }, dialogoId: 'vitral_noche' }, { dialogoId: 'vitral_dia' }] },
    { x: 6, y: 0, reglas: [{ si: { franja: ['noche'] }, dialogoId: 'vitral_noche' }, { dialogoId: 'vitral_dia' }] },
  ],
  puertas: [
    { x: 5, y: 11, destino: { mapa: 'vestibulo', x: 14, y: 7, direccion: 'left' } },
    { x: 6, y: 11, destino: { mapa: 'vestibulo', x: 14, y: 7, direccion: 'left' } },
  ],
  spawn: { x: 5, y: 10 },
};
