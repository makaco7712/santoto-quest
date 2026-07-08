import type { PreguntaTrivia } from '../state/types';

/**
 * Banco de preguntas para los duelos académicos, organizadas por categoría.
 * Agregar preguntas aquí las hace disponibles automáticamente para las
 * habilidades que usen esa categoría.
 */
export const TRIVIA: PreguntaTrivia[] = [
  // ---- USTA / lore del campus ----
  { categoria: 'usta', pregunta: '¿En qué año se fundó la Universidad Santo Tomás, Seccional Tunja?', opciones: ['1996', '2002', '1985', '2001'], correcta: 0 },
  { categoria: 'usta', pregunta: '¿Sobre qué antiguo edificio fue construido el campus del centro?', opciones: ['Convento de Santo Domingo', 'Casa del Fundador', 'Claustro de San Agustín', 'Palacio de la Torre'], correcta: 0 },
  { categoria: 'usta', pregunta: '¿A qué orden religiosa pertenece la USTA?', opciones: ['Orden de Predicadores (Dominicos)', 'Jesuitas', 'Franciscanos', 'Agustinos'], correcta: 0 },
  { categoria: 'usta', pregunta: '¿Qué facultad alberga el edificio San Alberto Magno?', opciones: ['Arquitectura', 'Derecho', 'Ingeniería', 'Educación'], correcta: 0 },
  { categoria: 'usta', pregunta: '¿En qué año fue inaugurado el edificio San Alberto Magno?', opciones: ['2001', '1996', '2010', '1999'], correcta: 0 },
  { categoria: 'usta', pregunta: '¿En qué calle está la sede del Centro Histórico de la USTA Tunja?', opciones: ['Calle 19', 'Calle 11', 'Avenida Norte', 'Calle 24'], correcta: 0 },

  // ---- Derecho ----
  { categoria: 'derecho', pregunta: '¿Qué artículo de la Constitución de 1991 consagra el derecho a la educación?', opciones: ['Artículo 67', 'Artículo 11', 'Artículo 103', 'Artículo 40'], correcta: 0 },
  { categoria: 'derecho', pregunta: '¿Cómo se llama la acción para proteger derechos fundamentales en Colombia?', opciones: ['Acción de tutela', 'Acción popular', 'Habeas data', 'Demanda civil'], correcta: 0 },
  { categoria: 'derecho', pregunta: '¿Qué principio dice que nadie puede ser juzgado dos veces por lo mismo?', opciones: ['Non bis in idem', 'In dubio pro reo', 'Habeas corpus', 'Erga omnes'], correcta: 0 },
  { categoria: 'derecho', pregunta: '¿Cuál es la norma de mayor jerarquía en Colombia?', opciones: ['La Constitución Política', 'El Código Civil', 'La ley estatutaria', 'El decreto presidencial'], correcta: 0 },

  // ---- Lógica ----
  { categoria: 'logica', pregunta: 'Si todos los tomasinos madrugan y Ana es tomasina, entonces...', opciones: ['Ana madruga', 'Ana no madruga', 'Ana quizá madruga', 'Nada se concluye'], correcta: 0 },
  { categoria: 'logica', pregunta: '¿Qué sigue en la serie: 2, 4, 8, 16, ...?', opciones: ['32', '24', '20', '18'], correcta: 0 },
  { categoria: 'logica', pregunta: 'Un bus sale de Tunja a las 6 y tarda 2h30. ¿A qué hora llega?', opciones: ['8:30', '8:00', '9:00', '7:30'], correcta: 0 },
  { categoria: 'logica', pregunta: 'Si NO es cierto que "llueve y hace frío", entonces...', opciones: ['No llueve o no hace frío', 'No llueve y no hace frío', 'Llueve o hace frío', 'Hace calor'], correcta: 0 },
  { categoria: 'logica', pregunta: 'Tres amigos se reparten 12 empanadas en partes iguales. ¿Cuántas tocan?', opciones: ['4', '3', '6', '5'], correcta: 0 },
  { categoria: 'logica', pregunta: '¿Qué sigue: lunes, miércoles, viernes, ...?', opciones: ['Domingo', 'Sábado', 'Jueves', 'Martes'], correcta: 0 },
  { categoria: 'logica', pregunta: 'Si todos los servidores fallan cuando hay ratones, y hay un ratón...', opciones: ['El servidor fallará', 'El ratón fallará', 'Nada se concluye', 'El WiFi mejora'], correcta: 0 },
  { categoria: 'logica', pregunta: 'Un parcial dura 90 minutos y empieza a las 8:15. ¿A qué hora termina?', opciones: ['9:45', '9:30', '10:00', '9:15'], correcta: 0 },

  // ---- Tecnología ----
  { categoria: 'tecnologia', pregunta: '¿Qué significa HTML?', opciones: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperTool Media Link', 'Home Text Machine Logic'], correcta: 0 },
  { categoria: 'tecnologia', pregunta: '¿Cuánto es 1010 en binario, en decimal?', opciones: ['10', '5', '12', '8'], correcta: 0 },
  { categoria: 'tecnologia', pregunta: '¿Cuál de estos NO es un lenguaje de programación?', opciones: ['Excel', 'Python', 'TypeScript', 'Java'], correcta: 0 },
  { categoria: 'tecnologia', pregunta: '¿Qué cable conecta un computador a la red por el puerto RJ45?', opciones: ['Ethernet', 'HDMI', 'USB-C', 'VGA'], correcta: 0 },
  { categoria: 'tecnologia', pregunta: '¿Qué hace el comando "ping"?', opciones: ['Comprueba si otro equipo responde en la red', 'Borra archivos temporales', 'Acelera el WiFi', 'Cambia la contraseña'], correcta: 0 },
  { categoria: 'tecnologia', pregunta: '¿Qué significa CPU?', opciones: ['Unidad Central de Procesamiento', 'Control Público Universitario', 'Circuito Paralelo Único', 'Computador Personal Universal'], correcta: 0 },
  { categoria: 'tecnologia', pregunta: 'Si un programa se repite sin parar, está en un...', opciones: ['Bucle infinito', 'Modo turbo', 'Punto de quiebre', 'Modo avión'], correcta: 0 },
  { categoria: 'tecnologia', pregunta: '¿Cuál es el navegador y cuál el buscador?', opciones: ['Chrome navega, Google busca', 'Google navega, Chrome busca', 'Son lo mismo', 'Ninguno busca'], correcta: 0 },
  { categoria: 'tecnologia', pregunta: 'Un byte tiene...', opciones: ['8 bits', '4 bits', '16 bits', '2 bits'], correcta: 0 },

  // ---- General (cultura boyacense / universitaria) ----
  { categoria: 'general', pregunta: '¿Cuál es la capital de Boyacá?', opciones: ['Tunja', 'Duitama', 'Sogamoso', 'Paipa'], correcta: 0 },
  { categoria: 'general', pregunta: '¿Qué batalla de 1819 selló la independencia y ocurrió en Boyacá?', opciones: ['Batalla de Boyacá', 'Batalla de Carabobo', 'Batalla del Pantano de Vargas', 'Batalla de Pichincha'], correcta: 0 },
  { categoria: 'general', pregunta: 'El clima típico de Tunja es...', opciones: ['Frío de montaña', 'Cálido tropical', 'Desértico', 'Templado costero'], correcta: 0 },
  { categoria: 'general', pregunta: '¿Cómo se llama la plaza principal de Tunja?', opciones: ['Plaza de Bolívar', 'Plaza Mayor de Villa', 'Plaza de la Independencia', 'Parque Santander'], correcta: 0 },
];

/** Devuelve una pregunta aleatoria de la categoría, con opciones barajadas. */
export function preguntaAleatoria(categoria: string): { pregunta: string; opciones: string[]; correcta: number } {
  const banco = TRIVIA.filter((t) => t.categoria === categoria);
  const base = banco[Math.floor(Math.random() * banco.length)] ?? TRIVIA[0];
  const indices = base.opciones.map((_, i) => i).sort(() => Math.random() - 0.5);
  return {
    pregunta: base.pregunta,
    opciones: indices.map((i) => base.opciones[i]),
    correcta: indices.indexOf(base.correcta),
  };
}
