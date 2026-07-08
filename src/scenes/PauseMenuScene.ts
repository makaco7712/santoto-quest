import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';
import { GameState } from '../state/GameState';
import { amigoPorId } from '../data/amigos';
import { itemPorId } from '../data/items';
import { QUESTS } from '../data/quests';
import { AudioSystem } from '../systems/AudioSystem';
import type { FacultadId } from '../state/types';

const PESTANAS = ['EQUIPO', 'INVENTARIO', 'MISIONES', 'ESTADÍSTICAS', 'GUARDAR'] as const;
const COLUMNAS_INV = 6;

const NOMBRE_FACULTAD: Record<FacultadId, string> = {
  derecho: 'Derecho',
  arquitectura: 'Arquitectura',
  ingenieria: 'Ing. Telecom./Sistemas',
  administracion: 'Admón. de Empresas',
  educacion: 'Educación',
  sociales: 'Ciencias Sociales',
};

/**
 * Menú de pausa: equipo de amigos, inventario, misiones,
 * estadísticas/reputación y guardar/cargar/exportar/importar.
 */
export class PauseMenuScene extends Phaser.Scene {
  private pestana = 0;
  private contenido: Phaser.GameObjects.GameObject[] = [];
  private tabs: Phaser.GameObjects.Text[] = [];
  private aviso!: Phaser.GameObjects.Text;
  /** selección actual dentro del grid de inventario */
  private invSeleccion = 0;

  constructor() { super(SCENES.PAUSE); }

  init(datos?: { pestana?: number }) {
    this.pestana = datos?.pestana ?? 0;
  }

  create() {
    this.tabs = [];
    this.invSeleccion = 0;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0);
    this.add.rectangle(40, 30, GAME_WIDTH - 80, GAME_HEIGHT - 60, COLORS.azulOscuro, 0.97)
      .setOrigin(0).setStrokeStyle(3, COLORS.dorado);

