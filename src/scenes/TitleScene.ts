import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, LEMA } from '../config/constants';
import { GameState } from '../state/GameState';
import { AudioSystem } from '../systems/AudioSystem';

/**
 * Pantalla de título: parallax del campus (cielo, nubes, silueta),
 * logo pixel-art y menú Nuevo Juego / Continuar / Opciones / Créditos.
 */
export class TitleScene extends Phaser.Scene {
  private nubes: Phaser.GameObjects.Image[] = [];
  private opciones: Phaser.GameObjects.Text[] = [];
  private seleccion = 0;
  private panel: Phaser.GameObjects.Container | null = null;
  private enMenu = false; // false = pantalla "PRESIONA ENTER"
  private presionaEnter: Phaser.GameObjects.Text | null = null;

  constructor() { super(SCENES.TITLE); }

  create() {
    const cx = GAME_WIDTH / 2;
    this.nubes = [];
    this.opciones = [];
    this.seleccion = 0;
    this.panel = null;

    // --- parallax ---
    this.add.image(0, 0, 'title_cielo').setOrigin(0);
    for (let i = 0; i < 5; i++) {
      const nube = this.add.image(Math.random() * GAME_WIDTH, 40 + Math.random() * 120, 'title_nube')
        .setAlpha(0.5 + Math.random() * 0.4)
        .setScale(0.7 + Math.random() * 0.8);
      this.nubes.push(nube);
    }
    this.add.image(0, GAME_HEIGHT - 200, 'title_campus').setOrigin(0);

    // --- logo ---
    const logo = this.add.text(cx, 110, 'SANTOTO\n QUEST', {
      fontFamily: 'monospace', fontSize: '56px', color: '#d4af37', fontStyle: 'bold',
      align: 'center', stroke: '#001a4d', strokeThickness: 10, lineSpacing: -14,
    }).setOrigin(0.5);
    this.tweens.add({ targets: logo, y: 104, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.add.text(cx, 192, `— ${LEMA} —`, {
      fontFamily: 'monospace', fontSize: '16px', color: '#f5efe0', stroke: '#001a4d', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT - 16, 'Universidad Santo Tomás · Seccional Tunja · Campus Universitario', {
      fontFamily: 'monospace', fontSize: '11px', color: '#7fa8e8',
    }).setOrigin(0.5);

    // --- pantalla de inicio: "PRESIONA ENTER" parpadeante ---
    this.enMenu = false;
    this.presionaEnter = this.add.text(cx, 300, '- PRESIONA ENTER -', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#001a4d', strokeThickness: 6,
    }).setOrigin(0.5);
    this.tweens.add({ targets: this.presionaEnter, alpha: 0.15, duration: 600, yoyo: true, repeat: -1 });

    // --- teclado ---
    this.input.keyboard!.on('keydown-UP', () => { this.mover(-1); });
    this.input.keyboard!.on('keydown-DOWN', () => { this.mover(1); });
    this.input.keyboard!.on('keydown-ENTER', () => this.accionPrincipal());
    this.input.keyboard!.on('keydown-SPACE', () => this.accionPrincipal());
    this.input.keyboard!.on('keydown-ESC', () => this.cerrarPanel());
    this.input.on('pointerdown', () => { if (!this.enMenu) this.accionPrincipal(); });
  }

  /** ENTER en la pantalla de inicio abre el menú; dentro del menú, elige. */
  private accionPrincipal() {
    if (!this.enMenu) {
      this.enMenu = true;
      AudioSystem.reproducir('titulo');
      AudioSystem.sfx('confirmar');
      this.presionaEnter?.destroy();
      this.presionaEnter = null;
      this.mostrarMenu();
      return;
    }
    this.elegir(this.seleccion);
  }

  private mostrarMenu() {
    const cx = GAME_WIDTH / 2;
    const items = ['Nuevo Juego', 'Continuar', 'Opciones', 'Créditos'];
    items.forEach((txt, i) => {
      const t = this.add.text(cx, 260 + i * 36, txt, {
        fontFamily: 'monospace', fontSize: '20px', color: '#f5efe0', stroke: '#001a4d', strokeThickness: 5,
      }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.seleccion = i; this.pintarMenu(); });
      t.on('pointerdown', () => this.elegir(i));
      this.opciones.push(t);
      // entrada escalonada; "Continuar" atenuado si no hay partida guardada
      const alphaFinal = i === 1 && !GameState.hayPartidaGuardada() ? 0.4 : 1;
      this.tweens.add({ targets: t, alpha: alphaFinal, duration: 250, delay: i * 90 });
    });
    this.pintarMenu();
  }

  update(_t: number, dt: number) {
    this.nubes.forEach((n, i) => {
      n.x += (0.01 + i * 0.006) * dt;
      if (n.x > GAME_WIDTH + 80) n.x = -80;
    });
  }

  private mover(d: number) {
    if (this.panel || !this.enMenu || !this.opciones.length) return;
    AudioSystem.sfx('paso');
    this.seleccion = Phaser.Math.Wrap(this.seleccion + d, 0, this.opciones.length);
    this.pintarMenu();
  }

  private pintarMenu() {
    this.opciones.forEach((t, i) => {
      const activo = i === this.seleccion;
      t.setColor(activo ? '#d4af37' : '#f5efe0');
      t.setText((activo ? '▶ ' : '') + t.text.replace('▶ ', ''));
      t.setScale(activo ? 1.08 : 1);
    });
  }

  private elegir(i: number) {
    if (this.panel) return;
    this.seleccion = i;
    AudioSystem.sfx('confirmar');
    switch (i) {
      case 0:
        this.scene.start(SCENES.CHAR_SELECT);
        break;
      case 1:
        if (GameState.cargar()) {
          AudioSystem.detener();
          this.scene.start(SCENES.OVERWORLD);
        } else {
          this.mostrarPanel('Continuar', 'No hay partida guardada todavía.\n\nInicia un Nuevo Juego y guarda desde\nel menú de pausa (ESC).');
        }
        break;
      case 2: {
        const estado = AudioSystem.silenciado ? 'SILENCIADA' : 'ACTIVA';
        this.mostrarPanel('Opciones',
          `Música: ${estado}\n\n[M] Alternar música\n\nControles:\nFlechas/WASD — moverse · SHIFT — correr\nESPACIO/ENTER — interactuar\nI — inventario · ESC — menú de pausa\nF — pantalla completa`);
        this.input.keyboard!.once('keydown-M', () => {
          AudioSystem.alternarSilencio();
          this.cerrarPanel();
        });
        break;
      }
      case 3:
        this.mostrarPanel('Créditos',
          'SANTOTO QUEST v0.2\n\nUn RPG inspirado en la vida\nuniversitaria tomasina en Tunja.\n\nAmbientado en el Campus Universitario\nde la USTA Tunja — fundada en 1996\npor la Orden de Predicadores.\n\nHecho con Phaser 3 + TypeScript.');
        break;
    }
  }

  private mostrarPanel(titulo: string, cuerpo: string) {
    this.cerrarPanel();
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;
    const fondo = this.add.rectangle(0, 0, 460, 300, COLORS.azulOscuro, 0.96).setStrokeStyle(3, COLORS.dorado);
    const tTitulo = this.add.text(0, -125, titulo, {
      fontFamily: 'monospace', fontSize: '20px', color: '#d4af37', fontStyle: 'bold',
    }).setOrigin(0.5);
    const tCuerpo = this.add.text(0, -95, cuerpo, {
      fontFamily: 'monospace', fontSize: '14px', color: '#f5efe0', align: 'center', lineSpacing: 4,
    }).setOrigin(0.5, 0);
    const tCerrar = this.add.text(0, 125, '[ESC o clic para cerrar]', {
      fontFamily: 'monospace', fontSize: '12px', color: '#7fa8e8',
    }).setOrigin(0.5);
    this.panel = this.add.container(cx, cy, [fondo, tTitulo, tCuerpo, tCerrar]);
    fondo.setInteractive();
    fondo.on('pointerdown', () => this.cerrarPanel());
  }

  private cerrarPanel() {
    this.panel?.destroy();
    this.panel = null;
  }
}
