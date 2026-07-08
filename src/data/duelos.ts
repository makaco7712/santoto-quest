import type { DueloDef } from '../state/types';

/** Duelos académicos — el sistema de "batalla" del juego. */
export const DUELOS: DueloDef[] = [
  {
    id: 'practica_camilo',
    oponente: 'Monitor Camilo',
    spriteKey: 'npc_camilo',
    titulo: 'Duelo de práctica — Inducción',
    energia: 25,
    danoBase: 4,
    categorias: ['usta', 'general'],
    debil: ['logica'],          // la lógica desarma sus discursos de monitor
    resistente: ['labia'],      // labia contra un monitor... él inventó la labia
    ataques: ['Discurso motivacional', 'Dato curioso de la U', 'Pregunta de inducción'],
    dialogoVictoria: 'camilo_victoria',
    dialogoDerrota: 'camilo_derrota',
    alGanar: [{ tipo: 'flag', flag: 'duelo_practica_ganado' }],
  },
  // ---- Duelos "salvajes" de encuentros aleatorios ----
  {
    id: 'salvaje_primiparo',
    oponente: 'Primíparo perdido',
    spriteKey: 'npc_primiparo',
    titulo: 'Encuentro — ¡Un primíparo quiere practicar!',
    energia: 14,
    danoBase: 3,
    categorias: ['general', 'usta'],
    debil: ['labia'],           // un primíparo se convence con carisma
    ataques: ['Pregunta perdida', '¿Dónde queda el baño?'],
    alGanar: [{ tipo: 'item', itemId: 'apuntes', cantidad: 1 }],
  },
  {
    id: 'salvaje_parciales',
    oponente: 'Estudiante en parciales',
    spriteKey: 'npc_parciales',
    titulo: 'Encuentro — Estrés de parciales en el aire',
    energia: 18,
    danoBase: 4,
    categorias: ['logica', 'general'],
    debil: ['logica'],          // el estrés se cura con orden mental
    resistente: ['ley'],        // ya nada lo asusta, ni el reglamento
    ataques: ['Crisis de pánico académico', 'Cafeína en vena', 'Llanto estratégico'],
    alGanar: [{ tipo: 'item', itemId: 'cafe', cantidad: 1 }],
  },
  {
    id: 'salvaje_nono',
    oponente: 'Ñoño de biblioteca',
    spriteKey: 'npc_nono',
    titulo: 'Encuentro — Un sabelotodo nocturno',
    energia: 22,
    danoBase: 5,
    categorias: ['tecnologia', 'derecho', 'logica'],
    debil: ['labia', 'deporte'],   // lo social y lo físico son su kriptonita
    resistente: ['logica', 'codigo'], // en su terreno nadie lo toca
    ataques: ['Corrección pedante', 'Cita textual con página', '"Eso no es lo que dijo el autor"'],
    alGanar: [{ tipo: 'item', itemId: 'apuntes', cantidad: 2 }],
  },
  // ---- JEFES DE ZONA ----
  {
    id: 'jefa_ruiz',
    oponente: 'Ing. Ruiz',
    spriteKey: 'npc_ruiz',
    titulo: 'JEFA — Sala de Sistemas',
    energia: 42,
    danoBase: 6,
    categorias: ['tecnologia', 'logica'],
    debil: ['labia'],                 // los ingenieros no tienen parche contra el small talk
    resistente: ['codigo', 'logica'], // en su terreno nadie la toca
    esJefe: true,
    cargaTurnos: 2,                   // cada 2 turnos COMPILA un ataque devastador
    ataques: ['Code review despiadado', 'Pregunta de examen final', 'Stack trace de 400 líneas', '"¿Y la documentación?"'],
    alGanar: [
      { tipo: 'flag', flag: 'jefa_ruiz_vencida' },
      { tipo: 'quest', accion: 'avanzar', questId: 'servidor_caido' },
    ],
    alPerder: [
      { tipo: 'flag', flag: 'ruiz_molesta' },
      { tipo: 'rep', facultad: 'ingenieria', cantidad: -5 },
    ],
    dialogoVictoria: 'ruiz_victoria',
    dialogoDerrota: 'ruiz_derrota',
  },
  // ---- Futuros: líderes de facultad para el Torneo Tomasino (Acto III) ----
];

export function dueloPorId(id: string): DueloDef | undefined {
  return DUELOS.find((d) => d.id === id);
}
