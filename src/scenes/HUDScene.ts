import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, currentDayPhase } from '../config/constants';
import { GameState, type TipoAviso } from '../state/GameState';
import { QUESTS } from '../data/quests';
import { MAPAS } from '../data/mapas/index';

const ESTILO_AVISO: Record<TipoAviso, { fondo: number; borde: number; color: string }> = {
  exito: { fondo: 0x0d3d1a, borde: 0x4ad44a, color: '#b8f0b8' },
  info: { fondo: 0x001a4d, borde: 0x3a6fd8, color: '#cfe0ff' },
  item: { fondo: 0x3d2a0d, borde: 0xd4af37, color: '#ffe9a8' },
  amigo: { fondo: 0x001a4d, borde: 0xd4af37, color: '#ffd700' },
  mision: { fondo: 0x2a0d3d, borde: 0xc07fe8, color: '#ecd0ff' },
};

/**
 * HUD superpuesto al Overworld: misión activa, mini-mapa,
 * contador de amigos, reloj con fase del día y clima.
 */
export class HUDScene extends Phaser.Scene {
  private textoQuest!: Phaser.GameObjects.Text;
  private textoAmigos!: Phaser.GameObjects.Text;
  private textoReloj!: Phaser.GameObjects.Text;
  private textoClima!: Phaser.GameObjects.Text;
  private minimapa!: Phaser.GameObjects.Graphics;
  private puntoJugador!: Phaser.GameObjects.Rectangle;
  private escalaMini = 3;
  private miniX = 0;
  private miniY = 8;
  private actualizar = () => this.refrescar();
  private toasts: Phaser.GameObjects.Container[] = [];
  private mostrarAviso = (texto: string, tipo: TipoAviso) => this.toast(texto, tipo);

  constructor() { super(SCENES.HUD); }

  create() {
    // ---- tracker de misión (arriba izquierda) ----
    this.add.rectangle(8, 8, 330, 64, COLORS.azulOscuro, 0.85).setOrigin(0).setStrokeStyle(2, COLORS.dorado);
    this.textoQuest = this.add.text(16, 14, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#f5efe0',
      wordWrap: { width: 310 }, lineSpacing: 3,
    });

    // ---- mini-mapa (arriba derecha) ----
    const mapa = MAPAS[GameState.get().jugador.mapa] ?? MAPAS.campus;
    const anchoMini = mapa.grid[0].length * this.escalaMini;
    this.miniX = GAME_WIDTH - anchoMini - 8;
    this.minimapa = this.add.graphics({ x: this.miniX, y: this.miniY });
    this.minimapa.fillStyle(0x001a4d, 0.9);
    this.minimapa.fillRect(-2, -2, anchoMini + 4, mapa.grid.length * this.escalaMini + 4);
    mapa.grid.forEach((fila, y) => {
      for (let x = 0; x < fila.length; x++) {
        const ch = fila[x];
        const color = ch === 'E' || ch === 'D' || ch === '3' || ch === 'M' ? 0x2a5aa8 // edificio vidrio
          : ch === 'G' ? 0xd4af37                                                    // banda dorada
          : '#RAW'.includes(ch) ? 0x6e6e78                                           // muros/cercas
          : ch === 'l' ? 0xa05a42                                                    // plaza ladrillo
          : '=L'.includes(ch) ? 0xb5b0a0                                             // andén
          : 'ap_'.includes(ch) ? 0x4a4a52                                            // parqueadero/salidas
          : 'cw'.includes(ch) ? 0x46b04e                                             // cancha césped
          : ch === 'k' ? 0x2a6a9a                                                    // cancha dura
          : 'F~'.includes(ch) ? 0x4a90c2                                             // agua
          : 'Tjx'.includes(ch) ? 0x2d6b25                                            // árboles/plantas
          : 'Pzv'.includes(ch) ? 0xffd700                                            // tótem/altar/vitral
          : 'fse'.includes(ch) ? 0xcfc9bc                                            // baldosa interior
          : 'rmhCuqBb'.includes(ch) ? 0x84603f                                       // mobiliario/madera
          : ch === 'W' ? 0x8a8578                                                    // pared interior
          : 'SK'.includes(ch) ? 0x2a2a3a                                             // computadores/rack
          : ch === '_' ? 0xd4af37                                                    // tapete de salida
          : 0x4a8f3c;                                                                // pasto
        this.minimapa.fillStyle(color, 1);
        this.minimapa.fillRect(x * this.escalaMini, y * this.escalaMini, this.escalaMini, this.escalaMini);
      }
    });
    this.puntoJugador = this.add.rectangle(0, 0, this.escalaMini + 1, this.escalaMini + 1, 0xffd700);

