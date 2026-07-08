import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';
import { dueloPorId } from '../data/duelos';
import { amigoPorId } from '../data/amigos';
import { itemPorId } from '../data/items';
import { preguntaAleatoria } from '../data/trivia';
import { MATERIA_NOMBRE, type DueloDef, type AmigoDef, type Habilidad } from '../state/types';
import { GameState } from '../state/GameState';
import { AudioSystem } from '../systems/AudioSystem';

interface CombatienteAmigo {
  def: AmigoDef;
  energia: number;
  /** stats efectivos (base + nivel) congelados al iniciar el duelo */
  stats: { carisma: number; disciplina: number; creatividad: number; energia: number };
}
type Fase = 'menu' | 'submenu' | 'pregunta' | 'defensa' | 'mensaje';

/**
 * DUELO ACADÉMICO — el "combate" del juego, estilo batalla GBA:
 * eliges la habilidad de un amigo, respondes una pregunta de trivia
 * con tiempo límite; si aciertas el golpe conecta, si fallas el
 * oponente contraataca. Sin violencia: puro conocimiento.
 */
export class DuelScene extends Phaser.Scene {
  private duelo!: DueloDef;
  private equipo: CombatienteAmigo[] = [];
  private activo = 0;
  private energiaOponente = 0;
  private fase: Fase = 'menu';

  private cajaTexto!: Phaser.GameObjects.Text;
  private barraOponente!: Phaser.GameObjects.Rectangle;
  private barraAmigo!: Phaser.GameObjects.Rectangle;
  private nombreAmigo!: Phaser.GameObjects.Text;
  private spriteAmigo!: Phaser.GameObjects.Image;
  private opciones: Phaser.GameObjects.Text[] = [];
  private seleccion = 0;
  private accionesSubmenu: { texto: string; accion: () => void }[] = [];
  private timerPregunta: Phaser.Time.TimerEvent | null = null;
  private barraTiempo: Phaser.GameObjects.Rectangle | null = null;
  private respuestaCorrecta = -1;
  private habilidadActual: Habilidad | null = null;
  private despuesDelMensaje: (() => void) | null = null;
  /** respuestas correctas consecutivas: a partir de 3, ¡EN RACHA! (+50% daño) */
  private racha = 0;
  private textoRacha: Phaser.GameObjects.Text | null = null;
  // minijuego de defensa (turno del oponente)
  private barraDefensa: Phaser.GameObjects.Container | null = null;
  private cursorDefensa: Phaser.GameObjects.Rectangle | null = null;
  private tweenDefensa: Phaser.Tweens.Tween | null = null;
  private timerDefensa: Phaser.Time.TimerEvent | null = null;
  // mecánica de JEFE: carga un ataque devastador cada N turnos
  private spriteOponente!: Phaser.GameObjects.Image;
  private turnosOponente = 0;
  private cargando = false;
  private aciertosEnCarga = 0;
  private ataqueCargado = '';
  private danoMultOponente = 1;
  private auraCarga: Phaser.Tweens.Tween | null = null;
  /** amigos que participaron (para repartir XP) */
  private participantes = new Set<string>();

  constructor() { super(SCENES.DUEL); }

  init(datos: { dueloId: string }) {
    const d = dueloPorId(datos.dueloId);
    if (!d) throw new Error(`Duelo no encontrado: ${datos.dueloId}`);
    this.duelo = d;
    this.energiaOponente = d.energia;
    // la energía PERSISTE entre duelos: se lee del estado global
    this.equipo = GameState.get().amigos
      .map((id) => amigoPorId(id))
      .filter((a): a is AmigoDef => !!a)
      .map((def) => ({
        def,
        stats: GameState.statsEfectivos(def.id),
        energia: GameState.get().energiaAmigos[def.id] ?? def.stats.energia,
      }));
    this.activo = Math.max(0, this.equipo.findIndex((c) => c.energia > 0));
    this.fase = 'menu';
    this.racha = 0;
    this.turnosOponente = 0;
    this.cargando = false;
    this.aciertosEnCarga = 0;
    this.danoMultOponente = 1;
    this.participantes = new Set([this.equipo[this.activo]?.def.id].filter(Boolean) as string[]);
  }

