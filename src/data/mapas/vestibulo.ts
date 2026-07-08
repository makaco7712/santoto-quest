import type { MapaDef } from './tipos';

/**
 * Vestíbulo del Edificio Principal — hub interior.
 * Recepción de Doña Marta, cartelera de anuncios, escaleras a las
 * facultades (próximamente), ascensor fuera de servicio (¿desde 2019?),
 * y puertas a la Cafetería (occidente) y la Capilla (oriente).
 * AQUÍ NO SE CORRE: Don Gustavo vigila.
 *
 * LEYENDA extra: W pared · f baldosa · r tapete · m mostrador
 * C cartelera · s escaleras · e ascensor · x planta · B banca
 * u puerta cafetería · q puerta capilla · _ tapete de salida
 */
export const VESTIBULO: MapaDef = {
  id: 'vestibulo',
  nombre: 'Vestíbulo — Edificio Principal',
  interior: true,
  tema: 'interior',
  prohibidoCorrer: true,
  grid: [
    'WWWWWWWWWWWWWWWW',
    'WxffCCffffssefxW',
    'WffffffffffffffW',
    'WfmmmmmffffffffW',
    'WffffffffffffffW',
    'WffffffffffffffW',
    'WbfffrrrrrrfffbW',
    'uffffrrrrrrffffq',
    'WbfffrrrrrrfffbW',
    'WffffffffffffffW',
    'WxffffffffffffxW',
    'WffffffffffffffW',
    'WffffffffffffffW',
    'WWWWWWW__WWWWWWW',
  ],
  solidos: 'WCmsexuqb',
  interaccionesPorChar: {
    C: 'cartelera_vestibulo',
    e: 'ascensor_bloqueado',
    m: 'mostrador_recepcion',
  },
  interacciones: [],
  puertas: [
    // tapetes de salida al campus
    { x: 7, y: 13, destino: { mapa: 'campus', x: 26, y: 9, direccion: 'down' } },
    { x: 8, y: 13, destino: { mapa: 'campus', x: 27, y: 9, direccion: 'down' } },
    // cafetería (occidente) y capilla (oriente)
    { x: 0, y: 7, destino: { mapa: 'cafeteria', x: 15, y: 6, direccion: 'left' } },
    { x: 15, y: 7, destino: { mapa: 'capilla', x: 5, y: 10, direccion: 'up' } },
    // escaleras al piso 2: Sala de Sistemas (Ingeniería)
    { x: 10, y: 1, destino: { mapa: 'sala_sistemas', x: 9, y: 11, direccion: 'up' } },
    { x: 11, y: 1, destino: { mapa: 'sala_sistemas', x: 9, y: 11, direccion: 'up' } },
  ],
  spawn: { x: 7, y: 12 },
};
