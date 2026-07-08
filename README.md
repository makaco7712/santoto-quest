# SANTOTO QUEST 🎓

RPG 2D estilo Game Boy Advance (Pokémon Esmeralda/FireRed) ambientado en el
**Campus Universitario de la Universidad Santo Tomás, Seccional Tunja**:
el edificio principal moderno de vidrio azul y paneles dorados (con su
bloque volado), cancha de césped, canchas múltiples, rotonda con espejo de
agua, jardines y parqueadero. El protagonista es **Páez**, estudiante de
primer semestre. La sede del Centro Histórico (antiguo Convento de Santo
Domingo) llegará como zona especial en próximos actos.

> *"Sé tu mejor versión"*

## Cómo jugar (sin programas abiertos)

**Doble clic en `JUGAR.bat`** — abre el juego en tu navegador. No necesita
servidor, ni internet, ni tener nada más abierto: todo el juego vive en un
único archivo (`dist/index.html`), que también puedes copiar a una USB o
enviar por correo y abrir en cualquier computador con doble clic.

- **`F`** dentro del juego = pantalla completa (o sal con ESC del navegador).
- Si cambias el código, corre **`ACTUALIZAR_JUEGO.bat`** para regenerar el archivo.

## Cómo ejecutar (modo desarrollo)

```bash
npm install
npm run dev        # desarrollo con recarga (http://localhost:5173)

npm run build      # empaqueta TODO en dist/index.html (un solo archivo)
```

## Controles

| Tecla | Acción |
|---|---|
| Flechas / WASD | Moverse |
| **SHIFT (mantener)** | **Correr** (¡pero no en el edificio, que Don Gustavo vigila!) |
| ESPACIO / ENTER / E | Interactuar, avanzar diálogo, **defender en duelos** |
| 1-4 | Responder trivia en duelos |
| I | Abrir inventario |
| ESC | Menú de pausa / volver |
| F | Pantalla completa |
| M (en Opciones) | Silenciar música |

## Zonas y sistemas nuevos (v0.3)

- **Multi-zona con puertas reales**: el Edificio Principal (carnet requerido)
  lleva al **Vestíbulo**, y de ahí a la **Cafetería** (Doña Blanca) y la
  **Capilla** (Fray Tomás cura tu equipo, estilo Centro Pokémon). Cada zona
  tiene su tema musical, letrero de entrada y transición con fade+autosave.
- **Correr con SHIFT** + nubecita de polvo. Don Gustavo el celador te regaña
  y te devuelve a la puerta si corres dentro del edificio.
- **Duelos con "tipos"**: cada habilidad tiene una materia (Ley, Código,
  Lógica, Labia, Arte, Deporte, Fe). Golpear la debilidad del rival = x1.5
  con banner "¡ARGUMENTO DEMOLEDOR!"; su resistencia = x0.5.
- **Rachas**: 3 aciertos seguidos = 🔥 EN RACHA (+50% daño).
- **Turno enemigo interactivo**: el rival telegrafía su ataque y aparece una
  barra de timing — ESPACIO en la zona dorada bloquea el 50% del daño.
- **Energía persistente**: los amigos no se recuperan solos entre duelos;
  cúralos en la capilla. Si todo el equipo cae, Fray Tomás te rescata.

## Qué hay implementado (v0.1 — Acto I, inicio)

- Pantalla de título con parallax (cielo, nubes, silueta del campus), música
  chiptune generada con Web Audio API y menú completo.
- Selección de personaje (3 estudiantes: Derecho, Ing. de Sistemas, Arquitectura).
- Cinemática de prólogo tipo paneles.
- **Plazoleta Central** jugable: movimiento en grid 32×32, colisiones, cámara
  con lerp, ciclo día/noche con la hora real del sistema, lluvia dinámica
  (¡es Tunja!).
- Misión principal **"Semana de Inducción"** jugable de inicio a fin:
  monitor Camilo → placa del Convento → reclutar a Valentina (Derecho) y
  Andrés (Ing. de Sistemas) → duelo académico de práctica.
