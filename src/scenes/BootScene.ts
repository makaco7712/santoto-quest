import Phaser from 'phaser';
import { SCENES } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() { super(SCENES.BOOT); }
  create() {
    this.scene.start(SCENES.PRELOAD);
  }
}
