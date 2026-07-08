/**
 * Música chiptune generada con Web Audio API — sin archivos de audio.
 * Temas: título, overworld y duelo. Para usar música real, reemplaza
 * este sistema por carga de .ogg/.mp3 en PreloadScene.
 */

export type Tema = 'titulo' | 'overworld' | 'duelo' | 'interior';

interface Nota { n: number | null; d: number } // nota MIDI (null = silencio), duración en pulsos

const f = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// Melodías simples en tono GBA. Formato: [midi, pulsos]
const TEMAS: Record<Tema, { bpm: number; melodia: Nota[]; bajo: Nota[] }> = {
  titulo: {
    bpm: 92,
    melodia: [
      { n: 67, d: 2 }, { n: 71, d: 2 }, { n: 74, d: 2 }, { n: 79, d: 4 },
      { n: 78, d: 2 }, { n: 74, d: 2 }, { n: 71, d: 4 },
      { n: 72, d: 2 }, { n: 76, d: 2 }, { n: 79, d: 2 }, { n: 83, d: 4 },
      { n: 81, d: 2 }, { n: 79, d: 2 }, { n: 74, d: 4 }, { n: null, d: 2 },
    ],
    bajo: [
      { n: 43, d: 4 }, { n: 47, d: 4 }, { n: 48, d: 4 }, { n: 43, d: 4 },
      { n: 45, d: 4 }, { n: 48, d: 4 }, { n: 50, d: 4 }, { n: 43, d: 4 },
    ],
  },
  overworld: {
    bpm: 110,
    melodia: [
      { n: 72, d: 2 }, { n: 74, d: 1 }, { n: 76, d: 3 }, { n: 74, d: 2 },
      { n: 72, d: 2 }, { n: 69, d: 4 }, { n: null, d: 2 },
      { n: 69, d: 2 }, { n: 72, d: 1 }, { n: 76, d: 3 }, { n: 77, d: 2 },
      { n: 76, d: 2 }, { n: 72, d: 4 }, { n: null, d: 2 },
    ],
    bajo: [
      { n: 48, d: 4 }, { n: 52, d: 4 }, { n: 45, d: 4 }, { n: 48, d: 4 },
      { n: 41, d: 4 }, { n: 45, d: 4 }, { n: 48, d: 4 }, { n: 48, d: 4 },
    ],
  },
  interior: {
    bpm: 84,
    melodia: [
      { n: 76, d: 3 }, { n: 74, d: 1 }, { n: 72, d: 4 }, { n: null, d: 2 },
      { n: 69, d: 2 }, { n: 72, d: 2 }, { n: 74, d: 4 }, { n: null, d: 2 },
      { n: 72, d: 3 }, { n: 71, d: 1 }, { n: 69, d: 4 }, { n: null, d: 2 },
      { n: 67, d: 2 }, { n: 69, d: 2 }, { n: 72, d: 6 },
    ],
    bajo: [
      { n: 45, d: 6 }, { n: 41, d: 6 }, { n: 43, d: 6 }, { n: 48, d: 6 },
      { n: 45, d: 6 }, { n: 41, d: 6 }, { n: 43, d: 6 }, { n: 40, d: 6 },
    ],
  },
  duelo: {
    bpm: 140,
    melodia: [
      { n: 69, d: 1 }, { n: 69, d: 1 }, { n: 72, d: 2 }, { n: 74, d: 1 }, { n: 76, d: 3 },
      { n: 74, d: 1 }, { n: 72, d: 1 }, { n: 69, d: 2 }, { n: 67, d: 4 },
      { n: 69, d: 1 }, { n: 71, d: 1 }, { n: 72, d: 2 }, { n: 76, d: 2 }, { n: 79, d: 2 },
      { n: 77, d: 2 }, { n: 76, d: 2 }, { n: 72, d: 4 },
    ],
    bajo: [
      { n: 45, d: 2 }, { n: 45, d: 2 }, { n: 43, d: 2 }, { n: 43, d: 2 },
      { n: 41, d: 2 }, { n: 41, d: 2 }, { n: 43, d: 2 }, { n: 45, d: 2 },
    ],
  },
};

class AudioSystemClass {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private temaActual: Tema | null = null;
  volumen = 0.22;
  silenciado = false;

