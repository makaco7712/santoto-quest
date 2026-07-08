import Phaser from 'phaser';
import { TILE } from '../config/constants';

/**
 * =====================================================================
 * SPRITES PLACEHOLDER GENERADOS POR CÓDIGO
 * ---------------------------------------------------------------------
 * Todo el arte es procedural para que el juego corra sin assets.
 * Para usar pixel-art real: coloca los PNG en /public/assets/... y
 * cambia la carga en PreloadScene (ver README de esa carpeta).
 * Las claves de textura ('tile_pasto', 'pc_derecho', etc.) se mantienen.
 * =====================================================================
 */

type Ctx = CanvasRenderingContext2D;

function canvasTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx) => void) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h)!;
  const ctx = tex.getContext();
  draw(ctx);
  tex.refresh();
}

function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ------------------------- TILES -------------------------

export function generarTiles(scene: Phaser.Scene) {
  const T = TILE;

  const pastoBase = (ctx: Ctx) => {
    px(ctx, 0, 0, T, T, '#4a8f3c');
    for (let i = 0; i < 10; i++) {
      px(ctx, Math.floor(Math.random() * T), Math.floor(Math.random() * T), 2, 2, '#3d7a30');
    }
  };

  canvasTexture(scene, 'tile_pasto', T, T, pastoBase);

  canvasTexture(scene, 'tile_flores', T, T, (ctx) => {
    pastoBase(ctx);
    px(ctx, 6, 8, 3, 3, '#f0d060');
    px(ctx, 20, 18, 3, 3, '#ffffff');
    px(ctx, 12, 24, 3, 3, '#f0d060');
  });

  // jardín frondoso: la "hierba alta" del campus (zona de encuentros)
  canvasTexture(scene, 'tile_jardin', T, T, (ctx) => {
    pastoBase(ctx);
    px(ctx, 0, 0, T, T, 'rgba(30,80,25,0.35)');
    for (let i = 0; i < 8; i++) {
      const x = 2 + Math.floor(Math.random() * (T - 6));
      const y = 4 + Math.floor(Math.random() * (T - 10));
      px(ctx, x, y, 2, 7, '#2d6b25');
      px(ctx, x + 2, y + 2, 2, 5, '#357a2c');
      px(ctx, x - 2, y + 3, 2, 4, '#2d6b25');
    }
    px(ctx, 8, 6, 3, 3, '#f0d060'); // florecitas que delatan la zona
    px(ctx, 22, 20, 3, 3, '#e8e8f0');
  });

  canvasTexture(scene, 'tile_camino', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#75705f');
    // losetas con luz superior y sombra inferior (relieve)
    const losa = (x: number, y: number, w: number, h: number) => {
      px(ctx, x, y, w, h, '#8a8578');
      px(ctx, x, y, w, 2, '#9b968a');
      px(ctx, x, y + h - 2, w, 2, '#6b665a');
    };
    losa(1, 1, 14, 14); losa(17, 1, 14, 14);
    losa(1, 17, 14, 14); losa(17, 17, 14, 14);
    px(ctx, 20, 5, 3, 2, '#7d7869');           // desgaste
  });

  canvasTexture(scene, 'tile_muro', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#f5efe0');           // muro colonial encalado
    px(ctx, 0, 0, T, 3, '#d8d0ba');
    px(ctx, 0, T - 6, T, 6, '#5a4632');       // zócalo de madera
    px(ctx, 4, 8, 24, 2, '#e8e0cc');
  });

  // ---- campus moderno ----

  // cerca perimetral: seto verde sobre muro bajo gris
  canvasTexture(scene, 'tile_cerca', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#2a5a22');
    for (let i = 0; i < 14; i++) {
      px(ctx, Math.floor(Math.random() * T), Math.floor(Math.random() * 22), 3, 3, '#357a2c');
    }
    px(ctx, 0, 22, T, 10, '#8a8a92');
    px(ctx, 0, 22, T, 2, '#a5a5ae');
  });

  // fachada de vidrio azul con montantes y reflejo diagonal (edificio principal)
  canvasTexture(scene, 'tile_vidrio', T, T, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, T);
    g.addColorStop(0, '#2a5aa8');
    g.addColorStop(1, '#16305e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, T, T);
    // reflejo diagonal del cielo tunjano
    ctx.fillStyle = 'rgba(140,190,240,0.35)';
    ctx.beginPath();
    ctx.moveTo(4, 0); ctx.lineTo(14, 0); ctx.lineTo(0, 14); ctx.lineTo(0, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(140,190,240,0.18)';
    ctx.beginPath();
    ctx.moveTo(20, 0); ctx.lineTo(26, 0); ctx.lineTo(0, 26); ctx.lineTo(0, 20);
    ctx.fill();
    px(ctx, 0, 15, T, 2, '#0d1f42');           // montante horizontal
    px(ctx, 15, 0, 2, T, '#0d1f42');
    px(ctx, 0, 0, T, 1, '#3a6fc0');            // brillo superior
  });

  // banda de paneles dorados (sello del edificio de la USTA)
  canvasTexture(scene, 'tile_dorado', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#d4af37');
    px(ctx, 0, 0, T, 4, '#f0d060');
    px(ctx, 0, 28, T, 4, '#a8862a');
    px(ctx, 10, 0, 2, T, '#b8942a');
    px(ctx, 22, 0, 2, T, '#b8942a');
  });

  // plaza de ladrillo (como la del acceso al edificio)
  canvasTexture(scene, 'tile_ladrillo', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#a05a42');
    for (let y = 0; y < T; y += 8) {
      px(ctx, 0, y, T, 1, '#7d4230');
      const off = ((y / 8) % 2) * 8;
      for (let x = off; x < T; x += 16) px(ctx, x, y, 1, 8, '#7d4230');
    }
    px(ctx, 4, 4, 3, 2, '#b86a50');
    px(ctx, 20, 18, 3, 2, '#8a4a38');
  });

  // césped de cancha (verde vivo con franjas de corte)
  canvasTexture(scene, 'tile_cancha', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#3da044');
    px(ctx, 0, 0, T, 8, '#46b04e');
    px(ctx, 0, 16, T, 8, '#46b04e');
  });

  // línea blanca de cancha sobre césped
  canvasTexture(scene, 'tile_cancha_linea', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#3da044');
    px(ctx, 0, 0, T, 8, '#46b04e');
    px(ctx, 0, 16, T, 8, '#46b04e');
    px(ctx, 13, 0, 6, T, '#e8f0e8');
  });

  // cancha dura azul (baloncesto/tenis)
  canvasTexture(scene, 'tile_cancha_dura', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#2a6a9a');
    px(ctx, 0, 0, T, 2, '#3a7aad');
    px(ctx, 0, 14, T, 2, '#e8f0e8');
  });

  // asfalto del parqueadero
  canvasTexture(scene, 'tile_asfalto', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a4a52');
    px(ctx, 6, 8, 2, 2, '#5a5a62');
    px(ctx, 22, 20, 2, 2, '#5a5a62');
    px(ctx, 14, 26, 2, 2, '#3a3a42');
  });

  // celda de parqueo demarcada (zona de encuentros nocturnos)
  canvasTexture(scene, 'tile_parqueo', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a4a52');
    px(ctx, 0, 0, 2, T, '#d8d840');
    px(ctx, 6, 8, 2, 2, '#5a5a62');
    px(ctx, 20, 22, 3, 2, '#3a3a42');
  });

  // puertas modernas del edificio
  const puertaModerna = (marco: string) => (ctx: Ctx) => {
    px(ctx, 0, 0, T, T, '#1a3a6e');
    px(ctx, 4, 4, 24, 28, marco);
    px(ctx, 7, 7, 18, 25, '#0d1f42');           // vidrio oscuro
    px(ctx, 9, 9, 6, 10, '#5a8ad8');
    px(ctx, 15, 10, 2, 22, marco);               // división central
  };
  canvasTexture(scene, 'tile_puerta_principal', T, T, puertaModerna('#d4af37'));
  canvasTexture(scene, 'tile_puerta_biblio', T, T, puertaModerna('#e8e8f0'));
  canvasTexture(scene, 'tile_puerta_bienestar', T, T, puertaModerna('#4a9a5a'));

  // ---- interiores ----

  // pared interior: crema con zócalo azul institucional
  canvasTexture(scene, 'tile_pared_int', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#efe8d8');
    px(ctx, 0, 0, T, 3, '#dcd4c0');
    px(ctx, 0, T - 8, T, 8, '#003087');
    px(ctx, 0, T - 8, T, 2, '#3a6fd8');
  });

  // baldosa clara con junta
  canvasTexture(scene, 'tile_baldosa', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#cfc9bc');
    px(ctx, 0, 0, T, 1, '#e0dbd0');
    px(ctx, 0, 15, T, 2, '#b5afa2');
    px(ctx, 15, 0, 2, T, '#b5afa2');
    px(ctx, 3, 3, 4, 2, '#dcd7cc');
  });

  // tapete azul con borde dorado
  canvasTexture(scene, 'tile_tapete', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#1a3a7a');
    px(ctx, 0, 0, T, 2, '#d4af37');
    px(ctx, 0, T - 2, T, 2, '#d4af37');
    px(ctx, 8, 10, 3, 3, '#2a4a9a');
    px(ctx, 20, 20, 3, 3, '#2a4a9a');
  });

  // mostrador de madera
  canvasTexture(scene, 'tile_mostrador', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#6b4a2f');
    px(ctx, 0, 0, T, 8, '#84603f');
    px(ctx, 0, 8, T, 2, '#4f3722');
    px(ctx, 6, 14, 2, 14, '#4f3722');
    px(ctx, 24, 14, 2, 14, '#4f3722');
  });

  // mesa de cafetería
  canvasTexture(scene, 'tile_mesa', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#cfc9bc');
    px(ctx, 0, 15, T, 2, '#b5afa2'); px(ctx, 15, 0, 2, T, '#b5afa2');
    ctx.fillStyle = '#84603f';
    ctx.beginPath(); ctx.arc(16, 16, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a0764e';
    ctx.beginPath(); ctx.arc(16, 14, 10, 0, Math.PI * 2); ctx.fill();
  });

  // cartelera de corcho con papeles
  canvasTexture(scene, 'tile_cartelera', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#efe8d8');
    px(ctx, 2, 4, 28, 24, '#a0764e');
    px(ctx, 4, 6, 24, 20, '#c49a6c');
    px(ctx, 6, 8, 8, 9, '#ffffff');
    px(ctx, 17, 9, 8, 7, '#ffe9a8');
    px(ctx, 10, 18, 9, 6, '#cfe0ff');
  });

  // escaleras hacia arriba
  canvasTexture(scene, 'tile_escaleras', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#efe8d8');
    for (let i = 0; i < 5; i++) {
      px(ctx, 4, 4 + i * 6, 24, 5, i % 2 ? '#b5afa2' : '#cfc9bc');
      px(ctx, 4, 4 + i * 6, 24, 1, '#8a857a');
    }
  });

  // ascensor fuera de servicio
  canvasTexture(scene, 'tile_ascensor', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#efe8d8');
    px(ctx, 4, 2, 24, 28, '#8a8a92');
    px(ctx, 6, 4, 9, 24, '#a5a5ae');
    px(ctx, 17, 4, 9, 24, '#a5a5ae');
    px(ctx, 15, 4, 2, 24, '#5a5a62');
    px(ctx, 8, 10, 16, 6, '#ffe9a8'); // letrero "fuera de servicio"
    px(ctx, 10, 12, 12, 2, '#b8942a');
  });

  // planta de interior
  canvasTexture(scene, 'tile_planta', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#cfc9bc');
    px(ctx, 11, 22, 10, 8, '#9c4a2f');
    px(ctx, 12, 20, 8, 3, '#7d3a24');
    ctx.fillStyle = '#2d6b25';
    ctx.beginPath(); ctx.arc(16, 13, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3d8a32';
    ctx.beginPath(); ctx.arc(13, 10, 5, 0, Math.PI * 2); ctx.fill();
  });

  // puertas interiores de madera con letrero
  const puertaInterior = (letrero: string) => (ctx: Ctx) => {
    px(ctx, 0, 0, T, T, '#efe8d8');
    px(ctx, 4, 2, 24, 30, '#6b4a2f');
    px(ctx, 6, 4, 20, 26, '#84603f');
    px(ctx, 20, 16, 3, 3, '#d4af37'); // manija
    px(ctx, 8, 6, 16, 6, letrero);    // letrero de color
  };
  canvasTexture(scene, 'tile_puerta_cafe', T, T, puertaInterior('#d4af37'));
  canvasTexture(scene, 'tile_puerta_capilla', T, T, puertaInterior('#7fa8e8'));

  // tapete de salida con flecha
  canvasTexture(scene, 'tile_salida', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a4a52');
    px(ctx, 2, 2, T - 4, T - 4, '#5a5a62');
    ctx.fillStyle = '#d4af37';
    ctx.beginPath(); ctx.moveTo(16, 24); ctx.lineTo(8, 12); ctx.lineTo(24, 12); ctx.fill();
    px(ctx, 13, 6, 6, 6, '#d4af37');
  });

  // altar de la capilla
  canvasTexture(scene, 'tile_altar', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#efe8d8');
    px(ctx, 4, 10, 24, 20, '#f5f5f0');
    px(ctx, 4, 10, 24, 3, '#d4af37');
    px(ctx, 4, 27, 24, 3, '#d4af37');
    px(ctx, 14, 2, 4, 8, '#d4af37');  // cruz
    px(ctx, 11, 4, 10, 3, '#d4af37');
  });

  // vitral de colores
  canvasTexture(scene, 'tile_vitral', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#2a2a3a');
    px(ctx, 3, 3, 12, 12, '#3a6fd8');
    px(ctx, 17, 3, 12, 12, '#d4af37');
    px(ctx, 3, 17, 12, 12, '#9c2f6b');
    px(ctx, 17, 17, 12, 12, '#2d8a4a');
    px(ctx, 15, 3, 2, 26, '#1a1a2a');
    px(ctx, 3, 15, 26, 2, '#1a1a2a');
    px(ctx, 12, 10, 8, 12, '#f0e8c8'); // figura central
  });

  // banca de interior (madera sobre baldosa — para capilla, vestíbulo, cafetería)
  canvasTexture(scene, 'tile_banca_int', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#cfc9bc');
    px(ctx, 0, 15, T, 2, '#b5afa2'); px(ctx, 15, 0, 2, T, '#b5afa2');
    px(ctx, 3, 8, 26, 12, '#6b4a2f');
    px(ctx, 3, 8, 26, 3, '#84603f');
    px(ctx, 5, 20, 4, 8, '#4f3722');
    px(ctx, 23, 20, 4, 8, '#4f3722');
  });

  // computador de la sala de sistemas
  canvasTexture(scene, 'tile_computador', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#cfc9bc');
    px(ctx, 0, 15, T, 2, '#b5afa2'); px(ctx, 15, 0, 2, T, '#b5afa2');
    px(ctx, 5, 4, 22, 16, '#2a2a3a');     // monitor
    px(ctx, 7, 6, 18, 12, '#0d1f42');     // pantalla
    px(ctx, 9, 8, 8, 2, '#4ad44a');       // línea de código verde
    px(ctx, 9, 12, 12, 2, '#4ad44a');
    px(ctx, 12, 20, 8, 3, '#4a4a52');     // base
    px(ctx, 6, 25, 20, 4, '#8a8a92');     // teclado
  });

  // rack de servidores con LEDs
  canvasTexture(scene, 'tile_rack', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#1a1a22');
    px(ctx, 3, 2, 26, 28, '#2a2a34');
    for (let y = 4; y < 28; y += 6) {
      px(ctx, 5, y, 22, 4, '#3a3a46');
      px(ctx, 7, y + 1, 2, 2, y % 12 ? '#4ad44a' : '#d44a4a');  // LEDs
      px(ctx, 11, y + 1, 2, 2, '#d8d840');
    }
  });

  // acceso peatonal: torniquete/reja del campus
  canvasTexture(scene, 'tile_acceso', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#8a8a92');
    px(ctx, 0, 0, T, 4, '#a5a5ae');
    px(ctx, 4, 6, 3, 26, '#3a3a42');
    px(ctx, 25, 6, 3, 26, '#3a3a42');
    px(ctx, 7, 14, 18, 3, '#d4af37');            // brazo del torniquete
  });

  canvasTexture(scene, 'tile_tejado', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#9c4a2f');
    for (let y = 0; y < T; y += 8) {
      px(ctx, 0, y, T, 2, '#7d3a24');
      for (let x = ((y / 8) % 2) * 8; x < T; x += 16) px(ctx, x, y + 2, 2, 6, '#7d3a24');
    }
  });

  canvasTexture(scene, 'tile_arbol', T, T, (ctx) => {
    pastoBase(ctx);
    px(ctx, 13, 20, 6, 12, '#6b4a2f');        // tronco
    ctx.fillStyle = '#2d6b25';
    ctx.beginPath(); ctx.arc(16, 12, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3d8a32';
    ctx.beginPath(); ctx.arc(12, 9, 7, 0, Math.PI * 2); ctx.fill();
  });

  canvasTexture(scene, 'tile_banca', T, T, (ctx) => {
    pastoBase(ctx);
    px(ctx, 3, 12, 26, 8, '#6b4a2f');
    px(ctx, 3, 12, 26, 2, '#84603f');
    px(ctx, 5, 20, 4, 8, '#4f3722');
    px(ctx, 23, 20, 4, 8, '#4f3722');
  });

  canvasTexture(scene, 'tile_farol', T, T, (ctx) => {
    pastoBase(ctx);
    px(ctx, 14, 8, 4, 22, '#2a2a2a');
    px(ctx, 11, 2, 10, 8, '#1a1a1a');
    px(ctx, 13, 4, 6, 4, '#f0d060');          // luz dorada
  });

  canvasTexture(scene, 'tile_fuente', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#8a8578');
    px(ctx, 2, 2, T - 4, T - 4, '#a39e8f');
    px(ctx, 0, 0, T, 2, '#b5b0a0');
    px(ctx, 0, T - 3, T, 3, '#6e6a5c');
  });

  canvasTexture(scene, 'tile_agua', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a90c2');
    px(ctx, 4, 6, 10, 2, '#7ab8de');
    px(ctx, 18, 14, 8, 2, '#7ab8de');
    px(ctx, 8, 24, 12, 2, '#3a78a8');
  });

  canvasTexture(scene, 'tile_placa', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#8a8578');
    px(ctx, 5, 4, 22, 24, '#d4af37');          // placa dorada
    px(ctx, 7, 6, 18, 20, '#b8942a');
    for (let y = 9; y < 24; y += 4) px(ctx, 9, y, 14, 1, '#8a6d1e');
  });

  // puertas: muro con puerta de madera en arco + franja de color por facultad
  const puerta = (franja: string) => (ctx: Ctx) => {
    px(ctx, 0, 0, T, T, '#f5efe0');
    px(ctx, 6, 6, 20, 26, '#5a4632');
    ctx.fillStyle = '#5a4632';
    ctx.beginPath(); ctx.arc(16, 8, 10, Math.PI, 0); ctx.fill();
    px(ctx, 15, 6, 2, 26, '#3f3122');
    px(ctx, 0, 0, T, 4, franja);
  };
  canvasTexture(scene, 'tile_puerta_derecho', T, T, puerta('#003087'));
  canvasTexture(scene, 'tile_puerta_sanalberto', T, T, puerta('#d4af37'));
  canvasTexture(scene, 'tile_puerta_biblioteca', T, T, puerta('#3a6fd8'));

  canvasTexture(scene, 'tile_arco', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#f5efe0');
    px(ctx, 4, 4, 24, 28, '#1a1a2a');
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.arc(16, 8, 12, Math.PI, 0); ctx.fill();
  });
}

