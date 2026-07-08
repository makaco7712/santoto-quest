import { SAVE_KEY, currentDayPhase } from '../config/constants';
import type { EstadoJuego, EfectoDialogo, CondicionJuego, FacultadId } from './types';
import { QUESTS } from '../data/quests';
import { AMIGOS } from '../data/amigos';
import { ITEMS } from '../data/items';
import { MAPAS } from '../data/mapas/index';

export type TipoAviso = 'exito' | 'info' | 'item' | 'amigo' | 'mision';

/**
 * Estado global del juego — singleton serializable.
 * Guarda en localStorage y además permite exportar/importar JSON
 * (para entornos donde localStorage no esté disponible).
 */
class GameStateManager {
  private estado: EstadoJuego = this.estadoInicial();
  /** listeners para reaccionar a cambios (HUD, quests, etc.) */
  private listeners: Array<(e: EstadoJuego) => void> = [];

  estadoInicial(): EstadoJuego {
    return {
      version: 1,
      jugador: { personajeId: 'est_derecho', nombre: 'Páez', mapa: 'campus', x: 16, y: 19, direccion: 'up' },
      flags: {},
      quests: {},
      amigos: [],
      energiaAmigos: {},
      xpAmigos: {},
      inventario: { carnet: 1 },
      reputacion: { derecho: 0, arquitectura: 0, ingenieria: 0, administracion: 0, educacion: 0, sociales: 0 },
      minutosJugados: 0,
    };
  }

  get(): EstadoJuego { return this.estado; }

  nuevaPartida(personajeId: string, nombre: string) {
    this.estado = this.estadoInicial();
    this.estado.jugador.personajeId = personajeId;
    this.estado.jugador.nombre = nombre;
    this.notificar();
  }

  suscribir(fn: (e: EstadoJuego) => void) { this.listeners.push(fn); }
  desuscribir(fn: (e: EstadoJuego) => void) { this.listeners = this.listeners.filter((f) => f !== fn); }
  private notificar() { this.listeners.forEach((f) => f(this.estado)); }

  // ---------- avisos visuales (toasts del HUD) ----------

  private avisoListeners: Array<(texto: string, tipo: TipoAviso) => void> = [];
  onAviso(fn: (texto: string, tipo: TipoAviso) => void) { this.avisoListeners.push(fn); }
  offAviso(fn: (texto: string, tipo: TipoAviso) => void) { this.avisoListeners = this.avisoListeners.filter((f) => f !== fn); }
  aviso(texto: string, tipo: TipoAviso = 'info') { this.avisoListeners.forEach((f) => f(texto, tipo)); }

  // ---------- flags / condiciones ----------

  setFlag(flag: string) { this.estado.flags[flag] = true; this.notificar(); }
  tieneFlag(flag: string) { return !!this.estado.flags[flag]; }

  cumple(cond?: CondicionJuego): boolean {
    if (!cond) return true;
    if (cond.flag && !this.tieneFlag(cond.flag)) return false;
    if (cond.sinFlag && this.tieneFlag(cond.sinFlag)) return false;
    if (cond.amigoReclutado && !this.estado.amigos.includes(cond.amigoReclutado)) return false;
    if (cond.franja && !cond.franja.includes(currentDayPhase().name)) return false;
    if (cond.quest) {
      const q = this.estado.quests[cond.quest.id];
      if (cond.quest.completada !== undefined) {
        if (!!q?.completada !== cond.quest.completada) return false;
      }
      if (cond.quest.paso !== undefined) {
        if (!q || q.completada || q.paso !== cond.quest.paso) return false;
      }
    }
    return true;
  }

  // ---------- quests ----------

  iniciarQuest(id: string) {
    if (!this.estado.quests[id]) {
      this.estado.quests[id] = { paso: 0, completada: false };
      const def = QUESTS.find((d) => d.id === id);
      if (def) this.aviso(`Nueva misión: ${def.titulo}`, 'mision');
      this.notificar();
    }
  }

