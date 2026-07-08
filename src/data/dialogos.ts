import type { NodoDialogo } from '../state/types';

/**
 * Árboles de diálogo. Cada nodo tiene id único; `siguiente` encadena nodos,
 * `opciones` crea ramas con efectos (reputación, quests, reclutamiento, duelos).
 */
export const DIALOGOS: NodoDialogo[] = [
  // ================= CAMILO — monitor de inducción =================
  {
    id: 'camilo_intro_1',
    hablante: 'Camilo',
    texto: '¡Hey! ¿Primer semestre, cierto? Se nota por la cara de frío... tranqui, a Tunja uno se acostumbra. Soy Camilo, monitor de inducción.',
    siguiente: 'camilo_intro_2',
  },
  {
    id: 'camilo_intro_2',
    hablante: 'Camilo',
    texto: 'Bienvenido al Campus Universitario de la Santoto. ¿Ves el edificio principal? Vidrio azul, paneles dorados y ese bloque de arriba que parece flotar en el aire. Los de Arquitectura lloran de la emoción cada vez que lo miran.',
    siguiente: 'camilo_intro_3',
  },
  {
    id: 'camilo_intro_3',
    hablante: 'Camilo',
    texto: 'Te propongo un recorrido: primero lee el tótem institucional de la rotonda, y luego preséntate con dos estudiantes veteranos. Aquí nadie sobrevive el semestre sin amigos. ¿Le medimos?',
    opciones: [
      {
        texto: '¡Claro! Sé tu mejor versión, ¿no?',
        siguiente: 'camilo_intro_si',
        efectos: [{ tipo: 'quest', accion: 'avanzar', questId: 'induccion' }],
      },
      {
        texto: 'Uy, ¿es obligatorio?',
        siguiente: 'camilo_intro_meh',
        efectos: [{ tipo: 'quest', accion: 'avanzar', questId: 'induccion' }],
      },
    ],
  },
  {
    id: 'camilo_intro_si',
    hablante: 'Camilo',
    texto: '¡Esa es la actitud tomasina! El tótem está en la rotonda del espejo de agua, subiendo por el sendero. Nos vemos aquí cuando termines.',
  },
  {
    id: 'camilo_intro_meh',
    hablante: 'Camilo',
    texto: 'Jajaja, obligatorio no... pero el que no conoce el campus termina perdido buscando el baño en semana de parciales. Hazme caso: empieza por el tótem de la rotonda.',
  },
  {
    id: 'camilo_espera_placa',
    hablante: 'Camilo',
    texto: 'El tótem está junto al espejo de agua de la rotonda. Es dorado, no tiene pierde.',
  },
  {
    id: 'camilo_espera_amigos',
    hablante: 'Camilo',
    texto: 'Ahora las presentaciones: Valentina de Derecho está en la plaza frente al Edificio Principal, y Andrés de Sistemas por las bancas de la cancha. Ve, que no muerden. Bueno... Valentina argumenta fuerte, pero no muerde.',
  },
  {
    id: 'camilo_duelo_intro',
    hablante: 'Camilo',
    texto: '¡Volviste, y con equipo! Última parte de la inducción: un DUELO ACADÉMICO de práctica. Así se resuelven las cosas aquí: con conocimiento, no con puños. ¿Listo para tu primer duelo?',
    opciones: [
      {
        texto: '¡Listo! (Iniciar duelo)',
        efectos: [{ tipo: 'duelo', dueloId: 'practica_camilo' }],
      },
      {
        texto: 'Dame un momento para prepararme.',
        siguiente: 'camilo_duelo_espera',
      },
    ],
  },
  {
    id: 'camilo_duelo_espera',
    hablante: 'Camilo',
    texto: 'Tranquilo, aquí te espero. Habla conmigo cuando estés listo. Consejo: en los duelos, cada habilidad de tus amigos lanza una pregunta. Responde bien y el golpe conecta.',
  },
  {
    id: 'camilo_victoria',
    hablante: 'Camilo',
    texto: '¡Excelente! Oficialmente sobreviviste la inducción. Toma: café campesino y un paraguas, los dos pilares de la vida universitaria en Tunja. Nos vemos por el campus... y recuerda el lema: sé tu mejor versión.',
    efectos: [{ tipo: 'quest', accion: 'avanzar', questId: 'induccion' }],
  },
  {
    id: 'camilo_derrota',
    hablante: 'Camilo',
    texto: '¡Casi! No te preocupes, hasta los de décimo pierden duelos. Respira, tómate un café y hablamos cuando quieras el desquite.',
  },
  {
    id: 'camilo_post',
    hablante: 'Camilo',
    texto: 'El semestre apenas comienza. Dicen que en el Edificio Principal una estudiante de Arquitectura perdió el croquis de su maqueta final... quizá pronto puedas ayudarla. (Próximamente: Acto I continúa)',
  },

  // ================= TÓTEM INSTITUCIONAL =================
  {
    id: 'placa_convento',
    hablante: 'Tótem institucional',
    texto: '"Universidad Santo Tomás, Seccional Tunja — Campus Universitario. Fundada el 1 de marzo de 1996. Orden de Predicadores (Dominicos). Primer claustro universitario de Colombia. Sé tu mejor versión."',
    siguiente: 'placa_convento_2',
  },
  {
    id: 'placa_convento_2',
    hablante: 'Páez',
    texto: '(El escudo dorado brilla contra el cielo frío de Tunja. Canchas, jardines y ese edificio que parece flotar... aquí vas a pasar los próximos años de tu vida. Mejor seguir con las presentaciones.)',
    efectos: [
      { tipo: 'flag', flag: 'placa_leida' },
      { tipo: 'quest', accion: 'avanzar', questId: 'induccion' },
    ],
  },
  {
    id: 'placa_convento_releer',
    hablante: 'Tótem institucional',
    texto: '"USTA Tunja — Campus Universitario. Fundada en 1996. Sé tu mejor versión."',
  },

  // ================= VALENTINA — Derecho =================
  {
    id: 'valentina_intro_1',
    hablante: 'Valentina',
    texto: '¿Cara nueva? Objeción: nadie me informó de estudiantes nuevos hoy... Ja, es broma. Soy Valentina, tercer semestre de Derecho. ¿Camilo te mandó, cierto? Siempre me manda a los primíparos.',
    siguiente: 'valentina_intro_2',
  },
  {
    id: 'valentina_intro_2',
    hablante: 'Valentina',
    texto: 'Consejo gratis: el bloque de Derecho parece intimidante, pero los mejores debates pasan en la cafetería. Y dime... ¿tú qué opinas de discutir ideas en voz alta?',
    opciones: [
      {
        texto: 'Me encanta un buen debate.',
        siguiente: 'valentina_recluta',
        efectos: [{ tipo: 'rep', facultad: 'derecho', cantidad: 5 }],
      },
      {
        texto: 'Prefiero escuchar primero.',
        siguiente: 'valentina_recluta_suave',
        efectos: [{ tipo: 'rep', facultad: 'derecho', cantidad: 2 }],
      },
      {
        texto: 'Los debates me dan pereza.',
        siguiente: 'valentina_reta',
      },
    ],
  },
  {
    id: 'valentina_recluta',
    hablante: 'Valentina',
    texto: '¡Esa respuesta me gusta! Mira, necesito gente con criterio para el semestre. Cuenta conmigo para tus duelos académicos: cuando necesites un alegato de apertura, ahí estaré.',
    efectos: [
      { tipo: 'reclutar', amigoId: 'valentina' },
      { tipo: 'quest', accion: 'avanzar', questId: 'induccion' },
    ],
  },
  {
    id: 'valentina_recluta_suave',
    hablante: 'Valentina',
    texto: 'Mmm, prudente. Eso también es una virtud jurídica: el que escucha bien, argumenta mejor. Me caes bien. Cuenta conmigo para tus duelos académicos este semestre.',
    efectos: [
      { tipo: 'reclutar', amigoId: 'valentina' },
      { tipo: 'quest', accion: 'avanzar', questId: 'induccion' },
    ],
  },
  {
    id: 'valentina_reta',
    hablante: 'Valentina',
    texto: '¿Pereza? Interesante tesis. Contra-argumento: acabas de debatir conmigo al defenderla. Caso cerrado: tienes madera y ni lo sabías. Te acompaño este semestre, primíparo.',
    efectos: [
      { tipo: 'reclutar', amigoId: 'valentina' },
      { tipo: 'quest', accion: 'avanzar', questId: 'induccion' },
      { tipo: 'rep', facultad: 'derecho', cantidad: 1 },
    ],
  },
  {
    id: 'valentina_post',
    hablante: 'Valentina',
    texto: 'Cuando haya duelo, invócame sin miedo: mi "¡Objeción!" no falla. Bueno, casi nunca.',
  },
  {
    id: 'valentina_pre',
    hablante: 'Valentina',
    texto: '(Una estudiante repasa un código en voz alta con total seguridad.) ...y por eso el artículo 67 es fundamental. ¿Necesitas algo? Estoy en medio de un repaso. Habla primero con el monitor de inducción.',
  },

  // ================= ANDRÉS — Ing. de Sistemas =================
  {
    id: 'andres_intro_1',
    hablante: 'Andrés',
    texto: '...y si el ciclo no termina es porque la condición nunca... ah. Hola. No te vi. Soy Andrés, Sistemas. ¿Te mandó Camilo? Suele "desplegar" primíparos hacia mí sin avisar.',
    siguiente: 'andres_intro_2',
  },
  {
    id: 'andres_intro_2',
    hablante: 'Andrés',
    texto: 'Te hago el test que le hago a todo el mundo. Es rápido, lo prometo: si un bus sale de Tunja a las 6:00 y tarda dos horas y media a Bogotá... ¿a qué hora llega?',
    opciones: [
      {
        texto: 'A las 8:30.',
        siguiente: 'andres_recluta',
        efectos: [{ tipo: 'rep', facultad: 'ingenieria', cantidad: 5 }],
      },
      {
        texto: 'A las 9:00... ¿no?',
        siguiente: 'andres_recluta_error',
      },
      {
        texto: 'Depende del trancón en el peaje.',
        siguiente: 'andres_recluta_trancon',
        efectos: [{ tipo: 'rep', facultad: 'ingenieria', cantidad: 3 }],
      },
    ],
  },
  {
    id: 'andres_recluta',
    hablante: 'Andrés',
    texto: '8:30. Correcto, sin dudar. Test aprobado: tienes lógica de compilador. Mira, este semestre necesito gente confiable... y tú necesitas equipo para los duelos. Trato hecho, ¿va?',
    efectos: [
      { tipo: 'reclutar', amigoId: 'andres' },
      { tipo: 'quest', accion: 'avanzar', questId: 'induccion' },
    ],
  },
  {
    id: 'andres_recluta_error',
    hablante: 'Andrés',
    texto: 'Error de cálculo... pero dudaste, y dudar es el primer paso del debugging. Me sirves: la gente que reconoce que puede equivocarse aprende más rápido. Equipo, ¿va?',
    efectos: [
      { tipo: 'reclutar', amigoId: 'andres' },
      { tipo: 'quest', accion: 'avanzar', questId: 'induccion' },
    ],
  },
  {
    id: 'andres_recluta_trancon',
    hablante: 'Andrés',
    texto: '...Respuesta no contemplada en mis casos de prueba. Y con manejo de variables del mundo real. Me gusta: pensamiento de ingeniero. Bienvenido al equipo.',
    efectos: [
      { tipo: 'reclutar', amigoId: 'andres' },
      { tipo: 'quest', accion: 'avanzar', questId: 'induccion' },
    ],
  },
  {
    id: 'andres_post',
    hablante: 'Andrés',
    texto: 'Si el duelo se pone difícil, usa mi "Debug mental". Encuentra el fallo en cualquier argumento... excepto en los de Valentina, esa mujer no tiene bugs.',
  },
  {
    id: 'andres_pre',
    hablante: 'Andrés',
    texto: '(Un estudiante murmura frente a su portátil, rodeado de stickers.) Mmm... perdón, estoy depurando algo. Si eres primíparo, busca primero al monitor Camilo, él coordina la inducción.',
  },

  // ================= AMBIENTE =================
  {
    id: 'fuente_mirar',
    hablante: 'Espejo de agua',
    texto: 'El agua de la rotonda refleja el edificio principal y el cielo frío de Tunja. Alguien lanzó una moneda de 500 pidiendo pasar Cálculo. El agua no promete nada.',
  },
  {
    id: 'cancha_mirar',
    hablante: 'Cancha de césped',
    texto: 'El césped huele a recién cortado. Un cartel dice: "Torneo intersemestral — inscripciones en Bienestar". A lo lejos alguien grita "¡GOLAZO!" con más fe que técnica.',
  },
  {
    id: 'cancha_dura_mirar',
    hablante: 'Canchas múltiples',
    texto: 'Cancha dura azul: baloncesto, voleibol y microfútbol se turnan el espacio. El tablero todavía marca 48-47. Nadie sabe quién ganó y ya hay dos versiones de la historia.',
  },
  {
    id: 'puerta_principal_sin_carnet',
    hablante: 'Edificio Principal',
    texto: 'El lector parpadea en rojo. *BIP-BIP* — "PRESENTE SU CARNET". Sin tu Carnet USTA no entras ni a reclamar. El celador te mira con sospecha profesional.',
  },
  {
    id: 'puerta_biblioteca',
    hablante: 'Biblioteca — CRAI',
    texto: 'Centro de Recursos para el Aprendizaje y la Investigación. Un letrero advierte: "SILENCIO — semana de parciales todo el año". (Esta zona se abrirá próximamente.)',
  },
  {
    id: 'puerta_bienestar',
    hablante: 'Bienestar Universitario',
    texto: 'Deportes, cultura y salud. Un pendón anuncia: "Inscripciones abiertas: fútbol, tuna universitaria y club de ajedrez". (Esta zona se abrirá próximamente.)',
  },
  {
    id: 'acceso_peatonal',
    hablante: 'Acceso peatonal',
    texto: 'El torniquete da a la Avenida Universitaria. El resto de Tunja — y el frío — tendrán que esperar: la inducción es primero.',
  },

  // ================= VESTÍBULO =================
  {
    id: 'marta_intro',
    hablante: 'Doña Marta',
    texto: '¡Primíparo a la vista! No, no me digas tu nombre... Páez, primer semestre, llegaste hoy a las 6:47 y ya te mojaste con el primer aguacero. Doña Marta lo sabe TODO, mijito. Llevo aquí desde que este edificio era un plano.',
    siguiente: 'marta_intro_2',
  },
  {
    id: 'marta_intro_2',
    hablante: 'Doña Marta',
    texto: 'Guía rápida: la cartelera tiene los anuncios, las escaleras van a las facultades, la cafetería de Blanca queda por esa puerta y la capilla por la otra. ¿El ascensor? Ni lo mires. "Fuera de servicio desde 2019". Aunque dicen que hay UNA llave...',
    efectos: [{ tipo: 'flag', flag: 'marta_conocida' }],
  },
  {
    id: 'marta_rumores',
    hablante: 'Doña Marta',
    texto: 'Rumor del día: Fray Tomás repone energías mejor que cualquier bebida energética, la almojábana de Blanca cura penas de amor, y el que consiga la llave del ascensor verá el mejor atardecer de Tunja. Yo no dije nada.',
  },
  {
    id: 'mostrador_recepcion',
    hablante: 'Recepción',
    texto: 'El mostrador huele a papel sellado y a tinto recién servido. Hay un timbre que dice "TOQUE UNA VEZ. Doña Marta ya sabe qué necesita".',
  },
  {
    id: 'cartelera_vestibulo',
    hablante: 'Cartelera',
    texto: '"Semillero de argumentación: martes 4pm" · "Torneo intersemestral: inscripciones en Bienestar" · "SE BUSCA compañero de tesis (situación desesperada, pago con empanadas)" · "Taller: cómo citar en APA sin llorar".',
  },
  {
    id: 'escaleras_facultades',
    hablante: 'Escaleras',
    texto: 'Suben hacia las facultades: Derecho, Ingeniería, Administración, Educación... Un cartel: "PISOS 2-6 EN OBRA. Disculpe las molestias". (Las facultades se abrirán próximamente.)',
  },
  {
    id: 'ascensor_bloqueado',
    hablante: 'Ascensor',
    texto: 'Un letrero amarillento: "FUERA DE SERVICIO". Debajo, en marcador: "desde 2019". Debajo, en otro marcador: "ya ni los de mantenimiento lo intentan". La ranura de la llave, en cambio, se ve... usada recientemente.',
  },
  {
    id: 'gustavo_charla',
    hablante: 'Don Gustavo',
    texto: 'Bienvenido al Edificio Principal. Reglas: no correr, no gritar, no patinetas, no "parkour" — sí, ya pasó, no pregunte. El piso lleva encerado desde las 5 a.m. y así se va a quedar.',
  },
  {
    id: 'gustavo_charla_2',
    hablante: 'Don Gustavo',
    texto: '...Lo estoy viendo, ¿oyó? Camine despacio y llegamos lejos.',
  },
  {
    id: 'gustavo_regano',
    hablante: 'Don Gustavo',
    texto: '¡¿QUÉ LE DIJE DE CORRER?! ¡Piso encerado, mijo! Hágame el favor y arranca desde la puerta, CAMINANDO, como la gente civilizada.',
    efectos: [{ tipo: 'flag', flag: 'gustavo_reganado' }],
  },

  // ================= CAFETERÍA =================
  {
    id: 'blanca_intro',
    hablante: 'Doña Blanca',
    texto: '¡Ay, pero qué flacura! ¿Primer semestre? Tome, mijito, una almojabanita de la casa, que aquí nadie estudia con el estómago vacío. Cuando abra la caja registradora me paga... con buenas notas.',
    efectos: [
      { tipo: 'flag', flag: 'blanca_conocida' },
      { tipo: 'item', itemId: 'almojabana', cantidad: 1 },
      { tipo: 'rep', facultad: 'administracion', cantidad: 2 },
    ],
  },
  {
    id: 'blanca_post',
    hablante: 'Doña Blanca',
    texto: 'El tinto está recién hecho y las empanadas salen a las 10. La caja registradora llega "la otra semana" desde marzo... así que por ahora, sonrisa y fe. ¿Se le ofrece algo, corazón?',
  },
  {
    id: 'menu_cafeteria',
    hablante: 'Menú del día',
    texto: '"Tinto: $1.000 · Almojábana: $2.000 · Almojábana CON queso: $2.500 (la buena) · Empanada: $1.500 · COMBO TRASNOCHADA: 2 tintos + 1 empanada + palabras de aliento: $4.000".',
  },
  {
    id: 'mesa_cafeteria',
    hablante: 'Mesa de la cafetería',
    texto: 'Conversación ajena inevitable: "...y el profe dijo QUIZ el lunes. — ¿Quiz de qué? — Nadie sabe. — ¿De qué materia? — NADIE. SABE." Decides no involucrarte.',
  },

  // ================= CAPILLA =================
  {
    id: 'fray_intro',
    hablante: 'Fray Tomás',
    texto: 'Pax et bonum... no, espera, eso es de los franciscanos. ¡Bienvenido! Fray Tomás, de la Orden de Predicadores. Esta capilla lleva el nombre de Santo Tomás de Aquino: santo, doctor de la Iglesia y, según dicen, el mejor tomador de apuntes de la historia.',
    siguiente: 'fray_intro_2',
  },
  {
    id: 'fray_intro_2',
    hablante: 'Fray Tomás',
    texto: 'Aquí no se pide nada a cambio: si tu equipo viene agotado de tanto duelo académico, un momento de silencio, un tinto y buena conversación obran milagros. ¿Descansamos?',
    efectos: [{ tipo: 'flag', flag: 'fray_conocido' }],
    opciones: [
      { texto: 'Sí, un respiro nos cae bien. (Curar equipo)', siguiente: 'fray_cura' },
      { texto: 'Solo pasaba a saludar.', siguiente: 'fray_despedida' },
    ],
  },
  {
    id: 'fray_post',
    hablante: 'Fray Tomás',
    texto: '¡Páez! ¿Cómo va ese semestre? ¿Un descanso para el equipo o solo vienes por la paz del lugar? Ambas son válidas, que conste.',
    opciones: [
      { texto: 'Necesitamos recargar energías. (Curar equipo)', siguiente: 'fray_cura' },
      { texto: 'Solo la paz del lugar, gracias.', siguiente: 'fray_despedida' },
    ],
  },
  {
    id: 'fray_cura',
    hablante: 'Fray Tomás',
    texto: 'Silencio... respiren... un sorbo de tinto... y listo. Como nuevos. Santo Tomás decía que el descanso es parte del estudio. Bueno, lo parafraseo, pero seguro lo pensó.',
    efectos: [{ tipo: 'curar' }],
  },
  {
    id: 'fray_despedida',
    hablante: 'Fray Tomás',
    texto: 'Las puertas siempre están abiertas. Y el tinto siempre está caliente — milagro menor, pero milagro al fin.',
  },
  {
    id: 'fray_rescate',
    hablante: 'Fray Tomás',
    texto: 'Despacio, despacio... Te encontraron agotado después del duelo y te trajeron aquí. Ya avisé que estás bien. Tu equipo descansó, tomó tinto y hasta el ánimo volvió. La derrota también enseña — Santo Tomás llenó libros con eso.',
    efectos: [{ tipo: 'curar' }],
  },
  {
    id: 'altar_mirar',
    hablante: 'Altar',
    texto: 'Sencillo, de madera y piedra, con detalles dorados. Huele a cera de vela. Una placa: "Facientes Veritatem — Haciendo la Verdad".',
  },
  {
    id: 'vitral_dia',
    hablante: 'Vitral',
    texto: 'Santo Tomás de Aquino en vidrio de colores, con un libro y una pluma. La luz fría de Tunja lo atraviesa y pinta el piso de azul y dorado.',
  },
  {
    id: 'vitral_noche',
    hablante: 'Vitral',
    texto: 'De noche el vitral no debería brillar... pero brilla. Las letras del libro de Santo Tomás parecen moverse y por un instante juraría que leen: "SÉ TU MEJOR VERSIÓN, PÁEZ". Parpadeas. Ya está normal. Nadie te va a creer esto.',
    efectos: [{ tipo: 'flag', flag: 'vitral_secreto' }, { tipo: 'rep', facultad: 'educacion', cantidad: 3 }],
  },
  {
    id: 'banca_capilla',
    hablante: 'Banca de la capilla',
    texto: 'Madera pulida por generaciones de estudiantes que vinieron a pedir: "que pase el semestre, que pase el parcial, que pase EL BUS". Todas plegarias válidas.',
  },

  // ================= SALA DE SISTEMAS =================
  {
    id: 'felipe_ocupado',
    hablante: 'Felipe',
    texto: '(Un estudiante con hoodie verde teclea a velocidad imposible.) Perdón parce, tengo el buffer lleno: primero termina tu inducción y después hablamos. Prioridad de procesos, ¿me entiendes?',
  },
  {
    id: 'felipe_quest',
    hablante: 'Felipe',
    texto: '¡Parce, qué bueno ver una cara nueva! Soy Felipe, Telecomunicaciones. Mira el drama: EL SERVIDOR SE CAYÓ. Notas, plataformas, TODO down. Y la Ing. Ruiz está que compila rabia pura. ¿Me ayudas a revisar el rack? Yo no me atrevo solo, esa esquina asusta.',
    opciones: [
      {
        texto: 'De una. Vamos a ver ese rack.',
        siguiente: 'felipe_quest_si',
        efectos: [{ tipo: 'quest', accion: 'iniciar', questId: 'servidor_caido' }],
      },
      {
        texto: '¿Y por qué no lo revisas tú?',
        siguiente: 'felipe_quest_excusa',
        efectos: [{ tipo: 'quest', accion: 'iniciar', questId: 'servidor_caido' }],
      },
    ],
  },
  {
    id: 'felipe_quest_si',
    hablante: 'Felipe',
    texto: '¡Ese es el espíritu! El rack es esa torre negra con luces de la esquina. Si algo pita, NO es tu culpa. Probablemente.',
  },
  {
    id: 'felipe_quest_excusa',
    hablante: 'Felipe',
    texto: '...La última vez que toqué el rack se cayó también el WiFi de la cafetería y Doña Blanca me miró de una forma que todavía me duele. Ve tú, que eres nuevo y nadie te conoce.',
  },
  {
    id: 'felipe_espera_rack',
    hablante: 'Felipe',
    texto: 'El rack, parce: la torre negra de la esquina, la que tiene lucecitas. Yo te cubro desde acá... moralmente.',
  },
  {
    id: 'rack_mirar',
    hablante: 'Rack de servidores',
    texto: 'Una torre negra con LEDs parpadeando. Ronronea como un gato de 40 kilos. Mejor no tocar nada sin razón.',
  },
  {
    id: 'rack_descubrimiento',
    hablante: 'Rack de servidores',
    texto: 'Revisas el rack: LED rojo, cable de red mordisqueado y... ¿pelitos? Un movimiento entre los cables. Un ratón. No un mouse: un RATÓN DE VERDAD, viviendo calientico entre los servidores. Ha estado mordiendo el cable del switch.',
    siguiente: 'rack_descubrimiento_2',
  },
  {
    id: 'rack_descubrimiento_2',
    hablante: 'Páez',
    texto: '(Reconectas el cable por el puerto de respaldo. Los LEDs pasan a verde uno por uno. El ratón te mira, ofendido, y se muda al techo. Esto tiene que saberlo Felipe.)',
    efectos: [{ tipo: 'quest', accion: 'avanzar', questId: 'servidor_caido' }],
  },
  {
    id: 'rack_post',
    hablante: 'Rack de servidores',
    texto: 'LEDs en verde, ronroneo estable. Alguien pegó un papelito: "PROHIBIDO ANIDAR — att. la administración". El ratón del techo no firma acuerdos.',
  },
  {
    id: 'felipe_solucion',
    hablante: 'Felipe',
    texto: '¿¡UN RATÓN!? ¿Un ratón de VERDAD tumbó la red de toda la universidad? Parce... llevo tres días culpando al proveedor. Esto es ORO. Espera... ¿reconectaste por el puerto de respaldo? Ingeniería pura. Tú y yo vamos a ser buenos amigos.',
    efectos: [
      { tipo: 'reclutar', amigoId: 'felipe' },
      { tipo: 'quest', accion: 'avanzar', questId: 'servidor_caido' },
      { tipo: 'rep', facultad: 'ingenieria', cantidad: 5 },
    ],
    siguiente: 'felipe_solucion_2',
  },
  {
    id: 'felipe_solucion_2',
    hablante: 'Felipe',
    texto: 'Peeeero hay un detalle: la Ing. Ruiz no cree que "un ratón" sea un diagnóstico serio. Dice que si quieres que firme el reporte, se lo demuestres en DUELO ACADÉMICO. Consejo de amigo: resiste código y lógica... pero la labia la descoloca. Y cuando empiece a "COMPILAR", acierta dos seguidas o nos borra a todos.',
  },
  {
    id: 'felipe_animo',
    hablante: 'Felipe',
    texto: '¡Tú puedes, parce! Recuerda: labia. Y si empieza a compilar, DOS SEGUIDAS. Yo estaré aquí, escondido detrás de este monitor por razones tácticas.',
  },
  {
    id: 'felipe_post',
    hablante: 'Felipe',
    texto: 'Equipo: si la red se cae, ya saben, primero pregunten si es culpa del proveedor... o del ratón. En los duelos cuenta conmigo: mi PING no falla. Casi nunca. Depende de la latencia.',
  },
  {
    id: 'pantalla_sala',
    hablante: 'Computador',
    texto: 'En la pantalla: 01001000 01001111 01001100 01000001. Alguien dejó un post-it: "si puedes leer esto, ya eres de Sistemas".',
  },
  {
    id: 'escritorio_sala',
    hablante: 'Escritorio',
    texto: 'Apuntes de redes, un destornillador, tres latas de energizante y un patito de goma para "debug". Todo en orden, según los estándares de Ingeniería.',
  },
  {
    id: 'ruiz_pre',
    hablante: 'Ing. Ruiz',
    texto: '(Una ingeniera de mirada láser revisa métricas en tres pantallas a la vez.) Si no viene a reportar la causa de la caída del servidor con EVIDENCIA, no me haga perder ciclos de CPU. Los curiosos también consumen ancho de banda.',
  },
  {
    id: 'ruiz_reto',
    hablante: 'Ing. Ruiz',
    texto: '¿Así que "un ratón"? ¿Esa es su hipótesis técnica? Mire, joven: aquí las teorías se DEFIENDEN. Duelo académico. Si sobrevive a mi banco de preguntas, firmo su reporte del roedor. Si no... váyase acostumbrando a los laboratorios en horario nocturno.',
    opciones: [
      { texto: '¡Acepto el duelo! (JEFA: Ing. Ruiz)', efectos: [{ tipo: 'duelo', dueloId: 'jefa_ruiz' }] },
      { texto: 'Necesito prepararme mejor.', siguiente: 'ruiz_espera' },
    ],
  },
  {
    id: 'ruiz_espera',
    hablante: 'Ing. Ruiz',
    texto: 'Prudente. Mi banco de preguntas no compila piedad. Vuelva cuando su equipo esté al 100%... y de pronto pase antes por la capilla, todos lo hacen.',
  },
  {
    id: 'ruiz_victoria',
    hablante: 'Ing. Ruiz',
    texto: '...Revisé los logs mientras duelábamos. Efectivamente: marcas de dientes en el RJ45. Hipótesis del ratón: CONFIRMADA. Firmo el reporte. Y tome: una USB de la facultad y un café. Lo del café no lo comente, tengo reputación de estricta que mantener.',
    efectos: [{ tipo: 'quest', accion: 'completar', questId: 'servidor_caido' }],
  },
  {
    id: 'ruiz_derrota',
    hablante: 'Ing. Ruiz',
    texto: 'Compilación exitosa: 0 errores... míos. Los suyos fueron varios. Vuelva cuando su argumentación pase el test de integración. Y de paso: la reputación de Ingeniería con usted acaba de recibir un downgrade.',
  },
  {
    id: 'ruiz_cafe',
    hablante: 'Ing. Ruiz',
    texto: '(La Ing. Ruiz ni lo mira.) Mi paciencia con usted retornó null. Si quiere revancha, tráigame una ofrenda de paz aceptable. Pista: es negra, caliente y sin azúcar.',
    opciones: [
      {
        texto: 'Ofrecerle un café campesino.',
        siguiente: 'ruiz_cafe_ok',
        siItem: { itemId: 'cafe' },
        efectos: [{ tipo: 'item', itemId: 'cafe', cantidad: -1 }, { tipo: 'flag', flag: 'ruiz_apaciguada' }],
      },
      { texto: 'Volveré con el café.', siguiente: 'ruiz_cafe_no' },
    ],
  },
  {
    id: 'ruiz_cafe_ok',
    hablante: 'Ing. Ruiz',
    texto: '(Sorbo. Silencio. Otro sorbo.) ...Aceptable. Sistema reiniciado. Tiene UNA oportunidad más de defender su teoría del ratón. Úsela mejor que la anterior.',
  },
  {
    id: 'ruiz_cafe_no',
    hablante: 'Ing. Ruiz',
    texto: 'La cafetería de Doña Blanca queda en el primer piso. La espera de un buen café es lo único que perdono sin ticket de soporte.',
  },
  {
    id: 'ruiz_post',
    hablante: 'Ing. Ruiz',
    texto: 'El servidor lleva días estables gracias a su diagnóstico. Sigo sin creer que perdí contra la teoría del ratón... pero los datos son los datos. Respeto. Vuelva cuando quiera un duelo de verdad, sin apuestas.',
  },
];