// ------------------------- VARIANTES Y DETALLES DE AMBIENTE -------------------------

/**
 * Variantes por carácter del grid: rompe la repetición visual.
 * El Overworld elige una por coordenada con un hash determinista.
 */
export const VARIANTES_CHAR: Record<string, string[]> = {
  '.': ['tile_pasto', 'tile_pasto_1', 'tile_pasto_2'],
  j: ['tile_jardin', 'tile_jardin_1'],
  f: ['tile_baldosa', 'tile_baldosa_1'],
  l: ['tile_ladrillo', 'tile_ladrillo_1'],
  a: ['tile_asfalto', 'tile_asfalto_1'],
};

/** frames del agua animada */
export const AGUA_FRAMES = ['tile_agua', 'tile_agua_1'];

export function generarAmbiente(scene: Phaser.Scene) {
  const T = TILE;

  // --- variantes de pasto: briznas, piedritas, hojas ---
  canvasTexture(scene, 'tile_pasto_1', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a8f3c');
    for (let i = 0; i < 8; i++) px(ctx, Math.floor(Math.random() * T), Math.floor(Math.random() * T), 2, 2, '#3d7a30');
    px(ctx, 8, 10, 2, 5, '#5aa34a'); px(ctx, 11, 8, 2, 6, '#5aa34a');   // briznas
    px(ctx, 22, 20, 2, 5, '#5aa34a'); px(ctx, 25, 22, 2, 4, '#3d7a30');
  });
  canvasTexture(scene, 'tile_pasto_2', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a8f3c');
    for (let i = 0; i < 8; i++) px(ctx, Math.floor(Math.random() * T), Math.floor(Math.random() * T), 2, 2, '#438436');
    px(ctx, 18, 12, 4, 3, '#8a8578');                                    // piedrita
    px(ctx, 7, 22, 3, 2, '#6b8f3c');                                     // hojita caída
  });

  // --- jardín variante: más flores ---
  canvasTexture(scene, 'tile_jardin_1', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a8f3c');
    px(ctx, 0, 0, T, T, 'rgba(30,80,25,0.35)');
    for (let i = 0; i < 7; i++) {
      const x = 2 + Math.floor(Math.random() * (T - 6));
      const y = 4 + Math.floor(Math.random() * (T - 10));
      px(ctx, x, y, 2, 7, '#2d6b25');
      px(ctx, x + 2, y + 2, 2, 5, '#357a2c');
    }
    px(ctx, 6, 8, 3, 3, '#e87fb0'); px(ctx, 20, 14, 3, 3, '#f0d060');
    px(ctx, 13, 22, 3, 3, '#9ec8e8');
  });

  // --- baldosa variante: grieta sutil ---
  canvasTexture(scene, 'tile_baldosa_1', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#cac4b6');
    px(ctx, 0, 0, T, 1, '#ddd8cd');
    px(ctx, 0, 15, T, 2, '#b5afa2'); px(ctx, 15, 0, 2, T, '#b5afa2');
    px(ctx, 20, 4, 1, 6, '#a8a295'); px(ctx, 21, 9, 1, 4, '#a8a295');   // grieta
  });

  // --- ladrillo variante: tonos alternos ---
  canvasTexture(scene, 'tile_ladrillo_1', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#a55e46');
    for (let y = 0; y < T; y += 8) {
      px(ctx, 0, y, T, 1, '#7d4230');
      const off = ((y / 8) % 2) * 8;
      for (let x = off; x < T; x += 16) px(ctx, x, y, 1, 8, '#7d4230');
      px(ctx, (off + 4) % T, y + 2, 6, 4, y % 16 ? '#b06a50' : '#94523c'); // ladrillo destacado
    }
  });

  // --- asfalto variante: grieta y parche ---
  canvasTexture(scene, 'tile_asfalto_1', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a4a52');
    px(ctx, 4, 6, 1, 10, '#3a3a42'); px(ctx, 5, 14, 1, 8, '#3a3a42');   // grieta
    px(ctx, 18, 18, 8, 6, '#42424a');                                    // parche
    px(ctx, 24, 6, 2, 2, '#5a5a62');
  });

  // --- agua: segundo frame para animar el espejo ---
  canvasTexture(scene, 'tile_agua_1', T, T, (ctx) => {
    px(ctx, 0, 0, T, T, '#4a90c2');
    px(ctx, 8, 8, 10, 2, '#7ab8de');
    px(ctx, 20, 18, 8, 2, '#7ab8de');
    px(ctx, 4, 26, 12, 2, '#3a78a8');
    px(ctx, 24, 4, 4, 2, '#9ed0ea');
  });

  // --- fleco de césped: borde suave donde el pasto toca camino/plaza ---
  canvasTexture(scene, 'fleco_pasto', T, 7, (ctx) => {
    px(ctx, 0, 0, T, 3, '#4a8f3c');
    for (let x = 0; x < T; x += 4) {
      const h = 3 + Math.floor(Math.random() * 4);
      px(ctx, x, 0, 3, h, '#4a8f3c');
      px(ctx, x + 1, h - 1, 1, 1, '#3d7a30');
    }
  });

  // --- sombra proyectada por edificios/muros ---
  canvasTexture(scene, 'sombra_sup', T, 12, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 12);
    g.addColorStop(0, 'rgba(8,10,26,0.42)');
    g.addColorStop(1, 'rgba(8,10,26,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, T, 12);
  });

  // --- halo cálido de los faroles (de noche) ---
  canvasTexture(scene, 'halo_luz', 96, 96, (ctx) => {
    const g = ctx.createRadialGradient(48, 48, 4, 48, 48, 46);
    g.addColorStop(0, 'rgba(255,214,110,0.55)');
    g.addColorStop(0.5, 'rgba(255,190,80,0.22)');
    g.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 96, 96);
  });

  // --- viñeta sutil que enmarca la pantalla ---
  canvasTexture(scene, 'vineta', 400, 240, (ctx) => {
    const g = ctx.createRadialGradient(200, 120, 90, 200, 120, 260);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.75, 'rgba(4,6,20,0.10)');
    g.addColorStop(1, 'rgba(4,6,20,0.42)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 400, 240);
  });

  // --- hojita que flota por el campus ---
  canvasTexture(scene, 'hoja', 7, 5, (ctx) => {
    px(ctx, 1, 1, 5, 3, '#6b8f3c');
    px(ctx, 0, 2, 2, 1, '#57762f');
    px(ctx, 5, 0, 2, 2, '#7da34a');
  });
}