- Sistema de diálogo con árbol de decisiones que afecta reputación.
- **Duelos académicos**: batalla por turnos con trivia cronometrada, habilidades
  que escalan con stats (Carisma/Disciplina/Creatividad), objetos y cambio de amigo.
- HUD: misión activa, mini-mapa, reloj/fase del día, clima, contador de amigos.
- Menú de pausa: equipo, inventario, misiones, estadísticas/reputación,
  guardar (localStorage) + exportar/importar JSON.

## Arquitectura

```
src/
├── main.ts                 # arranque Phaser
├── config/constants.ts     # tiles, colores USTA, fases del día
├── state/
│   ├── types.ts            # todos los tipos del contenido
│   └── GameState.ts        # estado global serializable (guardar/cargar)
├── data/                   # ⭐ TODO EL CONTENIDO VIVE AQUÍ (no en la lógica)
│   ├── personajes.ts       # personajes jugables
│   ├── amigos.ts           # amigos reclutables + stats + habilidades
│   ├── npcs.ts             # NPCs, posiciones y reglas de diálogo
│   ├── dialogos.ts         # árboles de diálogo
│   ├── quests.ts           # misiones y pasos
│   ├── items.ts            # ítems
│   ├── trivia.ts           # banco de preguntas por categoría
│   ├── duelos.ts           # definiciones de duelos
│   └── mapas/plazoleta.ts  # mapas como texto (1 char = 1 tile)
├── systems/AudioSystem.ts  # música/sfx con Web Audio API
├── utils/texturas.ts       # sprites/tiles placeholder procedurales
└── scenes/                 # Boot, Preload, Title, CharacterSelect,
                            # Cutscene, Overworld, Dialogue, Duel, HUD, Pause
```

**Para agregar contenido** (NPCs, misiones, preguntas, mapas) solo edita los
archivos de `src/data/` — la lógica de las escenas los consume automáticamente.

## Reemplazar el arte placeholder

Todo el arte actual se genera por código (`src/utils/texturas.ts`). Para usar
pixel-art real: coloca los PNG en `public/assets/` (ver READMEs de esas
carpetas) y cárgalos en `PreloadScene` con las **mismas claves de textura**
(`tile_pasto`, `pc_derecho`, `npc_camilo`, etc.).

## Hoja de ruta

- **Acto I**: zonas de Derecho, San Alberto Magno y Biblioteca + 6 amigos más.
- **Acto II**: crisis de mitad de semestre (parciales, la sala en riesgo, la USB perdida).
- **Acto III**: Torneo Tomasino — líderes de las 6 facultades como "jefes".

## Stack tecnológico

- **[Phaser 3](https://phaser.io/)** — motor de juego 2D (escenas, físicas arcade, cámara, input)
- **TypeScript** — todo el contenido del juego está tipado (`src/state/types.ts`)
- **Vite** — dev server con recarga instantánea y build de producción
- **Web Audio API** — música chiptune y efectos generados por código, sin archivos de audio
- **Sin backend**: el guardado usa `localStorage` + exportar/importar JSON. No hay APIs externas ni credenciales.

## Estado del proyecto

**v0.3 — en desarrollo activo.** El inicio del Acto I es jugable de principio a fin (5 zonas, misión de inducción, duelos académicos, guardado). Todo el arte es placeholder procedural a la espera de pixel-art definitivo. Ver *Hoja de ruta* para lo que viene.

## Créditos

Proyecto desarrollado por **Mahomer Leon** ([@makaco7712](https://github.com/makaco7712)). La autoría, la dirección del proyecto y las decisiones de diseño y arquitectura son del autor; se utilizó **Claude (Anthropic)** como herramienta de asistencia durante el proceso de desarrollo. Universidad Santo Tomás y los lugares del campus aparecen como homenaje ficticio; este es un proyecto estudiantil sin afiliación oficial.

## Licencia

Distribuido bajo licencia [MIT](LICENSE).
