import type { MapaDef } from './tipos';

/**
 * Sala de Sistemas — Facultad de Ingeniería (piso 2 del Edificio Principal).
 * Filas de computadores, el rack de servidores (escenario de la misión
 * "El servidor caído") y la Ing. Ruiz: PRIMERA JEFA del juego.
 *
 * LEYENDA extra: S computador · K rack de servidores
 */
export const SALA_SISTEMAS: MapaDef = {
  id: 'sala_sistemas',
  nombre: 'Sala de Sistemas — Ingeniería',
  interior: true,
  tema: 'interior',
  grid: [
    'WWWWWWWWWWWWWWWWWWW',
    'WKKKffffffffffffffW',
    'WfffffffffffffffffW',
    'WffmmSffmmSffmmSffW',
    'WfffffffffffffffffW',
    'WffmmSffmmSffmmSffW',
    'WfffffffffffffffffW',
    'WffmmSffmmSffmmSffW',
    'WfffffffffffffffffW',
    'WxfffffffffffffffxW',
    'WfffffffffffffffffW',
    'WfffffffffffffffffW',
    'WWWWWWWW___WWWWWWWW',
  ],
  solidos: 'WKSmx',
  interaccionesPorChar: {
    S: 'pantalla_sala',
    m: 'escritorio_sala',
  },
  interacciones: [
    // el rack de servidores: objetivo de "El servidor caído"
    ...[1, 2, 3].map((x) => ({
      x, y: 1,
      reglas: [
        { si: { quest: { id: 'servidor_caido', paso: 0 } }, dialogoId: 'rack_descubrimiento' },
        { si: { quest: { id: 'servidor_caido', completada: true } }, dialogoId: 'rack_post' },
        { dialogoId: 'rack_mirar' },
      ],
    })),
  ],
  puertas: [
    { x: 8, y: 12, destino: { mapa: 'vestibulo', x: 10, y: 2, direccion: 'down' } },
    { x: 9, y: 12, destino: { mapa: 'vestibulo', x: 10, y: 2, direccion: 'down' } },
    { x: 10, y: 12, destino: { mapa: 'vestibulo', x: 10, y: 2, direccion: 'down' } },
  ],
  spawn: { x: 9, y: 11 },
};
