import type { QuestDef } from '../state/types';

/**
 * Misiones del juego. ACTO I implementado; Actos II y III se
 * añadirán con sus zonas. El HUD muestra la pista del paso actual.
 */
export const QUESTS: QuestDef[] = [
  {
    id: 'induccion',
    titulo: 'Semana de Inducción',
    tipo: 'principal',
    acto: 1,
    pasos: [
      { descripcion: 'Habla con Camilo, el monitor de inducción.', pista: 'Camilo te espera junto al acceso peatonal, al sur del campus.', objetivo: { npcId: 'camilo' } },
      { descripcion: 'Lee el tótem institucional de la rotonda.', pista: 'El tótem dorado está junto al espejo de agua de la rotonda.', objetivo: { tile: [19, 12], mapa: 'campus' } },
      { descripcion: 'Preséntate con Valentina, estudiante de Derecho.', pista: 'Valentina está en la plaza de ladrillo, frente al Edificio Principal.', objetivo: { npcId: 'valentina' } },
      { descripcion: 'Preséntate con Andrés, de Ing. de Sistemas.', pista: 'Andrés está en las bancas junto a la cancha de césped.', objetivo: { npcId: 'andres' } },
      { descripcion: 'Vuelve con Camilo y supera el duelo de práctica.', pista: 'Demuestra lo aprendido: Camilo te espera en el acceso peatonal.', objetivo: { npcId: 'camilo' } },
    ],
    recompensa: {
      items: [{ itemId: 'cafe', cantidad: 2 }, { itemId: 'paraguas', cantidad: 1 }],
      rep: [{ facultad: 'derecho', cantidad: 5 }, { facultad: 'ingenieria', cantidad: 5 }],
    },
  },
  {
    id: 'servidor_caido',
    titulo: 'El servidor caído',
    tipo: 'principal',
    acto: 1,
    pasos: [
      { descripcion: 'Revisa el rack de servidores de la Sala de Sistemas.', pista: 'El rack está en la esquina noroccidental de la sala (piso 2 del Edificio Principal).', objetivo: { tile: [2, 1], mapa: 'sala_sistemas' } },
      { descripcion: 'Cuéntale a Felipe qué encontraste.', pista: 'Felipe está entre los computadores de la sala.', objetivo: { npcId: 'felipe' } },
      { descripcion: 'Derrota a la Ing. Ruiz en duelo académico.', pista: 'Tu primera JEFA: interrumpe su "compilación" acertando 2 preguntas seguidas. La labia es su debilidad.', objetivo: { npcId: 'ruiz' } },
    ],
    recompensa: {
      items: [{ itemId: 'usb', cantidad: 1 }, { itemId: 'cafe', cantidad: 1 }],
      rep: [{ facultad: 'ingenieria', cantidad: 10 }],
    },
  },
  // ---- Próximas misiones principales (se implementan con sus zonas) ----
  // 'croquis-perdido'    (Acto I — Arquitectura, recluta a Mariana)
  // 'sala-en-riesgo'     (Acto II — rumor de cierre del espacio estudiantil)
  // 'parciales'          (Acto II — crisis de mitad de semestre)
  // 'torneo-tomasino'    (Acto III — la "liga": líderes de cada facultad)
];
