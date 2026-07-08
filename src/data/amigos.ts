import type { AmigoDef } from '../state/types';

/**
 * Amigos reclutables — el equivalente a los Pokémon del juego.
 * Sus stats (carisma, disciplina, creatividad) alimentan los duelos académicos.
 * ZONA 1 (Plazoleta): Valentina y Andrés.
 * Los demás se irán añadiendo por zona en los siguientes actos.
 */
export const AMIGOS: AmigoDef[] = [
  {
    id: 'valentina',
    nombre: 'Valentina',
    carrera: 'Derecho',
    facultad: 'derecho',
    spriteKey: 'npc_valentina',
    descripcion: 'Tercer semestre de Derecho. Presidenta del semillero de argumentación jurídica.',
    personalidad: 'Elocuente y directa. Cita artículos de la Constitución en conversaciones casuales.',
    stats: { carisma: 8, disciplina: 6, creatividad: 4, energia: 30 },
    habilidades: [
      { id: 'alegato', nombre: 'Alegato de apertura', descripcion: 'Un argumento demoledor. Trivia de Derecho.', categoria: 'derecho', materia: 'ley', stat: 'carisma', poderBase: 6 },
      { id: 'objecion', nombre: '¡Objeción!', descripcion: 'Interrumpe con lógica jurídica. Trivia general.', categoria: 'general', materia: 'labia', stat: 'disciplina', poderBase: 4 },
    ],
  },
  {
    id: 'andres',
    nombre: 'Andrés',
    carrera: 'Ing. de Sistemas',
    facultad: 'ingenieria',
    spriteKey: 'npc_andres',
    descripcion: 'Cuarto semestre. Monitor de la sala de cómputo y campeón local de programación competitiva.',
    personalidad: 'Tímido hasta que hablas de código. Entonces no hay quien lo calle.',
    stats: { carisma: 3, disciplina: 7, creatividad: 8, energia: 28 },
    habilidades: [
      { id: 'debug', nombre: 'Debug mental', descripcion: 'Encuentra el error en cualquier argumento. Trivia de lógica.', categoria: 'logica', materia: 'logica', stat: 'creatividad', poderBase: 6 },
      { id: 'compilar', nombre: 'Compilar sin errores', descripcion: 'Precisión pura. Trivia de tecnología.', categoria: 'tecnologia', materia: 'codigo', stat: 'disciplina', poderBase: 5 },
    ],
  },
  {
    id: 'felipe',
    nombre: 'Felipe',
    carrera: 'Ing. de Telecomunicaciones',
    facultad: 'ingenieria',
    spriteKey: 'npc_felipe',
    descripcion: 'Quinto semestre. Vive en la Sala de Sistemas y habla en jerga de redes sin darse cuenta.',
    personalidad: 'Relajado hasta que se cae el WiFi. Entonces se convierte en otra persona.',
    stats: { carisma: 5, disciplina: 4, creatividad: 7, energia: 26 },
    habilidades: [
      { id: 'ping', nombre: 'PING insistente', descripcion: 'Pregunta hasta obtener respuesta. Trivia de tecnología.', categoria: 'tecnologia', materia: 'codigo', stat: 'creatividad', poderBase: 5 },
      { id: 'labia_red', nombre: 'Labia de red', descripcion: 'Convence a cualquiera como si repartiera WiFi gratis. Trivia general.', categoria: 'general', materia: 'labia', stat: 'carisma', poderBase: 5 },
    ],
  },
  // ---- Reservados para las próximas zonas (Actos I-III) ----
  // mariana (Arquitectura, San Alberto Magno), jorge (Admón. de Empresas),
  // luisa (Educación), camila (Ciencias Sociales), felipe (Telecomunicaciones),
  // padreTomas (mentor espiritual, Convento) — se agregan al construir sus zonas.
];

export function amigoPorId(id: string): AmigoDef | undefined {
  return AMIGOS.find((a) => a.id === id);
}
