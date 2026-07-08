import type { NPCDef } from '../state/types';

/**
 * NPCs del mundo. Las reglas de `dialogos` se evalúan en orden:
 * gana la primera cuya condición se cumpla, así el diálogo
 * cambia según el progreso sin tocar la lógica de escenas.
 */
export const NPCS: NPCDef[] = [
  {
    id: 'camilo',
    nombre: 'Camilo (Monitor)',
    spriteKey: 'npc_camilo',
    posicion: { campus: [15, 18] },
    dialogos: [
      { si: { quest: { id: 'induccion', completada: true } }, dialogoId: 'camilo_post' },
      { si: { flag: 'duelo_practica_ganado' }, dialogoId: 'camilo_victoria' },
      { si: { quest: { id: 'induccion', paso: 4 } }, dialogoId: 'camilo_duelo_intro' },
      { si: { quest: { id: 'induccion', paso: 1 } }, dialogoId: 'camilo_espera_placa' },
      { si: { quest: { id: 'induccion', paso: 2 } }, dialogoId: 'camilo_espera_amigos' },
      { si: { quest: { id: 'induccion', paso: 3 } }, dialogoId: 'camilo_espera_amigos' },
      { dialogoId: 'camilo_intro_1' },
    ],
  },
  {
    id: 'valentina',
    nombre: 'Valentina',
    spriteKey: 'npc_valentina',
    amigoId: 'valentina',
    posicion: { campus: [28, 9] },
    dialogos: [
      { si: { amigoReclutado: 'valentina' }, dialogoId: 'valentina_post' },
      { si: { quest: { id: 'induccion', paso: 2 } }, dialogoId: 'valentina_intro_1' },
      { si: { quest: { id: 'induccion', paso: 3 } }, dialogoId: 'valentina_intro_1' },
      { dialogoId: 'valentina_pre' },
    ],
  },
  {
    id: 'andres',
    nombre: 'Andrés',
    spriteKey: 'npc_andres',
    amigoId: 'andres',
    posicion: { campus: [4, 9] },
    dialogos: [
      { si: { amigoReclutado: 'andres' }, dialogoId: 'andres_post' },
      { si: { quest: { id: 'induccion', paso: 2 } }, dialogoId: 'andres_intro_1' },
      { si: { quest: { id: 'induccion', paso: 3 } }, dialogoId: 'andres_intro_1' },
      { dialogoId: 'andres_pre' },
    ],
  },

  // ================= INTERIORES =================
  {
    id: 'dona_marta',
    nombre: 'Doña Marta',
    spriteKey: 'npc_marta',
    posicion: { vestibulo: [7, 3] },
    dialogos: [
      { si: { sinFlag: 'marta_conocida' }, dialogoId: 'marta_intro' },
      { dialogoId: 'marta_rumores' },
    ],
  },
  {
    id: 'gustavo',
    nombre: 'Don Gustavo (Celador)',
    spriteKey: 'npc_gustavo',
    posicion: { vestibulo: [12, 10] },
    dialogos: [
      { si: { flag: 'gustavo_reganado' }, dialogoId: 'gustavo_charla_2' },
      { dialogoId: 'gustavo_charla' },
    ],
  },
  {
    id: 'dona_blanca',
    nombre: 'Doña Blanca',
    spriteKey: 'npc_blanca',
    posicion: { cafeteria: [3, 1] }, // tras el mostrador: se le habla por encima
    dialogos: [
      { si: { sinFlag: 'blanca_conocida' }, dialogoId: 'blanca_intro' },
      { dialogoId: 'blanca_post' },
    ],
  },
  {
    id: 'fray_tomas',
    nombre: 'Fray Tomás',
    spriteKey: 'npc_fray',
    posicion: { capilla: [5, 3] },
    dialogos: [
      { si: { sinFlag: 'fray_conocido' }, dialogoId: 'fray_intro' },
      { dialogoId: 'fray_post' },
    ],
  },

  // ================= SALA DE SISTEMAS =================
  {
    id: 'felipe',
    nombre: 'Felipe',
    spriteKey: 'npc_felipe',
    amigoId: 'felipe',
    posicion: { sala_sistemas: [15, 8] },
    dialogos: [
      { si: { amigoReclutado: 'felipe' }, dialogoId: 'felipe_post' },
      { si: { quest: { id: 'servidor_caido', paso: 1 } }, dialogoId: 'felipe_solucion' },
      { si: { quest: { id: 'servidor_caido', paso: 0 } }, dialogoId: 'felipe_espera_rack' },
      { si: { quest: { id: 'servidor_caido', paso: 2 } }, dialogoId: 'felipe_animo' },
      { si: { quest: { id: 'induccion', completada: true } }, dialogoId: 'felipe_quest' },
      { dialogoId: 'felipe_ocupado' },
    ],
  },
  {
    id: 'ruiz',
    nombre: 'Ing. Ruiz',
    spriteKey: 'npc_ruiz',
    posicion: { sala_sistemas: [5, 2] },
    dialogos: [
      { si: { quest: { id: 'servidor_caido', completada: true } }, dialogoId: 'ruiz_post' },
      { si: { flag: 'ruiz_molesta', sinFlag: 'ruiz_apaciguada' }, dialogoId: 'ruiz_cafe' },
      { si: { quest: { id: 'servidor_caido', paso: 2 } }, dialogoId: 'ruiz_reto' },
      { dialogoId: 'ruiz_pre' },
    ],
  },
];