    // ---- barra inferior de estado ----
    this.textoAmigos = this.add.text(12, 458, '', { fontFamily: 'monospace', fontSize: '12px', color: '#d4af37' });
    this.textoReloj = this.add.text(GAME_WIDTH - 12, 458, '', { fontFamily: 'monospace', fontSize: '12px', color: '#7fa8e8' }).setOrigin(1, 0);
    this.textoClima = this.add.text(GAME_WIDTH / 2, 458, '', { fontFamily: 'monospace', fontSize: '12px', color: '#9ec8e8' }).setOrigin(0.5, 0);

    GameState.suscribir(this.actualizar);
    GameState.onAviso(this.mostrarAviso);
    this.events.on('shutdown', () => {
      GameState.desuscribir(this.actualizar);
      GameState.offAviso(this.mostrarAviso);
    });
    this.game.events.on('clima-cambio', (lluvia: boolean) => {
      this.textoClima.setText(lluvia ? '🌧 Lluvia sobre Tunja' : '');
    });

    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.refrescarReloj() });
    this.refrescar();
    this.refrescarReloj();
  }

  update() {
    const j = GameState.get().jugador;
    this.puntoJugador.setPosition(
      this.miniX + j.x * this.escalaMini + this.escalaMini / 2,
      this.miniY + j.y * this.escalaMini + this.escalaMini / 2,
    );
  }

  private refrescar() {
    const activa = GameState.questActiva();
    if (activa) {
      const paso = activa.def.pasos[activa.paso];
      this.textoQuest.setText(`★ ${activa.def.titulo} (${activa.paso + 1}/${activa.def.pasos.length})\n${paso?.pista ?? paso?.descripcion ?? ''}`);
    } else {
      const completadas = QUESTS.filter((q) => GameState.get().quests[q.id]?.completada).length;
      this.textoQuest.setText(`✓ Sin misiones activas\nMisiones completadas: ${completadas}. Explora el campus...`);
    }
    this.textoAmigos.setText(`Amigos: ${GameState.get().amigos.length} ★   [ESC] Menú`);
  }

  /** Banner animado que entra desde arriba, se apila y se desvanece. */
  private toast(texto: string, tipo: TipoAviso) {
    const estilo = ESTILO_AVISO[tipo];
    const esAmigo = tipo === 'amigo' || tipo === 'mision';
    const tam = esAmigo ? 17 : 13;
    const txt = this.add.text(0, 0, texto, {
      fontFamily: 'monospace', fontSize: `${tam}px`, color: estilo.color, fontStyle: esAmigo ? 'bold' : 'normal',
    }).setOrigin(0.5);
    const w = Math.max(txt.width + 36, 220);
    const h = esAmigo ? 40 : 30;
    const fondo = this.add.rectangle(0, 0, w, h, estilo.fondo, 0.95).setStrokeStyle(2, estilo.borde);
    const cont = this.add.container(GAME_WIDTH / 2, -40, [fondo, txt]).setDepth(100);
    this.toasts.push(cont);
    this.reacomodarToasts();

    // entrada con rebote
    this.tweens.add({ targets: cont, y: cont.getData('destinoY'), duration: 380, ease: 'Back.out' });
    // brillo pulsante para avisos importantes
    if (esAmigo) {
      this.tweens.add({ targets: fondo, scaleX: 1.03, scaleY: 1.1, duration: 300, yoyo: true, repeat: 2 });
      this.explosionEstrellas(GAME_WIDTH / 2, 110);
    }
    // salida
    this.time.delayedCall(esAmigo ? 3200 : 2300, () => {
      this.tweens.add({
        targets: cont, alpha: 0, y: '-=20', duration: 350,
        onComplete: () => {
          this.toasts = this.toasts.filter((t) => t !== cont);
          cont.destroy();
          this.reacomodarToasts();
        },
      });
    });
  }

  private reacomodarToasts() {
    let y = 96;
    this.toasts.forEach((t) => {
      t.setData('destinoY', y);
      if (t.y > 0) this.tweens.add({ targets: t, y, duration: 200 });
      y += 42;
    });
  }

  /** Lluvia de estrellas doradas para celebrar reclutamientos y misiones. */
  private explosionEstrellas(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const estrella = this.add.text(x, y, '★', {
        fontSize: `${Phaser.Math.Between(10, 20)}px`,
        color: i % 3 === 0 ? '#ffffff' : '#ffd700',
      }).setOrigin(0.5).setDepth(99);
      const ang = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(50, 150);
      this.tweens.add({
        targets: estrella,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist + 40,
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: Phaser.Math.Between(600, 1100),
        ease: 'Cubic.out',
        onComplete: () => estrella.destroy(),
      });
    }
  }

  private refrescarReloj() {
    const ahora = new Date();
    const hh = String(ahora.getHours()).padStart(2, '0');
    const mm = String(ahora.getMinutes()).padStart(2, '0');
    this.textoReloj.setText(`${hh}:${mm} — ${currentDayPhase().name}`);
  }
}
