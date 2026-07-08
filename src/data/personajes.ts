import type { PersonajeJugable } from '../state/types';

/** Personajes seleccionables al iniciar partida */
/** El protagonista siempre es Páez: eliges qué carrera estudia. */
export const PERSONAJES: PersonajeJugable[] = [
  {
    id: 'est_derecho',
    nombre: 'Páez',
    carrera: 'Derecho',
    facultad: 'derecho',
    spriteKey: 'pc_derecho',
    descripcion: 'Páez, versión leguleyo: le encanta debatir y sueña con ser magistrado. Llegó desde Sogamoso con una maleta llena de códigos.',
  },
  {
    id: 'est_sistemas',
    nombre: 'Páez',
    carrera: 'Ing. de Sistemas',
    facultad: 'ingenieria',
    spriteKey: 'pc_sistemas',
    descripcion: 'Páez, versión dev: programa desde los 14. Su portátil tiene más stickers que espacio libre. Odia el frío de Tunja pero ama el café.',
  },
  {
    id: 'est_arqui',
    nombre: 'Páez',
    carrera: 'Arquitectura',
    facultad: 'arquitectura',
    spriteKey: 'pc_arqui',
    descripcion: 'Páez, versión creativo: dibuja todo lo que ve. Eligió la USTA por el edificio principal del campus: dice que su bloque volado desafía la gravedad.',
  },
];