  create() {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    // fondo estilo aula/claustro
    this.add.rectangle(0, 0, W, H, 0x2a3a5a).setOrigin(0);
    this.add.rectangle(0, H - 170, W, 170, COLORS.azulOscuro).setOrigin(0);
    this.add.rectangle(0, H - 170, W, 4, COLORS.dorado).setOrigin(0);

    this.add.text(W / 2, 18, this.duelo.titulo, {
      fontFamily: 'monospace', fontSize: '16px', color: '#d4af37', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ---- splash "¡DUELO!" de entrada ----
    this.cameras.main.fadeIn(250, 0, 0, 0);
    const splash = this.add.text(W / 2, H / 2 - 60, '¡DUELO ACADÉMICO!', {
      fontFamily: 'monospace', fontSize: '40px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#001a4d', strokeThickness: 10,
    }).setOrigin(0.5).setScale(0.2).setDepth(30);
    this.tweens.add({
      targets: splash, scale: 1, duration: 350, ease: 'Back.out',
      onComplete: () => this.tweens.add({ targets: splash, alpha: 0, y: '-=30', duration: 400, delay: 650, onComplete: () => splash.destroy() }),
    });

    // ---- oponente (arriba derecha, entra deslizándose) ----
    this.spriteOponente = this.add.image(W + 80, 130, this.duelo.spriteKey, 'down_0').setScale(3.5);
    this.tweens.add({ targets: this.spriteOponente, x: W - 170, duration: 450, ease: 'Cubic.out' });
    this.tweens.add({ targets: this.spriteOponente, y: 126, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 500 });
    this.add.text(W - 350, 55, this.duelo.oponente, {
      fontFamily: 'monospace', fontSize: '15px', color: '#f5efe0', fontStyle: 'bold',
    });
    this.add.rectangle(W - 350, 78, 204, 14, 0x1a1a2a).setOrigin(0);
    this.barraOponente = this.add.rectangle(W - 348, 80, 200, 10, 0xd44a4a).setOrigin(0);

    // ---- amigo activo (abajo izquierda, entra deslizándose) ----
    this.spriteAmigo = this.add.image(-80, H - 230, this.equipo[0].def.spriteKey, 'up_0').setScale(3.5);
    this.tweens.add({ targets: this.spriteAmigo, x: 150, duration: 450, ease: 'Cubic.out' });
    this.nombreAmigo = this.add.text(60, H - 320, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#f5efe0', fontStyle: 'bold',
    });
    this.add.rectangle(60, H - 296, 204, 14, 0x1a1a2a).setOrigin(0);
    this.barraAmigo = this.add.rectangle(62, H - 294, 200, 10, 0x4ad44a).setOrigin(0);

    // ---- caja de acciones/mensajes ----
    this.cajaTexto = this.add.text(24, H - 155, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#f5efe0',
      wordWrap: { width: W - 48 }, lineSpacing: 6,
    });

    const kb = this.input.keyboard!;
    kb.on('keydown-UP', () => this.mover(-1));
    kb.on('keydown-DOWN', () => this.mover(1));
    kb.on('keydown-SPACE', () => this.confirmar());
    kb.on('keydown-ENTER', () => this.confirmar());
    kb.on('keydown-ESC', () => { if (this.fase === 'submenu') this.menuPrincipal(); });

    this.actualizarBarras();
    this.mensaje(`¡${this.duelo.oponente} te reta a un duelo académico!`, () => this.menuPrincipal());
  }

  // ------------------------------------------------------------ UI básica