  private asegurarContexto() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volumen;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  reproducir(tema: Tema) {
    if (this.temaActual === tema) return;
    this.detener();
    this.asegurarContexto();
    this.temaActual = tema;

    const def = TEMAS[tema];
    const pulso = 60 / def.bpm / 2; // corchea
    const durTotal = (voz: Nota[]) => voz.reduce((s, x) => s + x.d, 0) * pulso;
    const loopDur = Math.max(durTotal(def.melodia), durTotal(def.bajo));

    let proximoLoop = this.ctx!.currentTime + 0.05;
    const programarLoop = () => {
      if (!this.ctx || this.temaActual !== tema) return;
      // programa un ciclo completo de ambas voces
      this.programarVoz(def.melodia, 'square', 0.5, proximoLoop, pulso, loopDur);
      this.programarVoz(def.bajo, 'triangle', 0.9, proximoLoop, pulso, loopDur);
      proximoLoop += loopDur;
    };
    programarLoop();
    this.timer = window.setInterval(() => {
      if (this.ctx && proximoLoop - this.ctx.currentTime < 0.3) programarLoop();
    }, 100);
  }

  private programarVoz(voz: Nota[], tipo: OscillatorType, gainRel: number, t0: number, pulso: number, loopDur: number) {
    let t = t0;
    for (const nota of voz) {
      const dur = nota.d * pulso;
      if (t - t0 >= loopDur) break;
      if (nota.n !== null && !this.silenciado) {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = tipo;
        osc.frequency.value = f(nota.n);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(gainRel * 0.5, t + 0.01);
        g.gain.setValueAtTime(gainRel * 0.5, t + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
        osc.connect(g); g.connect(this.master!);
        osc.start(t); osc.stop(t + dur);
      }
      t += dur;
    }
  }

  /** efecto de sonido corto */
  sfx(tipo: 'confirmar' | 'cancelar' | 'paso' | 'correcto' | 'incorrecto' | 'reclutar' | 'victoria' | 'curacion' | 'puerta' | 'bloqueo' | 'racha') {
    if (this.silenciado) return;
    this.asegurarContexto();
    const t = this.ctx!.currentTime;
    const tocar = (midi: number, inicio: number, dur: number, tipoOsc: OscillatorType = 'square', vol = 0.4) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = tipoOsc;
      osc.frequency.value = f(midi);
      g.gain.setValueAtTime(vol, t + inicio);
      g.gain.exponentialRampToValueAtTime(0.0001, t + inicio + dur);
      osc.connect(g); g.connect(this.master!);
      osc.start(t + inicio); osc.stop(t + inicio + dur);
    };
    switch (tipo) {
      case 'confirmar': tocar(76, 0, 0.08); tocar(83, 0.06, 0.1); break;
      case 'cancelar': tocar(64, 0, 0.12); break;
      case 'paso': tocar(50, 0, 0.03, 'triangle', 0.15); break;
      case 'correcto': tocar(72, 0, 0.08); tocar(76, 0.08, 0.08); tocar(79, 0.16, 0.15); break;
      case 'incorrecto': tocar(50, 0, 0.15, 'sawtooth', 0.25); tocar(44, 0.12, 0.2, 'sawtooth', 0.25); break;
      case 'reclutar': tocar(67, 0, 0.09); tocar(71, 0.08, 0.09); tocar(74, 0.16, 0.09); tocar(79, 0.24, 0.25); break;
      case 'victoria': [67, 71, 74, 79, 83].forEach((n, i) => tocar(n, i * 0.11, 0.18)); break;
      // jingle de curación estilo "Centro Pokémon": arpegio suave ascendente y campanita
      case 'curacion': [64, 67, 71, 72].forEach((n, i) => tocar(n, i * 0.13, 0.2, 'triangle', 0.35)); tocar(84, 0.55, 0.35, 'sine', 0.3); break;
      case 'puerta': tocar(55, 0, 0.07, 'triangle', 0.3); tocar(60, 0.07, 0.09, 'triangle', 0.3); break;
      case 'bloqueo': tocar(48, 0, 0.06, 'square', 0.35); tocar(72, 0.07, 0.12, 'triangle', 0.3); break;
      case 'racha': [72, 76, 79, 84].forEach((n, i) => tocar(n, i * 0.06, 0.09)); break;
    }
  }

  detener() {
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
    this.temaActual = null;
  }

  alternarSilencio() {
    this.silenciado = !this.silenciado;
    if (this.master) this.master.gain.value = this.silenciado ? 0 : this.volumen;
    return this.silenciado;
  }
}

export const AudioSystem = new AudioSystemClass();
