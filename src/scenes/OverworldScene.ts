import Phaser from 'phaser';
import { SCENES, TILE, STEP_MS, RUN_STEP_MS, GAME_WIDTH, GAME_HEIGHT, currentDayPhase } from '../config/constants';
import { CHAR_A_TILE, VARIANTES_CHAR, AGUA_FRAMES } from '../utils/texturas';
import { MAPAS, type MapaDef, type PuertaDef } from '../data/mapas/index';
import { NPCS } from '../data/npcs';
import { GameState } from '../state/GameState';
import { AudioSystem } from '../systems/AudioSystem';
import { EncounterSystem } from '../systems/EncounterSystem';
import type { Encuentro } from '../state/types';

type Dir = 'up' | 'down' | 'left' | 'right';
const DELTA: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/**
 * Mundo explorable: movimiento en grid 32x32, colisión, cámara con lerp,
 * ciclo día/noche real, lluvia dinámica e interacción con NPCs/objetos.
 */
export class OverworldScene extends Phaser.Scene {
  private mapa!: MapaDef;
  private jugador!: Phaser.GameObjects.Image;
  private npcSprites = new Map<string, Phaser.GameObjects.Image>();
  private moviendo = false;
  private bloqueado = false; // diálogo/duelo/pausa abiertos
  private frameAlt = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private tinte!: Phaser.GameObjects.Rectangle;
  private lluvia: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private lloviendo = false;
  private marcador: Phaser.GameObjects.Text | null = null;
  private tweenMarcador: Phaser.Tweens.Tween | null = null;
  private actualizarMarcadorCb = () => this.actualizarMarcador();
  private encuentros = new EncounterSystem();
  private teclaShift!: Phaser.Input.Keyboard.Key;
  private transicionando = false;
  /** diálogo que debe abrirse al llegar a la zona (rescates, cinemáticas) */
  private dialogoAlLlegar: string | null = null;
  /** contador de pasos corriendo en zonas con celador */
  private pasosCorriendo = 0;
  // pulido visual del mundo
  private aguaImgs: Phaser.GameObjects.Image[] = [];
  private halos: Phaser.GameObjects.Image[] = [];
  private frameAgua = 0;

  constructor() { super(SCENES.OVERWORLD); }

  create() {
    const estado = GameState.get();
    this.mapa = MAPAS[estado.jugador.mapa] ?? MAPAS.campus;
    this.npcSprites.clear();
    this.moviendo = false;
    this.bloqueado = false;
    this.transicionando = false;
    this.lluvia = null;
    this.lloviendo = false;
    this.pasosCorriendo = 0;
    this.encuentros.reiniciar();

    // primera vez: arranca la misión de inducción
    GameState.iniciarQuest('induccion');

    // ---- render del mapa (con variantes anti-repetición) ----
    this.aguaImgs = [];
    this.halos = [];
    const filas = this.mapa.grid.length;
    const cols = this.mapa.grid[0].length;
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = this.mapa.grid[y][x];
        const variantes = VARIANTES_CHAR[ch];
        const tex = variantes
          ? variantes[(x * 31 + y * 17 + ((x * y) % 7)) % variantes.length]
          : CHAR_A_TILE[ch] ?? 'tile_pasto';
        const img = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, tex);
        if (ch === '~') this.aguaImgs.push(img);
        if (ch === 'L') {
          // halo cálido del farol: se enciende al caer la tarde
          const halo = this.add.image(x * TILE + TILE / 2, y * TILE + 8, 'halo_luz')
            .setBlendMode(Phaser.BlendModes.ADD).setDepth(12).setScale(1.6).setVisible(false);
          this.tweens.add({ targets: halo, alpha: { from: 0.75, to: 1 }, scale: 1.75, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          this.halos.push(halo);
        }
      }
    }
    this.decorarBordes(filas, cols);

