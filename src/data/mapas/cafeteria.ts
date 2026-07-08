import type { MapaDef } from './tipos';

/**
 * Cafetería Central — el corazón social del campus.
 * Doña Blanca atiende tras el mostrador (y te fía si le caes bien).
 * Aquí nacerá el rumor del Acto II y la tienda cuando llegue la economía.
 *
 * LEYENDA extra: h mesa · C tablero del menú
 */
export const CAFETERIA: MapaDef = {
  id: 'cafeteria',
  nombre: 'Cafetería Central',
  interior: true,
  tema: 'interior',
  grid: [
    'WWWWWWWWCWWWWWWWW',
    'WxfffffffffffffxW',
    'WmmmmmmfffffffffW',
    'WfffffffffffffffW',
    'WfbhbffbhbffbhbfW',
    'WfffffffffffffffW',
    'Wfbhbffbhbffbhbfq',
    'WfffffffffffffffW',
    'WfbhbffbhbffbhbfW',
    'WfffffffffffffffW',
    'WxfffffffffffffxW',
    'WWWWWWWWWWWWWWWWW',
  ],
  solidos: 'WCmhxbq',
  interaccionesPorChar: {
    C: 'menu_cafeteria',
    h: 'mesa_cafeteria',
  },
  interacciones: [
    // Doña Blanca atiende tras el mostrador: se interactúa por encima de él
    { x: 2, y: 2, reglas: [{ si: { sinFlag: 'blanca_conocida' }, dialogoId: 'blanca_intro' }, { dialogoId: 'blanca_post' }] },
    { x: 3, y: 2, reglas: [{ si: { sinFlag: 'blanca_conocida' }, dialogoId: 'blanca_intro' }, { dialogoId: 'blanca_post' }] },
    { x: 4, y: 2, reglas: [{ si: { sinFlag: 'blanca_conocida' }, dialogoId: 'blanca_intro' }, { dialogoId: 'blanca_post' }] },
  ],
  puertas: [
    { x: 16, y: 6, destino: { mapa: 'vestibulo', x: 1, y: 7, direccion: 'right' } },
  ],
  spawn: { x: 15, y: 6 },
};
