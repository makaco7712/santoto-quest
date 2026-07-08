import type { MapaDef } from './tipos';

/**
 * ZONA 1 — Campus Universitario, USTA Seccional Tunja.
 * Inspirado en el campus real: edificio principal moderno de vidrio azul
 * y paneles dorados (con su bloque volado), cancha de césped, canchas
 * duras, rotonda ajardinada con espejo de agua, plaza de ladrillo y
 * parqueadero (zona de encuentros nocturnos).
 *
 * El mapa se define como texto: cada carácter es un tile de 32x32.
 * LEYENDA:
 *   .  pasto            ,  pasto con flores    =  andén
 *   j  jardín frondoso (ZONA DE ENCUENTROS — ver data/encuentros.ts)
 *   l  plaza de ladrillo w  línea de cancha     c  césped de cancha
 *   k  cancha dura       a  asfalto             p  parqueadero (ENCUENTROS nocturnos)
 *   #  cerca perimetral  E  fachada de vidrio   G  banda de paneles dorados
 *   T  árbol             B  banca               L  farol
 *   F  borde de fuente   ~  espejo de agua      P  tótem/placa institucional
 *   D  puerta Edificio Principal (requiere carnet)
 *   3  puerta Biblioteca-CRAI     M  puerta Bienestar Universitario
 *   A  acceso peatonal (Avenida Universitaria, sur)
 */
export const CAMPUS: MapaDef = {
  id: 'campus',
  nombre: 'Campus Universitario — USTA Tunja',
  tema: 'overworld',
  grid: [
    '################################',
    '#..............................#',
    '#.T...........kkkkkkk..EEEEEEEE#',
    '#.wwwwwwww....kkkkkkk..EEEEEEEE#',
    '#.wccccccw....kkkkkkk..GGGGGGGG#',
    '#.wccccccw...j.........EEEEEEEE#',
    '#.wccccccw....jj.......EEEEEEEE#',
    '#.wccccccw...L.........GGGGGGGG#',
    '#.wwwwwwww.............E3EDDEME#',
    '#.B......B.............llllllll#',
    '#............j....j....ll......#',
    '#............FFFFFF....ll......#',
    '#............F~~~~FP...ll......#',
    '#............F~~~~F....ll......#',
    '#............FFFFFF....ll......#',
    '#..............ll......ll......#',
    '#.jTj..........ll......ll.....,#',
    '#..............ll...aaaaaaaaaaa#',
    '#.jj...........ll...apppppppppa#',
    '#..............ll...aaaaaaaaaaa#',
    '#..............ll..............#',
    '###############AA###############',
  ],
  solidos: '#EGTBFL~P3DMA',
  interaccionesPorChar: {
    F: 'fuente_mirar',
    '~': 'fuente_mirar',
    w: 'cancha_mirar',
    c: 'cancha_mirar',
    k: 'cancha_dura_mirar',
    '3': 'puerta_biblioteca',
    M: 'puerta_bienestar',
    A: 'acceso_peatonal',
  },
  interacciones: [
    {
      x: 19, y: 12, // tótem institucional junto a la rotonda
      reglas: [
        { si: { quest: { id: 'induccion', paso: 1 } }, dialogoId: 'placa_convento' },
        { dialogoId: 'placa_convento_releer' },
      ],
    },
  ],
  puertas: [
    // Edificio Principal: entrada real al vestíbulo (exige carnet)
    { x: 26, y: 8, destino: { mapa: 'vestibulo', x: 7, y: 12, direccion: 'up' }, requiereItem: 'carnet', dialogoSinItem: 'puerta_principal_sin_carnet' },
    { x: 27, y: 8, destino: { mapa: 'vestibulo', x: 8, y: 12, direccion: 'up' }, requiereItem: 'carnet', dialogoSinItem: 'puerta_principal_sin_carnet' },
  ],
  spawn: { x: 16, y: 19 },
};
