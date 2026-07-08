import type { CondicionJuego, InteraccionChar } from '../../state/types';

export type DireccionJugador = 'up' | 'down' | 'left' | 'right';

/** Puerta o conexión entre zonas. Si el tile es sólido se activa al
 *  interactuar mirándolo; si es pisable (tapetes de salida '_') se
 *  activa al caminar sobre él. */
export interface PuertaDef {
  x: number;
  y: number;
  destino: { mapa: string; x: number; y: number; direccion?: DireccionJugador };
  requiereItem?: string;
  dialogoSinItem?: string;
}

export interface MapaDef {
  id: string;
  nombre: string;
  grid: string[];
  /** caracteres que bloquean el paso */
  solidos: string;
  /** interior: sin lluvia, tinte día/noche atenuado */
  interior?: boolean;
  /** tema musical de la zona (por defecto 'overworld') */
  tema?: 'overworld' | 'interior' | 'duelo' | 'titulo';
  /** si es true, correr aquí atrae al celador */
  prohibidoCorrer?: boolean;
  /** interacción por tipo de tile; las puertas pueden exigir un ítem clave */
  interaccionesPorChar: Record<string, InteraccionChar>;
  /** interacciones puntuales por coordenada, con reglas condicionales */
  interacciones: { x: number; y: number; reglas: { si?: CondicionJuego; dialogoId: string }[] }[];
  puertas?: PuertaDef[];
  spawn: { x: number; y: number };
}