  avanzarQuest(id: string) {
    const q = this.estado.quests[id];
    const def = QUESTS.find((d) => d.id === id);
    if (!q || q.completada || !def) return;
    q.paso++;
    if (q.paso >= def.pasos.length) {
      this.completarQuest(id);
    } else {
      this.aviso('✓ Objetivo cumplido', 'exito');
    }
    this.notificar();
  }

  completarQuest(id: string) {
    const q = this.estado.quests[id];
    const def = QUESTS.find((d) => d.id === id);
    if (!q || q.completada) return;
    q.completada = true;
    if (def) this.aviso(`🏆 Misión completada: ${def.titulo}`, 'mision');
    def?.recompensa?.items?.forEach((r) => this.darItem(r.itemId, r.cantidad));
    def?.recompensa?.rep?.forEach((r) => this.subirRep(r.facultad, r.cantidad));
    this.notificar();
    this.autoguardar();
  }

  questActiva() {
    for (const def of QUESTS) {
      const q = this.estado.quests[def.id];
      if (q && !q.completada) return { def, paso: q.paso };
    }
    return null;
  }

  // ---------- amigos / items / reputación ----------

  reclutarAmigo(id: string) {
    if (!this.estado.amigos.includes(id)) {
      this.estado.amigos.push(id);
      const amigo = AMIGOS.find((a) => a.id === id);
      this.estado.energiaAmigos[id] = amigo?.stats.energia ?? 20;
      this.estado.xpAmigos[id] = { nivel: 1, xp: 0 };
      this.aviso(`★ ¡${amigo?.nombre ?? id} se une a tu parche!`, 'amigo');
      this.notificar();
      this.autoguardar();
    }
  }

  /** Restaura la energía de todo el equipo (capilla, rescates). */
  curarEquipo() {
    this.estado.amigos.forEach((id) => {
      this.estado.energiaAmigos[id] = this.statsEfectivos(id).energia;
    });
    this.aviso('✚ Tu equipo recuperó todas sus energías', 'exito');
    this.notificar();
  }

  // ---------- niveles y experiencia ----------

  nivelDe(id: string): { nivel: number; xp: number; xpSiguiente: number } {
    const reg = this.estado.xpAmigos[id] ?? { nivel: 1, xp: 0 };
    return { ...reg, xpSiguiente: reg.nivel * 20 };
  }

  /** Stats reales de un amigo: base + bonus por nivel (+1 stats, +3 energía por nivel). */
  statsEfectivos(id: string) {
    const base = AMIGOS.find((a) => a.id === id)?.stats ?? { carisma: 3, disciplina: 3, creatividad: 3, energia: 20 };
    const nivel = this.estado.xpAmigos[id]?.nivel ?? 1;
    const bono = nivel - 1;
    return {
      carisma: base.carisma + bono,
      disciplina: base.disciplina + bono,
      creatividad: base.creatividad + bono,
      energia: base.energia + bono * 3,
    };
  }

  /** Otorga XP a un amigo; maneja subidas de nivel con aviso. */
  darXP(id: string, cantidad: number) {
    const reg = (this.estado.xpAmigos[id] ??= { nivel: 1, xp: 0 });
    reg.xp += cantidad;
    const amigo = AMIGOS.find((a) => a.id === id);
    let necesario = reg.nivel * 20;
    while (reg.xp >= necesario) {
      reg.xp -= necesario;
      reg.nivel++;
      necesario = reg.nivel * 20;
      this.aviso(`⬆ ¡${amigo?.nombre ?? id} subió al nivel ${reg.nivel}!`, 'amigo');
      // pequeño respiro al subir: +3 de energía actual (sin pasar el máximo)
      const max = this.statsEfectivos(id).energia;
      this.estado.energiaAmigos[id] = Math.min(max, (this.estado.energiaAmigos[id] ?? 0) + 3);
    }
    this.notificar();
  }

  /** energía total disponible del equipo (0 = agotados, nadie puede duelar) */
  energiaTotalEquipo(): number {
    return this.estado.amigos.reduce((s, id) => s + (this.estado.energiaAmigos[id] ?? 0), 0);
  }