/** char del grid -> clave de textura */
export const CHAR_A_TILE: Record<string, string> = {
  '.': 'tile_pasto',
  ',': 'tile_flores',
  j: 'tile_jardin',
  '=': 'tile_camino',
  l: 'tile_ladrillo',
  c: 'tile_cancha',
  w: 'tile_cancha_linea',
  k: 'tile_cancha_dura',
  a: 'tile_asfalto',
  p: 'tile_parqueo',
  '#': 'tile_cerca',
  E: 'tile_vidrio',
  G: 'tile_dorado',
  T: 'tile_arbol',
  B: 'tile_banca',
  L: 'tile_farol',
  F: 'tile_fuente',
  '~': 'tile_agua',
  P: 'tile_placa',
  D: 'tile_puerta_principal',
  '3': 'tile_puerta_biblio',
  M: 'tile_puerta_bienestar',
  A: 'tile_acceso',
  // interiores
  W: 'tile_pared_int',
  f: 'tile_baldosa',
  r: 'tile_tapete',
  m: 'tile_mostrador',
  h: 'tile_mesa',
  C: 'tile_cartelera',
  s: 'tile_escaleras',
  e: 'tile_ascensor',
  x: 'tile_planta',
  u: 'tile_puerta_cafe',
  q: 'tile_puerta_capilla',
  _: 'tile_salida',
  z: 'tile_altar',
  v: 'tile_vitral',
  b: 'tile_banca_int',
  S: 'tile_computador',
  K: 'tile_rack',
  // tiles coloniales (se conservan para la futura zona del Centro Histórico)
  R: 'tile_tejado',
  '1': 'tile_muro',
  '2': 'tile_muro',
};