    // agua animada + destellos ocasionales
    if (this.aguaImgs.length) {
      this.time.addEvent({
        delay: 650, loop: true,
        callback: () => {
          this.frameAgua = 1 - this.frameAgua;
          this.aguaImgs.forEach((img) => img.setTexture(AGUA_FRAMES[this.frameAgua]));
        },
      });
      this.time.addEvent({
        delay: 1200, loop: true,
        callback: () => {
          const img = this.aguaImgs[Phaser.Math.Between(0, this.aguaImgs.length - 1)];
          const chispa = this.add.text(img.x + Phaser.Math.Between(-8, 8), img.y + Phaser.Math.Between(-8, 8), '✦', {
            fontSize: '10px', color: '#e8f4ff',
          }).setOrigin(0.5).setDepth(5).setAlpha(0);
          this.tweens.add({
            targets: chispa, alpha: { from: 0.9, to: 0 }, scale: { from: 0.6, to: 1.3 },
            duration: 700, onComplete: () => chispa.destroy(),
          });
        },
      });
    }

    // hojas flotando por el campus (solo al aire libre)
    if (!this.mapa.interior) {
      this.add.particles(0, 0, 'hoja', {
        x: { min: 0, max: cols * TILE },
        y: -10,
        lifespan: 14000,
        speedX: { min: 12, max: 32 },
        speedY: { min: 10, max: 24 },
        rotate: { start: 0, end: 360 },
        alpha: { start: 0.9, end: 0.5 },
        frequency: 1700,
        quantity: 1,
      }).setDepth(14);
    }

    // viñeta sutil que enmarca la escena
    this.add.image(0, 0, 'vineta').setOrigin(0)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setScrollFactor(0).setDepth(55);

    // ---- NPCs ----
    this.crearNPCs();

    // ---- jugador ----
    const spriteKey = this.spriteJugador();
    this.jugador = this.add.image(
      estado.jugador.x * TILE + TILE / 2,
      estado.jugador.y * TILE + TILE / 2,
      spriteKey, `${estado.jugador.direccion}_0`,
    ).setDepth(10);