  tieneItem(itemId: string, cantidad = 1): boolean {
    return (this.estado.inventario[itemId] ?? 0) >= cantidad;
  }

  darItem(itemId: string, cantidad: number) {
    this.estado.inventario[itemId] = (this.estado.inventario[itemId] ?? 0) + cantidad;
    if (this.estado.inventario[itemId] <= 0) delete this.estado.inventario[itemId];
    if (cantidad > 0) {
      const item = ITEMS.find((i) => i.id === itemId);
      this.aviso(`+${cantidad} ${item?.nombre ?? itemId}`, 'item');
    }
    this.notificar();
  }

  subirRep(facultad: FacultadId, cantidad: number) {
    this.estado.reputacion[facultad] = Phaser.Math.Clamp(this.estado.reputacion[facultad] + cantidad, -100, 100);
    if (cantidad !== 0) {
      const nombres: Record<FacultadId, string> = {
        derecho: 'Derecho', arquitectura: 'Arquitectura', ingenieria: 'Ingeniería',
        administracion: 'Administración', educacion: 'Educación', sociales: 'C. Sociales',
      };
      this.aviso(`${cantidad > 0 ? '+' : ''}${cantidad} reputación con ${nombres[facultad]}`, 'info');
    }
    this.notificar();
  }

  /** Aplica efectos de diálogo/duelo. Devuelve id de duelo si uno debe iniciarse. */
  aplicarEfectos(efectos?: EfectoDialogo[]): string | null {
    let duelo: string | null = null;
    efectos?.forEach((e) => {
      switch (e.tipo) {
        case 'flag': this.setFlag(e.flag); break;
        case 'curar': this.curarEquipo(); break;
        case 'rep': this.subirRep(e.facultad, e.cantidad); break;
        case 'reclutar': this.reclutarAmigo(e.amigoId); break;
        case 'item': this.darItem(e.itemId, e.cantidad); break;
        case 'duelo': duelo = e.dueloId; break;
        case 'quest':
          if (e.accion === 'iniciar') this.iniciarQuest(e.questId);
          else if (e.accion === 'avanzar') this.avanzarQuest(e.questId);
          else this.completarQuest(e.questId);
          break;
      }
    });
    return duelo;
  }

  // ---------- guardado ----------

  guardar(): boolean {
    try {
      localStorage.setItem(SAVE_KEY, this.exportarJSON());
      return true;
    } catch { return false; }
  }

  /** Guardado silencioso en hitos (entrar a zona, completar misión, reclutar). */
  autoguardar() {
    if (this.guardar()) this.aviso('💾 Progreso guardado', 'info');
  }

  cargar(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      return this.importarJSON(raw);
    } catch { return false; }
  }

  hayPartidaGuardada(): boolean {
    try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
  }

  exportarJSON(): string { return JSON.stringify(this.estado); }

  importarJSON(json: string): boolean {
    try {
      const data = JSON.parse(json) as EstadoJuego;
      if (!data.jugador || data.version !== 1) return false;
      // partidas de mapas que ya no existen vuelven al spawn del campus
      if (!MAPAS[data.jugador.mapa]) {
        const inicial = this.estadoInicial().jugador;
        data.jugador.mapa = inicial.mapa;
        data.jugador.x = inicial.x;
        data.jugador.y = inicial.y;
      }
      // migración: partidas viejas sin energía persistente ni niveles
      data.energiaAmigos ??= {};
      data.xpAmigos ??= {};
      data.amigos.forEach((id) => {
        if (data.energiaAmigos[id] === undefined) {
          data.energiaAmigos[id] = AMIGOS.find((a) => a.id === id)?.stats.energia ?? 20;
        }
        data.xpAmigos[id] ??= { nivel: 1, xp: 0 };
      });
      this.estado = data;
      this.notificar();
      return true;
    } catch { return false; }
  }
}

export const GameState = new GameStateManager();
