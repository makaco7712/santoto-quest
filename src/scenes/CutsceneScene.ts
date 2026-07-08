import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';
import { AudioSystem } from '../systems/AudioSystem';

interface PanelCinematica { titulo: string; texto: string }
interface DatosCutscene { paneles: PanelCinematica[]; siguienteEscena: string }

/**
 * Cinemáticas simples estilo paneles de cómic pixel-art:
 * texto sobre fondo con viñeta, avanza con ESPACIO/clic.
 */
export class CutsceneScene extends Phaser.Scene {
  private datos!: DatosCutscene;
  private indice = 0;
  private contenedor: Phaser.GameObjects.Container | null = null;

  constructor() { super(SCENES.CUTSCENE); }

  init(datos: DatosCutscene) {
    this.datos = datos;
    this.indice = 0;
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0);
    this.mostrarPanel();
    this.input.on('pointerdown', () => this.avanzar());
    this.input.keyboard!.on('keydown-SPACE', () => this.avanzar());
    this.input.keyboard!.on('keydown-ENTER', () => this.avanzar());
  }

  private mostrarPanel() {
    this.contenedor?.destroy();
    const p = this.datos.paneles[this.indice];
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;

    const marco = this.add.rectangle(0, 0, 620, 300, COLORS.azulOscuro).setStrokeStyle(4, COLORS.dorado);
    const decor = this.add.image(0, -60, 'title_campus').setScale(0.55).setAlpha(0.35);
    const titulo = this.add.text(0, -110, p.titulo, {
      fontFamily: 'monospace', fontSize: '18px', color: '#d4af37', fontStyle: 'bold',
    }).setOrigin(0.5);
    const texto = this.add.text(0, 20, p.texto, {
      fontFamily: 'monospace', fontSize: '15px', color: '#f5efe0', align: 'center', lineSpacing: 8,
      wordWrap: { width: 560 },
    }).setOrigin(0.5);
    const pie = this.add.text(0, 130, `[ESPACIO] continuar  ·  ${this.indice + 1}/${this.datos.paneles.length}`, {
      fontFamily: 'monospace', fontSize: '11px', color: '#7fa8e8',
    }).setOrigin(0.5);

    this.contenedor = this.add.container(cx, cy, [marco, decor, titulo, texto, pie]).setAlpha(0);
    this.tweens.add({ targets: this.contenedor, alpha: 1, duration: 350 });
  }

  private avanzar() {
    AudioSystem.sfx('confirmar');
    this.indice++;
    if (this.indice >= this.datos.paneles.length) {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.datos.siguienteEscena));
    } else {
      this.mostrarPanel();
    }
  }
}
