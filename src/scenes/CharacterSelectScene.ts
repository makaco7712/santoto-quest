import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';
import { PERSONAJES } from '../data/personajes';
import { GameState } from '../state/GameState';
import { AudioSystem } from '../systems/AudioSystem';

/** Selección de personaje: 3 estudiantes de programas distintos. */
export class CharacterSelectScene extends Phaser.Scene {
  private seleccion = 0;
  private tarjetas: Phaser.GameObjects.Container[] = [];
  private descripcion!: Phaser.GameObjects.Text;

  constructor() { super(SCENES.CHAR_SELECT); }

  create() {
    this.seleccion = 0;
    this.tarjetas = [];
    const cx = GAME_WIDTH / 2;

    this.add.image(0, 0, 'title_cielo').setOrigin(0).setAlpha(0.8);
    this.add.text(cx, 40, 'Elige tu estudiante', {
      fontFamily: 'monospace', fontSize: '26px', color: '#d4af37', fontStyle: 'bold', stroke: '#001a4d', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(cx, 70, 'Primer día de clases en la USTA Tunja', {
      fontFamily: 'monospace', fontSize: '13px', color: '#f5efe0',
    }).setOrigin(0.5);

    PERSONAJES.forEach((p, i) => {
      const x = cx + (i - 1) * 220;
      const fondo = this.add.rectangle(0, 0, 190, 210, COLORS.azulOscuro, 0.92).setStrokeStyle(3, COLORS.azulClaro);
      const sprite = this.add.image(0, -45, p.spriteKey, 'down_0').setScale(3.2);
      const nombre = this.add.text(0, 30, p.nombre, {
        fontFamily: 'monospace', fontSize: '20px', color: '#f5efe0', fontStyle: 'bold',
      }).setOrigin(0.5);
      const carrera = this.add.text(0, 56, p.carrera, {
        fontFamily: 'monospace', fontSize: '13px', color: '#d4af37',
      }).setOrigin(0.5);
      const cont = this.add.container(x, 210, [fondo, sprite, nombre, carrera]);
      fondo.setInteractive({ useHandCursor: true });
      fondo.on('pointerover', () => { this.seleccion = i; this.pintar(); });
      fondo.on('pointerdown', () => this.confirmar());
      this.tarjetas.push(cont);
    });

    this.descripcion = this.add.text(cx, 350, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#f5efe0', align: 'center',
      wordWrap: { width: 620 }, lineSpacing: 4,
    }).setOrigin(0.5, 0);

    this.add.text(cx, GAME_HEIGHT - 24, '← → elegir   ·   ENTER/ESPACIO confirmar   ·   ESC volver', {
      fontFamily: 'monospace', fontSize: '12px', color: '#7fa8e8',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown-LEFT', () => this.mover(-1));
    this.input.keyboard!.on('keydown-RIGHT', () => this.mover(1));
    this.input.keyboard!.on('keydown-ENTER', () => this.confirmar());
    this.input.keyboard!.on('keydown-SPACE', () => this.confirmar());
    this.input.keyboard!.on('keydown-ESC', () => this.scene.start(SCENES.TITLE));

    this.pintar();
  }

  private mover(d: number) {
    AudioSystem.sfx('paso');
    this.seleccion = Phaser.Math.Wrap(this.seleccion + d, 0, PERSONAJES.length);
    this.pintar();
  }

  private pintar() {
    this.tarjetas.forEach((c, i) => {
      const activo = i === this.seleccion;
      (c.list[0] as Phaser.GameObjects.Rectangle).setStrokeStyle(activo ? 4 : 3, activo ? COLORS.dorado : COLORS.azulClaro);
      c.setScale(activo ? 1.06 : 0.95);
      c.setAlpha(activo ? 1 : 0.75);
    });
    this.descripcion.setText(PERSONAJES[this.seleccion].descripcion);
  }

  private confirmar() {
    const p = PERSONAJES[this.seleccion];
    AudioSystem.sfx('confirmar');
    GameState.nuevaPartida(p.id, p.nombre);
    AudioSystem.detener();
    this.scene.start(SCENES.CUTSCENE, {
      paneles: [
        { titulo: 'Tunja, Boyacá — 6:30 a.m.', texto: 'Hace frío. Siempre hace frío. Pero hoy no es un día cualquiera:\nes tu PRIMER DÍA en la Universidad Santo Tomás.' },
        { titulo: 'Campus Universitario, Av. Universitaria', texto: `${p.nombre} cruza el torniquete del campus.\nCanchas verdes, jardines, y el edificio principal brillando\nen azul y dorado con su bloque flotante. Olor a café.` },
        { titulo: 'Semestre I', texto: 'Dicen que aquí uno encuentra amigos para toda la vida...\ny parciales para toda la semana.\n\n"Sé tu mejor versión." Que empiece la aventura.' },
      ],
      siguienteEscena: SCENES.OVERWORLD,
    });
  }
}
