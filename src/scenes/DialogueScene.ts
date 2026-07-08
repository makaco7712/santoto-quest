import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';
import { dialogoPorId } from '../data/dialogos';
import type { NodoDialogo, OpcionDialogo } from '../state/types';
import { GameState } from '../state/GameState';
import { AudioSystem } from '../systems/AudioSystem';

/**
 * Caja de diálogo estilo GBA con efecto máquina de escribir y
 * árboles de decisión. Los efectos (reputación, quests, reclutar,
 * duelos) se aplican vía GameState.
 */
export class DialogueScene extends Phaser.Scene {
  private nodo!: NodoDialogo;
  private textoObj!: Phaser.GameObjects.Text;
  private nombreObj!: Phaser.GameObjects.Text;
  private indicador!: Phaser.GameObjects.Text;
  private opcionObjs: Phaser.GameObjects.Text[] = [];
  private escribiendo = false;
  private timerEscritura: Phaser.Time.TimerEvent | null = null;
  private seleccion = 0;
  private dueloPendiente: string | null = null;
  /** opciones del nodo actual que pasan su condición de inventario (siItem) */
  private opcionesVisibles: OpcionDialogo[] = [];

  constructor() { super(SCENES.DIALOGUE); }

  init(datos: { dialogoId: string }) {
    const nodo = dialogoPorId(datos.dialogoId);
    if (!nodo) throw new Error(`Diálogo no encontrado: ${datos.dialogoId}`);
    this.nodo = nodo;
    this.dueloPendiente = null;
  }

  create() {
    const alto = 130;
    const y = GAME_HEIGHT - alto - 10;

    this.add.rectangle(10, y, GAME_WIDTH - 20, alto, COLORS.azulOscuro, 0.95)
      .setOrigin(0).setStrokeStyle(3, COLORS.dorado);
    this.nombreObj = this.add.text(28, y - 14, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#001a4d', fontStyle: 'bold',
      backgroundColor: '#d4af37', padding: { x: 8, y: 3 },
    });
    this.textoObj = this.add.text(30, y + 18, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#f5efe0',
      wordWrap: { width: GAME_WIDTH - 70 }, lineSpacing: 5,
    });
    this.indicador = this.add.text(GAME_WIDTH - 40, GAME_HEIGHT - 32, '▼', {
      fontFamily: 'monospace', fontSize: '16px', color: '#d4af37',
    }).setVisible(false);
    this.tweens.add({ targets: this.indicador, y: '+=4', duration: 400, yoyo: true, repeat: -1 });

    this.input.keyboard!.on('keydown-SPACE', () => this.accion());
    this.input.keyboard!.on('keydown-ENTER', () => this.accion());
    this.input.keyboard!.on('keydown-UP', () => this.moverSeleccion(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.moverSeleccion(1));
    this.input.on('pointerdown', () => this.accion());

    this.mostrarNodo();
  }

  private mostrarNodo() {
    this.limpiarOpciones();
    this.nombreObj.setText(` ${this.nodo.hablante} `);
    this.indicador.setVisible(false);

    // efectos al entrar al nodo
    const duelo = GameState.aplicarEfectos(this.nodo.efectos);
    if (duelo) this.dueloPendiente = duelo;

    // máquina de escribir
    this.escribiendo = true;
    this.textoObj.setText('');
    let i = 0;
    this.timerEscritura?.remove();
    this.timerEscritura = this.time.addEvent({
      delay: 18,
      repeat: this.nodo.texto.length - 1,
      callback: () => {
        i++;
        this.textoObj.setText(this.nodo.texto.slice(0, i));
        if (i >= this.nodo.texto.length) this.terminarEscritura();
      },
    });
  }

  private terminarEscritura() {
    this.escribiendo = false;
    this.timerEscritura?.remove();
    this.textoObj.setText(this.nodo.texto);
    this.opcionesVisibles = (this.nodo.opciones ?? []).filter(
      (op) => !op.siItem || GameState.tieneItem(op.siItem.itemId, op.siItem.cantidad ?? 1),
    );
    if (this.opcionesVisibles.length) {
      this.mostrarOpciones(this.opcionesVisibles);
    } else {
      this.indicador.setVisible(true);
    }
  }

  private mostrarOpciones(opciones: OpcionDialogo[]) {
    this.seleccion = 0;
    const w = 380;
    const h = opciones.length * 30 + 20;
    const x = GAME_WIDTH - w - 24;
    const y = GAME_HEIGHT - 150 - h;
    const fondo = this.add.rectangle(x, y, w, h, COLORS.azulOscuro, 0.97).setOrigin(0).setStrokeStyle(2, COLORS.azulClaro);
    this.opcionObjs = opciones.map((op, i) => {
      const t = this.add.text(x + 16, y + 12 + i * 30, op.texto, {
        fontFamily: 'monospace', fontSize: '14px', color: '#f5efe0',
      }).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.seleccion = i; this.pintarOpciones(); });
      t.on('pointerdown', () => { this.elegirOpcion(i); });
      return t;
    });
    this.opcionObjs.push(fondo as unknown as Phaser.GameObjects.Text); // para destruir junto
    this.pintarOpciones();
  }

  private pintarOpciones() {
    this.opcionesVisibles.forEach((op, i) => {
      const t = this.opcionObjs[i];
      t.setColor(i === this.seleccion ? '#d4af37' : '#f5efe0');
      t.setText((i === this.seleccion ? '▶ ' : '  ') + op.texto);
    });
  }

  private moverSeleccion(d: number) {
    if (!this.opcionesVisibles.length || this.escribiendo) return;
    AudioSystem.sfx('paso');
    this.seleccion = Phaser.Math.Wrap(this.seleccion + d, 0, this.opcionesVisibles.length);
    this.pintarOpciones();
  }

  private accion() {
    if (this.escribiendo) { this.terminarEscritura(); return; }
    if (this.opcionesVisibles.length) { this.elegirOpcion(this.seleccion); return; }
    AudioSystem.sfx('confirmar');
    if (this.nodo.siguiente) {
      this.irA(this.nodo.siguiente);
    } else {
      this.cerrar();
    }
  }

  private elegirOpcion(i: number) {
    const op = this.opcionesVisibles[i];
    if (!op) return;
    AudioSystem.sfx('confirmar');
    const duelo = GameState.aplicarEfectos(op.efectos);
    if (duelo) this.dueloPendiente = duelo;
    // sonido especial si la opción reclutó a alguien
    if (op.efectos?.some((e) => e.tipo === 'reclutar')) AudioSystem.sfx('reclutar');
    if (op.siguiente) this.irA(op.siguiente);
    else this.cerrar();
  }

  private irA(id: string) {
    const nodo = dialogoPorId(id);
    if (!nodo) { this.cerrar(); return; }
    this.nodo = nodo;
    this.mostrarNodo();
  }

  private limpiarOpciones() {
    this.opcionObjs.forEach((o) => o.destroy());
    this.opcionObjs = [];
  }

  private cerrar() {
    this.timerEscritura?.remove();
    const duelo = this.dueloPendiente;
    this.scene.stop();
    this.game.events.emit('dialogo-terminado', duelo);
  }
}