// ------------------------- PERSONAJES -------------------------

export interface PaletaPersonaje {
  piel: string;
  pelo: string;
  camisa: string;
  pantalon: string;
  detalle?: string; // chaleco/bufanda
}

/**
 * Genera una hoja de sprites 32x32 con 8 frames:
 * down0 down1 up0 up1 left0 left1 right0 right1
 */
export function generarPersonaje(scene: Phaser.Scene, key: string, p: PaletaPersonaje) {
  if (scene.textures.exists(key)) return;
  const T = TILE;
  const tex = scene.textures.createCanvas(key, T * 8, T)!;
  const ctx = tex.getContext();

  const frame = (fx: number, dir: 'down' | 'up' | 'left' | 'right', paso: number) => {
    const o = fx * T;
    const bob = paso === 1 ? 1 : 0;
    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(o + 16, 29, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
    // piernas (alternan al caminar)
    const izq = paso === 1 ? 2 : 0;
    px(ctx, o + 10, 22 - bob + izq, 5, 6 - izq, p.pantalon);
    px(ctx, o + 17, 22 - bob + (paso === 1 ? 0 : 2), 5, paso === 1 ? 6 : 4, p.pantalon);
    // torso
    px(ctx, o + 8, 13 - bob, 16, 10, p.camisa);
    if (p.detalle) px(ctx, o + 8, 13 - bob, 16, 3, p.detalle);
    // brazos
    px(ctx, o + 5, 14 - bob, 3, 7, p.camisa);
    px(ctx, o + 24, 14 - bob, 3, 7, p.camisa);
    px(ctx, o + 5, 21 - bob, 3, 2, p.piel);
    px(ctx, o + 24, 21 - bob, 3, 2, p.piel);
    // cabeza
    px(ctx, o + 9, 2 - bob, 14, 12, p.piel);
    // pelo según dirección
    if (dir === 'up') {
      px(ctx, o + 9, 2 - bob, 14, 10, p.pelo);
    } else {
      px(ctx, o + 9, 2 - bob, 14, 5, p.pelo);
      px(ctx, o + 9, 2 - bob, 2, 9, p.pelo);
      px(ctx, o + 21, 2 - bob, 2, 9, p.pelo);
      // ojos
      const ojo = '#1a1a2a';
      if (dir === 'down') {
        px(ctx, o + 12, 8 - bob, 2, 3, ojo);
        px(ctx, o + 18, 8 - bob, 2, 3, ojo);
      } else if (dir === 'left') {
        px(ctx, o + 11, 8 - bob, 2, 3, ojo);
      } else {
        px(ctx, o + 19, 8 - bob, 2, 3, ojo);
      }
    }
  };

  const dirs: Array<'down' | 'up' | 'left' | 'right'> = ['down', 'up', 'left', 'right'];
  dirs.forEach((d, i) => { frame(i * 2, d, 0); frame(i * 2 + 1, d, 1); });
  tex.refresh();

  // registra frames nombrados
  dirs.forEach((d, i) => {
    tex.add(`${d}_0`, 0, i * 2 * T, 0, T, T);
    tex.add(`${d}_1`, 0, (i * 2 + 1) * T, 0, T, T);
  });
}

/** Paletas de los personajes jugables y NPCs de la zona 1 */
export const PALETAS: Record<string, PaletaPersonaje> = {
  pc_derecho:   { piel: '#e8b88a', pelo: '#3a2418', camisa: '#003087', pantalon: '#2a2a3a', detalle: '#d4af37' },
  pc_sistemas:  { piel: '#c98d5f', pelo: '#1a1a1a', camisa: '#2a4a6a', pantalon: '#1a1a2a', detalle: '#3a6fd8' },
  pc_arqui:     { piel: '#e8c89a', pelo: '#6b3a1f', camisa: '#f5efe0', pantalon: '#3a3a4a', detalle: '#d4af37' },
  npc_camilo:   { piel: '#d9a06b', pelo: '#2a1a10', camisa: '#d4af37', pantalon: '#003087', detalle: '#003087' },
  npc_valentina:{ piel: '#e8b88a', pelo: '#0f0f0f', camisa: '#003087', pantalon: '#4a4a5a', detalle: '#ffffff' },
  npc_andres:   { piel: '#c98d5f', pelo: '#2a2a2a', camisa: '#5a6a7a', pantalon: '#2a2a3a', detalle: '#3a6fd8' },
  // estudiantes genéricos de encuentros aleatorios
  npc_primiparo:{ piel: '#e8c89a', pelo: '#8a5a2a', camisa: '#4a9a5a', pantalon: '#3a3a4a', detalle: '#ffffff' },
  npc_parciales:{ piel: '#d9c0a8', pelo: '#4a4a4a', camisa: '#7a7a8a', pantalon: '#2a2a3a', detalle: '#d44a4a' },
  npc_nono:     { piel: '#e8b88a', pelo: '#1a1a1a', camisa: '#8a6a3a', pantalon: '#4a3a2a', detalle: '#d4af37' },
  // personal del campus
  npc_marta:    { piel: '#e8c09a', pelo: '#c8c8c8', camisa: '#9c4a6b', pantalon: '#3a3a4a', detalle: '#f0d060' },
  npc_gustavo:  { piel: '#c98d5f', pelo: '#3a3a3a', camisa: '#1a2a5a', pantalon: '#1a1a2a', detalle: '#d4af37' },
  npc_blanca:   { piel: '#e8b88a', pelo: '#5a3a2a', camisa: '#f5f5f0', pantalon: '#8a4a5a', detalle: '#d44a4a' },
  npc_fray:     { piel: '#d9a06b', pelo: '#8a8a8a', camisa: '#f5f5f0', pantalon: '#f5f5f0', detalle: '#1a1a1a' },
  npc_ruiz:     { piel: '#e8c09a', pelo: '#2a2a2a', camisa: '#5a5a6a', pantalon: '#2a2a3a', detalle: '#d4af37' },
  npc_felipe:   { piel: '#c98d5f', pelo: '#4a2a1a', camisa: '#2d6b45', pantalon: '#2a2a3a', detalle: '#d8d840' },
};

// ------------------------- ÍCONOS DE ÍTEMS -------------------------

export function generarIconosItems(scene: Phaser.Scene) {
  const S = 24;
  canvasTexture(scene, 'item_carnet', S, S, (ctx) => {
    px(ctx, 2, 5, 20, 14, '#ffffff');
    px(ctx, 2, 5, 20, 4, '#003087');
    px(ctx, 4, 11, 6, 6, '#e8b88a');
    px(ctx, 12, 12, 8, 1, '#888'); px(ctx, 12, 15, 8, 1, '#888');
  });
  canvasTexture(scene, 'item_apuntes', S, S, (ctx) => {
    px(ctx, 4, 3, 16, 18, '#f5efe0');
    for (let y = 7; y < 19; y += 3) px(ctx, 6, y, 12, 1, '#7a8bb5');
  });
  canvasTexture(scene, 'item_cafe', S, S, (ctx) => {
    px(ctx, 5, 8, 12, 12, '#f5efe0');
    px(ctx, 6, 9, 10, 4, '#4a2a1a');
    px(ctx, 17, 10, 4, 6, '#f5efe0');
    px(ctx, 8, 2, 2, 4, '#bbb'); px(ctx, 12, 2, 2, 4, '#bbb');
  });
  canvasTexture(scene, 'item_usb', S, S, (ctx) => {
    px(ctx, 6, 8, 12, 12, '#2a2a3a');
    px(ctx, 9, 3, 6, 5, '#a0a0a0');
    px(ctx, 8, 12, 8, 4, '#d4af37');
  });
  canvasTexture(scene, 'item_paraguas', S, S, (ctx) => {
    ctx.fillStyle = '#003087';
    ctx.beginPath(); ctx.arc(12, 10, 10, Math.PI, 0); ctx.fill();
    px(ctx, 11, 10, 2, 11, '#6b4a2f');
  });
  canvasTexture(scene, 'item_almojabana', S, S, (ctx) => {
    ctx.fillStyle = '#e8b84a';
    ctx.beginPath(); ctx.arc(12, 13, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d4a030';
    ctx.beginPath(); ctx.arc(12, 11, 7, 0, Math.PI * 2); ctx.fill();
  });
}

// ------------------------- TÍTULO / PARALLAX -------------------------

export function generarParallax(scene: Phaser.Scene) {
  // cielo degradado
  canvasTexture(scene, 'title_cielo', 800, 480, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 480);
    g.addColorStop(0, '#0a1440');
    g.addColorStop(0.6, '#1a3a7a');
    g.addColorStop(1, '#3a6fd8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 800, 480);
    // estrellas
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(Math.random() * 800, Math.random() * 200, 2, 2);
    }
  });

  // nube
  canvasTexture(scene, 'title_nube', 120, 40, (ctx) => {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(30, 25, 15, 0, Math.PI * 2);
    ctx.arc(55, 18, 19, 0, Math.PI * 2);
    ctx.arc(85, 25, 14, 0, Math.PI * 2);
    ctx.fill();
  });

  // silueta del Campus Universitario: edificio principal moderno con su
  // bloque volado, postes de las canchas y árboles
  canvasTexture(scene, 'title_campus', 800, 200, (ctx) => {
    ctx.fillStyle = '#0d1a3a';
    ctx.fillRect(0, 140, 800, 60);                    // suelo
    // edificio principal (derecha): cuerpo escalonado + bloque volado arriba
    ctx.fillRect(480, 60, 240, 140);                  // cuerpo
    ctx.fillRect(440, 100, 60, 100);                  // ala baja
    ctx.fillRect(530, 25, 220, 45);                   // BLOQUE VOLADO (en voladizo a la derecha)
    // postes de iluminación de la cancha (izquierda)
    [80, 200, 320].forEach((x) => {
      ctx.fillRect(x, 70, 6, 130);
      ctx.fillRect(x - 12, 62, 30, 10);
    });
    // árboles
    ctx.beginPath(); ctx.arc(400, 150, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(395, 150, 10, 50);
    // ventanas doradas encendidas del edificio
    ctx.fillStyle = '#d4af37';
    for (let x = 495; x < 710; x += 26) {
      for (let y = 75; y < 190; y += 30) ctx.fillRect(x, y, 12, 14);
    }
    for (let x = 545; x < 740; x += 26) ctx.fillRect(x, 35, 12, 14); // volado
    // luces de los postes
    ctx.fillStyle = '#f0d060';
    [80, 200, 320].forEach((x) => ctx.fillRect(x - 10, 64, 26, 6));
    // franja dorada del edificio (sello USTA)
    ctx.fillStyle = '#b8942a';
    ctx.fillRect(480, 120, 240, 8);
  });
}