// ================= EVENTOS DE ENCUENTRO ALEATORIO =================
export const DIALOGOS_EVENTOS: NodoDialogo[] = [
  {
    id: 'evento_perro',
    hablante: '???',
    texto: 'Un perro campusero sale de entre el jardín y te mira fijo. Mueve la cola. Claramente quiere algo.',
    opciones: [
      {
        texto: 'Compartirle una almojábana.',
        siguiente: 'evento_perro_almojabana',
        efectos: [{ tipo: 'item', itemId: 'almojabana', cantidad: -1 }],
        siItem: { itemId: 'almojabana' },
      },
      { texto: 'Acariciarlo y seguir.', siguiente: 'evento_perro_caricia' },
      { texto: 'Fingir que no lo viste.', siguiente: 'evento_perro_huir' },
    ],
  },
  {
    id: 'evento_perro_almojabana',
    hablante: 'Perro campusero',
    texto: '¡GULP! El perro devora la almojábana y te escolta como guardaespaldas hasta el camino. Los estudiantes te miran con respeto. (+3 reputación con Ciencias Sociales: el perro es influyente.)',
    efectos: [{ tipo: 'rep', facultad: 'sociales', cantidad: 3 }],
  },
  {
    id: 'evento_perro_caricia',
    hablante: 'Perro campusero',
    texto: 'El perro acepta la caricia con dignidad de decano. Te sientes en paz con el universo. Sigue tu camino moviendo la cola.',
    efectos: [{ tipo: 'rep', facultad: 'sociales', cantidad: 1 }],
  },
  {
    id: 'evento_perro_huir',
    hablante: 'Perro campusero',
    texto: 'Intentas seguir de largo... pero te ladra UNA vez, con decepción. Todo el jardín te juzga en silencio.',
  },
  {
    id: 'evento_fotocopias',
    hablante: 'Golpe de suerte',
    texto: 'Alguien dejó fotocopias impecables olvidadas junto al jardín, con un post-it: "para quien las necesite. Éxitos en el parcial." La bondad tomasina existe.',
    efectos: [{ tipo: 'item', itemId: 'apuntes', cantidad: 1 }],
  },
  {
    id: 'evento_llovizna',
    hablante: 'Clima de Tunja',
    texto: 'El cielo se oscurece de golpe — llovizna tunjana traicionera. Corres a refugiarte bajo el voladizo del edificio principal junto a otros estudiantes. Alguien comparte tinto. Momentos boyacenses.',
    efectos: [{ tipo: 'item', itemId: 'cafe', cantidad: 1 }],
  },
];
DIALOGOS.push(...DIALOGOS_EVENTOS);

export function dialogoPorId(id: string): NodoDialogo | undefined {
  return DIALOGOS.find((d) => d.id === id);
}