    PESTANAS.forEach((nombre, i) => {
      const t = this.add.text(70 + i * 140, 44, nombre, {
        fontFamily: 'monospace', fontSize: '13px', color: '#f5efe0', fontStyle: 'bold',
      }).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => { this.pestana = i; this.render(); });
      this.tabs.push(t);
    });

    this.aviso = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 48, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#d4af37',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 68, 'Q/E o ←/→ cambiar pestaña · flechas navegan el inventario · ESC volver', {
      fontFamily: 'monospace', fontSize: '11px', color: '#7fa8e8',
    }).setOrigin(0.5);

    const kb = this.input.keyboard!;
    kb.on('keydown-ESC', () => this.cerrar());
    kb.on('keydown-Q', () => this.cambiarPestana(-1));
    kb.on('keydown-E', () => this.cambiarPestana(1));
    // en INVENTARIO las flechas mueven la selección del grid; en el resto cambian pestaña
    kb.on('keydown-LEFT', () => {
      if (PESTANAS[this.pestana] === 'INVENTARIO') this.moverInv(-1);
      else this.cambiarPestana(-1);
    });
    kb.on('keydown-RIGHT', () => {
      if (PESTANAS[this.pestana] === 'INVENTARIO') this.moverInv(1);
      else this.cambiarPestana(1);
    });
    kb.on('keydown-UP', () => { if (PESTANAS[this.pestana] === 'INVENTARIO') this.moverInv(-COLUMNAS_INV); });
    kb.on('keydown-DOWN', () => { if (PESTANAS[this.pestana] === 'INVENTARIO') this.moverInv(COLUMNAS_INV); });

    this.render();
  }

  private cambiarPestana(d: number) {
    this.pestana = Phaser.Math.Wrap(this.pestana + d, 0, PESTANAS.length);
    this.invSeleccion = 0;
    this.render();
  }

  private moverInv(d: number) {
    const total = Object.keys(GameState.get().inventario).length;
    if (!total) return;
    this.invSeleccion = Phaser.Math.Wrap(this.invSeleccion + d, 0, total);
    this.render();
  }

  private render() {
    AudioSystem.sfx('paso');
    this.contenido.forEach((c) => c.destroy());
    this.contenido = [];
    this.tabs.forEach((t, i) => t.setColor(i === this.pestana ? '#d4af37' : '#f5efe0'));
    this.aviso.setText('');

    const x = 70, y = 84;
    switch (PESTANAS[this.pestana]) {
      case 'EQUIPO': this.renderEquipo(x, y); break;
      case 'INVENTARIO': this.renderInventario(x, y); break;
      case 'MISIONES': this.renderMisiones(x, y); break;
      case 'ESTADÍSTICAS': this.renderStats(x, y); break;
      case 'GUARDAR': this.renderGuardar(x, y); break;
    }
  }

  private texto(x: number, y: number, s: string, color = '#f5efe0', size = 13) {
    const t = this.add.text(x, y, s, {
      fontFamily: 'monospace', fontSize: `${size}px`, color, lineSpacing: 5,
      wordWrap: { width: GAME_WIDTH - 160 },
    });
    this.contenido.push(t);
    return t;
  }

  private renderEquipo(x: number, y: number) {
    const amigos = GameState.get().amigos;
    if (!amigos.length) {
      this.texto(x, y, 'Aún no has reclutado amigos.\n\nHabla con los estudiantes del campus: cada facultad tiene\ncompañeros con talentos únicos para los duelos académicos.');
      return;
    }
    amigos.forEach((id, i) => {
      const a = amigoPorId(id);
      if (!a) return;
      const fy = y + i * 96;
      const stats = GameState.statsEfectivos(id);
      const { nivel, xp, xpSiguiente } = GameState.nivelDe(id);
      const energia = GameState.get().energiaAmigos[id] ?? stats.energia;

      const spr = this.add.image(x + 24, fy + 38, a.spriteKey, 'down_0').setScale(2.2);
      this.contenido.push(spr);
      this.texto(x + 60, fy, `${a.nombre}  Nv.${nivel} — ${a.carrera}`, '#d4af37', 15);

      // barra de energía actual
      const relE = Math.max(0, energia / stats.energia);
      const fondoE = this.add.rectangle(x + 62, fy + 26, 150, 8, 0x1a1a2a).setOrigin(0, 0.5);
      const barraE = this.add.rectangle(x + 62, fy + 26, 150 * relE, 6, relE > 0.5 ? 0x4ad44a : relE > 0.25 ? 0xd4af37 : 0xd44a4a).setOrigin(0, 0.5);
      const txtE = this.texto(x + 220, fy + 19, `⚡ ${energia}/${stats.energia}`, '#f5efe0', 11);
      // barra de experiencia
      const fondoX = this.add.rectangle(x + 330, fy + 26, 120, 8, 0x1a1a2a).setOrigin(0, 0.5);
      const barraX = this.add.rectangle(x + 330, fy + 26, 120 * Math.min(1, xp / xpSiguiente), 6, 0x7fa8e8).setOrigin(0, 0.5);
      const txtX = this.texto(x + 456, fy + 19, `XP ${xp}/${xpSiguiente}`, '#7fa8e8', 11);
      this.contenido.push(fondoE, barraE, txtE, fondoX, barraX, txtX);

      this.texto(x + 60, fy + 38, `Carisma ${stats.carisma} · Disciplina ${stats.disciplina} · Creatividad ${stats.creatividad}`, '#7fa8e8', 12);
      this.texto(x + 60, fy + 56, a.personalidad, '#f5efe0', 12);
      this.texto(x + 60, fy + 74, 'Habilidades: ' + a.habilidades.map((h) => h.nombre).join(' · '), '#9ec8e8', 12);
    });
  }

  /** Grid visual estilo mochila: casillas con ícono y cantidad + panel de detalle. */
  private renderInventario(x: number, y: number) {
    const inv = Object.entries(GameState.get().inventario);
    if (!inv.length) { this.texto(x, y, 'Inventario vacío. El campus está lleno de cosas por encontrar...'); return; }
    if (this.invSeleccion >= inv.length) this.invSeleccion = 0;

    const CELDA = 72, GAP = 10;
    inv.forEach(([id, cant], i) => {
      const item = itemPorId(id);
      if (!item) return;
      const col = i % COLUMNAS_INV;
      const fila = Math.floor(i / COLUMNAS_INV);
      const cx = x + col * (CELDA + GAP) + CELDA / 2;
      const cy = y + fila * (CELDA + GAP) + CELDA / 2;
      const activo = i === this.invSeleccion;

      const celda = this.add.rectangle(cx, cy, CELDA, CELDA, activo ? 0x0d2a6b : 0x001233, 0.95)
        .setStrokeStyle(activo ? 3 : 2, activo ? COLORS.dorado : COLORS.azulClaro)
        .setInteractive({ useHandCursor: true });
      celda.on('pointerover', () => { if (this.invSeleccion !== i) { this.invSeleccion = i; this.render(); } });
      const icono = this.add.image(cx, cy - 6, item.icono).setScale(activo ? 2.2 : 1.8);
      const cantidad = this.add.text(cx + CELDA / 2 - 6, cy + CELDA / 2 - 6, `x${cant}`, {
        fontFamily: 'monospace', fontSize: '12px', color: '#ffd700', fontStyle: 'bold',
      }).setOrigin(1);
      this.contenido.push(celda, icono, cantidad);
      if (activo) this.tweens.add({ targets: icono, scale: 2.4, duration: 300, yoyo: true, repeat: -1 });
    });

    // panel de detalle del ítem seleccionado
    const [idSel, cantSel] = inv[this.invSeleccion];
    const sel = itemPorId(idSel);
    if (sel) {
      const py = y + (Math.floor((inv.length - 1) / COLUMNAS_INV) + 1) * (CELDA + GAP) + 16;
      const etiqueta = sel.tipo === 'clave' ? '[ ÍTEM CLAVE ]' : sel.usableEnDuelo ? '[ CONSUMIBLE · usable en duelos ]' : '[ CONSUMIBLE ]';
      this.texto(x, py, `${sel.nombre}  x${cantSel}`, '#d4af37', 16);
      this.texto(x + 320, py + 2, etiqueta, sel.tipo === 'clave' ? '#c07fe8' : '#7fa8e8', 12);
      this.texto(x, py + 26, sel.descripcion, '#f5efe0', 13);
      if (sel.efectoDuelo?.energia) {
        this.texto(x, py + 50, `Restaura ${sel.efectoDuelo.energia} de energía en duelos académicos.`, '#4ad44a', 12);
      }
    }
  }

  private renderMisiones(x: number, y: number) {
    let fy = y;
    let alguna = false;
    QUESTS.forEach((def) => {
      const q = GameState.get().quests[def.id];
      if (!q) return;
      alguna = true;
      const estadoTxt = q.completada ? '✓ COMPLETADA' : `paso ${q.paso + 1}/${def.pasos.length}`;
      this.texto(x, fy, `[${def.tipo === 'principal' ? 'PRINCIPAL' : 'SECUNDARIA'}] ${def.titulo} — ${estadoTxt}`, q.completada ? '#4ad44a' : '#d4af37', 14);
      fy += 22;
      if (!q.completada) {
        const paso = def.pasos[q.paso];
        this.texto(x + 16, fy, `▶ ${paso.descripcion}`, '#f5efe0', 12);
        fy += 20;
        if (paso.pista) { this.texto(x + 16, fy, `Pista: ${paso.pista}`, '#7fa8e8', 11); fy += 20; }
      }
      fy += 10;
    });
    if (!alguna) this.texto(x, y, 'Sin misiones registradas todavía.');
  }

  private renderStats(x: number, y: number) {
    const e = GameState.get();
    this.texto(x, y, `Estudiante: ${e.jugador.nombre}`, '#d4af37', 15);
    this.texto(x, y + 24, `Tiempo jugado: ${e.minutosJugados} min · Amigos: ${e.amigos.length} · Zona: Plazoleta Central`, '#f5efe0', 12);
    this.texto(x, y + 56, 'REPUTACIÓN POR FACULTAD', '#7fa8e8', 13);
    (Object.keys(NOMBRE_FACULTAD) as FacultadId[]).forEach((fac, i) => {
      const rep = e.reputacion[fac];
      const fy = y + 84 + i * 30;
      this.texto(x, fy, NOMBRE_FACULTAD[fac], '#f5efe0', 12);
      const fondo = this.add.rectangle(x + 220, fy + 7, 204, 12, 0x1a1a2a).setOrigin(0, 0.5);
      const rel = (rep + 100) / 200;
      const barra = this.add.rectangle(x + 222, fy + 7, 200 * rel, 8, rep >= 0 ? 0xd4af37 : 0xd44a4a).setOrigin(0, 0.5);
      const num = this.texto(x + 436, fy, `${rep}`, '#d4af37', 12);
      this.contenido.push(fondo, barra, num);
    });
  }

  private renderGuardar(x: number, y: number) {
    const boton = (fy: number, etiqueta: string, accion: () => void) => {
      const t = this.add.text(x, fy, `[ ${etiqueta} ]`, {
        fontFamily: 'monospace', fontSize: '15px', color: '#f5efe0',
        backgroundColor: '#003087', padding: { x: 10, y: 6 },
      }).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => t.setColor('#d4af37'));
      t.on('pointerout', () => t.setColor('#f5efe0'));
      t.on('pointerdown', accion);
      this.contenido.push(t);
    };

    this.texto(x, y, 'El progreso se guarda en tu navegador (localStorage).\nTambién puedes exportarlo como JSON para respaldarlo o moverlo.', '#f5efe0', 12);

    boton(y + 60, 'GUARDAR PARTIDA', () => {
      this.aviso.setText(GameState.guardar() ? '✓ Partida guardada.' : '✗ No se pudo guardar (localStorage no disponible). Usa EXPORTAR.');
      AudioSystem.sfx('confirmar');
    });
    boton(y + 110, 'EXPORTAR JSON (copiar al portapapeles)', async () => {
      const json = GameState.exportarJSON();
      try {
        await navigator.clipboard.writeText(json);
        this.aviso.setText('✓ JSON copiado al portapapeles.');
      } catch {
        window.prompt('Copia tu partida:', json);
      }
    });
    boton(y + 160, 'IMPORTAR JSON', () => {
      const json = window.prompt('Pega aquí el JSON de tu partida:');
      if (json && GameState.importarJSON(json)) {
        this.aviso.setText('✓ Partida importada. Volviendo al campus...');
        this.time.delayedCall(600, () => {
          this.scene.stop(SCENES.OVERWORLD);
          this.scene.stop(SCENES.HUD);
          this.scene.stop();
          this.scene.start(SCENES.OVERWORLD);
        });
      } else if (json !== null) {
        this.aviso.setText('✗ JSON inválido.');
      }
    });
    boton(y + 210, 'SALIR AL TÍTULO', () => {
      AudioSystem.detener();
      this.scene.stop(SCENES.OVERWORLD);
      this.scene.stop(SCENES.HUD);
      this.scene.stop(SCENES.DIALOGUE);
      this.scene.stop();
      this.scene.start(SCENES.TITLE);
    });
  }

  private cerrar() {
    AudioSystem.sfx('cancelar');
    this.scene.stop();
    this.game.events.emit('pausa-cerrada');
  }
}
