// ============================================================
// Tipos de datos del juego — todo el contenido es data-driven.
// ============================================================

/** Facultades reales de la USTA Tunja usadas como facciones */
export type FacultadId =
  | 'derecho'
  | 'arquitectura'
  | 'ingenieria'      // Ing. de Telecomunicaciones / Sistemas
  | 'administracion'
  | 'educacion'
  | 'sociales';

export interface StatsAmigo {
  carisma: number;     // fuerza social — potencia habilidades de persuasión
  disciplina: number;  // defensa / resistencia mental
  creatividad: number; // potencia habilidades de ingenio
  energia: number;     // "HP" en duelos académicos
}

/**
 * Materias académicas — el "sistema de tipos" de los duelos.
 * Cada habilidad tiene una materia; cada oponente tiene debilidades
 * y resistencias que multiplican el daño (x1.5 / x0.5).
 */
export type Materia = 'logica' | 'ley' | 'codigo' | 'labia' | 'arte' | 'deporte' | 'fe';

export const MATERIA_NOMBRE: Record<Materia, string> = {
  logica: 'Lógica', ley: 'Ley', codigo: 'Código', labia: 'Labia',
  arte: 'Arte', deporte: 'Deporte', fe: 'Fe',
};

export interface Habilidad {
  id: string;
  nombre: string;
  descripcion: string;
  /** categoría de trivia que dispara: se toma una pregunta al azar de esa categoría */
  categoria: string;
  /** materia académica (sistema de ventajas) */
  materia: Materia;
  /** stat que escala el daño */
  stat: keyof Omit<StatsAmigo, 'energia'>;
  poderBase: number;
}

export interface AmigoDef {
  id: string;
  nombre: string;
  carrera: string;
  facultad: FacultadId;
  descripcion: string;
  personalidad: string;
  spriteKey: string;
  stats: StatsAmigo;
  habilidades: Habilidad[];
  /** franjas del día en que aparece en el mapa; vacío = siempre */
  apareceEn?: string[];
}

export interface NPCDef {
  id: string;
  nombre: string;
  spriteKey: string;
  /** id del amigo reclutable asociado, si aplica */
  amigoId?: string;
  /** posición inicial por mapa: { mapId: [tileX, tileY] } */
  posicion: Record<string, [number, number]>;
  /** franjas del día en que aparece; vacío/undefined = siempre */
  apareceEn?: string[];
  /** reglas de diálogo evaluadas en orden: la primera cuyo `si` se cumpla gana */
  dialogos: { si?: CondicionJuego; dialogoId: string }[];
}

/** Condición simple evaluada contra GameState */
export interface CondicionJuego {
  flag?: string;          // flag activo
  sinFlag?: string;       // flag NO activo
  quest?: { id: string; paso?: number; completada?: boolean };
  amigoReclutado?: string;
  /** franja del día real en que se cumple (ej: ['noche']) */
  franja?: string[];
}

export type EfectoDialogo =
  | { tipo: 'flag'; flag: string }
  | { tipo: 'rep'; facultad: FacultadId; cantidad: number }
  | { tipo: 'reclutar'; amigoId: string }
  | { tipo: 'quest'; accion: 'iniciar' | 'avanzar' | 'completar'; questId: string }
  | { tipo: 'item'; itemId: string; cantidad: number }
  | { tipo: 'duelo'; dueloId: string }
  | { tipo: 'curar' };  // restaura la energía de todo el equipo

export interface OpcionDialogo {
  texto: string;
  siguiente?: string;
  efectos?: EfectoDialogo[];
  /** la opción solo aparece si el jugador tiene este ítem (cantidad por defecto: 1) */
  siItem?: { itemId: string; cantidad?: number };
}

export interface NodoDialogo {
  id: string;
  hablante: string;
  texto: string;
  siguiente?: string;
  opciones?: OpcionDialogo[];
  efectos?: EfectoDialogo[]; // se aplican al mostrar el nodo
}

export interface PasoQuest {
  descripcion: string;
  /** pista mostrada en el HUD */
  pista?: string;
  /** objetivo visual: el juego dibuja un "!" saltarín sobre el NPC o tile */
  objetivo?: { npcId?: string; tile?: [number, number]; mapa?: string };
}

