import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { CutsceneScene } from './scenes/CutsceneScene';
import { OverworldScene } from './scenes/OverworldScene';
import { DialogueScene } from './scenes/DialogueScene';
import { DuelScene } from './scenes/DuelScene';
import { HUDScene } from './scenes/HUDScene';
import { PauseMenuScene } from './scenes/PauseMenuScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0a1128',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    CharacterSelectScene,
    CutsceneScene,
    OverworldScene,
    DialogueScene,
    DuelScene,
    HUDScene,
    PauseMenuScene,
  ],
});

// pantalla completa con la tecla F (requiere gesto del usuario: keydown cuenta)
window.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') {
    if (game.scale.isFullscreen) game.scale.stopFullscreen();
    else game.scale.startFullscreen();
  }
});

// expuesto para depuración en consola
import { GameState } from './state/GameState';
(window as unknown as { __game: Phaser.Game; __estado: unknown }).__game = game;
Object.defineProperty(window, '__estado', { get: () => GameState.get() });