  private actualizarBarras() {
    const op = Math.max(0, this.energiaOponente / this.duelo.energia);
    this.tweens.add({ targets: this.barraOponente, width: 200 * op, duration: 400, ease: 'Cubic.out' });
    const a = this.equipo[this.activo];
    const nivel = GameState.nivelDe(a.def.id).nivel;
    this.nombreAmigo.setText(`${a.def.nombre} Nv.${nivel} (${a.def.carrera})`);
    this.spriteAmigo.setTexture(a.def.spriteKey, 'up_0');
    const rel = Math.max(0, a.energia / a.stats.energia);
    this.tweens.add({ targets: this.barraAmigo, width: 200 * rel, duration: 400, ease: 'Cubic.out' });
    this.barraAmigo.fillColor = rel > 0.5 ? 0x4ad44a : rel > 0.25 ? 0xd4af37 : 0xd44a4a;

    // indicador de racha
    if (this.racha >= 3) {
      if (!this.textoRacha) {
        this.textoRacha = this.add.text(60, GAME_HEIGHT - 276, '', {
          fontFamily: 'monospace', fontSize: '14px', color: '#ff9030', fontStyle: 'bold',
          stroke: '#001a4d', strokeThickness: 4,
        }).setDepth(20);
        this.tweens.add({ targets: this.textoRacha, scale: 1.12, duration: 300, yoyo: true, repeat: -1 });
      }
      this.textoRacha.setText(`🔥 EN RACHA x${this.racha} (+50% daño)`);
    } else {
      this.textoRacha?.destroy();
      this.textoRacha = null;
    }
  }

  /** multiplicador por materia contra este oponente */
  private multiplicadorMateria(h: Habilidad): { mult: number; banner?: string; color?: string } {
    if (this.duelo.debil?.includes(h.materia)) {
      return { mult: 1.5, banner: '¡ARGUMENTO DEMOLEDOR!', color: '#ffd700' };
    }
    if (this.duelo.resistente?.includes(h.materia)) {
      return { mult: 0.5, banner: 'No le hizo ni cosquillas...', color: '#8a9ab5' };
    }
    return { mult: 1 };
  }

  /** Número de daño/curación flotante estilo RPG. */
  private textoFlotante(x: number, y: number, texto: string, color: string) {
    const t = this.add.text(x, y, texto, {
      fontFamily: 'monospace', fontSize: '26px', color, fontStyle: 'bold',
      stroke: '#001a4d', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({
      targets: t, y: y - 45, alpha: 0, duration: 950, ease: 'Cubic.out',
      onComplete: () => t.destroy(),
    });
  }

  private limpiarOpciones() {
    this.opciones.forEach((o) => o.destroy());
    this.opciones = [];
    this.barraTiempo?.destroy();
    this.barraTiempo = null;
    this.timerPregunta?.remove();
    this.timerPregunta = null;
  }

  private listarOpciones(items: string[], columna2 = false) {
    this.limpiarOpciones();
    this.seleccion = 0;
    items.forEach((txt, i) => {
      const col = columna2 ? i % 2 : 0;
      const fila = columna2 ? Math.floor(i / 2) : i;
      const t = this.add.text(40 + col * 370, GAME_HEIGHT - 125 + fila * 28, txt, {
        fontFamily: 'monospace', fontSize: '15px', color: '#f5efe0',
      }).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.seleccion = i; this.pintar(); });
      t.on('pointerdown', () => this.confirmar());
      this.opciones.push(t);
    });
    this.pintar();
  }

  private pintar() {
    this.opciones.forEach((t, i) => {
      t.setColor(i === this.seleccion ? '#d4af37' : '#f5efe0');
      const limpio = t.text.replace(/^▶ /, '').replace(/^ {2}/, '');
      t.setText((i === this.seleccion ? '▶ ' : '  ') + limpio);
    });
  }

  private mover(d: number) {
    if (!this.opciones.length || this.fase === 'mensaje') return;
    AudioSystem.sfx('paso');
    this.seleccion = Phaser.Math.Wrap(this.seleccion + d, 0, this.opciones.length);
    this.pintar();
  }

  private mensaje(texto: string, despues: () => void) {
    this.fase = 'mensaje';
    this.limpiarOpciones();
    this.cajaTexto.setText(texto + '\n\n[ESPACIO]');
    this.despuesDelMensaje = despues;
  }

  // ------------------------------------------------------------ menús

  private menuPrincipal() {
    this.fase = 'menu';
    this.cajaTexto.setText('¿Qué vas a hacer?');
    this.listarOpciones(['HABILIDADES', 'OBJETOS', 'CAMBIAR AMIGO'], false);
  }

