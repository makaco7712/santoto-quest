import type { ItemDef } from '../state/types';

/** Ítems de la vida universitaria tunjana */
export const ITEMS: ItemDef[] = [
  { id: 'carnet', nombre: 'Carnet USTA', tipo: 'clave', descripcion: 'Tu identidad tomasina. Abre las puertas de las facultades (literalmente).', icono: 'item_carnet' },
  { id: 'apuntes', nombre: 'Apuntes', tipo: 'consumible', descripcion: 'Fotocopias y notas de clase. Restauran la concentración de un amigo.', icono: 'item_apuntes', usableEnDuelo: true, efectoDuelo: { energia: 8 } },
  { id: 'cafe', nombre: 'Café campesino', tipo: 'consumible', descripcion: 'Caliente, boyacense y salvador. Restaura mucha energía en un duelo.', icono: 'item_cafe', usableEnDuelo: true, efectoDuelo: { energia: 15 } },
  { id: 'usb', nombre: 'Memoria USB', tipo: 'clave', descripcion: 'Contiene TODOS los trabajos del semestre. Objeto de misión.', icono: 'item_usb' },
  { id: 'paraguas', nombre: 'Paraguas', tipo: 'clave', descripcion: 'En Tunja puede llover en cualquier momento. Imprescindible.', icono: 'item_paraguas' },
  { id: 'almojabana', nombre: 'Almojábana', tipo: 'consumible', descripcion: 'De la cafetería del claustro. Recupera un poco de energía.', icono: 'item_almojabana', usableEnDuelo: true, efectoDuelo: { energia: 6 } },
];

export function itemPorId(id: string): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}
