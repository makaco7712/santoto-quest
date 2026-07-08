// ============================================================
// SANTOTO QUEST — Constantes globales
// Universidad Santo Tomás, Seccional Tunja
// Ambientado en el Campus Universitario (Av. Universitaria).
// La sede del Centro Histórico (antiguo Convento de Santo
// Domingo, Calle 19) llegará como zona especial más adelante.
// ============================================================

export const TILE = 32;               // tamaño de tile en px
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 480;

// Colores institucionales USTA (azul, blanco, dorado)
export const COLORS = {
  azul: 0x003087,
  azulOscuro: 0x001a4d,
  azulClaro: 0x3a6fd8,
  dorado: 0xd4af37,
  doradoClaro: 0xf0d060,
  blanco: 0xffffff,
  crema: 0xf5efe0,       // muros coloniales
  tejaColonial: 0x9c4a2f, // tejados
  piedra: 0x8a8578,      // piso de piedra del claustro
  pasto: 0x4a8f3c,
  pastoOscuro: 0x3d7a30,
  agua: 0x4a90c2,
  madera: 0x6b4a2f,
  noche: 0x1a2a6b,
  texto: '#f5efe0',
  textoDorado: '#d4af37',
  textoAzul: '#7fa8e8',
};

export const LEMA = 'Sé tu mejor versión';

// Claves de escenas
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  TITLE: 'TitleScene',
  CHAR_SELECT: 'CharacterSelectScene',
  CUTSCENE: 'CutsceneScene',
  OVERWORLD: 'OverworldScene',
  DIALOGUE: 'DialogueScene',
  DUEL: 'DuelScene',
  HUD: 'HUDScene',
  PAUSE: 'PauseMenuScene',
} as const;

export const SAVE_KEY = 'santoto-quest-save-v1';

// Velocidad de movimiento en grid (ms por tile)
export const STEP_MS = 170;
// Corriendo (mantén SHIFT)
export const RUN_STEP_MS = 105;

// Ciclo día/noche: usa la hora REAL del sistema.
// franja -> tinte aplicado al mapa
export const DAY_PHASES = [
  { from: 6, to: 10, name: 'mañana', tint: 0xfff2d8, alpha: 0.10 },
  { from: 10, to: 16, name: 'día', tint: 0xffffff, alpha: 0.0 },
  { from: 16, to: 18, name: 'tarde', tint: 0xffc078, alpha: 0.18 },
  { from: 18, to: 21, name: 'atardecer', tint: 0xb06090, alpha: 0.28 },
  { from: 21, to: 24, name: 'noche', tint: 0x1a2a6b, alpha: 0.45 },
  { from: 0, to: 6, name: 'noche', tint: 0x1a2a6b, alpha: 0.45 },
] as const;

export type DayPhaseName = (typeof DAY_PHASES)[number]['name'];

export function currentDayPhase(): (typeof DAY_PHASES)[number] {
  const h = new Date().getHours();
  return DAY_PHASES.find((p) => h >= p.from && h < p.to) ?? DAY_PHASES[1];
}