  private confirmar() {
    if (this.fase === 'defensa') { this.intentarDefensa(); return; }
    if (this.fase === 'mensaje') {
      AudioSystem.sfx('confirmar');
      const cb = this.despuesDelMensaje;
      this.despuesDelMensaje = null;
      cb?.();
      return;
    }
    if (this.fase === 'menu') {
      AudioSystem.sfx('confirmar');
      if (this.seleccion === 0) this.submenuHabilidades();
      else if (this.seleccion === 1) this.submenuObjetos();
      else this.submenuCambiar();
      return;
    }
    if (this.fase === 'submenu') {
      AudioSystem.sfx('confirmar');
      this.accionesSubmenu[this.seleccion]?.accion();
      return;
    }
    if (this.fase === 'pregunta') {
      this.responder(this.seleccion);
    }
  }

  private submenuHabilidades() {
    const amigo = this.equipo[this.activo];
    this.fase = 'submenu';
    this.cajaTexto.setText(`Habilidades de ${amigo.def.nombre}:  (ESC para volver)`);
    this.accionesSubmenu = amigo.def.habilidades.map((h) => ({
      texto: `${h.nombre} [${MATERIA_NOMBRE[h.materia]}] — ${h.descripcion}`,
      accion: () => this.lanzarPregunta(h),
    }));
    this.listarOpciones(this.accionesSubmenu.map((a) => a.texto));
  }

  private submenuObjetos() {
    const inv = GameState.get().inventario;
    const usables = Object.entries(inv)
      .map(([id, cant]) => ({ def: itemPorId(id), cant }))
      .filter((x) => x.def?.usableEnDuelo && x.cant > 0);
    this.fase = 'submenu';
    if (!usables.length) {
      this.mensaje('No tienes objetos usables en duelo. (Consigue café o apuntes.)', () => this.menuPrincipal());
      return;
    }
    this.cajaTexto.setText('Objetos:  (ESC para volver)');
    this.accionesSubmenu = usables.map(({ def, cant }) => ({
      texto: `${def!.nombre} x${cant} — ${def!.descripcion}`,
      accion: () => {
        const amigo = this.equipo[this.activo];
        const cura = def!.efectoDuelo?.energia ?? 0;
        amigo.energia = Math.min(amigo.stats.energia, amigo.energia + cura);
        GameState.darItem(def!.id, -1);
        this.actualizarBarras();
        AudioSystem.sfx('correcto');
        this.mensaje(`${amigo.def.nombre} recupera ${cura} de energía con ${def!.nombre}.`, () => this.turnoOponente());
      },
    }));
    this.listarOpciones(this.accionesSubmenu.map((a) => a.texto));
  }

  private submenuCambiar() {
    const disponibles = this.equipo
      .map((c, i) => ({ c, i }))
      .filter(({ c, i }) => i !== this.activo && c.energia > 0);
    this.fase = 'submenu';
    if (!disponibles.length) {
      this.mensaje('No tienes más amigos disponibles.', () => this.menuPrincipal());
      return;
    }
    this.cajaTexto.setText('¿A quién llamas al frente?  (ESC para volver)');
    this.accionesSubmenu = disponibles.map(({ c, i }) => ({
      texto: `${c.def.nombre} (${c.def.carrera}) — energía ${c.energia}/${c.stats.energia}`,
      accion: () => {
        this.activo = i;
        this.participantes.add(c.def.id);
        this.actualizarBarras();
        this.mensaje(`¡Adelante, ${c.def.nombre}!`, () => this.turnoOponente());
      },
    }));
    this.listarOpciones(this.accionesSubmenu.map((a) => a.texto));
  }

  // ------------------------------------------------------------ trivia

  private lanzarPregunta(h: Habilidad) {
    this.fase = 'pregunta';
    this.habilidadActual = h;
    this.participantes.add(this.equipo[this.activo].def.id);
    const q = preguntaAleatoria(h.categoria);
    this.respuestaCorrecta = q.correcta;
    this.cajaTexto.setText(q.pregunta);
    this.listarOpciones(q.opciones.map((o, i) => `${i + 1}. ${o}`), true);

    // teclas 1-4
    q.opciones.forEach((_, i) => {
      this.input.keyboard!.once(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR'][i]}`, () => {
        if (this.fase === 'pregunta') this.responder(i);
      });
    });

