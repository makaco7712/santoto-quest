import type { Encuentro } from '../state/types';
import { ENCUENTROS_POR_MAPA } from '../data/encuentros';

/**
 * Lógica pura de encuentros aleatorios, desacoplada de las escenas:
 * OverworldScene le informa cada paso y este decide si dispara un
 * encuentro y cuál, según la tabla del mapa, la franja del día y
 * una protección anti-frustración (pasos mínimos entre encuentros).
 */
export class EncounterSystem {
  private pasosSeguros = 0;

  reiniciar() {
    this.pasosSeguros = 0;
  }

  /**
   * Llamar al COMPLETAR un paso.
   * @param mapaId mapa actual
   * @param char carácter del tile pisado
   * @param fase franja del día actual ('mañana' | 'día' | ...)
   * @param tieneAmigos si el jugador ya tiene equipo (sin amigos no hay duelos)
   * @returns el encuentro disparado, o null
   */
  alPisar(mapaId: string, char: string, fase: string, tieneAmigos: boolean): Encuentro | null {
    const cfg = ENCUENTROS_POR_MAPA[mapaId];
    if (!cfg || !cfg.tiles.includes(char)) return null;

    this.pasosSeguros++;
    if (this.pasosSeguros < cfg.pasosMinimos) return null;
    if (Math.random() > cfg.probabilidad) return null;

    const candidatos = cfg.encuentros.filter((e) =>
      (!e.franjas || e.franjas.includes(fase as never)) &&
      (e.tipo !== 'duelo' || tieneAmigos),
    );
    if (!candidatos.length) return null;

    // ruleta ponderada
    const total = candidatos.reduce((s, e) => s + e.peso, 0);
    let r = Math.random() * total;
    for (const e of candidatos) {
      r -= e.peso;
      if (r <= 0) {
        this.pasosSeguros = 0;
        return e;
      }
    }
    this.pasosSeguros = 0;
    return candidatos[candidatos.length - 1];
  }
}