    // ---- cámara con seguimiento suave (centra mapas menores que la pantalla) ----
    const mundoW = cols * TILE, mundoH = filas * TILE;
    const bx = mundoW < GAME_WIDTH ? -(GAME_WIDTH - mundoW) / 2 : 0;
    const by = mundoH < GAME_HEIGHT ? -(GAME_HEIGHT - mundoH) / 2 : 0;
    this.cameras.main.setBounds(bx, by, Math.max(mundoW, GAME_WIDTH), Math.max(mundoH, GAME_HEIGHT));
    this.cameras.main.startFollow(this.jugador, true, 0.12, 0.12);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // ---- letrero con el nombre de la zona ----
    const letrero = this.add.text(GAME_WIDTH / 2, 90, `— ${this.mapa.nombre} —`, {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#001a4d', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(90).setAlpha(0);
    this.tweens.add({
      targets: letrero, alpha: 1, y: 84, duration: 400, ease: 'Cubic.out',
      onComplete: () => this.tweens.add({
        targets: letrero, alpha: 0, duration: 500, delay: 1600, onComplete: () => letrero.destroy(),
      }),
    });

    // ---- tinte día/noche (se actualiza cada 30 s con la hora real) ----
    this.tinte = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0)
      .setOrigin(0).setScrollFactor(0).setDepth(50);
    this.aplicarFaseDia();
    this.time.addEvent({ delay: 30000, loop: true, callback: () => this.aplicarFaseDia() });

    // ---- clima: solo al aire libre ----
    if (!this.mapa.interior) {
      this.evaluarClima();
      this.time.addEvent({ delay: 45000, loop: true, callback: () => this.evaluarClima() });
    } else {
      this.game.events.emit('clima-cambio', false);
    }

    // ---- entradas ----
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.teclaShift = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    kb.on('keydown-SPACE', () => this.interactuar());
    kb.on('keydown-ENTER', () => this.interactuar());
    kb.on('keydown-E', () => this.interactuar());
    kb.on('keydown-ESC', () => this.abrirPausa());
    kb.on('keydown-I', () => this.abrirPausa(1)); // atajo directo al inventario

    // ---- HUD ----
    this.scene.launch(SCENES.HUD);

    // ---- eventos globales ----
    const g = this.game.events;
    g.off('dialogo-terminado');
    g.on('dialogo-terminado', (dueloId: string | null) => {
      this.refrescarNPCs();
      if (dueloId) {
        this.iniciarDuelo(dueloId);
      } else {
        this.bloqueado = false;
      }
    });
    g.off('duelo-terminado');
    g.on('duelo-terminado', (resultado: { gano: boolean; dialogoId?: string; equipoKO?: boolean }) => {
      this.scene.resume();
      this.scene.wake(SCENES.HUD);
      AudioSystem.reproducir(this.mapa.tema ?? 'overworld');
      if (resultado.equipoKO) {
        // "blackout" estilo Pokémon: Fray Tomás te rescata en la capilla
        this.dialogoAlLlegar = 'fray_rescate';
        this.cambiarZona({ mapa: 'capilla', x: 5, y: 9, direccion: 'up' });
        return;
      }
      if (resultado.dialogoId) {
        this.abrirDialogo(resultado.dialogoId);
      } else {
        this.bloqueado = false;
      }
      this.refrescarNPCs();
    });
    g.off('pausa-cerrada');
    g.on('pausa-cerrada', () => { this.bloqueado = false; });

    AudioSystem.reproducir(this.mapa.tema ?? 'overworld');

    // contador de minutos jugados
    this.time.addEvent({ delay: 60000, loop: true, callback: () => { GameState.get().minutosJugados++; } });

    // autoguardado al entrar a la zona (con retraso para que el HUD muestre el toast)
    this.time.delayedCall(1200, () => GameState.autoguardar());

    // diálogo pendiente al llegar (rescate de Fray Tomás, cinemáticas)
    if (this.dialogoAlLlegar) {
      const id = this.dialogoAlLlegar;
      this.dialogoAlLlegar = null;
      this.bloqueado = true;
      this.time.delayedCall(700, () => this.abrirDialogo(id));
    }

    // ---- marcador "!" sobre el objetivo actual de la misión ----
    this.marcador = this.add.text(0, 0, '!', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#001a4d', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(20).setVisible(false);
    this.actualizarMarcador();
    GameState.suscribir(this.actualizarMarcadorCb);
    this.events.on('shutdown', () => GameState.desuscribir(this.actualizarMarcadorCb));
  }

  // ------------------------------------------------------------
  update() {
    if (this.moviendo || this.bloqueado) return;

    let dir: Dir | null = null;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dir = 'left';
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dir = 'right';
    else if (this.cursors.up.isDown || this.wasd.W.isDown) dir = 'up';
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dir = 'down';
    if (!dir) return;

    const estado = GameState.get();
    estado.jugador.direccion = dir;
    const [dx, dy] = DELTA[dir];
    const nx = estado.jugador.x + dx;
    const ny = estado.jugador.y + dy;

    if (!this.esCaminable(nx, ny)) {
      this.jugador.setFrame(`${dir}_0`);
      return;
    }

    const corriendo = this.teclaShift.isDown;
    this.moviendo = true;
    estado.jugador.x = nx;
    estado.jugador.y = ny;
    this.frameAlt = 1 - this.frameAlt;
    this.jugador.setFrame(`${dir}_${this.frameAlt}`);
    if (corriendo) this.crearPolvo(this.jugador.x, this.jugador.y + 12);
    this.tweens.add({
      targets: this.jugador,
      x: nx * TILE + TILE / 2,
      y: ny * TILE + TILE / 2,
      duration: corriendo ? RUN_STEP_MS : STEP_MS,
      onComplete: () => {
        this.moviendo = false;
        this.jugador.setFrame(`${GameState.get().jugador.direccion}_0`);
        // ¿pisó un tapete de salida?
        const puerta = this.mapa.puertas?.find((p) => p.x === nx && p.y === ny && !this.esSolido(nx, ny));
        if (puerta) { this.usarPuerta(puerta); return; }
        // celador: aquí no se corre
        if (corriendo && this.mapa.prohibidoCorrer) this.vigilarCarrera();
        this.chequearEncuentro(nx, ny);
      },
    });
  }

  // ------------------------------------------------------------
  private spriteJugador(): string {
    const id = GameState.get().jugador.personajeId;
    return { est_derecho: 'pc_derecho', est_sistemas: 'pc_sistemas', est_arqui: 'pc_arqui' }[id] ?? 'pc_derecho';
  }

  /**
   * Capa de detalle sobre los tiles base:
   *  - sombra proyectada bajo edificios y muros (profundidad estilo GBA)
   *  - fleco de césped donde el pasto toca caminos, plazas y asfalto
   */
  private decorarBordes(filas: number, cols: number) {
    const ALTOS = 'EGWRK#';       // proyectan sombra hacia abajo
    const SUELO = '=lapf';        // reciben fleco de césped
    const VERDE = '.,jTB';        // cuentan como césped

    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = this.mapa.grid[y][x];

        // sombra del edificio sobre el tile inferior
        if (ALTOS.includes(ch)) {
          const abajo = this.mapa.grid[y + 1]?.[x];
          if (abajo && !ALTOS.includes(abajo)) {
            this.add.image(x * TILE + TILE / 2, (y + 1) * TILE + 6, 'sombra_sup').setDepth(1);
          }
        }

        // flecos de césped en los 4 bordes
        if (SUELO.includes(ch)) {
          const t2 = TILE / 2;
          if (VERDE.includes(this.mapa.grid[y - 1]?.[x] ?? '')) {
            this.add.image(x * TILE + t2, y * TILE + 3.5, 'fleco_pasto').setDepth(1);
          }
          if (VERDE.includes(this.mapa.grid[y + 1]?.[x] ?? '')) {
            this.add.image(x * TILE + t2, y * TILE + TILE - 3.5, 'fleco_pasto').setAngle(180).setDepth(1);
          }
          if (VERDE.includes(this.mapa.grid[y]?.[x - 1] ?? '')) {
            this.add.image(x * TILE + 3.5, y * TILE + t2, 'fleco_pasto').setAngle(270).setDepth(1);
          }
          if (VERDE.includes(this.mapa.grid[y]?.[x + 1] ?? '')) {
            this.add.image(x * TILE + TILE - 3.5, y * TILE + t2, 'fleco_pasto').setAngle(90).setDepth(1);
          }
        }
      }
    }
  }

  private esSolido(x: number, y: number): boolean {
    const fila = this.mapa.grid[y];
    return !fila || x < 0 || x >= fila.length || this.mapa.solidos.includes(fila[x]);
  }

  /** nubecita de polvo al correr */
  private crearPolvo(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const p = this.add.rectangle(
        x + Phaser.Math.Between(-6, 6), y + Phaser.Math.Between(-2, 2),
        Phaser.Math.Between(3, 5), Phaser.Math.Between(3, 5), 0xd8d0c0, 0.7,
      ).setDepth(8);
      this.tweens.add({
        targets: p, y: p.y - Phaser.Math.Between(4, 9), alpha: 0,
        scale: 0.3, duration: Phaser.Math.Between(250, 400),
        onComplete: () => p.destroy(),
      });
    }
  }

  /** Don Gustavo no tolera corredores en el edificio */
  private vigilarCarrera() {
    this.pasosCorriendo++;
    if (this.pasosCorriendo === 2) {
      GameState.aviso('👮 Don Gustavo te clava la mirada: aquí no se corre...', 'info');
    } else if (this.pasosCorriendo >= 4) {
      this.pasosCorriendo = 0;
      // te devuelve a la entrada de la zona, regañado
      const estado = GameState.get();
      estado.jugador.x = this.mapa.spawn.x;
      estado.jugador.y = this.mapa.spawn.y;
      estado.jugador.direccion = 'up';
      this.jugador.setPosition(this.mapa.spawn.x * TILE + TILE / 2, this.mapa.spawn.y * TILE + TILE / 2);
      this.jugador.setFrame('up_0');
      this.cameras.main.flash(150, 255, 255, 255);
      AudioSystem.sfx('cancelar');
      this.abrirDialogo('gustavo_regano');
    }
  }

  /** Transición de zona con fade + autosave (vía create de la nueva zona). */
  private usarPuerta(puerta: PuertaDef) {
    if (puerta.requiereItem && !GameState.tieneItem(puerta.requiereItem)) {
      AudioSystem.sfx('cancelar');
      if (puerta.dialogoSinItem) this.abrirDialogo(puerta.dialogoSinItem);
      return;
    }
    this.cambiarZona(puerta.destino);
  }

  private cambiarZona(destino: { mapa: string; x: number; y: number; direccion?: 'up' | 'down' | 'left' | 'right' }) {
    if (this.transicionando) return;
    this.transicionando = true;
    this.bloqueado = true;
    AudioSystem.sfx('puerta');
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const estado = GameState.get();
      estado.jugador.mapa = destino.mapa;
      estado.jugador.x = destino.x;
      estado.jugador.y = destino.y;
      estado.jugador.direccion = destino.direccion ?? 'down';
      this.scene.stop(SCENES.HUD);
      this.scene.restart();
    });
  }

  private esCaminable(x: number, y: number): boolean {
    const fila = this.mapa.grid[y];
    if (!fila || x < 0 || x >= fila.length) return false;
    if (this.mapa.solidos.includes(fila[x])) return false;
    for (const [id, spr] of this.npcSprites) {
      if (!spr.visible) continue;
      const npc = NPCS.find((n) => n.id === id)!;
      const [px, py] = npc.posicion[this.mapa.id];
      if (px === x && py === y) return false;
    }
    return true;
  }

  private crearNPCs() {
    const fase = currentDayPhase().name;
    NPCS.forEach((npc) => {
      const pos = npc.posicion[this.mapa.id];
      if (!pos) return;
      const visible = !npc.apareceEn || npc.apareceEn.includes(fase);
      const spr = this.add.image(pos[0] * TILE + TILE / 2, pos[1] * TILE + TILE / 2, npc.spriteKey, 'down_0')
        .setDepth(9).setVisible(visible);
      // pequeño balanceo "idle" para que el mundo se sienta vivo
      this.tweens.add({
        targets: spr, y: spr.y - 1.5, duration: Phaser.Math.Between(700, 1000),
        yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 500),
      });
      this.npcSprites.set(npc.id, spr);
      // indicador de amigo reclutado
      if (npc.amigoId && GameState.get().amigos.includes(npc.amigoId)) {
        this.marcarReclutado(spr);
      }
    });
  }

  private refrescarNPCs() {
    NPCS.forEach((npc) => {
      const spr = this.npcSprites.get(npc.id);
      if (spr && npc.amigoId && GameState.get().amigos.includes(npc.amigoId) && !spr.getData('marcado')) {
        this.marcarReclutado(spr, true);
      }
    });
  }

  private marcarReclutado(spr: Phaser.GameObjects.Image, celebrar = false) {
    spr.setData('marcado', true);
    const estrella = this.add.text(spr.x, spr.y - 24, '★', { fontSize: '14px', color: '#d4af37' }).setOrigin(0.5).setDepth(11);
    this.tweens.add({ targets: estrella, y: estrella.y - 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    if (celebrar) {
      // salto de alegría del NPC + ráfaga de estrellas en el mundo
      this.tweens.add({ targets: spr, y: spr.y - 10, duration: 140, yoyo: true, repeat: 2, ease: 'Quad.out' });
      for (let i = 0; i < 10; i++) {
        const p = this.add.text(spr.x, spr.y - 10, '★', {
          fontSize: `${Phaser.Math.Between(8, 15)}px`, color: i % 2 ? '#ffd700' : '#ffffff',
        }).setOrigin(0.5).setDepth(21);
        const ang = Math.random() * Math.PI * 2;
        this.tweens.add({
          targets: p,
          x: spr.x + Math.cos(ang) * Phaser.Math.Between(30, 70),
          y: spr.y - 10 + Math.sin(ang) * Phaser.Math.Between(30, 70),
          alpha: 0, angle: 180,
          duration: Phaser.Math.Between(500, 900),
          onComplete: () => p.destroy(),
        });
      }
    }
  }

  /** Coloca el "!" saltarín sobre el NPC/tile objetivo del paso actual. */
  private actualizarMarcador() {
    if (!this.marcador) return;
    const activa = GameState.questActiva();
    let objetivo = activa?.def.pasos[activa.paso]?.objetivo;

    // si el objetivo es un amigo ya reclutado, apunta al siguiente por reclutar
    if (objetivo?.npcId) {
      const npc = NPCS.find((n) => n.id === objetivo!.npcId);
      if (npc?.amigoId && GameState.get().amigos.includes(npc.amigoId)) {
        const pendiente = NPCS.find((n) => n.amigoId && !GameState.get().amigos.includes(n.amigoId) && n.posicion[this.mapa.id]);
        objetivo = pendiente ? { npcId: pendiente.id } : objetivo;
      }
    }

    let pos: [number, number] | undefined;
    if (objetivo?.npcId) {
      const npc = NPCS.find((n) => n.id === objetivo!.npcId);
      pos = npc?.posicion[this.mapa.id];
    } else if (objetivo?.tile && (!objetivo.mapa || objetivo.mapa === this.mapa.id)) {
      pos = objetivo.tile;
    }

    this.tweenMarcador?.remove();
    if (!pos) { this.marcador.setVisible(false); return; }
    const mx = pos[0] * TILE + TILE / 2;
    const my = pos[1] * TILE - 14;
    this.marcador.setPosition(mx, my).setVisible(true);
    this.tweenMarcador = this.tweens.add({
      targets: this.marcador, y: my - 7, duration: 380, yoyo: true, repeat: -1, ease: 'Quad.inOut',
    });
  }

  // ------------------------------------------------------------ encuentros

  /** Se llama al terminar cada paso: consulta el EncounterSystem. */
  private chequearEncuentro(x: number, y: number) {
    if (this.bloqueado) return;
    const char = this.mapa.grid[y]?.[x] ?? '';
    const encuentro = this.encuentros.alPisar(
      this.mapa.id, char, currentDayPhase().name, GameState.get().amigos.length > 0,
    );
    if (encuentro) this.resolverEncuentro(encuentro);
  }

  private resolverEncuentro(e: Encuentro) {
    switch (e.tipo) {
      case 'duelo': {
        // sacudida de "algo se mueve en el jardín" antes de la transición
        const ex = this.add.text(this.jugador.x, this.jugador.y - 26, '!', {
          fontFamily: 'monospace', fontSize: '24px', color: '#ff6060', fontStyle: 'bold',
          stroke: '#001a4d', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(21);
        this.tweens.add({ targets: ex, y: ex.y - 8, duration: 160, yoyo: true, onComplete: () => ex.destroy() });
        this.time.delayedCall(320, () => this.iniciarDuelo(e.dueloId));
        break;
      }
      case 'hallazgo': {
        AudioSystem.sfx('confirmar');
        this.cameras.main.flash(120, 255, 240, 180);
        GameState.darItem(e.itemId, e.cantidad); // el toast del HUD anuncia el ítem
        const brillo = this.add.text(this.jugador.x, this.jugador.y - 20, '✦', {
          fontSize: '18px', color: '#ffd700',
        }).setOrigin(0.5).setDepth(21);
        this.tweens.add({ targets: brillo, y: brillo.y - 24, alpha: 0, duration: 700, onComplete: () => brillo.destroy() });
        break;
      }
      case 'evento':
        this.bloqueado = true;
        this.abrirDialogo(e.dialogoId);
        break;
    }
  }

  // ------------------------------------------------------------
  private interactuar() {
    if (this.moviendo || this.bloqueado) return;
    const estado = GameState.get();
    const [dx, dy] = DELTA[estado.jugador.direccion];
    const tx = estado.jugador.x + dx;
    const ty = estado.jugador.y + dy;

    // 1) ¿NPC en frente?
    for (const npc of NPCS) {
      const pos = npc.posicion[this.mapa.id];
      const spr = this.npcSprites.get(npc.id);
      if (pos && spr?.visible && pos[0] === tx && pos[1] === ty) {
        // el NPC mira al jugador
        const cara: Dir = estado.jugador.direccion === 'up' ? 'down'
          : estado.jugador.direccion === 'down' ? 'up'
          : estado.jugador.direccion === 'left' ? 'right' : 'left';
        spr.setFrame(`${cara}_0`);
        const regla = npc.dialogos.find((r) => GameState.cumple(r.si));
        if (regla) this.abrirDialogo(regla.dialogoId);
        return;
      }
    }

    // 2) ¿puerta sólida (entradas a edificios/zonas)?
    const puerta = this.mapa.puertas?.find((p) => p.x === tx && p.y === ty);
    if (puerta) { this.usarPuerta(puerta); return; }

    // 3) ¿interacción puntual (placa, etc.)?
    const punto = this.mapa.interacciones.find((i) => i.x === tx && i.y === ty);
    if (punto) {
      const regla = punto.reglas.find((r) => GameState.cumple(r.si));
      if (regla) this.abrirDialogo(regla.dialogoId);
      return;
    }

    // 4) ¿tile con interacción por tipo (fuente, canchas, letreros)?
    const ch = this.mapa.grid[ty]?.[tx];
    const inter = ch ? this.mapa.interaccionesPorChar[ch] : undefined;
    if (!inter) return;
    if (typeof inter === 'string') {
      this.abrirDialogo(inter);
    } else if (!inter.requiereItem || GameState.tieneItem(inter.requiereItem)) {
      this.abrirDialogo(inter.dialogoId);
    } else {
      AudioSystem.sfx('cancelar');
      this.abrirDialogo(inter.dialogoSinItem ?? inter.dialogoId);
    }
  }

  private abrirDialogo(dialogoId: string) {
    this.bloqueado = true;
    this.scene.launch(SCENES.DIALOGUE, { dialogoId });
  }

  private iniciarDuelo(dueloId: string) {
    // sin energía no hay duelo: manda al jugador a la capilla
    if (GameState.get().amigos.length > 0 && GameState.energiaTotalEquipo() <= 0) {
      GameState.aviso('😴 Tu equipo está agotado. Fray Tomás puede ayudarte en la capilla.', 'info');
      this.bloqueado = false;
      return;
    }
    this.bloqueado = true;
    AudioSystem.reproducir('duelo');
    // transición estilo GBA: doble flash + temblor antes de entrar al duelo
    this.cameras.main.flash(120, 255, 255, 255);
    this.time.delayedCall(180, () => this.cameras.main.flash(120, 255, 255, 255));
    this.cameras.main.shake(400, 0.008);
    this.time.delayedCall(520, () => {
      this.cameras.main.fadeOut(220, 0, 0, 0);
      this.time.delayedCall(240, () => {
        this.cameras.main.resetFX();
        this.scene.pause();
        this.scene.sleep(SCENES.HUD);
        this.scene.launch(SCENES.DUEL, { dueloId });
      });
    });
  }

  private abrirPausa(pestana = 0) {
    if (this.bloqueado) return;
    this.bloqueado = true;
    this.scene.launch(SCENES.PAUSE, { pestana });
  }

  // ------------------------------------------------------------
  private aplicarFaseDia() {
    const fase = currentDayPhase();
    // en interiores la luz artificial atenúa el tinte del cielo
    const alpha = this.mapa.interior ? fase.alpha * 0.25 : fase.alpha;
    this.tinte.setFillStyle(fase.tint, alpha);
    // los faroles se encienden al caer la tarde
    const oscuro = fase.name === 'atardecer' || fase.name === 'noche';
    this.halos.forEach((h) => h.setVisible(oscuro));
  }

  private evaluarClima() {
    // Tunja: fría y lluviosa — 35% de probabilidad de lluvia en cada chequeo
    const debeLlover = Math.random() < 0.35;
    if (debeLlover && !this.lloviendo) {
      this.lloviendo = true;
      if (!this.textures.exists('gota')) {
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        g.fillStyle(0x9ec8e8, 0.85);
        g.fillRect(0, 0, 2, 9);
        g.generateTexture('gota', 2, 9);
        g.destroy();
      }
      this.lluvia = this.add.particles(0, 0, 'gota', {
        x: { min: -50, max: GAME_WIDTH + 50 },
        y: -20,
        lifespan: 900,
        speedY: { min: 380, max: 480 },
        speedX: { min: -40, max: -20 },
        quantity: 5,
        frequency: 25,
      }).setScrollFactor(0).setDepth(60);
      this.game.events.emit('clima-cambio', true);
    } else if (!debeLlover && this.lloviendo) {
      this.lloviendo = false;
      this.lluvia?.destroy();
      this.lluvia = null;
      this.game.events.emit('clima-cambio', false);
    }
  }
}