    // barra de tiempo: 10 segundos
    this.barraTiempo = this.add.rectangle(24, GAME_HEIGHT - 172, GAME_WIDTH - 48, 6, 0xd4af37).setOrigin(0);
    this.timerPregunta = this.time.addEvent({
      delay: 10000,
      callback: () => { if (this.fase === 'pregunta') this.responder(-1); },
    });
    this.tweens.add({ targets: this.barraTiempo, width: 0, duration: 10000 });
  }

  private responder(indice: number) {
    if (this.fase !== 'pregunta' || !this.habilidadActual) return;
    const h = this.habilidadActual;
    const amigo = this.equipo[this.activo];
    const acierto = indice === this.respuestaCorrecta;
    this.limpiarOpciones();

    if (acierto) {
      AudioSystem.sfx('correcto');
      this.racha++;
      if (this.racha === 3) AudioSystem.sfx('racha');

      // ¿interrumpe la compilación del jefe? (2 aciertos seguidos mientras carga)
      let lineaInterrupcion = '';
      if (this.cargando) {
        this.aciertosEnCarga++;
        if (this.aciertosEnCarga >= 2) {
          this.cargando = false;
          this.danoMultOponente = 1;
          this.auraCarga?.remove();
          this.spriteOponente.clearTint();
          AudioSystem.sfx('bloqueo');
          this.textoFlotante(GAME_WIDTH - 170, 150, '¡ERROR DE COMPILACIÓN!', '#4ad44a');
          lineaInterrupcion = `\n💥 ¡La carga de ${this.duelo.oponente} FALLA! (interrumpida)`;
        }
      }

      const { mult, banner, color } = this.multiplicadorMateria(h);
      const multRacha = this.racha >= 3 ? 1.5 : 1;
      const dano = Math.max(1, Math.round((h.poderBase + amigo.stats[h.stat]) * mult * multRacha));
      this.energiaOponente = Math.max(0, this.energiaOponente - dano);
      this.actualizarBarras();
      this.cameras.main.shake(mult > 1 ? 250 : 150, mult > 1 ? 0.01 : 0.006);
      this.textoFlotante(GAME_WIDTH - 170, 90, `-${dano}`, mult > 1 ? '#ffd700' : '#ff7070');
      this.textoFlotante(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '¡CORRECTO!', '#4ad44a');
      if (banner) this.textoFlotante(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 5, banner, color!);

      const lineaMult = mult > 1 ? ' ¡Le dio donde más le duele!' : mult < 1 ? ' ...pero apenas lo despeina.' : '';
      const lineaRacha = this.racha >= 3 ? ` 🔥 ¡Racha de ${this.racha}!` : '';
      if (this.energiaOponente <= 0) {
        this.mensaje(`${amigo.def.nombre} usa "${h.nombre}": ${dano} de impacto.${lineaMult}\n¡${this.duelo.oponente} se queda sin argumentos!`, () => this.victoria());
      } else {
        this.mensaje(`${amigo.def.nombre} usa "${h.nombre}": ${dano} de impacto.${lineaMult}${lineaRacha}${lineaInterrupcion}`, () => this.turnoOponente());
      }
    } else {
      AudioSystem.sfx('incorrecto');
      this.racha = 0;
      this.actualizarBarras();
      this.textoFlotante(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, indice === -1 ? '¡TIEMPO!' : '¡FALLO!', '#ff7070');
      const razon = indice === -1 ? '¡Se acabó el tiempo!' : 'Respuesta incorrecta...';
      this.mensaje(`${razon} La habilidad falla y ${this.duelo.oponente} aprovecha.`, () => this.turnoOponente());
    }
  }

  /** Turno del oponente: telegraph del ataque + minijuego de defensa.
   *  Los JEFES cargan un ataque devastador cada N turnos. */
  private turnoOponente() {
    if (this.energiaOponente <= 0) { this.victoria(); return; }
    const ataques = this.duelo.ataques?.length ? this.duelo.ataques : ['Pregunta capciosa'];

    // el jefe libera su ataque cargado
    if (this.cargando) {
      this.cargando = false;
      this.danoMultOponente = 2.2;
      this.auraCarga?.remove();
      this.spriteOponente.clearTint();
      this.cameras.main.shake(300, 0.006);
      this.mensaje(`💾 ¡COMPILACIÓN EXITOSA! ${this.duelo.oponente} LIBERA "${this.ataqueCargado}".\n¡Defiende o dolerá EL DOBLE!`, () => this.iniciarDefensa(this.ataqueCargado));
      return;
    }

    // el jefe empieza a cargar
    this.turnosOponente++;
    if (this.duelo.esJefe && this.duelo.cargaTurnos && this.turnosOponente % this.duelo.cargaTurnos === 0) {
      this.cargando = true;
      this.aciertosEnCarga = 0;
      this.ataqueCargado = ataques[Phaser.Math.Between(0, ataques.length - 1)];
      this.spriteOponente.setTint(0xff9030);
      this.auraCarga = this.tweens.add({
        targets: this.spriteOponente, scale: 3.8, duration: 350, yoyo: true, repeat: -1,
      });
      AudioSystem.sfx('incorrecto');
      this.textoFlotante(GAME_WIDTH - 170, 150, '⚠ COMPILANDO...', '#ff9030');
      this.mensaje(`⚠ ${this.duelo.oponente} empieza a COMPILAR "${this.ataqueCargado}"...\n¡Acierta 2 preguntas SEGUIDAS para interrumpirla, o defiéndete del doble de daño!`, () => this.menuPrincipal());
      return;
    }

    const ataque = ataques[Phaser.Math.Between(0, ataques.length - 1)];
    this.mensaje(`${this.duelo.oponente} prepara: "${ataque}"...\n¡ESPACIO cuando el cursor pase por la ZONA DORADA para defender!`, () => this.iniciarDefensa(ataque));
  }

  /** Barra de timing: bloquea el 50% del daño si aciertas la zona dorada. */
  private iniciarDefensa(ataque: string) {
    this.fase = 'defensa';
    this.limpiarOpciones();
    this.cajaTexto.setText(`"${ataque}" viene en camino... ¡ESPACIO!`);

    const W = 340, H = 22;
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT - 195;
    const fondo = this.add.rectangle(0, 0, W, H, 0x1a1a2a).setStrokeStyle(2, 0x3a6fd8);
    const zona = this.add.rectangle(0, 0, W * 0.24, H - 4, 0xd4af37, 0.9); // zona dorada al centro
    this.cursorDefensa = this.add.rectangle(-W / 2, 0, 6, H + 8, 0xffffff);
    this.barraDefensa = this.add.container(cx, cy, [fondo, zona, this.cursorDefensa]).setDepth(26);

    this.tweenDefensa = this.tweens.add({
      targets: this.cursorDefensa, x: W / 2, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
    // si no reaccionas en 2.6 s, el golpe entra completo
    this.timerDefensa = this.time.delayedCall(2600, () => {
      if (this.fase === 'defensa') this.resolverDefensa(false);
    });
  }

  private intentarDefensa() {
    if (this.fase !== 'defensa' || !this.cursorDefensa) return;
    const dentro = Math.abs(this.cursorDefensa.x) <= (340 * 0.24) / 2;
    this.resolverDefensa(dentro);
  }

  private resolverDefensa(bloqueado: boolean) {
    this.tweenDefensa?.remove();
    this.timerDefensa?.remove();
    this.barraDefensa?.destroy();
    this.barraDefensa = null;
    this.cursorDefensa = null;
    this.resolverAtaqueOponente(bloqueado ? 0.5 : 1, bloqueado);
  }

  private resolverAtaqueOponente(mitigacion: number, defendido: boolean) {
    const amigo = this.equipo[this.activo];
    const base = (this.duelo.danoBase + Phaser.Math.Between(0, 3) - Math.floor(amigo.stats.disciplina / 4)) * this.danoMultOponente;
    this.danoMultOponente = 1;
    const real = Math.max(1, Math.round(Math.max(1, base) * mitigacion));
    amigo.energia = Math.max(0, amigo.energia - real);
    this.actualizarBarras();
    this.cameras.main.shake(120, defendido ? 0.002 : 0.004);
    this.textoFlotante(150, GAME_HEIGHT - 290, `-${real}`, defendido ? '#7fa8e8' : '#ff7070');
    if (defendido) {
      AudioSystem.sfx('bloqueo');
      this.textoFlotante(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '¡DEFENDIDO!', '#7fa8e8');
    } else {
      this.tweens.add({ targets: this.spriteAmigo, alpha: 0.3, duration: 80, yoyo: true, repeat: 2 });
    }

    const frase = defendido
      ? `¡${amigo.def.nombre} ataja el golpe con estilo! Solo ${real} de impacto.`
      : `El ataque conecta de lleno: ${real} de impacto a ${amigo.def.nombre}.`;

    if (amigo.energia <= 0) {
      const quedan = this.equipo.some((c) => c.energia > 0);
      if (quedan) {
        this.mensaje(`${frase}\n¡${amigo.def.nombre} necesita un descanso!`, () => this.submenuCambiarForzado());
      } else {
        this.mensaje(`${frase}\n¡Tu equipo se quedó sin energía!`, () => this.derrota());
      }
    } else {
      this.mensaje(frase, () => this.menuPrincipal());
    }
  }

  private submenuCambiarForzado() {
    const disponibles = this.equipo.map((c, i) => ({ c, i })).filter(({ c }) => c.energia > 0);
    this.fase = 'submenu';
    this.cajaTexto.setText('Elige quién sigue:');
    this.accionesSubmenu = disponibles.map(({ c, i }) => ({
      texto: `${c.def.nombre} — energía ${c.energia}/${c.stats.energia}`,
      accion: () => {
        this.activo = i;
        this.participantes.add(c.def.id);
        this.actualizarBarras();
        this.mensaje(`¡Adelante, ${c.def.nombre}!`, () => this.menuPrincipal());
      },
    }));
    this.listarOpciones(this.accionesSubmenu.map((a) => a.texto));
  }

  // ------------------------------------------------------------ fin

  private victoria() {
    AudioSystem.sfx('victoria');
    GameState.aplicarEfectos(this.duelo.alGanar);
    // confeti de estrellas doradas
    for (let i = 0; i < 24; i++) {
      const p = this.add.text(Phaser.Math.Between(80, GAME_WIDTH - 80), -20, i % 3 ? '★' : '✦', {
        fontSize: `${Phaser.Math.Between(12, 24)}px`, color: i % 2 ? '#ffd700' : '#ffffff',
      }).setOrigin(0.5).setDepth(28);
      this.tweens.add({
        targets: p, y: GAME_HEIGHT + 30, angle: Phaser.Math.Between(-360, 360),
        duration: Phaser.Math.Between(1200, 2400), delay: Phaser.Math.Between(0, 500),
        onComplete: () => p.destroy(),
      });
    }
    const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, '¡VICTORIA!', {
      fontFamily: 'monospace', fontSize: '48px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#001a4d', strokeThickness: 12,
    }).setOrigin(0.5).setScale(0.2).setDepth(30);
    this.tweens.add({ targets: banner, scale: 1, duration: 400, ease: 'Back.out' });

    // experiencia para los que pelearon (los jefes dan 50% extra)
    const xp = Math.round(this.duelo.energia * (this.duelo.esJefe ? 1.5 : 1));
    this.participantes.forEach((id) => GameState.darXP(id, xp));

    this.mensaje(`¡GANASTE EL DUELO ACADÉMICO! El conocimiento es la mejor victoria.\n✨ +${xp} XP para: ${[...this.participantes].map((id) => amigoPorId(id)?.nombre ?? id).join(', ')}.`, () => {
      this.terminar(true, this.duelo.dialogoVictoria);
    });
  }

  private derrota() {
    // consecuencias reales: reputación, flags de historia (jefes)
    GameState.aplicarEfectos(this.duelo.alPerder);
    this.mensaje('Perdiste el duelo... pero de las derrotas también se aprende. Descansa y vuelve a intentarlo.', () => {
      this.terminar(false, this.duelo.dialogoDerrota);
    });
  }

  private terminar(gano: boolean, dialogoId?: string) {
    this.limpiarOpciones();
    // la energía restante persiste en el estado global
    const estado = GameState.get();
    this.equipo.forEach((c) => { estado.energiaAmigos[c.def.id] = c.energia; });
    const equipoKO = !gano && this.equipo.every((c) => c.energia <= 0);
    this.scene.stop();
    this.game.events.emit('duelo-terminado', { gano, dialogoId, equipoKO });
  }
}
