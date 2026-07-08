import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, LEMA } from '../config/constants';
import { generarTiles, generarAmbiente, generarPersonaje, generarIconosItems, generarParallax, PALETAS } from '../utils/texturas';

/**
 * Genera todas las texturas placeholder por código.
 * ---------------------------------------------------------------
 * PARA USAR ASSETS REALES: agrega aquí this.load.image(...) /
 * this.load.spritesheet(...) apuntando a /public/assets/ y elimina
 * la generación procedural correspondiente. Las claves de textura
 * deben conservarse (ver utils/texturas.ts).
 * ---------------------------------------------------------------
 */
export class PreloadScene extends Phaser.Scene {
  constructor() { super(SCENES.PRELOAD); }

  create() {
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, COLORS.azulOscuro);
    this.add.text(cx, cy - 20, 'SANTOTO QUEST', {
      fontFamily: 'monospace', fontSize: '32px', color: COLORS.textoDorado, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(cx, cy + 20, `"${LEMA}"`, {
      fontFamily: 'monospace', fontSize: '14px', color: COLORS.texto,
    }).setOrigin(0.5);

    // genera arte placeholder
    generarTiles(this);
    generarAmbiente(this);
    generarIconosItems(this);
    generarParallax(this);
    Object.entries(PALETAS).forEach(([key, paleta]) => generarPersonaje(this, key, paleta));

    this.time.delayedCall(400, () => this.scene.start(SCENES.TITLE));
  }
}