export interface QuestDef {
  id: string;
  titulo: string;
  tipo: 'principal' | 'secundaria';
  acto: 1 | 2 | 3;
  pasos: PasoQuest[];
  recompensa?: { items?: { itemId: string; cantidad: number }[]; rep?: { facultad: FacultadId; cantidad: number }[] };
}

export interface ItemDef {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string; // clave de textura
  /** consumible: se gasta al usarse · clave: objeto de historia/desbloqueo */
  tipo: 'consumible' | 'clave';
  usableEnDuelo?: boolean;
  efectoDuelo?: { energia?: number };
}

/** Interacción de tile: un diálogo simple o una puerta con requisito de ítem clave */
export type InteraccionChar =
  | string
  | { dialogoId: string; requiereItem?: string; dialogoSinItem?: string };

export interface PreguntaTrivia {
  categoria: string;
  pregunta: string;
  opciones: string[];
  correcta: number; // índice
}

export interface DueloDef {
  id: string;
  oponente: string;
  spriteKey: string;
  titulo: string;
  energia: number;
  danoBase: number;         // daño que hace el oponente por turno
  categorias: string[];     // categorías de trivia que usa
  /** materias contra las que es débil (daño x1.5) */
  debil?: Materia[];
  /** materias que resiste (daño x0.5) */
  resistente?: Materia[];
  /** nombres de sus ataques (telegraph del turno enemigo) */
  ataques?: string[];
  /** JEFE: cada N turnos "carga" un ataque devastador; se interrumpe
   *  acertando 2 preguntas seguidas mientras carga */
  esJefe?: boolean;
  cargaTurnos?: number;
  /** efectos al ganar */
  alGanar?: EfectoDialogo[];
  /** efectos al perder (consecuencias reales: reputación, flags de historia) */
  alPerder?: EfectoDialogo[];
  dialogoVictoria?: string;
  dialogoDerrota?: string;
}

export interface PersonajeJugable {
  id: string;
  nombre: string;
  carrera: string;
  facultad: FacultadId;
  spriteKey: string;
  descripcion: string;
}

// ---------- Encuentros aleatorios ----------

/** Un encuentro posible al caminar por zonas de encuentro (jardines, parqueaderos...) */
export type Encuentro =
  | { tipo: 'duelo'; dueloId: string; peso: number; franjas?: DayPhaseNameLike[] }
  | { tipo: 'hallazgo'; itemId: string; cantidad: number; peso: number; franjas?: DayPhaseNameLike[] }
  | { tipo: 'evento'; dialogoId: string; peso: number; franjas?: DayPhaseNameLike[] };

/** nombres de franja del día (ver DAY_PHASES en constants.ts) */
export type DayPhaseNameLike = 'mañana' | 'día' | 'tarde' | 'atardecer' | 'noche';

export interface ConfigEncuentrosMapa {
  /** caracteres del grid que cuentan como zona de encuentro */
  tiles: string;
  /** probabilidad de encuentro por paso (0-1) una vez superados los pasos mínimos */
  probabilidad: number;
  /** pasos mínimos sobre zona de encuentro entre un encuentro y el siguiente */
  pasosMinimos: number;
  encuentros: Encuentro[];
}

// ---------- Estado serializable ----------

export interface EstadoJuego {
  version: number;
  jugador: {
    personajeId: string;
    nombre: string;
    mapa: string;
    x: number; // tile
    y: number;
    direccion: 'up' | 'down' | 'left' | 'right';
  };
  flags: Record<string, boolean>;
  quests: Record<string, { paso: number; completada: boolean }>;
  amigos: string[]; // ids reclutados
  /** energía actual de cada amigo — PERSISTE entre duelos (cúrala en la capilla) */
  energiaAmigos: Record<string, number>;
  /** nivel y experiencia de cada amigo */
  xpAmigos: Record<string, { nivel: number; xp: number }>;
  inventario: Record<string, number>;
  reputacion: Record<FacultadId, number>;
  minutosJugados: number;
}
