/* ============================================================
   JUGÁ CON MARTÍN – Lógica Computacional
   IES9008 Manuel Belgrano
   script.js  –  Lógica pedagógica + banco de preguntas
   ============================================================ */

'use strict';

/* ------------------------------------------------------------------ */
/*  MENSAJES DE HUMOR                                                   */
/* ------------------------------------------------------------------ */
const MSGS_CORRECT = [
  '🥩 ¡Excelente chinchulín!',
  '🧠 ¡Sos un capo, cabeza de chancho!',
  '🔥 ¡Clavada! Sos un fenómeno.',
  '🎯 ¡De taquito! Impecable.',
  '🐷 ¡Chancho pero brillante!',
  '⚡ ¡Exacto! Seguí así crack.',
  '🏆 ¡Perfecto! Martín te da un 10.',
  '💪 ¡Eso es! La rompiste.',
  '🎉 ¡Correctísimo! Sos un genio de la lógica.',
  '🌟 ¡De primera! Sin escalas.'
];

const MSGS_WRONG = [
  // Humor físico
  '😅 ¡Dale que vos podés! Volvé a intentarlo.',
  '🪵 ¡Te voy a dar un tablaso! Revisá y volvé.',
  '💪 Al piso, hacé dos flexiones y volvé con todo.',
  '🦵 Dos sentadillas y la próxima la clavás.',
  '🏃 Salí a correr una vuelta y volvé con la respuesta.',
  '🤸 Diez saltos en el lugar y a intentar de nuevo.',
  // Humor cordobés / argento
  '🥤 Le vas a tener que pagar una Coca a Martín.',
  '🍕 ¡Esa no! Te debo una pizza cuando apruebes.',
  '🥙 Uy, esa se fue al descánso. ¡Seguí pichón!',
  '🍺 Martín dice: "Esa respuesta no pasa ni en las prácticas".',
  '😎 ¡Casáte con la respuesta correcta antes de avanzar!',
  // Piropos / aliento (género neutro)
  '💖 ¡Equivocarse es parte de aprender, crack! Dale de nuevo.',
  '✨ Esa no era, pero tenés toda la onda para lograrlo.',
  '🌟 ¡Casi! Una mente brillante como la tuya lo resuelve ya.',
  '💙 Error de campeón/a. Los mejores también fallan antes de ganar.',
  '🧡 ¡Ese cerebro tuyo sabe la respuesta! Pensá de nuevo.',
  '🙌 No te rendís, que sos un/a genio/a en potencia.',
  // Humor intelectual
  '🧐 Mmm... Revisá los apuntes y volvé con todo.',
  '📖 Los apuntes de Martín son la solución. ¡Dale una re-leída!',
  '🎸 ¡Error! Pero el que no yerra no aprende.',
  '😂 ¡Casi! Te faltó un cachito. ¡Volvé!',
  '🤦 ¡Uy! Esa no era... pero podés. Te lo juro.',
  '📊 Dato: el 90% de los genios fallaron en el primer intento.'
];

function randomMsg(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ------------------------------------------------------------------ */
/*  AUDIO (Web Audio API – sin archivos externos)                      */
/* ------------------------------------------------------------------ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;
let audioUnlocked = false;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

// Desbloquea el AudioContext sincrónicamente dentro de un gesto de usuario.
// Debe llamarse DIRECTAMENTE en un handler de click/touch — no en setTimeout ni promesa.
function unlockAudioSync() {
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === 'suspended') {
    ctx.resume(); // llamada sincrónica — iOS la acepta dentro del gesto
  }
  audioUnlocked = true;
}

// Devuelve una promesa que se resuelve con el ctx listo para usar
function getCtxReady() {
  const c = getCtx();
  if (c.state === 'suspended') {
    return c.resume().then(() => c).catch(() => c);
  }
  return Promise.resolve(c);
}

function playTone(freq, type, duration, vol = 0.4) {
  getCtxReady().then(c => {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch (e) { /* silently ignore */ }
  }).catch(() => {});
}

function soundError() {
  // Alarma: serie descendente de tonos disonantes
  [440, 330, 220].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sawtooth', 0.35, 0.5), i * 120);
  });
}

function soundSuccess() {
  // Chillido de cerdo: tono ascendente vibrante
  [600, 800, 1000, 1200, 900].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sine', 0.18, 0.35), i * 80);
  });
}

/* ------------------------------------------------------------------ */
/*  NIVELES (Taxonomía de Bloom)                                       */
/* ------------------------------------------------------------------ */
const LEVELS = [
  { id: 0, name: 'Nivel 1 – Recordar',   bloom: 'Conocimiento básico',      icon: '🧠', color: '#4CAF50', startIndex: 0,   endIndex: 25   },
  { id: 1, name: 'Nivel 2 – Comprender', bloom: 'Comprensión de conceptos', icon: '💡', color: '#2196F3', startIndex: 26,  endIndex: 70   },
  { id: 2, name: 'Nivel 3 – Aplicar',    bloom: 'Aplicación práctica',      icon: '⚙️', color: '#FF9800', startIndex: 71,  endIndex: 120  },
  { id: 3, name: 'Nivel 4 – Analizar',   bloom: 'Análisis y síntesis',      icon: '🔬', color: '#9C27B0', startIndex: 121, endIndex: 173  },
  { id: 4, name: 'Nivel 5 – Evaluar',    bloom: 'Evaluación integradora',   icon: '🏆', color: '#F44336', startIndex: 174, endIndex: 9999 }
];

/* ------------------------------------------------------------------ */
/*  CONTENIDOS PEDAGÓGICOS                                             */
/*  Estructura: array de "unidades" en orden de dificultad creciente  */
/*  Cada unidad tiene: definición (opcional) y preguntas              */
/* ------------------------------------------------------------------ */

/*  TIPOS DE TARJETA:
    "definition"  → muestra def, botón Continuar
    "mc"          → multiple-choice estándar (con justificación opcional)
    "tf"          → verdadero/falso
    "match"       → relación concepto-definición (se implementa como MC)
    "complete"    → completar expresión (opciones)
    "error"       → detección de error conceptual
    "review"      → mini repaso acumulativo
*/

const CURRICULUM = [

  /* ══════════════════════════════════════════════════════
     UNIDAD 0 – INTRODUCCIÓN GENERAL
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Bienvenida a la Lógica Computacional',
    body: `La <strong>Lógica</strong> es la disciplina que estudia las reglas y principios del razonamiento válido.
<br><br>
Existen dos tipos principales de lógica formal: la <strong>Lógica Proposicional</strong> (de proposiciones) y la <strong>Lógica de Predicados</strong>.
<br><br>
A lo largo del juego vas a explorar los conceptos fundamentales de cada una, con definiciones, ejemplos y ejercicios de dificultad creciente.`
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 1 – PROPOSICIONES
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: '¿Qué es una proposición?',
    body: `Una <strong>proposición</strong> es una oración enunciativa que puede ser <strong>verdadera</strong> o <strong>falsa</strong>, pero no ambas a la vez.
<br><br>
<span class='example'>✅ "Mendoza es una ciudad argentina" → proposición (verdadera)<br>
✅ "2 + 2 = 5" → proposición (falsa)<br>
❌ "¿Funciona la impresora?" → NO es proposición (es pregunta)<br>
❌ "Entregue el informe" → NO es proposición (es orden)</span>
<br>
Las proposiciones se designan con letras: <span class='symbol'>p</span>, <span class='symbol'>q</span>, <span class='symbol'>r</span>, <span class='symbol'>w</span>…<br>
Si <span class='symbol'>p</span> es verdadera, se escribe <span class='symbol'>V(p) = 1</span>; si es falsa, <span class='symbol'>V(p) = 0</span>.`
  },

  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: '¿Cuál de las siguientes oraciones ES una proposición?',
    options: [
      { text: '"¿Cuántos estudiantes hay en el aula?"', correct: false },
      { text: '"2 + 2 = 4"', correct: true },
      { text: '"Cerrá la puerta."', correct: false },
      { text: '"¡Qué calor hace!"', correct: false }
    ],
    justification: {
      text: 'Elegí la justificación correcta:',
      options: [
        { text: 'Porque contiene dos variables', correct: false },
        { text: 'Porque es una oración que puede ser verdadera o falsa', correct: true },
        { text: 'Porque usa signos matemáticos', correct: false },
        { text: 'Porque está entre comillas', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: '¿Cuál de las siguientes oraciones NO es una proposición?',
    options: [
      { text: '"La tierra es un planeta"', correct: false },
      { text: '"Todos los ingenieros son médicos"', correct: false },
      { text: '"Teclee Control+Z para salir del modo Insert"', correct: true },
      { text: '"Si 20 es impar entonces 20 no es divisible por 2"', correct: false }
    ],
    justification: {
      text: '¿Por qué esa oración no es una proposición?',
      options: [
        { text: 'Porque tiene más de diez palabras', correct: false },
        { text: 'Porque es una instrucción (no afirma ni niega nada)', correct: true },
        { text: 'Porque habla de computadoras', correct: false },
        { text: 'Porque comienza con una mayúscula', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: 'Si definimos p: "Hay un premio Nobel en Ciencias de la Computación". ¿Cuál es el valor de verdad de p?',
    options: [
      { text: 'V(p) = 1 (verdadera)', correct: false },
      { text: 'V(p) = 0 (falsa)', correct: true },
      { text: 'No se puede determinar', correct: false },
      { text: 'Es una proposición ambigua', correct: false }
    ]
  },

  {
    type: 'tf',
    qtype: '✔/✘ Verdadero o Falso',
    text: '"El sol brilla y la humedad no es alta" ES una proposición.',
    options: [
      { text: 'Verdadero – es una proposición compuesta', correct: true },
      { text: 'Falso – es una pregunta', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔍 Identificá el tipo',
    text: '¿Cómo se clasifica la oración: "Tres veces dos es cinco"?',
    options: [
      { text: 'Proposición verdadera', correct: false },
      { text: 'Proposición falsa', correct: true },
      { text: 'No es proposición (es pregunta)', correct: false },
      { text: 'No es proposición (es orden)', correct: false }
    ],
    justification: {
      text: '¿Por qué es una proposición falsa y no otra cosa?',
      options: [
        { text: 'Porque tiene un valor de verdad determinado aunque sea incorrecta matemáticamente', correct: true },
        { text: 'Porque contiene números', correct: false },
        { text: 'Porque no tiene sujeto', correct: false },
        { text: 'Porque comienza con "Tres"', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: 'La expresión "x + y = y + x", donde x e y son números reales, ¿es una proposición?',
    options: [
      { text: 'Sí, y es verdadera', correct: false },
      { text: 'Sí, y es falsa', correct: false },
      { text: 'No, porque contiene variables libres: formalmente es una fórmula abierta (aunque sea siempre verdadera)', correct: false },
      { text: 'No en el sentido estricto: es una proposición abierta porque tiene variables libres x e y', correct: true }
    ]
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 2 – PROPOSICIONES SIMPLES Y COMPUESTAS
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Proposiciones Simples y Compuestas',
    body: `Una proposición es <strong>simple</strong> cuando no contiene otra proposición dentro de sí.<br>
Es <strong>compuesta</strong> cuando está formada por dos o más proposiciones unidas por <em>conectivos lógicos</em>.
<br><br>
<span class='example'>✅ Simple: "La tierra es un planeta"<br>
✅ Compuesta: "El sistema operativo administra los recursos <strong>y</strong> la computadora es eficiente"<br>
&nbsp;&nbsp;&nbsp;&nbsp;(formada por dos simples unidas por "y")</span>
<br>
<strong>Atención:</strong> "Todo número par es divisible por 2" parece simple, pero su valor de verdad depende de muchos casos particulares. Se la considera proposición simple especial.`
  },

  {
    type: 'mc',
    qtype: '🔍 Clasificá',
    text: '¿Cuál de las siguientes es una proposición COMPUESTA?',
    options: [
      { text: '"La tierra es un planeta"', correct: false },
      { text: '"2 + 2 = 4"', correct: false },
      { text: '"5 es número impar y 6 es número primo"', correct: true },
      { text: '"No todos los alumnos provienen de escuelas técnicas"', correct: false }
    ],
    justification: {
      text: 'Elegí la mejor justificación:',
      options: [
        { text: 'Porque contiene la palabra "y" uniendo dos proposiciones', correct: true },
        { text: 'Porque tiene más palabras', correct: false },
        { text: 'Porque habla de números', correct: false },
        { text: 'Porque tiene una negación', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🔍 Clasificá',
    text: '"El volumen de ventas es menor a $200.000 ó su gasto mensual excede ese monto". ¿Cómo se clasifica?',
    options: [
      { text: 'Proposición simple', correct: false },
      { text: 'Proposición compuesta por disyunción', correct: true },
      { text: 'Proposición compuesta por conjunción', correct: false },
      { text: 'No es proposición', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 3 – CONECTIVOS LÓGICOS (tabla general)
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Los 5 Conectivos Lógicos',
    body: `La <strong>Lógica Simbólica</strong> reemplaza las palabras por símbolos. Los principales conectivos son:
<br><br>
<table>
  <tr><th>Nombre</th><th>Símbolo</th><th>Cómo se lee</th></tr>
  <tr><td>Negación</td><td>-p</td><td>"no p" / "no es cierto que p"</td></tr>
  <tr><td>Conjunción</td><td>p ∧ q</td><td>"p y q"</td></tr>
  <tr><td>Disyunción</td><td>p ∨ q</td><td>"p o q"</td></tr>
  <tr><td>Implicación</td><td>p → q</td><td>"si p entonces q"</td></tr>
  <tr><td>Doble Implicación</td><td>p ↔ q</td><td>"p si y solo si q"</td></tr>
</table>
<br>
<span class='example'>Ejemplo: p = "La computadora se colgó"<br>
−p = "La computadora NO se colgó"</span>`
  },

  {
    type: 'match',
    qtype: '🔗 Relacioná',
    text: '¿Qué conectivo lógico corresponde a la expresión "si p entonces q"?',
    options: [
      { text: 'Conjunción (p ∧ q)', correct: false },
      { text: 'Implicación (p → q)', correct: true },
      { text: 'Disyunción (p ∨ q)', correct: false },
      { text: 'Doble implicación (p ↔ q)', correct: false }
    ]
  },

  {
    type: 'match',
    qtype: '🔗 Relacioná',
    text: '¿Qué conectivo usa la expresión "si y solo si"?',
    options: [
      { text: 'Negación', correct: false },
      { text: 'Conjunción', correct: false },
      { text: 'Implicación', correct: false },
      { text: 'Doble implicación (p ↔ q)', correct: true }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: 'La frase "Franklin fue presidente Y 4 es número impar" se simboliza como:',
    options: [
      { text: 'p → q', correct: false },
      { text: 'p ∧ q', correct: true },
      { text: 'p ∨ q', correct: false },
      { text: 'p ↔ q', correct: false }
    ],
    justification: {
      text: '¿Por qué esa simbolización?',
      options: [
        { text: 'La palabra "y" indica conjunción (∧)', correct: true },
        { text: 'La palabra "y" indica disyunción (∨)', correct: false },
        { text: 'Hay una condición, entonces es implicación', correct: false },
        { text: 'Son dos proposiciones iguales', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"Venceremos o moriremos". Si v = "Venceremos" y m = "Moriremos", la simbolización es:',
    options: [
      { text: 'v ∧ m', correct: false },
      { text: 'v → m', correct: false },
      { text: 'v ∨ m', correct: true },
      { text: 'v ↔ m', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"Si la tierra gira, se mueve." Sea t = "La tierra gira", m = "La tierra se mueve". Simbolizá:',
    options: [
      { text: 't ∧ m', correct: false },
      { text: 't ∨ m', correct: false },
      { text: 't → m', correct: true },
      { text: '-t → m', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"Soy humano sólo si soy racional." Sea h = "soy humano", r = "soy racional". Simbolizá:',
    options: [
      { text: 'r → h', correct: false },
      { text: 'h ↔ r', correct: false },
      { text: 'h → r', correct: true },
      { text: 'h ∧ r', correct: false }
    ],
    justification: {
      text: '"sólo si" en lógica indica:',
      options: [
        { text: 'Doble implicación siempre', correct: false },
        { text: 'Que el antecedente es condición suficiente del consecuente', correct: false },
        { text: 'Que el consecuente es condición necesaria: h → r', correct: true },
        { text: 'Conjunción entre ambas proposiciones', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: 'Sean p = "El SO administra recursos", q = "La computadora es eficiente", r = "El programa se ejecuta lento". Simbolizá: "El SO administra los recursos y la computadora es eficiente".',
    options: [
      { text: 'p ∨ q', correct: false },
      { text: 'p ∧ q', correct: true },
      { text: 'p → q', correct: false },
      { text: 'p ↔ q', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: 'Con las mismas proposiciones (p, q, r del ejercicio anterior), simbolizá: "Si el programa se ejecuta lento entonces la computadora no es eficiente".',
    options: [
      { text: 'r → -q', correct: true },
      { text: '-r → q', correct: false },
      { text: 'r ∧ -q', correct: false },
      { text: 'r ↔ -q', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: 'Con p, q, r del ejercicio anterior: "La computadora es eficiente o el programa se ejecuta lento".',
    options: [
      { text: 'q → r', correct: false },
      { text: 'q ∧ r', correct: false },
      { text: 'q ∨ r', correct: true },
      { text: '-q ∨ r', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     MINI REPASO 1
     ══════════════════════════════════════════════════════ */
  {
    type: 'review',
    title: '🔄 Mini Repaso – Conceptos 1 al 3',
    items: [
      { icon: '📌', text: 'Una <strong>proposición</strong> es una oración que puede ser verdadera o falsa (no ambas).' },
      { icon: '📌', text: 'Las proposiciones pueden ser <strong>simples</strong> (sin conectivos) o <strong>compuestas</strong> (con conectivos).' },
      { icon: '📌', text: 'Los <strong>5 conectivos</strong> son: negación (-), conjunción (∧), disyunción (∨), implicación (→), doble implicación (↔).' },
      { icon: '📌', text: 'La <strong>negación</strong> invierte el valor de verdad de la proposición.' }
    ]
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 4 – NEGACIÓN
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Negación (-p)',
    body: `La <strong>negación</strong> de una proposición p, escrita <span class='symbol'>-p</span>, es la proposición que afirma lo contrario de p.
<br><br>
<table>
  <tr><th>p</th><th>-p</th></tr>
  <tr><td>0 (Falso)</td><td>1 (Verdadero)</td></tr>
  <tr><td>1 (Verdadero)</td><td>0 (Falso)</td></tr>
</table>
<br>
<span class='example'>p = "La computadora se colgó"<br>
-p = "La computadora <strong>no</strong> se colgó" / "No es cierto que la computadora se colgó"</span>`
  },

  {
    type: 'mc',
    qtype: '❓ Tabla de Verdad',
    text: 'Si V(p) = 1 (verdadero), ¿cuál es V(-p)?',
    options: [
      { text: '1 (verdadero)', correct: false },
      { text: '0 (falso)', correct: true },
      { text: 'Depende del contexto', correct: false },
      { text: 'No se puede determinar', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: 'La negación de "5 es un número natural" es:',
    options: [
      { text: '"5 es un número entero"', correct: false },
      { text: '"5 no es un número natural"', correct: true },
      { text: '"5 es un número primo"', correct: false },
      { text: '"5 es par"', correct: false }
    ]
  },

  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: 'Un estudiante dice: "La negación de \'llueve\' es \'hace sol\'". ¿Hay un error?',
    options: [
      { text: 'No hay error, es correcto', correct: false },
      { text: 'Sí hay error: la negación correcta es "no llueve", no "hace sol"', correct: true },
      { text: 'Sí hay error: la negación debería ser "llueve mucho"', correct: false },
      { text: 'No hay error porque son opuestos naturales', correct: false }
    ],
    justification: {
      text: '¿Por qué es un error?',
      options: [
        { text: 'La negación lógica solo agrega "no" o "no es cierto que", no reemplaza por contrario cotidiano', correct: true },
        { text: 'Porque en lógica no existe el mal tiempo', correct: false },
        { text: 'Porque "hace sol" es una tautología', correct: false },
        { text: 'Porque la frase tiene demasiadas palabras', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 5 – CONJUNCIÓN
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Conjunción (p ∧ q)',
    body: `La <strong>conjunción</strong> de p y q, escrita <span class='symbol'>p ∧ q</span>, se lee "p <strong>y</strong> q". 
<br><br>
<table>
  <tr><th>p</th><th>q</th><th>p ∧ q</th></tr>
  <tr><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>0</td><td>1</td><td>0</td></tr>
  <tr><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>1</td><td>1</td></tr>
</table>
<br>
<strong>Regla clave:</strong> La conjunción es verdadera <em>únicamente</em> cuando AMBAS proposiciones son verdaderas. Si alguna es falsa, la conjunción es falsa.
<br><br>
<span class='example'>Ejemplo: "Este cuadrado es un polígono <strong>y</strong> 3 + 2 son 5" → es VERDADERA porque ambas partes son verdaderas.</span>`
  },

  {
    type: 'mc',
    qtype: '📊 Tabla de Verdad',
    text: 'Si p = 1 (V) y q = 0 (F), ¿cuál es el valor de p ∧ q?',
    options: [
      { text: '1 (Verdadero)', correct: false },
      { text: '0 (Falso)', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Depende de otras variables', correct: false }
    ],
    justification: {
      text: 'La conjunción es falsa porque:',
      options: [
        { text: 'Al menos una de las proposiciones es falsa', correct: true },
        { text: 'Las dos proposiciones son falsas', correct: false },
        { text: 'La conjunción siempre es falsa', correct: false },
        { text: 'Solo es verdadera si q = 1', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: '¿Cuándo es VERDADERA la conjunción p ∧ q?',
    options: [
      { text: 'Cuando al menos una de las dos es verdadera', correct: false },
      { text: 'Cuando ambas p y q son verdaderas', correct: true },
      { text: 'Cuando p es verdadera y q falsa', correct: false },
      { text: 'Siempre es verdadera', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p = "El SO administra recursos" (V) y q = "La computadora es eficiente" (V). ¿Cuál es V(p ∧ q)?',
    options: [
      { text: '0 (Falso)', correct: false },
      { text: '1 (Verdadero)', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Depende de r', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Siendo p = 0 (F) y q = 0 (F), ¿qué valor tiene -p ∧ -q?',
    options: [
      { text: '0 (Falso)', correct: false },
      { text: '1 (Verdadero)', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '0 porque p es falsa', correct: false }
    ],
    justification: {
      text: '¿Por qué el resultado es 1?',
      options: [
        { text: '-p = 1 y -q = 1, entonces -p ∧ -q = 1 ∧ 1 = 1', correct: true },
        { text: 'La doble negación siempre da verdadero', correct: false },
        { text: 'Porque las dos proposiciones originales son falsas', correct: false },
        { text: 'La conjunción es verdadera cuando p es falsa', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🔢 Conteo',
    text: '¿Cuántas filas tiene la tabla de verdad de una proposición compuesta con DOS variables?',
    options: [
      { text: '2 filas', correct: false },
      { text: '4 filas', correct: true },
      { text: '6 filas', correct: false },
      { text: '8 filas', correct: false }
    ],
    justification: {
      text: '¿Por qué 4 filas?',
      options: [
        { text: 'Porque cada variable tiene 2 valores, entonces 2² = 4', correct: true },
        { text: 'Porque hay 4 conectivos', correct: false },
        { text: 'Es una regla convencional sin fórmula', correct: false },
        { text: 'Porque 2 × 2 = 4 variables', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🔢 Conteo',
    text: '¿Cuántas filas tendría la tabla de verdad con TRES variables proposicionales?',
    options: [
      { text: '4 filas', correct: false },
      { text: '6 filas', correct: false },
      { text: '8 filas', correct: true },
      { text: '16 filas', correct: false }
    ],
    justification: {
      text: 'La cantidad de filas se calcula como:',
      options: [
        { text: '2ⁿ donde n es el número de variables. 2³ = 8', correct: true },
        { text: 'n × 2 donde n es el número de variables', correct: false },
        { text: 'n² donde n es el número de variables', correct: false },
        { text: 'Siempre son 8 sin importar las variables', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 6 – DISYUNCIÓN
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Disyunción (p ∨ q)',
    body: `La <strong>disyunción</strong> de p y q, escrita <span class='symbol'>p ∨ q</span>, se lee "p <strong>o</strong> q". Usamos el sentido <strong>inclusivo</strong> (una o la otra, o ambas).
<br><br>
<table>
  <tr><th>p</th><th>q</th><th>p ∨ q</th></tr>
  <tr><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>0</td><td>1</td><td>1</td></tr>
  <tr><td>1</td><td>0</td><td>1</td></tr>
  <tr><td>1</td><td>1</td><td>1</td></tr>
</table>
<br>
<strong>Regla clave:</strong> La disyunción (inclusiva) es falsa <em>únicamente</em> cuando AMBAS proposiciones son falsas.
<br><br>
<strong>Disyunción exclusiva:</strong> Es verdadera <em>solo cuando</em> una proposición es verdadera y la otra falsa (no pueden ser ambas verdaderas).
<br><br>
<span class='example'>Inclusiva: "Imprimo el archivo o grabo el archivo" (puedo hacer ambas)<br>
Exclusiva: "Borro el archivo o guardo el archivo" (no puedo hacer ambas)</span>`
  },

  {
    type: 'mc',
    qtype: '📊 Tabla de Verdad',
    text: '¿Cuándo es FALSA la disyunción inclusiva p ∨ q?',
    options: [
      { text: 'Cuando p = 0 y q = 1', correct: false },
      { text: 'Cuando ambas p y q son falsas (p = 0 y q = 0)', correct: true },
      { text: 'Cuando p = 1 y q = 1', correct: false },
      { text: 'Nunca es falsa', correct: false }
    ],
    justification: {
      text: 'La disyunción es falsa solo cuando:',
      options: [
        { text: 'Ninguna de las dos proposiciones es verdadera', correct: true },
        { text: 'Ambas proposiciones son verdaderas', correct: false },
        { text: 'Al menos una es verdadera', correct: false },
        { text: 'La primera proposición es falsa', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sea p = "4 + 8 < 2" (F) y q = "Estoy en clase de Discreta" (V). ¿Cuál es V(p ∨ q)?',
    options: [
      { text: '0 (Falso)', correct: false },
      { text: '1 (Verdadero)', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Depende del contexto', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔍 Diferenciá',
    text: '¿Cuándo es verdadera la disyunción EXCLUSIVA?',
    options: [
      { text: 'Cuando ambas proposiciones son verdaderas', correct: false },
      { text: 'Cuando exactamente UNA de las dos proposiciones es verdadera', correct: true },
      { text: 'Cuando ambas proposiciones son falsas', correct: false },
      { text: 'Siempre que alguna sea verdadera', correct: false }
    ]
  },

  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: 'Un estudiante afirma: "La disyunción p ∨ q es FALSA cuando p es verdadero y q es falso". ¿Hay un error?',
    options: [
      { text: 'No hay error, es correcto', correct: false },
      { text: 'Sí hay error: con p = 1 y q = 0 la disyunción inclusiva es VERDADERA', correct: true },
      { text: 'Sí hay error, pero en q: debería ser verdadero', correct: false },
      { text: 'Depende de si es inclusiva o exclusiva', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     MINI REPASO 2
     ══════════════════════════════════════════════════════ */
  {
    type: 'review',
    title: '🔄 Mini Repaso – Negación, Conjunción y Disyunción',
    items: [
      { icon: '🔵', text: '<strong>Negación (-p):</strong> invierte el valor. V→F, F→V.' },
      { icon: '🟢', text: '<strong>Conjunción (p ∧ q):</strong> verdadera SOLO cuando ambas son verdaderas (1∧1=1).' },
      { icon: '🟡', text: '<strong>Disyunción inclusiva (p ∨ q):</strong> falsa SOLO cuando ambas son falsas (0∨0=0).' },
      { icon: '🟠', text: '<strong>Disyunción exclusiva:</strong> verdadera solo cuando exactamente una es verdadera.' },
      { icon: '📐', text: '<strong>Filas en tabla:</strong> 2ⁿ donde n = cantidad de variables.' }
    ]
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 7 – IMPLICACIÓN
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Implicación (p → q)',
    body: `La <strong>implicación</strong> o condicional <span class='symbol'>p → q</span> se lee "si p entonces q". 
<br>
• <strong>p</strong> = antecedente &nbsp;|&nbsp; <strong>q</strong> = consecuente
<br><br>
<table>
  <tr><th>p</th><th>q</th><th>p → q</th></tr>
  <tr><td>0</td><td>0</td><td>1</td></tr>
  <tr><td>0</td><td>1</td><td>1</td></tr>
  <tr><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>1</td><td>1</td></tr>
</table>
<br>
<strong>Regla clave:</strong> La implicación es FALSA <em>únicamente</em> cuando el antecedente (p) es <strong>verdadero</strong> y el consecuente (q) es <strong>falso</strong>.
<br><br>
En otras palabras: "La implicación es falsa sólo en el caso en que el <strong>antecedente es verdadero</strong> y el <strong>consecuente es falso</strong>."
<br><br>
<span class='example'>Si la implicación es verdadera, p es <strong>condición suficiente</strong> para q.<br>
Y q es <strong>condición necesaria</strong> para p.</span>`
  },

  {
    type: 'mc',
    qtype: '📊 Tabla de Verdad',
    text: '¿Cuándo es FALSA la implicación p → q?',
    options: [
      { text: 'Cuando p = 0 y q = 0', correct: false },
      { text: 'Cuando p = 0 y q = 1', correct: false },
      { text: 'Cuando p = 1 y q = 0', correct: true },
      { text: 'Cuando p = 1 y q = 1', correct: false }
    ],
    justification: {
      text: 'Elegí la justificación correcta:',
      options: [
        { text: 'La implicación falla solo cuando el antecedente es verdadero pero el consecuente es falso', correct: true },
        { text: 'La implicación falla cuando ambas son falsas', correct: false },
        { text: 'La implicación siempre es verdadera si p es verdadero', correct: false },
        { text: 'La implicación falla cuando q es verdadero y p es falso', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 0 (F) y q = 1 (V), ¿cuál es el valor de p → q?',
    options: [
      { text: '0 (Falso)', correct: false },
      { text: '1 (Verdadero)', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'El mismo que q', correct: false }
    ],
    justification: {
      text: '¿Por qué la implicación es verdadera aquí?',
      options: [
        { text: 'Con antecedente falso, la implicación es siempre verdadera (vacuamente verdadera)', correct: true },
        { text: 'Porque q es verdadero', correct: false },
        { text: 'Porque p y q tienen valores distintos', correct: false },
        { text: 'Porque la implicación siempre es verdadera', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: '"Si Franklin es el rey de Inglaterra entonces 2 + 2 = 4." ¿Cuál es su valor de verdad?',
    options: [
      { text: 'Falsa, porque Franklin no es rey', correct: false },
      { text: 'Verdadera, porque el antecedente es falso', correct: true },
      { text: 'Falsa, porque 2+2=4 no tiene que ver con Franklin', correct: false },
      { text: 'Indeterminada', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: '"Si 2 + 2 = 4 entonces Franklin es el rey de Inglaterra." ¿Cuál es su valor de verdad?',
    options: [
      { text: 'Verdadera, porque 2+2=4 es verdadero', correct: false },
      { text: 'Falsa, porque antecedente V y consecuente F → implicación F', correct: true },
      { text: 'Verdadera siempre', correct: false },
      { text: 'Indeterminada', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔗 Relación de condiciones',
    text: 'Si la implicación p → q es verdadera, se dice que p es condición _____ para q.',
    options: [
      { text: 'Necesaria', correct: false },
      { text: 'Suficiente', correct: true },
      { text: 'Necesaria y suficiente', correct: false },
      { text: 'Exclusiva', correct: false }
    ],
    justification: {
      text: '¿Qué significa que p sea "condición suficiente" para q?',
      options: [
        { text: 'Basta con que p sea verdadero para garantizar que q lo sea', correct: true },
        { text: 'q solo puede ser verdadero si p también lo es', correct: false },
        { text: 'p y q son equivalentes', correct: false },
        { text: 'q es independiente de p', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🔗 Relación de condiciones',
    text: 'Si p → q es verdadera, q es condición _____ para p.',
    options: [
      { text: 'Suficiente', correct: false },
      { text: 'Necesaria', correct: true },
      { text: 'Exclusiva', correct: false },
      { text: 'Contingente', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Traducción verbal',
    text: 'Siendo p → q una implicación, la expresión "p solo si q" es:',
    options: [
      { text: 'Una forma diferente que NO equivale a p → q', correct: false },
      { text: 'Una expresión sinónima de p → q', correct: true },
      { text: 'Equivalente a q → p', correct: false },
      { text: 'Equivalente a p ↔ q', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: 'Sea p: "Se sobrepasa la capacidad de la unidad aritmética" y r: "La bandera de sobrepaso tiene valor 1". Simbolizá: "La bandera de sobrepaso tiene valor 1 si se sobrepasa la capacidad de la unidad aritmética".',
    options: [
      { text: 'r → p', correct: false },
      { text: 'p → r', correct: true },
      { text: 'p ∧ r', correct: false },
      { text: 'p ↔ r', correct: false }
    ],
    justification: {
      text: '"r si p" significa:',
      options: [
        { text: 'p es el antecedente y r el consecuente: p → r', correct: true },
        { text: 'r es el antecedente y p el consecuente: r → p', correct: false },
        { text: 'Son equivalentes, p ↔ r', correct: false },
        { text: 'Conjunción entre ambas', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 8 – VARIANTES DE LA IMPLICACIÓN
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Variantes de la Implicación',
    body: `Dada la implicación directa <span class='symbol'>p → q</span>:
<br><br>
<table>
  <tr><th>Nombre</th><th>Forma</th><th>Relación con directa</th></tr>
  <tr><td>Directa</td><td>p → q</td><td>—</td></tr>
  <tr><td>Recíproca</td><td>q → p</td><td>Se invierte. NO equivalente a la directa</td></tr>
  <tr><td>Inversa</td><td>-p → -q</td><td>Se niegan ambas. NO equivalente a la directa</td></tr>
  <tr><td>Contrarrecíproca</td><td>-q → -p</td><td>Se invierte y niega. <strong>Equivalente</strong> a la directa</td></tr>
</table>
<br>
<strong>Importante:</strong> solo la contrarrecíproca es equivalente a la directa. La recíproca y la inversa NO lo son (aunque recíproca e inversa sí son equivalentes entre sí).
<br><br>
<span class='example'>Directa: "Si p entonces q" (p → q)<br>
Recíproca: "Si q entonces p" (q → p)<br>
Inversa: "Si no p entonces no q" (-p → -q)<br>
Contrarrecíproca: "Si no q entonces no p" (-q → -p)</span>`
  },

  {
    type: 'mc',
    qtype: '🔄 Variantes',
    text: 'Dada la implicación directa p → q, ¿cuál es la implicación RECÍPROCA?',
    options: [
      { text: '-p → -q', correct: false },
      { text: 'q → p', correct: true },
      { text: '-q → -p', correct: false },
      { text: 'p ↔ q', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔄 Variantes',
    text: '¿Cuál de las siguientes es la CONTRARRECÍPROCA de p → q?',
    options: [
      { text: 'q → p', correct: false },
      { text: '-p → -q', correct: false },
      { text: '-q → -p', correct: true },
      { text: 'p ↔ q', correct: false }
    ],
    justification: {
      text: 'La contrarrecíproca se forma:',
      options: [
        { text: 'Negando ambas proposiciones e invirtiendo el orden: -q → -p', correct: true },
        { text: 'Solo negando el antecedente', correct: false },
        { text: 'Invirtiendo sin negar', correct: false },
        { text: 'Usando la doble implicación', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🔗 Equivalencia',
    text: '¿Cuál de las siguientes proposiciones es lógicamente EQUIVALENTE a la implicación directa p → q?',
    options: [
      { text: 'La recíproca q → p', correct: false },
      { text: 'La negación -p → -q', correct: false },
      { text: 'La contrarrecíproca -q → -p', correct: true },
      { text: 'La doble implicación p ↔ q', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 9 – DOBLE IMPLICACIÓN
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Doble Implicación (p ↔ q)',
    body: `La <strong>doble implicación</strong> o bicondicional <span class='symbol'>p ↔ q</span> se lee "p si y solo si q".
<br><br>
<table>
  <tr><th>p</th><th>q</th><th>p ↔ q</th></tr>
  <tr><td>0</td><td>0</td><td>1</td></tr>
  <tr><td>0</td><td>1</td><td>0</td></tr>
  <tr><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>1</td><td>1</td></tr>
</table>
<br>
<strong>Regla clave:</strong> La doble implicación es verdadera cuando p y q tienen el <em>mismo valor de verdad</em> (ambas verdaderas o ambas falsas).
<br><br>
Es equivalente a: <span class='symbol'>(p → q) ∧ (q → p)</span>`
  },

  {
    type: 'mc',
    qtype: '📊 Tabla de Verdad',
    text: '¿Cuándo es VERDADERA la doble implicación p ↔ q?',
    options: [
      { text: 'Solo cuando p es verdadera', correct: false },
      { text: 'Cuando p y q tienen el mismo valor de verdad', correct: true },
      { text: 'Cuando al menos una es verdadera', correct: false },
      { text: 'Siempre', correct: false }
    ],
    justification: {
      text: '¿Por qué coinciden los valores?',
      options: [
        { text: 'Porque equivale a (p→q) ∧ (q→p): ambas deben implicarse mutuamente', correct: true },
        { text: 'Porque la doble implicación es la negación de la implicación', correct: false },
        { text: 'Porque solo opera con variables binarias', correct: false },
        { text: 'Por definición arbitraria', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si V(p) = 0 y V(q) = 1, ¿cuál es V(p ↔ q)?',
    options: [
      { text: '1 (Verdadero)', correct: false },
      { text: '0 (Falso)', correct: true },
      { text: 'Depende del contexto', correct: false },
      { text: 'Indeterminado', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"Soy humano si y solo si soy racional." Sea h = "soy humano", r = "soy racional". Simbolizá:',
    options: [
      { text: 'h → r', correct: false },
      { text: 'r → h', correct: false },
      { text: 'h ↔ r', correct: true },
      { text: 'h ∧ r', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     MINI REPASO 3
     ══════════════════════════════════════════════════════ */
  {
    type: 'review',
    title: '🔄 Mini Repaso – Implicación y Doble Implicación',
    items: [
      { icon: '🔴', text: '<strong>Implicación (p→q):</strong> FALSA solo cuando p=1 y q=0 (antecedente V, consecuente F).' },
      { icon: '🔵', text: '<strong>Con antecedente falso:</strong> la implicación es siempre verdadera ("vacuamente verdadera").' },
      { icon: '🟣', text: '<strong>p es condición suficiente</strong> para q | <strong>q es condición necesaria</strong> para p.' },
      { icon: '🟢', text: '<strong>Recíproca</strong> de p→q es q→p | <strong>Contrarrecíproca</strong> es -q→-p (equivalente a la directa).' },
      { icon: '🟡', text: '<strong>Doble implicación (p↔q):</strong> verdadera cuando p y q tienen el MISMO valor.' }
    ]
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 10 – LÓGICA Y PROGRAMACIÓN
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Lógica en la Programación',
    body: `Los conectivos lógicos tienen aplicaciones directas en la <strong>programación</strong>:
<br><br>
<strong>Estructura if-then-else:</strong>
<span class='example'>if p then acción1 else acción2<br>
→ Si p es verdadera: ejecuta acción1. Si p es falsa: ejecuta acción2.</span>
<br>
<strong>Estructura while loop:</strong>
<span class='example'>while p do acción<br>
→ La acción se repite mientras p sea verdadera. Cuando p se vuelve falsa, el lazo termina.</span>
<br>
Las condiciones de estos bloques son <strong>proposiciones lógicas</strong> que se evalúan como verdadero (1) o falso (0).`
  },

  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'En la estructura "if p then acción1 else acción2", ¿qué ocurre cuando p es falsa?',
    options: [
      { text: 'Se ejecuta acción1', correct: false },
      { text: 'Se ejecuta acción2', correct: true },
      { text: 'No se ejecuta ninguna acción', correct: false },
      { text: 'El programa termina', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'En "while p do acción", ¿cuándo se detiene el lazo?',
    options: [
      { text: 'Cuando p es verdadera', correct: false },
      { text: 'Cuando p se vuelve falsa', correct: true },
      { text: 'Cuando la acción se ejecuta una vez', correct: false },
      { text: 'Nunca se detiene', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'Considera: i := 1; if (i < 2 OR i > 0) then x := x+1 else x := x+2. ¿Qué rama se ejecuta?',
    options: [
      { text: 'x := x+2 (else), porque i no cumple ninguna condición', correct: false },
      { text: 'x := x+1 (then), porque (i<2 OR i>0) es verdadero con i=1', correct: true },
      { text: 'Ambas ramas se ejecutan', correct: false },
      { text: 'Ninguna rama, el programa queda en espera', correct: false }
    ],
    justification: {
      text: 'Con i=1: i<2 es V y i>0 es V, entonces V OR V = ?',
      options: [
        { text: '1 (Verdadero), por eso se ejecuta el then', correct: true },
        { text: '0 (Falso), las condiciones se anulan', correct: false },
        { text: 'Indeterminado porque hay dos condiciones', correct: false },
        { text: 'V solo si ambas son falsas', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'Dado: i:=1; while i < 3 do begin x:=x+1; i:=i+1; end. ¿Cuántas veces se ejecuta x:=x+1?',
    options: [
      { text: '1 vez', correct: false },
      { text: '2 veces', correct: true },
      { text: '3 veces', correct: false },
      { text: 'Infinitas veces', correct: false }
    ],
    justification: {
      text: '¿Por qué 2 veces?',
      options: [
        { text: 'i=1 (1<3 V → ejecuta), i=2 (2<3 V → ejecuta), i=3 (3<3 F → detiene). Son 2 ejecuciones.', correct: true },
        { text: 'Porque el bucle siempre corre exactamente n-1 veces siendo n el límite', correct: false },
        { text: 'Porque i comienza en 1 y hay 3 iteraciones', correct: false },
        { text: 'El while no se ejecuta con i<3', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 11 – LÓGICA NATURAL vs. FORMAL
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Lógica Natural vs. Lógica Formal',
    body: `<strong>Lógica natural:</strong> capacidad innata de los seres humanos para razonar correctamente. Todos la poseemos en mayor o menor grado.
<br><br>
<strong>Lógica formal:</strong> se aprende con el estudio de las <em>reglas y preceptos que gobiernan los razonamientos</em>. Permite determinar la validez de un argumento sin importar su contenido.
<br><br>
<span class='example'>El razonamiento:<br>
"Todos los guncos son tuncos / Cral es gunco / Entonces Cral es tunco"<br>
→ es <strong>válido formalmente</strong>, aunque los términos no existan en ningún idioma.</span>
<br>
Esto es posible gracias a la <strong>Lógica Simbólica</strong>, que reemplaza contenidos por símbolos.`
  },

  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿Qué permite afirmar que el razonamiento "Todos los guncos son tuncos / Cral es gunco / Entonces Cral es tunco" es válido?',
    options: [
      { text: 'Que los términos existen en algún idioma', correct: false },
      { text: 'La lógica formal, que evalúa la estructura sin importar el contenido', correct: true },
      { text: 'Que las tres oraciones son proposiciones', correct: false },
      { text: 'Que usa palabras similares al español', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿Cuál es la principal diferencia entre lógica natural y lógica formal?',
    options: [
      { text: 'La lógica natural es más precisa que la formal', correct: false },
      { text: 'La lógica formal se aprende; la natural es innata y puede ser imprecisa', correct: true },
      { text: 'La lógica formal solo aplica a la computación', correct: false },
      { text: 'No hay diferencia, son sinónimos', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿Qué es la Lógica de Predicados?',
    options: [
      { text: 'La lógica que solo estudia proposiciones simples', correct: false },
      { text: 'La lógica que estudia proposiciones cuyo valor de verdad depende de variables o cuantificadores', correct: true },
      { text: 'Un sinónimo de la lógica proposicional', correct: false },
      { text: 'La lógica que solo aplica a predicados matemáticos', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     UNIDAD 12 – EJERCICIOS AVANZADOS INTEGRADOS
     ══════════════════════════════════════════════════════ */
  {
    type: 'definition',
    title: 'Resolviendo proposiciones compuestas',
    body: `Para determinar el valor de verdad de una proposición compuesta, seguimos estos pasos:
<br><br>
1. <strong>Identificar</strong> las proposiciones simples y sus valores.<br>
2. <strong>Aplicar</strong> las tablas de verdad de cada conectivo, respetando precedencia.<br>
3. <strong>Calcular</strong> de adentro hacia afuera (primero paréntesis internos).
<br><br>
<span class='example'>Ejemplo: p=1, q=0<br>
¿Cuánto vale -(q → p)?<br>
Paso 1: q→p = 0→1 = 1<br>
Paso 2: -(1) = 0<br>
Resultado: 0 (Falso)</span>`
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 0 (F) y q = 1 (V), ¿cuál es el valor de (p ∧ q) → q?',
    options: [
      { text: '0 (Falso)', correct: false },
      { text: '1 (Verdadero)', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Depende de r', correct: false }
    ],
    justification: {
      text: 'Paso a paso: p∧q = 0∧1 = 0. Luego 0→1 = ?',
      options: [
        { text: '1 (Verdadero), porque con antecedente falso la implicación es verdadera', correct: true },
        { text: '0 (Falso), porque p es falsa', correct: false },
        { text: '1, porque q es verdadera', correct: false },
        { text: '0, porque la conjunción es falsa', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Siendo p = 1 (V) y q = 0 (F), ¿cuánto vale -(q → p)?',
    options: [
      { text: '1 (Verdadero)', correct: false },
      { text: '0 (Falso)', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: 'q→p = 0→1 = 1. Luego -(1) = ?',
      options: [
        { text: '0 (Falso). La negación de verdadero es falso.', correct: true },
        { text: '1. La negación no cambia la implicación.', correct: false },
        { text: '0 porque p y q tienen valores distintos', correct: false },
        { text: 'Indefinido', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sea p=1 y q=0. ¿Cuánto vale (p ∧ -q) → [(-p → q) → p]?',
    options: [
      { text: '0 (Falso)', correct: false },
      { text: '1 (Verdadero)', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: 'Primero resolvemos de adentro afuera: -q=1, p∧-q=1. -p=0, -p→q=0→0=1. 1→p=1→1=1. Finalmente 1→1=?',
      options: [
        { text: '1 (Verdadero), porque la implicación 1→1 es verdadera', correct: true },
        { text: '0, porque hay muchas operaciones encadenadas', correct: false },
        { text: 'Indeterminado por la complejidad', correct: false },
        { text: '0, porque q=0 en el antecedente', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🧩 Completá',
    text: 'Completá: "La doble implicación p ↔ q es equivalente a _______".',
    options: [
      { text: '(p → q) ∨ (q → p)', correct: false },
      { text: '(p → q) ∧ (q → p)', correct: true },
      { text: '-(p → q)', correct: false },
      { text: 'p ∧ q', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🧩 Completá',
    text: 'Completá: "La tabla de verdad de una proposición compuesta con n variables tiene _____ filas".',
    options: [
      { text: '2n', correct: false },
      { text: 'n²', correct: false },
      { text: '2ⁿ', correct: true },
      { text: 'n + 2', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🔤 Traducción al castellano',
    text: 'Sean p="El SO administra recursos", q="La computadora es eficiente", r="El programa corre lento". Traducí: (p → -r) → q',
    options: [
      { text: '"Si el SO administra recursos y el programa no corre lento, entonces la computadora es eficiente"', correct: false },
      { text: '"Si cuando el SO administra recursos el programa no corre lento, entonces la computadora es eficiente"', correct: true },
      { text: '"El SO administra recursos o la computadora no es eficiente"', correct: false },
      { text: '"El programa corre lento si y solo si la computadora es eficiente"', correct: false }
    ]
  },

  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: 'Un estudiante afirma: "La contrarrecíproca de p → q es -p → -q y es equivalente a la implicación directa". ¿Hay un error?',
    options: [
      { text: 'No hay error, es correcto', correct: false },
      { text: 'Sí: -p → -q es la INVERSA, no la contrarrecíproca. La contrarrecíproca es -q → -p', correct: true },
      { text: 'Sí, hay error: la contrarrecíproca es q → p', correct: false },
      { text: 'Sí, hay error: ninguna variante es equivalente a la directa', correct: false }
    ]
  },

  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: '"Una conjunción p ∧ q es verdadera cuando alguna de las dos proposiciones es verdadera." ¿Esta afirmación es correcta?',
    options: [
      { text: 'Sí, es correcta', correct: false },
      { text: 'No: la conjunción requiere que AMBAS sean verdaderas. La descripción corresponde a la disyunción.', correct: true },
      { text: 'No: la conjunción es siempre falsa', correct: false },
      { text: 'Sí, si "alguna" significa la mayoría', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     MINI REPASO FINAL
     ══════════════════════════════════════════════════════ */
  {
    type: 'review',
    title: '🔄 Repaso Final Integrado',
    items: [
      { icon: '✅', text: '<strong>Proposición:</strong> oración que puede ser V o F (no ambas).' },
      { icon: '✅', text: '<strong>Negación (-p):</strong> invierte el valor de p.' },
      { icon: '✅', text: '<strong>Conjunción (p∧q):</strong> V solo si ambas son V.' },
      { icon: '✅', text: '<strong>Disyunción (p∨q):</strong> F solo si ambas son F.' },
      { icon: '✅', text: '<strong>Implicación (p→q):</strong> F solo si p=V y q=F.' },
      { icon: '✅', text: '<strong>Doble implicación (p↔q):</strong> V cuando tienen el mismo valor.' },
      { icon: '✅', text: '<strong>Contrarrecíproca (-q→-p):</strong> equivalente a la implicación directa.' },
      { icon: '✅', text: '<strong>Tabla de verdad:</strong> 2ⁿ filas para n variables.' }
    ]
  },

  /* ══════════════════════════════════════════════════════
     PREGUNTAS EXTRA DE REFUERZO (se mezclan si hay errores)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '🏁 Repaso acumulativo',
    text: '¿Cuál de las siguientes proposiciones compuestas es una TAUTOLOGÍA (siempre verdadera)?',
    options: [
      { text: 'p ∧ -p', correct: false },
      { text: 'p ∨ -p', correct: true },
      { text: 'p → -p', correct: false },
      { text: 'p ↔ -p', correct: false }
    ],
    justification: {
      text: '¿Por qué p ∨ -p es siempre verdadera?',
      options: [
        { text: 'Porque p y -p cubren todos los casos (si p=V la disyunción es V; si p=F, -p=V y la disyunción también)', correct: true },
        { text: 'Porque la disyunción siempre es verdadera', correct: false },
        { text: 'Porque p y -p son iguales', correct: false },
        { text: 'Es una convención, no tiene demostración', correct: false }
      ]
    }
  },

  {
    type: 'mc',
    qtype: '🏁 Repaso acumulativo',
    text: 'La proposición p ∧ -p (contradicción):',
    options: [
      { text: 'Es siempre verdadera', correct: false },
      { text: 'Es siempre falsa', correct: true },
      { text: 'Depende del valor de p', correct: false },
      { text: 'Es lo mismo que una tautología', correct: false }
    ]
  },

  {
    type: 'mc',
    qtype: '🏁 Repaso acumulativo',
    text: 'Si sabemos que p → q es FALSA, ¿qué podemos concluir con certeza?',
    options: [
      { text: 'p es falsa y q es falsa', correct: false },
      { text: 'p es verdadera y q es falsa', correct: true },
      { text: 'p es falsa y q es verdadera', correct: false },
      { text: 'No se puede concluir nada', correct: false }
    ],
    justification: {
      text: '¿Por qué eso se concluye con certeza?',
      options: [
        { text: 'La implicación es F SOLO en el caso p=1 y q=0; es la única combinación posible', correct: true },
        { text: 'Hay varios casos en que la implicación es falsa', correct: false },
        { text: 'Porque la implicación siempre es verdadera cuando p es verdadera', correct: false },
        { text: 'Por convención de la lógica formal', correct: false }
      ]
    }
  }

,

  /* ══════════════════════════════════════════════════════
     BLOQUE A – PROPOSICIONES (refuerzo)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: '"La primera computadora electrónica digital fue construida en el siglo XX." ¿Es proposición?',
    options: [
      { text: 'Sí, y es verdadera', correct: true },
      { text: 'Sí, y es falsa', correct: false },
      { text: 'No, porque habla de tecnología', correct: false },
      { text: 'No, porque es una opinión', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: '"y − z = z − y", ¿es una proposición?',
    options: [
      { text: 'Sí, y es verdadera', correct: false },
      { text: 'Sí, y es falsa', correct: false },
      { text: 'No: su valor de verdad depende de los valores de y y z', correct: true },
      { text: 'Sí, es una proposición ambigua', correct: false }
    ],
    justification: {
      text: '¿Por qué depende de los valores de y y z?',
      options: [
        { text: 'Porque contiene variables libres, no tiene valor de verdad fijo', correct: true },
        { text: 'Porque es una ecuación matemática', correct: false },
        { text: 'Porque es una proposición compuesta', correct: false },
        { text: 'Porque tiene signo =', correct: false }
      ]
    }
  },
  {
    type: 'tf',
    qtype: '✔/✘ Verdadero o Falso',
    text: '"¿Funciona la impresora?" es una proposición falsa.',
    options: [
      { text: 'Verdadero', correct: false },
      { text: 'Falso – es una pregunta, por lo tanto NO es proposición', correct: true }
    ]
  },
  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: '¿Cuál de los siguientes enunciados es una proposición VERDADERA?',
    options: [
      { text: '"2 + 2 = 5"', correct: false },
      { text: '"Buenos Aires es la capital de Argentina"', correct: true },
      { text: '"¡Qué linda ciudad!"', correct: false },
      { text: '"Abrí la ventana."', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔍 Identificá el tipo',
    text: '"Algunos ingenieros son médicos." ¿Cómo clasificás esta oración?',
    options: [
      { text: 'Proposición verdadera', correct: true },
      { text: 'Proposición falsa', correct: false },
      { text: 'No es proposición (es exclamación)', correct: false },
      { text: 'No es proposición (es orden)', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: 'Sea p: "2 + 2 = 4". ¿Cuál es V(p)?',
    options: [
      { text: 'V(p) = 0', correct: false },
      { text: 'V(p) = 1', correct: true },
      { text: 'V(p) = indefinido', correct: false },
      { text: 'V(p) = -1', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: '¿Qué dos valores de verdad puede tomar una proposición?',
    options: [
      { text: 'Posible e imposible', correct: false },
      { text: 'Verdadero (1) y Falso (0)', correct: true },
      { text: 'Afirmativo y negativo', correct: false },
      { text: 'Cierto e incierto', correct: false }
    ]
  },
  {
    type: 'tf',
    qtype: '✔/✘ Verdadero o Falso',
    text: 'Una proposición puede ser simultáneamente verdadera Y falsa.',
    options: [
      { text: 'Verdadero', correct: false },
      { text: 'Falso – por definición una proposición tiene UN solo valor de verdad', correct: true }
    ]
  },
  {
    type: 'mc',
    qtype: '🔍 Clasificá',
    text: '"Todo polígono tiene n lados." ¿Es proposición?',
    options: [
      { text: 'Sí, verdadera', correct: false },
      { text: 'Sí, falsa', correct: false },
      { text: 'No, porque n es una variable sin valor fijo', correct: true },
      { text: 'Sí, es una tautología', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: '"El sol brilla y la humedad no es alta." ¿Cuántas proposiciones simples contiene?',
    options: [
      { text: 'Una', correct: false },
      { text: 'Dos', correct: true },
      { text: 'Tres', correct: false },
      { text: 'Ninguna, no es proposición', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE B – CONECTIVOS LÓGICOS (refuerzo)
     ══════════════════════════════════════════════════════ */
  {
    type: 'match',
    qtype: '🔗 Relacioná',
    text: '¿Qué símbolo representa la CONJUNCIÓN?',
    options: [
      { text: '∨', correct: false },
      { text: '→', correct: false },
      { text: '∧', correct: true },
      { text: '↔', correct: false }
    ]
  },
  {
    type: 'match',
    qtype: '🔗 Relacioná',
    text: '¿Qué símbolo representa la DISYUNCIÓN?',
    options: [
      { text: '∧', correct: false },
      { text: '∨', correct: true },
      { text: '→', correct: false },
      { text: '-', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"Si llueve entonces hay nubes en el cielo." Sea l = llueve, n = hay nubes. Simbolizá:',
    options: [
      { text: 'l ∧ n', correct: false },
      { text: 'l ∨ n', correct: false },
      { text: 'l → n', correct: true },
      { text: 'l ↔ n', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"El archivo se imprimirá en la impresora O en la pantalla." Sea i = se imprime, p = se ve en pantalla:',
    options: [
      { text: 'i ∧ p', correct: false },
      { text: 'i ∨ p', correct: true },
      { text: 'i → p', correct: false },
      { text: '-i ∨ p', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"Si hoy es lunes entonces mañana es martes." Sea l = hoy es lunes, m = mañana es martes:',
    options: [
      { text: 'l ∧ m', correct: false },
      { text: 'l ↔ m', correct: false },
      { text: 'l → m', correct: true },
      { text: 'm → l', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"No es cierto que la computadora se colgó." Sea c = la computadora se colgó:',
    options: [
      { text: 'c', correct: false },
      { text: '-c', correct: true },
      { text: 'c → 0', correct: false },
      { text: 'c ∧ -c', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"4 es par ó 4 es primo." Sea e = 4 es par, p = 4 es primo:',
    options: [
      { text: 'e ∧ p', correct: false },
      { text: 'e ∨ p', correct: true },
      { text: 'e → p', correct: false },
      { text: 'e ↔ p', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Traducción verbal',
    text: '¿Cuál es la lectura correcta de p ↔ q?',
    options: [
      { text: '"si p entonces q"', correct: false },
      { text: '"p y q"', correct: false },
      { text: '"p si y solo si q"', correct: true },
      { text: '"p o q"', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Simbolizá',
    text: '"Juan y Pedro son primos." Sea j = Juan es primo, p = Pedro es primo:',
    options: [
      { text: 'j ∨ p', correct: false },
      { text: 'j ∧ p', correct: true },
      { text: 'j → p', correct: false },
      { text: 'j ↔ p', correct: false }
    ],
    justification: {
      text: '¿Por qué conjunción y no otra cosa?',
      options: [
        { text: 'La palabra "y" que une dos afirmaciones independientes indica conjunción', correct: true },
        { text: 'Porque habla de dos personas', correct: false },
        { text: 'La palabra "y" siempre es disyunción', correct: false },
        { text: 'Porque es una proposición compuesta con implicación implícita', correct: false }
      ]
    }
  },
  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: 'Un estudiante escribe: "La disyunción se simboliza con ∧". ¿Hay un error?',
    options: [
      { text: 'No hay error', correct: false },
      { text: 'Sí: ∧ es la conjunción. La disyunción se simboliza con ∨', correct: true },
      { text: 'Sí: ∧ es la implicación', correct: false },
      { text: 'Sí: ∧ es la negación', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE C – NEGACIÓN (refuerzo)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '❓ Tabla de Verdad',
    text: 'Si V(p) = 0, ¿cuál es V(-p)?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: 'La negación de "El programa terminó" es:',
    options: [
      { text: '"El programa empezó"', correct: false },
      { text: '"El programa no terminó"', correct: true },
      { text: '"El programa tardó mucho"', correct: false },
      { text: '"El programa terminó bien"', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '❓ Pregunta',
    text: 'La negación de "Todos los alumnos aprobaron" es:',
    options: [
      { text: '"Ningún alumno aprobó"', correct: false },
      { text: '"Algunos alumnos no aprobaron" (al menos uno)', correct: true },
      { text: '"Todos los alumnos reprobaron"', correct: false },
      { text: '"La mayoría aprobó"', correct: false }
    ],
    justification: {
      text: 'En lógica, la negación de "Todos..." es:',
      options: [
        { text: '"Existe al menos uno que no..." (alguno no cumple la condición)', correct: true },
        { text: '"Ninguno..." (negación total)', correct: false },
        { text: '"La mayoría no..."', correct: false },
        { text: '"Exactamente la mitad no..."', correct: false }
      ]
    }
  },
  {
    type: 'tf',
    qtype: '✔/✘ Verdadero o Falso',
    text: 'La doble negación --p equivale a p.',
    options: [
      { text: 'Verdadero – la doble negación restituye el valor original', correct: true },
      { text: 'Falso – la doble negación da siempre falso', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 1, ¿cuánto vale --p?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: '-1', correct: false },
      { text: 'Indeterminado', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE D – CONJUNCIÓN (refuerzo y aplicación)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 1 y q = 1, ¿cuánto vale p ∧ q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Depende del contexto', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 0 y q = 0, ¿cuánto vale p ∧ q?',
    options: [
      { text: '1', correct: false },
      { text: '0', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '2', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Siendo p=1 y q=0, ¿cuánto vale p ∧ -q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: 'Paso a paso: -q = ?, luego p ∧ -q = ?',
      options: [
        { text: '-q = 1 (porque q=0), entonces 1 ∧ 1 = 1', correct: true },
        { text: '-q = 0, entonces p ∧ 0 = 0', correct: false },
        { text: '-q invierte p también', correct: false },
        { text: 'La conjunción con negación siempre es 0', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '🔢 Conteo',
    text: '¿Cuántas filas tiene la tabla de verdad de p ∧ q ∧ r (tres variables)?',
    options: [
      { text: '4', correct: false },
      { text: '6', correct: false },
      { text: '8', correct: true },
      { text: '16', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'En un if con condición (p AND q), ¿cuándo se ejecuta el bloque then?',
    options: [
      { text: 'Cuando p es verdadera, sin importar q', correct: false },
      { text: 'Cuando ambas p y q son verdaderas', correct: true },
      { text: 'Cuando alguna de las dos es verdadera', correct: false },
      { text: 'Cuando p es falsa y q es verdadera', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=1, q=1, r=0. ¿Cuánto vale p ∧ q ∧ r?',
    options: [
      { text: '1', correct: false },
      { text: '0', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '2', correct: false }
    ],
    justification: {
      text: 'En una conjunción múltiple, ¿qué ocurre si una sola proposición es falsa?',
      options: [
        { text: 'Toda la conjunción es falsa (basta un 0 para que todo sea 0)', correct: true },
        { text: 'Depende de cuántas sean verdaderas', correct: false },
        { text: 'La conjunción sigue siendo verdadera si la mayoría son V', correct: false },
        { text: 'Se toma el valor de la primera proposición', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE E – DISYUNCIÓN (refuerzo y aplicación)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 1 y q = 1, ¿cuánto vale p ∨ q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Solo en disyunción exclusiva sería 0', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 0 y q = 0, ¿cuánto vale p ∨ q?',
    options: [
      { text: '1', correct: false },
      { text: '0', correct: true },
      { text: 'Depende del contexto', correct: false },
      { text: 'Indeterminado', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Siendo p=0 y q=1, ¿cuánto vale -p ∨ q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: '-p = 1 (porque p=0). Entonces 1 ∨ 1 = ?',
      options: [
        { text: '1, porque la disyunción de dos verdaderos es verdadera', correct: true },
        { text: '0, porque p original es falsa', correct: false },
        { text: '0, porque la negación cambia el resultado de la disyunción', correct: false },
        { text: 'Indeterminado', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'En un if con condición (p OR q), ¿cuándo se ejecuta el bloque then?',
    options: [
      { text: 'Solo cuando ambas son verdaderas', correct: false },
      { text: 'Cuando al menos una de p o q es verdadera', correct: true },
      { text: 'Siempre', correct: false },
      { text: 'Nunca', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔍 Diferenciá',
    text: 'En la disyunción INCLUSIVA con p=1 y q=1, el resultado es:',
    options: [
      { text: '0, porque ambas no pueden ser verdaderas', correct: false },
      { text: '1, porque la disyunción inclusiva admite que ambas sean verdaderas', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Depende del orden de p y q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔍 Diferenciá',
    text: 'En la disyunción EXCLUSIVA con p=1 y q=1, el resultado es:',
    options: [
      { text: '1', correct: false },
      { text: '0, porque ambas son verdaderas y la exclusiva requiere que solo una lo sea', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que la inclusiva', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=0, q=1, r=1. ¿Cuánto vale (p ∨ q) ∧ r?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: 'Primero p∨q = 0∨1 = 1. Luego 1 ∧ r = 1 ∧ 1 = ?',
      options: [
        { text: '1, porque ambos operandos de la conjunción son verdaderos', correct: true },
        { text: '0, porque p es falsa', correct: false },
        { text: '0, hay que resolver de derecha a izquierda', correct: false },
        { text: 'Indeterminado', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE F – IMPLICACIÓN (refuerzo y ejercicios avanzados)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 1 y q = 1, ¿cuánto vale p → q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Depende', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 0 y q = 0, ¿cuánto vale p → q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: '¿Por qué la implicación con p=0 y q=0 es verdadera?',
      options: [
        { text: 'Con antecedente falso, la implicación es siempre verdadera (vacuamente verdadera)', correct: true },
        { text: 'Porque ambas son falsas', correct: false },
        { text: 'Porque la implicación siempre es verdadera', correct: false },
        { text: 'Porque 0→0 es una tautología especial', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Siendo p=1 y q=0, ¿cuánto vale -p → q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Es igual a p→q', correct: false }
    ],
    justification: {
      text: '-p = 0 (porque p=1). Entonces 0 → q = 0 → 0 = ?',
      options: [
        { text: '1, porque con antecedente falso la implicación es verdadera', correct: true },
        { text: '0, porque q es falso', correct: false },
        { text: '0, porque p es verdadero y la negación lo hace falso', correct: false },
        { text: 'Indeterminado', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=1, q=1. ¿Cuánto vale p → -q?',
    options: [
      { text: '1', correct: false },
      { text: '0', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Es igual a p→q', correct: false }
    ],
    justification: {
      text: '-q = 0 (porque q=1). Entonces p→-q = 1→0 = ?',
      options: [
        { text: '0, único caso en que la implicación es falsa: antecedente V y consecuente F', correct: true },
        { text: '1, porque p es verdadero', correct: false },
        { text: '1, la negación del consecuente no cambia el resultado', correct: false },
        { text: 'Indeterminado', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '🔤 Traducción verbal',
    text: '"q si p" es una expresión sinónima de:',
    options: [
      { text: 'q → p', correct: false },
      { text: 'p → q', correct: true },
      { text: 'p ↔ q', correct: false },
      { text: 'p ∧ q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Traducción verbal',
    text: '"p es condición suficiente para q" equivale a:',
    options: [
      { text: 'q → p', correct: false },
      { text: 'p ↔ q', correct: false },
      { text: 'p → q', correct: true },
      { text: 'p ∧ q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Traducción verbal',
    text: '"q es condición necesaria para p" equivale a:',
    options: [
      { text: 'q → p', correct: false },
      { text: 'p → q', correct: true },
      { text: 'p ↔ q', correct: false },
      { text: '-p → q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔤 Traducción verbal',
    text: '"No hay p sin q" equivale a:',
    options: [
      { text: 'q → p', correct: false },
      { text: 'p → q', correct: true },
      { text: 'p ∧ -q', correct: false },
      { text: '-p ∨ -q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🧩 Completá',
    text: 'La implicación p → q es equivalente a la disyunción: _______',
    options: [
      { text: 'p ∨ q', correct: false },
      { text: '-p ∨ q', correct: true },
      { text: 'p ∨ -q', correct: false },
      { text: '-p ∨ -q', correct: false }
    ],
    justification: {
      text: '¿Por qué p→q equivale a -p∨q?',
      options: [
        { text: 'Porque la implicación solo es falsa cuando p=1 y q=0, igual que -p∨q', correct: true },
        { text: 'Porque toda implicación es una disyunción disfrazada sin más razón', correct: false },
        { text: 'Porque la negación de p siempre convierte la implicación', correct: false },
        { text: 'No son equivalentes, el estudiante se equivocó', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Siendo p=0 y q=1, ¿cuánto vale (p → q) ∧ (q → p)?',
    options: [
      { text: '1', correct: false },
      { text: '0 — y además es lo mismo que p↔q', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Es lo mismo que p∧q', correct: false }
    ],
    justification: {
      text: 'p→q = 0→1 = 1. q→p = 1→0 = 0. Entonces 1∧0 = ?',
      options: [
        { text: '0, porque la conjunción requiere ambos verdaderos', correct: true },
        { text: '1, porque al menos una implicación es verdadera', correct: false },
        { text: 'Indeterminado por el orden de resolución', correct: false },
        { text: '1, porque p→q es verdadera', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sea p=1, q=0. ¿Cuánto vale (p ∨ q) → q?',
    options: [
      { text: '1', correct: false },
      { text: '0', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p→q', correct: false }
    ],
    justification: {
      text: 'p∨q = 1∨0 = 1. Luego 1→q = 1→0 = ?',
      options: [
        { text: '0, porque antecedente V y consecuente F es el único caso falso de la implicación', correct: true },
        { text: '1, porque p∨q es verdadera', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: '1, porque q siempre domina', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE G – DOBLE IMPLICACIÓN (refuerzo)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 1 y q = 1, ¿cuánto vale p ↔ q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p→q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 0 y q = 0, ¿cuánto vale p ↔ q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p∧q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Si p = 1 y q = 0, ¿cuánto vale p ↔ q?',
    options: [
      { text: '1', correct: false },
      { text: '0', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p→q', correct: false }
    ],
    justification: {
      text: 'La doble implicación es falsa cuando:',
      options: [
        { text: 'p y q tienen distinto valor de verdad', correct: true },
        { text: 'p es verdadera y q es falsa solamente', correct: false },
        { text: 'Ambas son falsas', correct: false },
        { text: 'La implicación directa es falsa', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '🧩 Completá',
    text: 'La doble implicación p ↔ q es verdadera cuando p y q tienen _______.',
    options: [
      { text: 'Valores distintos', correct: false },
      { text: 'El mismo valor de verdad', correct: true },
      { text: 'Ambas valor 1', correct: false },
      { text: 'Ambas valor 0', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=1, q=0. ¿Cuánto vale -(p ↔ q)?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: 'p↔q = 0 (valores distintos). Entonces -(0) = ?',
      options: [
        { text: '1, la negación de falso es verdadero', correct: true },
        { text: '0, la negación no cambia el bicondicional', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: '-1', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE H – VARIANTES IMPLICACIÓN (refuerzo)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '🔄 Variantes',
    text: 'Dada p → q, ¿cuál es la INVERSA (o negación de ambas sin invertir)?',
    options: [
      { text: 'q → p', correct: false },
      { text: '-p → -q', correct: true },
      { text: '-q → -p', correct: false },
      { text: 'p ↔ q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔗 Equivalencia',
    text: 'La inversa -p → -q ¿es equivalente a la implicación directa p → q?',
    options: [
      { text: 'Sí, siempre son equivalentes', correct: false },
      { text: 'No, la inversa no es equivalente a la directa', correct: true },
      { text: 'Solo cuando p es verdadera', correct: false },
      { text: 'Solo cuando q es verdadera', correct: false }
    ],
    justification: {
      text: '¿Qué variante SÍ es equivalente a la directa?',
      options: [
        { text: 'La contrarrecíproca (-q → -p)', correct: true },
        { text: 'La recíproca (q → p)', correct: false },
        { text: 'La inversa (-p → -q)', correct: false },
        { text: 'Ninguna variante es equivalente', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '🔄 Variantes',
    text: 'Si p → q es verdadera, ¿qué podemos afirmar sobre -q → -p?',
    options: [
      { text: 'También es verdadera, porque son equivalentes', correct: true },
      { text: 'Es falsa, porque es la negación de la directa', correct: false },
      { text: 'No se puede determinar', correct: false },
      { text: 'Es falsa cuando p=0', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🔄 Variantes',
    text: '¿Cuál de las variantes de p → q NO es equivalente a ella?',
    options: [
      { text: 'La contrarrecíproca: -q → -p', correct: false },
      { text: 'La recíproca: q → p', correct: true },
      { text: 'Ambas son equivalentes', correct: false },
      { text: 'Ninguna es equivalente', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE I – TABLAS DE VERDAD (ejercicios integradores)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=1, q=1, r=0. ¿Cuánto vale (p ∧ q) → r?',
    options: [
      { text: '1', correct: false },
      { text: '0', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p→r', correct: false }
    ],
    justification: {
      text: 'p∧q = 1∧1 = 1. Luego 1→r = 1→0 = ?',
      options: [
        { text: '0, antecedente verdadero y consecuente falso es el único caso falso de →', correct: true },
        { text: '1, porque p∧q es verdadera', correct: false },
        { text: '1, porque la conjunción domina', correct: false },
        { text: 'Indeterminado', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=0, q=1. ¿Cuánto vale -(p ∧ q) ∨ p?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: 'p∧q=0. -(0)=1. 1∨p=1∨0=?',
      options: [
        { text: '1, la disyunción de 1 con cualquier valor da 1', correct: true },
        { text: '0, p es falsa', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: 'Depende de q', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=1, q=0, r=1. ¿Cuánto vale p → (q ∨ r)?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p→q', correct: false }
    ],
    justification: {
      text: 'q∨r = 0∨1 = 1. Luego p→1 = 1→1 = ?',
      options: [
        { text: '1, porque 1→1 es verdadero', correct: true },
        { text: '0, porque q es falso', correct: false },
        { text: '0, porque p→q sería 1→0=0', correct: false },
        { text: 'Indeterminado', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Siendo p=0, q=0, ¿cuánto vale -p → -q?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p→q', correct: false }
    ],
    justification: {
      text: '-p=1, -q=1. Entonces 1→1 = ?',
      options: [
        { text: '1, porque ambos son verdaderos', correct: true },
        { text: '0, porque p y q son falsas', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: 'Igual que p∧q', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=1, q=1. ¿Cuánto vale (p → q) ↔ (q → p)?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p↔q', correct: false }
    ],
    justification: {
      text: 'p→q=1, q→p=1. Entonces 1↔1=?',
      options: [
        { text: '1, la bicondicional es verdadera cuando ambos lados tienen el mismo valor', correct: true },
        { text: '0, la bicondicional de dos implicaciones siempre es 0', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: '0, porque p=q=1 hace que sean distintas', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '📊 Calculá',
    text: 'Sean p=1, q=0. ¿Cuánto vale (p → q) ↔ (-q → -p)?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Solo verdadero si p=q', correct: false }
    ],
    justification: {
      text: 'p→q=0. -q=1,-p=0, entonces -q→-p=1→0=0. Entonces 0↔0=?',
      options: [
        { text: '1, ambos lados son 0 y la bicondicional de iguales es verdadera', correct: true },
        { text: '0, porque ambas implicaciones son falsas', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: '0, no son equivalentes', correct: false }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE J – LÓGICA Y PROGRAMACIÓN (refuerzo)
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'En "while (p AND q) do acción", ¿cuándo se detiene el lazo?',
    options: [
      { text: 'Cuando p se vuelve falsa O q se vuelve falsa (o ambas)', correct: true },
      { text: 'Solo cuando ambas se vuelven falsas a la vez', correct: false },
      { text: 'Cuando p se vuelve falsa solamente', correct: false },
      { text: 'Nunca se detiene', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'En "while (p OR q) do acción", ¿cuándo se detiene el lazo?',
    options: [
      { text: 'Cuando alguna de las dos es falsa', correct: false },
      { text: 'Cuando AMBAS p y q son falsas', correct: true },
      { text: 'Cuando p es falsa solamente', correct: false },
      { text: 'Nunca', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'Sea i:=1; while i < 4 do begin x:=x+1; i:=i+1 end. ¿Cuántas veces se ejecuta x:=x+1?',
    options: [
      { text: '2', correct: false },
      { text: '3', correct: true },
      { text: '4', correct: false },
      { text: '1', correct: false }
    ],
    justification: {
      text: '¿Por qué 3 veces?',
      options: [
        { text: 'i=1 (V→ejecuta), i=2 (V→ejecuta), i=3 (V→ejecuta), i=4 (F→detiene). Total: 3', correct: true },
        { text: 'El bucle siempre corre el límite menos 1 veces', correct: false },
        { text: 'El bucle corre hasta que i iguala el límite', correct: false },
        { text: 'Corre desde 0 hasta 4', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'En "if (p AND NOT q) then acción". Con p=1 y q=1, ¿se ejecuta la acción?',
    options: [
      { text: 'Sí, porque p es verdadera', correct: false },
      { text: 'No, porque NOT q = 0 y p∧0 = 0 (condición falsa)', correct: true },
      { text: 'Sí, porque la conjunción de p es suficiente', correct: false },
      { text: 'No, porque q es verdadera', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '💻 Programación',
    text: 'La condición "i < 2 OR i > 0" con i=1, ¿es verdadera o falsa?',
    options: [
      { text: 'Falsa, porque i no puede cumplir ambas', correct: false },
      { text: 'Verdadera, porque i<2 es V y i>0 es V, y V∨V=1', correct: true },
      { text: 'Falsa, porque es una disyunción contradictoria', correct: false },
      { text: 'Indeterminada', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE K – LÓGICA FORMAL Y CONCEPTOS GENERALES
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿Para qué sirve la Lógica Formal en Ciencias de la Computación?',
    options: [
      { text: 'Solo para diseñar hardware', correct: false },
      { text: 'Para demostrar la corrección de programas y especificar su comportamiento sin ambigüedad', correct: true },
      { text: 'Solo para la inteligencia artificial', correct: false },
      { text: 'Para traducir lenguajes de programación', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿En qué año surgió el lenguaje de programación lógica PROLOG?',
    options: [
      { text: '1960', correct: false },
      { text: '1972', correct: true },
      { text: '1985', correct: false },
      { text: '1990', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿Qué es la Lógica Simbólica?',
    options: [
      { text: 'Una lógica que solo usa números', correct: false },
      { text: 'Una forma de lógica que reemplaza contenidos por símbolos para operar formalmente', correct: true },
      { text: 'Un lenguaje de programación', correct: false },
      { text: 'Un tipo especial de tabla de verdad', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿Qué es la Matemática Discreta?',
    options: [
      { text: 'El estudio de números continuos y funciones', correct: false },
      { text: 'El estudio de objetos discretos (contables) y las relaciones entre ellos', correct: true },
      { text: 'Una rama de la física', correct: false },
      { text: 'El estudio de algoritmos de ordenamiento', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿Cuál es el metalenguaje que menciona el apunte para especificar programas?',
    options: [
      { text: 'El lenguaje ensamblador', correct: false },
      { text: 'La Lógica Formal', correct: true },
      { text: 'El pseudocódigo', correct: false },
      { text: 'El lenguaje C', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: '¿Cómo se designan convencionalmente las proposiciones en lógica simbólica?',
    options: [
      { text: 'Con números 0 y 1', correct: false },
      { text: 'Con letras minúsculas: p, q, r, w...', correct: true },
      { text: 'Con letras mayúsculas: P, Q, R...', correct: false },
      { text: 'Con símbolos griegos: α, β, γ...', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: 'En lógica proposicional, los valores verdadero y falso se representan numéricamente como:',
    options: [
      { text: '1 y -1', correct: false },
      { text: '1 y 0', correct: true },
      { text: '2 y 1', correct: false },
      { text: 'V y F solamente (sin equivalente numérico)', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🧠 Comprensión',
    text: 'La Lógica de Predicados estudia proposiciones en las cuales aparecen palabras como:',
    options: [
      { text: '"y", "o", "si"', correct: false },
      { text: '"todos", "alguno", "ninguno" (cuantificadores)', correct: true },
      { text: 'Solo símbolos matemáticos', correct: false },
      { text: 'Solo negaciones y conjunciones', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE L – DETECCIÓN DE ERRORES Y DISCRIMINACIÓN
     ══════════════════════════════════════════════════════ */
  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: '"La implicación p → q es falsa cuando p es falsa." ¿Esta afirmación es correcta?',
    options: [
      { text: 'Sí, es correcta', correct: false },
      { text: 'No: con p falsa la implicación es SIEMPRE verdadera (vacuamente verdadera)', correct: true },
      { text: 'Sí, porque con p falsa q también es falsa', correct: false },
      { text: 'Depende del valor de q', correct: false }
    ]
  },
  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: '"La disyunción p ∨ q es verdadera solo cuando exactamente UNA es verdadera." ¿Error?',
    options: [
      { text: 'No hay error, es correcto', correct: false },
      { text: 'Sí: eso describe la disyunción EXCLUSIVA. La inclusiva es verdadera también cuando ambas son V', correct: true },
      { text: 'Sí: la disyunción siempre es falsa cuando ambas son V', correct: false },
      { text: 'No hay error porque se refiere a la inclusiva', correct: false }
    ]
  },
  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: '"La bicondicional p ↔ q es equivalente a (p → q) ∨ (q → p)." ¿Error?',
    options: [
      { text: 'No hay error', correct: false },
      { text: 'Sí: la bicondicional equivale a (p→q) ∧ (q→p), no a la disyunción', correct: true },
      { text: 'Sí: la bicondicional equivale solo a p→q', correct: false },
      { text: 'Sí: la bicondicional no tiene equivalencia con implicaciones', correct: false }
    ]
  },
  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: '"La tabla de verdad de 4 variables tiene 8 filas." ¿Error?',
    options: [
      { text: 'No hay error', correct: false },
      { text: 'Sí: 4 variables → 2⁴ = 16 filas, no 8', correct: true },
      { text: 'Sí: debería tener 4 filas', correct: false },
      { text: 'Sí: debería tener 32 filas', correct: false }
    ],
    justification: {
      text: 'La fórmula correcta es:',
      options: [
        { text: '2ⁿ donde n es el número de variables proposicionales', correct: true },
        { text: 'n × 2 donde n es el número de variables', correct: false },
        { text: 'n² donde n es el número de variables', correct: false },
        { text: 'n + 4 donde n es el número de variables', correct: false }
      ]
    }
  },
  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: '"La recíproca de p → q es -q → -p y es equivalente a la directa." ¿Error?',
    options: [
      { text: 'No hay error', correct: false },
      { text: 'Sí: -q → -p es la CONTRARRECÍPROCA (que sí es equivalente). La recíproca es q → p y NO es equivalente a la directa', correct: true },
      { text: 'Sí: la recíproca es -p → -q', correct: false },
      { text: 'No hay error en la equivalencia, solo en el nombre', correct: false }
    ]
  },
  {
    type: 'error',
    qtype: '🚨 Detectá el error',
    text: '"p ∧ q es verdadera cuando p=0 y q=0." ¿Error?',
    options: [
      { text: 'No hay error', correct: false },
      { text: 'Sí: con p=0 y q=0 la conjunción es 0 (falsa), no verdadera', correct: true },
      { text: 'Sí: con p=0 y q=0 la conjunción es indeterminada', correct: false },
      { text: 'No hay error porque 0∧0=0 es correcto en algún contexto', correct: false }
    ]
  },

  /* ══════════════════════════════════════════════════════
     BLOQUE M – REPASO INTEGRADOR FINAL
     ══════════════════════════════════════════════════════ */
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: 'Sean p=1, q=0. Determiná el valor de: (p → q) ↔ -(p ∧ -q)',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: 'p→q=0. -q=1, p∧-q=1, -(1)=0. Entonces 0↔0=?',
      options: [
        { text: '1, porque ambos lados son 0 y la bicondicional de iguales es V', correct: true },
        { text: '0, porque p→q es falsa', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: '0, porque p∧-q es verdadera', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: 'La tautología es una proposición que:',
    options: [
      { text: 'Es siempre falsa', correct: false },
      { text: 'Es verdadera para todos los valores posibles de sus variables', correct: true },
      { text: 'Puede ser verdadera o falsa según el contexto', correct: false },
      { text: 'Es falsa para todos los valores posibles', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: 'Una contradicción es una proposición que:',
    options: [
      { text: 'Es siempre verdadera', correct: false },
      { text: 'Es siempre falsa para todos los valores posibles de sus variables', correct: true },
      { text: 'Es verdadera para algunos valores y falsa para otros', correct: false },
      { text: 'Es equivalente a la tautología', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: '¿Cuál de estas es una CONTRADICCIÓN?',
    options: [
      { text: 'p ∨ -p', correct: false },
      { text: 'p ∧ -p', correct: true },
      { text: 'p → p', correct: false },
      { text: 'p ↔ p', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: '¿Cuál de estas es una TAUTOLOGÍA?',
    options: [
      { text: 'p ∧ -p', correct: false },
      { text: 'p → q', correct: false },
      { text: 'p ∨ -p', correct: true },
      { text: 'p ↔ -p', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: 'Sean p=0, q=1, r=0. ¿Cuánto vale -p ∧ (q ∨ r)?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: '-1', correct: false }
    ],
    justification: {
      text: '-p=1, q∨r=1∨0=1. Entonces 1∧1=?',
      options: [
        { text: '1, la conjunción de dos verdaderos es verdadera', correct: true },
        { text: '0, r es falso y eso invalida todo', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: '0, porque p es falsa', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: 'Siendo p=1 y q=0, ¿cuánto vale (p ∨ q) → (p ∧ q)?',
    options: [
      { text: '1', correct: false },
      { text: '0', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Igual que p→q', correct: false }
    ],
    justification: {
      text: 'p∨q=1, p∧q=0. Entonces 1→0=?',
      options: [
        { text: '0, es el único caso en que la implicación es falsa', correct: true },
        { text: '1, porque p∨q es verdadera', correct: false },
        { text: '1, porque la disyunción domina', correct: false },
        { text: 'Indeterminado', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: 'Sea p=0, q=0. ¿Cuánto vale -(p ∨ q) ↔ (-p ∧ -q)?',
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: 'Indeterminado', correct: false },
      { text: 'Depende de r', correct: false }
    ],
    justification: {
      text: 'p∨q=0, -(0)=1. -p=1,-q=1, -p∧-q=1. Entonces 1↔1=? (Esta es la Ley de De Morgan)',
      options: [
        { text: '1, demuestra que -(p∨q) ≡ (-p∧-q) — Ley de De Morgan', correct: true },
        { text: '0, las leyes de De Morgan no aplican aquí', correct: false },
        { text: 'Indeterminado', correct: false },
        { text: '0, porque p y q son falsas', correct: false }
      ]
    }
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: 'La Ley de De Morgan establece que -(p ∧ q) equivale a:',
    options: [
      { text: '-p ∧ -q', correct: false },
      { text: '-p ∨ -q', correct: true },
      { text: 'p ∨ q', correct: false },
      { text: '-p → -q', correct: false }
    ]
  },
  {
    type: 'mc',
    qtype: '🏁 Integrador',
    text: 'La Ley de De Morgan establece que -(p ∨ q) equivale a:',
    options: [
      { text: '-p ∨ -q', correct: false },
      { text: '-p ∧ -q', correct: true },
      { text: 'p ∧ q', correct: false },
      { text: 'p → q', correct: false }
    ]
  },

  /* REPASO ACUMULATIVO EXTRA */
  {
    type: 'review',
    title: '🔄 Repaso Extra – Leyes importantes',
    items: [
      { icon: '⚡', text: '<strong>De Morgan 1:</strong> -(p∧q) ≡ -p∨-q &nbsp;|&nbsp; La negación de una conjunción es la disyunción de las negaciones.' },
      { icon: '⚡', text: '<strong>De Morgan 2:</strong> -(p∨q) ≡ -p∧-q &nbsp;|&nbsp; La negación de una disyunción es la conjunción de las negaciones.' },
      { icon: '⚡', text: '<strong>Equivalencia p→q:</strong> p→q ≡ -p∨q &nbsp;|&nbsp; La implicación se puede reescribir como disyunción.' },
      { icon: '⚡', text: '<strong>Tautología:</strong> p∨-p siempre es V &nbsp;|&nbsp; <strong>Contradicción:</strong> p∧-p siempre es F.' },
      { icon: '⚡', text: '<strong>Doble negación:</strong> --p ≡ p.' }
    ]
  }
]; // fin CURRICULUM

/* ------------------------------------------------------------------ */
/*  ESTADO DEL JUEGO                                                    */
/* ------------------------------------------------------------------ */
const state = {
  currentIndex: 0,
  score: 0,
  errorCount: 0,          // errores en el ítem actual
  totalItems: 0,
  difficultTopics: [],    // índices de ítems con dificultad (≥2 errores)
  attemptedRetry: false,  // ya revisitó temas difíciles
  wrongAnswerCount: 0,    // errores acumulados totales
  phase: 'main',          // 'main' | 'retry'
  retryQueue: [],
  awaitingJustification: false,
  justAnsweredCorrect: false,
  streak: 0,
  maxStreak: 0
};

// Separamos los ítems en secuencia principal + colchón de refuerzo
let mainSequence = [];
const RETRY_POOL = [];

/* ------------------------------------------------------------------ */
/*  DOM REFS                                                            */
/* ------------------------------------------------------------------ */
const $ = id => document.getElementById(id);
const screenStart   = $('screen-start');
const screenLevels  = $('screen-levels');
const screenGame    = $('screen-game');
const cardDef       = $('card-definition');
const cardQ         = $('card-question');
const cardReview    = $('card-review');
const cardEnd       = $('card-end');
const popup         = $('popup');
const popupInner    = $('popup-inner');
const popupText     = $('popup-text');
const progressFill  = $('progress-fill');
const progressLabel = $('progress-label');
const scoreEl       = $('score');
const levelBadge    = $('level-badge');
const btnPrev       = $('btn-prev');
const btnExit       = $('btn-exit');

/* ------------------------------------------------------------------ */
/*  MÚSICA ELECTRÓNICA – 3 TRACKS QUE ROTAN CADA 90 SEGUNDOS          */
/* ------------------------------------------------------------------ */
let musicPlaying = false;
let musicTimeout = null;
let currentTrack = 0;
let musicGainNode = null;

// Track 0: House/Tech – bombo en cada beat, bajo sincopado
function playTrack0(c, masterGain, duration) {
  const BPM = 128, beat = 60/BPM;
  let t = c.currentTime + 0.05;
  const end = t + duration;
  while (t < end) {
    // Bombo (kick)
    const kick = c.createOscillator();
    const kickG = c.createGain();
    kick.connect(kickG); kickG.connect(masterGain);
    kick.type = 'sine';
    kick.frequency.setValueAtTime(150, t);
    kick.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    kickG.gain.setValueAtTime(0.5, t);
    kickG.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    kick.start(t); kick.stop(t + 0.2);

    // Hi-hat en contratiempo
    [beat*0.5, beat*1.5, beat*2.5, beat*3.5].forEach(offset => {
      if (t + offset >= end) return;
      const buf = c.createBuffer(1, c.sampleRate*0.04, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i=0; i<data.length; i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*0.008));
      const src = c.createBufferSource(); const hg = c.createGain();
      const hf = c.createBiquadFilter(); hf.type='highpass'; hf.frequency.value=8000;
      src.buffer=buf; src.connect(hf); hf.connect(hg); hg.connect(masterGain);
      hg.gain.value=0.08; src.start(t+offset);
    });

    // Línea de bajo electrónico
    const bassNotes = [55, 55, 62, 58, 55, 55, 67, 65];
    bassNotes.forEach((freq, i) => {
      const bt = t + i*(beat/2);
      if (bt >= end) return;
      const osc = c.createOscillator(); const bg = c.createGain();
      const bf = c.createBiquadFilter(); bf.type='lowpass'; bf.frequency.value=400;
      osc.connect(bf); bf.connect(bg); bg.connect(masterGain);
      osc.type='sawtooth'; osc.frequency.value=freq;
      bg.gain.setValueAtTime(0, bt);
      bg.gain.linearRampToValueAtTime(0.15, bt+0.02);
      bg.gain.exponentialRampToValueAtTime(0.001, bt+beat*0.45);
      osc.start(bt); osc.stop(bt+beat*0.5);
    });

    t += beat * 4;
  }
}

// Track 1: Synthwave – arpeggio melódico y pad
function playTrack1(c, masterGain, duration) {
  const BPM = 110, beat = 60/BPM;
  const scale = [261, 293, 329, 392, 440, 523, 587, 659]; // C mayor
  let t = c.currentTime + 0.05;
  const end = t + duration;
  while (t < end) {
    // Pad de fondo
    const pad = c.createOscillator(); const pg = c.createGain();
    pad.connect(pg); pg.connect(masterGain);
    pad.type='sine'; pad.frequency.value=130;
    pg.gain.setValueAtTime(0,t); pg.gain.linearRampToValueAtTime(0.06, t+0.5);
    pg.gain.linearRampToValueAtTime(0.06, t+beat*3.5);
    pg.gain.linearRampToValueAtTime(0, t+beat*4);
    pad.start(t); pad.stop(t+beat*4);

    // Arpeggio ascendente
    scale.forEach((freq, i) => {
      const at = t + i*(beat/2);
      if (at >= end) return;
      const osc = c.createOscillator(); const ag = c.createGain();
      const rev = c.createBiquadFilter(); rev.type='bandpass'; rev.frequency.value=freq*2; rev.Q.value=2;
      osc.connect(rev); rev.connect(ag); ag.connect(masterGain);
      osc.type='triangle'; osc.frequency.value=freq*2;
      ag.gain.setValueAtTime(0,at); ag.gain.linearRampToValueAtTime(0.12,at+0.03);
      ag.gain.exponentialRampToValueAtTime(0.001,at+beat*0.6);
      osc.start(at); osc.stop(at+beat*0.7);
    });

    // Kick suave
    [0, beat*2].forEach(offset => {
      if (t+offset >= end) return;
      const k = c.createOscillator(); const kg = c.createGain();
      k.connect(kg); kg.connect(masterGain);
      k.type='sine'; k.frequency.setValueAtTime(100,t+offset);
      k.frequency.exponentialRampToValueAtTime(40,t+offset+0.1);
      kg.gain.setValueAtTime(0.3,t+offset); kg.gain.exponentialRampToValueAtTime(0.001,t+offset+0.15);
      k.start(t+offset); k.stop(t+offset+0.2);
    });

    t += beat * 8;
  }
}

// Track 2: Drum & Bass relajado – ritmo rápido con melodía
function playTrack2(c, masterGain, duration) {
  const BPM = 140, beat = 60/BPM;
  const melody = [392, 440, 494, 440, 392, 349, 392, 440];
  let t = c.currentTime + 0.05;
  const end = t + duration;
  while (t < end) {
    // Snare en beat 2 y 4
    [beat, beat*3].forEach(offset => {
      if (t+offset >= end) return;
      const buf = c.createBuffer(1, c.sampleRate*0.12, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i=0; i<data.length; i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*0.025));
      const src = c.createBufferSource(); const sg = c.createGain();
      src.buffer=buf; src.connect(sg); sg.connect(masterGain);
      sg.gain.value=0.18; src.start(t+offset);
    });

    // Bombo sincopado
    [0, beat*0.75, beat*2, beat*2.5].forEach(offset => {
      if (t+offset >= end) return;
      const k=c.createOscillator(); const kg=c.createGain();
      k.connect(kg); kg.connect(masterGain);
      k.type='sine'; k.frequency.setValueAtTime(120,t+offset);
      k.frequency.exponentialRampToValueAtTime(40,t+offset+0.1);
      kg.gain.setValueAtTime(0.35,t+offset); kg.gain.exponentialRampToValueAtTime(0.001,t+offset+0.12);
      k.start(t+offset); k.stop(t+offset+0.15);
    });

    // Melodía
    melody.forEach((freq,i) => {
      const mt = t + i*(beat/2);
      if (mt >= end) return;
      const osc=c.createOscillator(); const mg2=c.createGain();
      osc.connect(mg2); mg2.connect(masterGain);
      osc.type='square'; osc.frequency.value=freq;
      const detune=c.createOscillator(); const dg=c.createGain();
      detune.connect(dg); dg.connect(masterGain);
      detune.type='square'; detune.frequency.value=freq*1.005;
      mg2.gain.setValueAtTime(0,mt); mg2.gain.linearRampToValueAtTime(0.06,mt+0.02);
      mg2.gain.exponentialRampToValueAtTime(0.001,mt+beat*0.4);
      dg.gain.setValueAtTime(0,mt); dg.gain.linearRampToValueAtTime(0.04,mt+0.02);
      dg.gain.exponentialRampToValueAtTime(0.001,mt+beat*0.4);
      osc.start(mt); osc.stop(mt+beat*0.5);
      detune.start(mt); detune.stop(mt+beat*0.5);
    });

    t += beat * 8;
  }
}

function startMusic() {
  if (musicPlaying) return;
  getCtxReady().then(c => {
    if (musicPlaying) return; // evitar doble inicio por race condition
    musicPlaying = true;
    musicGainNode = c.createGain();
    musicGainNode.gain.value = 0.35;
    musicGainNode.connect(c.destination);
    currentTrack = 0;
    scheduleTrack();
    syncMusicButtons();
  }).catch(() => {});
}

function scheduleTrack() {
  if (!musicPlaying) return;
  const c = getCtx();
  const TRACK_DURATION = 90; // segundos por track

  // Fade in
  if (musicGainNode) {
    musicGainNode.gain.setValueAtTime(0, c.currentTime);
    musicGainNode.gain.linearRampToValueAtTime(0.4, c.currentTime + 2);
  }

  if (currentTrack === 0) playTrack0(c, musicGainNode, TRACK_DURATION);
  else if (currentTrack === 1) playTrack1(c, musicGainNode, TRACK_DURATION);
  else playTrack2(c, musicGainNode, TRACK_DURATION);

  // Fade out antes de cambiar
  musicTimeout = setTimeout(() => {
    if (!musicPlaying) return;
    if (musicGainNode) {
      const c2 = getCtx();
      musicGainNode.gain.linearRampToValueAtTime(0, c2.currentTime + 2);
    }
    setTimeout(() => {
      currentTrack = (currentTrack + 1) % 3;
      if (musicGainNode) {
        const c3 = getCtx();
        musicGainNode = c3.createGain();
        musicGainNode.gain.value = 0;
        musicGainNode.connect(c3.destination);
      }
      scheduleTrack();
    }, 2500);
  }, (TRACK_DURATION - 3) * 1000);
}

function stopMusic() {
  musicPlaying = false;
  if (musicTimeout) { clearTimeout(musicTimeout); musicTimeout = null; }
  if (musicGainNode) {
    try {
      const c = getCtx();
      musicGainNode.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
    } catch(e) {}
  }
  syncMusicButtons();
}

function syncMusicButtons() {
  const icon = musicPlaying ? '🎵' : '🔇';
  const btnStart = document.getElementById('btn-music-start');
  const btnGame = document.getElementById('btn-music');
  if (btnStart) btnStart.textContent = icon;
  if (btnGame) btnGame.textContent = icon;
}

function toggleMusic() {
  if (musicPlaying) stopMusic(); else startMusic();
}

/* ------------------------------------------------------------------ */
/*  RACHA (STREAK)                                                      */
/* ------------------------------------------------------------------ */
function updateStreak(correct) {
  if (correct) {
    state.streak++;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    const el = document.getElementById('streak-display');
    const cnt = document.getElementById('streak-count');
    if (el && cnt) {
      cnt.textContent = state.streak;
      el.style.display = 'inline-flex';
      if (state.streak >= 3) {
        el.classList.add('streak-fire');
        soundStreak();
        showStreakBurst(state.streak);
      }
    }
  } else {
    state.streak = 0;
    const el = document.getElementById('streak-display');
    if (el) { el.style.display = 'none'; el.classList.remove('streak-fire'); }
  }
}

function soundStreak() {
  [880, 1100, 1320].forEach((f,i) => setTimeout(() => playTone(f,'sine',0.15,0.3), i*80));
}

function soundClick() {
  getCtxReady().then(c => {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.06, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.08);
    } catch(e) {}
  }).catch(() => {});
}

function showStreakBurst(n) {
  const burst = document.createElement('div');
  burst.className = 'streak-burst';
  burst.textContent = n >= 5 ? '🔥 ¡EN LLAMAS! x' + n : '🔥 Racha x' + n;
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 1800);
}

/* ------------------------------------------------------------------ */
/*  PISTAS PROGRESIVAS (HINT)                                           */
/* ------------------------------------------------------------------ */
function showHint(item) {
  const hintBox = document.getElementById('hint-box');
  const hintText = document.getElementById('hint-text');
  if (!hintBox || !hintText) return;

  // Generar hint automático basado en la respuesta correcta
  const correct = item.options.find(o => o.correct);
  if (!correct) return;

  // Mostrar las primeras palabras de la respuesta correcta como pista
  const words = correct.text.split(' ');
  const hint = words.length <= 3
    ? `La respuesta empieza con "${words[0]}"`
    : `Pista: la respuesta correcta menciona "${words.slice(0,2).join(' ')}..."`;

  hintText.textContent = hint;
  hintBox.classList.remove('hidden');
  hintBox.classList.add('hint-appear');
}

/* ------------------------------------------------------------------ */
/*  INDICADOR BLOOM                                                     */
/* ------------------------------------------------------------------ */
function updateBloomIndicator(levelId) {
  const el = document.getElementById('bloom-indicator');
  if (!el) return;
  const bloomLabels = [
    { icon: '🧠', label: 'Recordar', color: '#4ade80' },
    { icon: '💡', label: 'Comprender', color: '#60a5fa' },
    { icon: '⚙️', label: 'Aplicar', color: '#fb923c' },
    { icon: '🔬', label: 'Analizar', color: '#c084fc' },
    { icon: '🏆', label: 'Evaluar', color: '#f472b6' }
  ];
  const lvl = bloomLabels[levelId] || bloomLabels[0];
  el.innerHTML = `${lvl.icon} ${lvl.label}`;
  el.style.color = lvl.color;
}

/* ------------------------------------------------------------------ */
/*  POPUP FERNET                                                        */
/* ------------------------------------------------------------------ */
function soundFernet() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 'sine', 0.3, 0.6), i * 100);
  });
  setTimeout(() => {
    getCtxReady().then(c => {
      try {
        const buf    = c.createBuffer(1, c.sampleRate * 0.8, c.sampleRate);
        const data   = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.15));
        }
        const src    = c.createBufferSource();
        const gain   = c.createGain();
        const filter = c.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.5;
        src.buffer = buf;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        gain.gain.value = 0.3;
        src.start();
      } catch(e) {}
    }).catch(() => {});
  }, 400);
}

function showFernetPopup(onClose) {
  soundFernet();
  const fernetEl = $('popup-fernet');
  fernetEl.classList.remove('hidden');
  $('btn-fernet-close').onclick = () => {
    fernetEl.classList.add('hidden');
    if (typeof onClose === 'function') onClose();
  };
}

/* ------------------------------------------------------------------ */
/*  PROGRESO – localStorage                                            */
/* ------------------------------------------------------------------ */
const LS_PREFIX = 'aprendejugando_level_';

function saveProgress(levelId, index, score) {
  localStorage.setItem(LS_PREFIX + levelId + '_index', index);
  localStorage.setItem(LS_PREFIX + levelId + '_score', score);
}

function markLevelDone(levelId, score) {
  localStorage.setItem(LS_PREFIX + levelId + '_done', 'true');
  localStorage.setItem(LS_PREFIX + levelId + '_score', score);
}

function loadProgress(levelId) {
  const done  = localStorage.getItem(LS_PREFIX + levelId + '_done') === 'true';
  const index = parseInt(localStorage.getItem(LS_PREFIX + levelId + '_index') || '0', 10);
  const score = parseInt(localStorage.getItem(LS_PREFIX + levelId + '_score') || '0', 10);
  return { done, index, score };
}

function clearProgress(levelId) {
  localStorage.removeItem(LS_PREFIX + levelId + '_done');
  localStorage.removeItem(LS_PREFIX + levelId + '_index');
  localStorage.removeItem(LS_PREFIX + levelId + '_score');
}

/* ------------------------------------------------------------------ */
/*  SELECTOR DE NIVELES                                                 */
/* ------------------------------------------------------------------ */
let currentLevelId = 0; // nivel actualmente jugado

function renderLevelsGrid() {
  const grid = $('levels-grid');
  grid.innerHTML = '';

  LEVELS.forEach(lvl => {
    const progress = loadProgress(lvl.id);
    const btn = document.createElement('button');
    btn.className = 'level-item';
    btn.style.borderColor = lvl.color;

    let badgeHTML = '';
    if (progress.done) {
      badgeHTML = `<span class="level-badge-status badge-done">✓ Completado</span>`;
    } else if (progress.index > 0) {
      badgeHTML = `<span class="level-badge-status badge-progress">En progreso</span>`;
    }

    btn.innerHTML = `
      <span class="level-icon">${lvl.icon}</span>
      <span class="level-info">
        <span class="level-name">${lvl.name}</span>
        <span class="level-bloom">${lvl.bloom}</span>
      </span>
      ${badgeHTML}
    `;

    btn.addEventListener('click', () => {
      unlockAudioSync(); // desbloquear audio en el gesto del nivel
      const prog = loadProgress(lvl.id);
      if (prog.index > 0 && !prog.done) {
        // Nivel en progreso: preguntar continuar o empezar
        showLevelDialog(lvl, prog);
      } else if (prog.done) {
        // Nivel completado: preguntar si quiere repetir
        showLevelDialog(lvl, prog);
      } else {
        startLevel(lvl.id, 0);
      }
    });

    grid.appendChild(btn);
  });
}

function showLevelDialog(lvl, prog) {
  // Crear overlay de diálogo
  const overlay = document.createElement('div');
  overlay.className = 'level-dialog-overlay';

  const msg = prog.done
    ? '¿Deséas jugar de nuevo este nivel?'
    : `¿Querés continuar donde dejaste (punto ${prog.index}) o empezar desde el inicio?`;

  overlay.innerHTML = `
    <div class="level-dialog">
      <h3>${lvl.icon} ${lvl.name}</h3>
      <p>${msg}</p>
      <div class="level-dialog-btns">
        <button id="dlg-continue" class="btn btn-primary">Continuar</button>
        <button id="dlg-restart" class="btn btn-nav">Empezar de nuevo</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#dlg-continue').addEventListener('click', () => {
    document.body.removeChild(overlay);
    startLevel(lvl.id, prog.done ? 0 : prog.index);
  });
  overlay.querySelector('#dlg-restart').addEventListener('click', () => {
    clearProgress(lvl.id);
    document.body.removeChild(overlay);
    startLevel(lvl.id, 0);
  });
  // Cerrar al hacer click fuera
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  });
}

function startLevel(levelId, startIdx) {
  currentLevelId = levelId;
  buildSequenceForLevel(levelId, startIdx);
  switchScreen(screenLevels, screenGame);
  startMusic();
  syncMusicButtons();
  showCurrentItem();
}

/* ------------------------------------------------------------------ */
/*  INICIALIZACIÓN                                                      */
/* ------------------------------------------------------------------ */
// Historial de navegación para el botón Anterior
let navHistory = [];

function buildSequence() {
  buildSequenceForLevel(0, 0);
}

function buildSequenceForLevel(levelId, startIdx) {
  const lvl = LEVELS[levelId];
  const end = Math.min(lvl.endIndex + 1, CURRICULUM.length);
  const slice = CURRICULUM.slice(lvl.startIndex, end);
  // Offset dentro del slice
  const offsetInSlice = Math.max(0, startIdx - lvl.startIndex);
  mainSequence = slice.slice(offsetInSlice);
  state._levelStartSliceIndex = lvl.startIndex + offsetInSlice;
  state._levelId = levelId;
  state.totalItems = mainSequence.length;
  state.currentIndex = 0;
  state.score = 0;
  state.errorCount = 0;
  state.difficultTopics = [];
  state.retryQueue = [];
  state.phase = 'main';
  state.awaitingJustification = false;
  state.streak = 0;
  state.maxStreak = 0;
  navHistory = [];
  // Actualizar badge del nivel en header
  levelBadge.textContent = LEVELS[levelId].name;
  updateBloomIndicator(levelId);
}

// El primer gesto real del usuario es tocar "Jugar" — ahí desbloqueamos el audio
$('btn-play').addEventListener('click', () => {
  unlockAudioSync(); // sincrónico dentro del gesto → iOS lo acepta
  renderLevelsGrid();
  switchScreen(screenStart, screenLevels);
});

// También escuchamos cualquier otro toque como respaldo
function unlockAudio() {
  if (!audioUnlocked) unlockAudioSync();
}
document.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio, { passive: true });

$('btn-levels-back').addEventListener('click', () => {
  switchScreen(screenLevels, screenStart);
});

$('btn-restart').addEventListener('click', () => {
  stopMusic();
  syncMusicButtons();
  renderLevelsGrid();
  switchScreen(screenGame, screenLevels);
});

$('btn-back-levels').addEventListener('click', () => {
  stopMusic();
  syncMusicButtons();
  renderLevelsGrid();
  switchScreen(screenGame, screenLevels);
});

// Botón MÚSICA en juego
$('btn-music').addEventListener('click', toggleMusic);
// Botón MÚSICA en portada
$('btn-music-start').addEventListener('click', toggleMusic);

// Botón ANTERIOR
btnPrev.addEventListener('click', () => {
  if (navHistory.length === 0) return;
  state.currentIndex = navHistory.pop();
  state.errorCount = 0;
  state.awaitingJustification = false;
  updateNavButtons();
  showCurrentItem();
});

// Botón SALIR
btnExit.addEventListener('click', () => {
  if (confirm('¿Querés salir? Tu progreso actual se perderá.')) {
    stopMusic();
    syncMusicButtons();
    // Guardar progreso actual
    const lvl = LEVELS[state._levelId || 0];
    const absoluteIndex = lvl.startIndex + state.currentIndex;
    saveProgress(state._levelId || 0, absoluteIndex, state.score);
    renderLevelsGrid();
    switchScreen(screenGame, screenLevels);
  }
});

function updateNavButtons() {
  btnPrev.disabled = navHistory.length === 0;
}

/* ------------------------------------------------------------------ */
/*  NAVEGACIÓN                                                          */
/* ------------------------------------------------------------------ */
function switchScreen(from, to) {
  from.classList.remove('active');
  from.style.display = 'none';   // ocultar pantalla anterior
  to.style.display = 'flex';
  to.classList.add('active');
  window.scrollTo(0, 0);         // siempre arrancar desde arriba
}

function hideAllCards() {
  [cardDef, cardQ, cardReview, cardEnd].forEach(c => c.classList.add('hidden'));
}

function updateProgress() {
  const total  = mainSequence.length + state.retryQueue.length;
  const done   = state.currentIndex;
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `${done} / ${total}`;

  // Nivel
  if (pct < 30)       levelBadge.textContent = 'Nivel 1 – Básico';
  else if (pct < 60)  levelBadge.textContent = 'Nivel 2 – Medio';
  else if (pct < 85)  levelBadge.textContent = 'Nivel 3 – Avanzado';
  else                levelBadge.textContent = 'Nivel 4 – Experto';

  scoreEl.textContent = state.score;
}

/* ------------------------------------------------------------------ */
/*  MOSTRAR ÍTEM ACTUAL                                                 */
/* ------------------------------------------------------------------ */
function showCurrentItem() {
  state.errorCount = 0;
  state.awaitingJustification = false;
  updateProgress();
  updateNavButtons();

  // Guardar progreso automáticamente
  if (state._levelId !== undefined) {
    const lvl = LEVELS[state._levelId];
    const absoluteIndex = lvl.startIndex + state.currentIndex;
    saveProgress(state._levelId, absoluteIndex, state.score);
  }

  const sequence = state.phase === 'main' ? mainSequence : state.retryQueue;

  if (state.currentIndex >= sequence.length) {
    if (state.phase === 'main' && state.retryQueue.length > 0) {
      // Hay temas difíciles para revisar
      state.phase = 'retry';
      state.currentIndex = 0;
      showCurrentItem();
    } else {
      showEndCard();
    }
    return;
  }

  const item = sequence[state.currentIndex];
  hideAllCards();

  switch (item.type) {
    case 'definition': showDefinition(item); break;
    case 'review':     showReview(item);     break;
    default:           showQuestion(item);   break;
  }
}

/* ------------------------------------------------------------------ */
/*  TARJETA DE DEFINICIÓN                                               */
/* ------------------------------------------------------------------ */
function showDefinition(item) {
  $('def-title').textContent = item.title;
  $('def-body').innerHTML = item.body;
  cardDef.classList.remove('hidden');

  $('btn-continue-def').onclick = () => {
    soundClick();
    navHistory.push(state.currentIndex);
    state.currentIndex++;
    showCurrentItem();
  };
}

/* ------------------------------------------------------------------ */
/*  TARJETA DE REPASO                                                   */
/* ------------------------------------------------------------------ */
function showReview(item) {
  $('review-title').textContent = item.title;
  const container = $('review-items');
  container.innerHTML = '';
  item.items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `<span class="review-icon">${it.icon}</span><span>${it.text}</span>`;
    container.appendChild(div);
  });
  cardReview.classList.remove('hidden');

  $('btn-continue-review').onclick = () => {
    soundClick();
    navHistory.push(state.currentIndex);
    state.currentIndex++;
    showCurrentItem();
  };
}

/* ------------------------------------------------------------------ */
/*  TARJETA DE PREGUNTA                                                 */
/* ------------------------------------------------------------------ */
function showQuestion(item) {
  $('q-type-badge').textContent = item.qtype || '❓ Pregunta';
  $('q-number').textContent = `Ítem ${state.currentIndex + 1}`;
  $('q-text').textContent = item.text;

  const grid = $('options-grid');
  grid.innerHTML = '';

  const justWrap = $('justification-wrap');
  justWrap.classList.add('hidden');
  $('just-options-grid').innerHTML = '';

  const btnContinue = $('btn-continue-q');
  btnContinue.classList.add('hidden');

  // Ocultar hint al inicio
  document.getElementById('hint-box')?.classList.add('hidden');

  cardQ.classList.remove('hidden');

  item.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.dataset.correct = opt.correct;
    btn.dataset.idx = idx;
    btn.addEventListener('click', () => {
      soundClick();
      handleAnswer(btn, opt.correct, item, grid);
    });
    grid.appendChild(btn);
  });
}

function handleAnswer(btn, isCorrect, item, grid) {
  // Deshabilitar todos los botones del grid actual
  const allBtns = grid.querySelectorAll('.option-btn');
  allBtns.forEach(b => b.disabled = true);

  if (isCorrect) {
    btn.classList.add('correct');
    soundSuccess();
    showPopup(true, randomMsg(MSGS_CORRECT));
    if (!state.awaitingJustification) updateStreak(true);

    if (!state.awaitingJustification && item.justification) {
      // Hay justificación: mostrarla sin avanzar aún
      setTimeout(() => {
        hidePopup();
        showJustification(item);
      }, 1600);
    } else {
      // Sin justificación o ya respondió justificación: habilitar Continuar
      state.score += (state.errorCount === 0 ? 10 : 5);
      scoreEl.textContent = state.score;
      setTimeout(() => {
        hidePopup();
        $('btn-continue-q').classList.remove('hidden');
        $('btn-continue-q').onclick = () => {
          soundClick();
          navHistory.push(state.currentIndex);
          state.currentIndex++;
          showCurrentItem();
        };
      }, 1600);
    }
  } else {
    btn.classList.add('wrong');
    soundError();
    showPopup(false, randomMsg(MSGS_WRONG));
    state.errorCount++;
    state.wrongAnswerCount++;
    if (!state.awaitingJustification) updateStreak(false);

    // Re-habilitar botones correctos para reintentar
    setTimeout(() => {
      hidePopup();
      allBtns.forEach(b => {
        if (!b.classList.contains('wrong') && !b.classList.contains('correct')) {
          b.disabled = false;
        }
      });

      // Si erró 2 veces → mostrar respuesta correcta, hint y botón continuar
      if (state.errorCount >= 2) {
        const sequence = state.phase === 'main' ? mainSequence : state.retryQueue;
        const currentItem = sequence[state.currentIndex];
        // Agregar a cola de repaso si no está ya
        const alreadyQueued = state.retryQueue.some(i => i === currentItem);
        if (!alreadyQueued && state.phase === 'main') {
          state.retryQueue.push(currentItem);
        }
        showHint(item);

        // Revelar la respuesta correcta y desbloquear el avance
        allBtns.forEach(b => {
          b.disabled = true;
          if (b.dataset.correct === 'true') {
            b.classList.add('correct');
          }
        });

        // Mostrar botón CONTINUAR con mensaje claro
        const btnContinue = $('btn-continue-q');
        btnContinue.textContent = '✓ Ver respuesta y continuar →';
        btnContinue.classList.remove('hidden');
        btnContinue.onclick = () => {
          btnContinue.textContent = 'Continuar →'; // restaurar texto original
          soundClick();
          navHistory.push(state.currentIndex);
          state.currentIndex++;
          showCurrentItem();
        };
      }
    }, 2800);
  }
}

function showJustification(item) {
  state.awaitingJustification = true;
  const justWrap = $('justification-wrap');
  const justGrid = $('just-options-grid');
  justWrap.classList.remove('hidden');
  justGrid.innerHTML = '';

  const justQuestion = document.createElement('p');
  justQuestion.className = 'just-label';
  justQuestion.textContent = item.justification.text;
  // Insert before grid (already in HTML)

  item.justification.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      soundClick();
      const allJ = justGrid.querySelectorAll('.option-btn');
      allJ.forEach(b => b.disabled = true);

      if (opt.correct) {
        btn.classList.add('correct');
        soundSuccess();
        showPopup(true, randomMsg(MSGS_CORRECT));
        updateStreak(true);
        state.score += (state.errorCount === 0 ? 10 : 5);
        scoreEl.textContent = state.score;
        setTimeout(() => {
          hidePopup();
          $('btn-continue-q').classList.remove('hidden');
          $('btn-continue-q').onclick = () => {
            soundClick();
            navHistory.push(state.currentIndex);
            state.currentIndex++;
            showCurrentItem();
          };
        }, 1600);
      } else {
        btn.classList.add('wrong');
        soundError();
        showPopup(false, randomMsg(MSGS_WRONG));
        updateStreak(false);
        state.errorCount++;
        setTimeout(() => {
          hidePopup();

          if (state.errorCount >= 2) {
            // Revelar respuesta correcta en la justificación y dejar avanzar
            allJ.forEach(b => {
              b.disabled = true;
              if (b.dataset && b._isCorrect) b.classList.add('correct');
            });
            // Buscar y resaltar el botón correcto por texto
            allJ.forEach(b => {
              if (b.classList.contains('wrong')) return;
              b.disabled = true;
            });
            item.justification.options.forEach((opt, idx) => {
              if (opt.correct) {
                const btns = justGrid.querySelectorAll('.option-btn');
                if (btns[idx]) btns[idx].classList.add('correct');
              }
            });
            const btnContinue = $('btn-continue-q');
            btnContinue.textContent = '✓ Ver respuesta y continuar →';
            btnContinue.classList.remove('hidden');
            btnContinue.onclick = () => {
              btnContinue.textContent = 'Continuar →';
              soundClick();
              navHistory.push(state.currentIndex);
              state.currentIndex++;
              showCurrentItem();
            };
          } else {
            allJ.forEach(b => {
              if (!b.classList.contains('wrong') && !b.classList.contains('correct')) {
                b.disabled = false;
              }
            });
          }
        }, 2800);
      }
    });
    justGrid.appendChild(btn);
  });
}

/* ------------------------------------------------------------------ */
/*  POPUP FEEDBACK                                                      */
/* ------------------------------------------------------------------ */
function showPopup(success, msg) {
  popupText.textContent = msg;
  popupInner.className = 'popup-inner ' + (success ? 'success' : 'error');
  popup.classList.remove('hidden');
}

function hidePopup() {
  popup.classList.add('hidden');
}

/* ------------------------------------------------------------------ */
/*  TARJETA FINAL                                                       */
/* ------------------------------------------------------------------ */
function showEndCard() {
  // Guardar nivel como completado
  const levelId = state._levelId || 0;
  markLevelDone(levelId, state.score);

  hideAllCards();
  cardEnd.classList.remove('hidden');

  const total = mainSequence.length;
  const wrong = state.wrongAnswerCount;

  document.getElementById('stat-correct').textContent = Math.round(state.score / 8);
  document.getElementById('stat-wrong').textContent = wrong;
  document.getElementById('stat-streak').textContent = state.maxStreak || 0;
  document.getElementById('final-score').textContent = state.score;

  const pct = total > 0 ? Math.round((state.score / (total * 10)) * 100) : 0;

  let msg = '', suggestion = '', bloomMsg = '';
  if (pct >= 90) {
    msg = '¡Dominio excelente! Sos un crack de la lógica. 🧠';
    suggestion = '✨ Estás listo para el siguiente nivel.';
    bloomMsg = '🏆 Nivel cognitivo alcanzado: <strong>Síntesis y Evaluación</strong>';
  } else if (pct >= 70) {
    msg = '¡Muy bien! Dominás los conceptos principales.';
    suggestion = '📖 Repasá los temas donde cometiste errores antes de avanzar.';
    bloomMsg = '💡 Nivel cognitivo alcanzado: <strong>Análisis</strong>';
  } else if (pct >= 50) {
    msg = 'Bien encaminado, seguí practicando.';
    suggestion = '🔄 Te recomendamos repetir este nivel para consolidar el aprendizaje.';
    bloomMsg = '⚙️ Nivel cognitivo: <strong>Comprensión en desarrollo</strong>';
  } else {
    msg = '¡No te rindas! La práctica hace al maestro.';
    suggestion = '📚 Revisá los apuntes y volvé a intentarlo. Cada intento mejora.';
    bloomMsg = '🧠 Nivel cognitivo: <strong>Recordar — seguí construyendo</strong>';
  }

  document.getElementById('end-msg').textContent = msg;
  document.getElementById('end-suggestion').innerHTML = suggestion;
  document.getElementById('end-bloom-badge').innerHTML = bloomMsg;

  progressFill.style.width = '100%';
  progressLabel.textContent = 'Completado';

  showFernetPopup(() => {});
}

/* ------------------------------------------------------------------ */
/*  BOTÓN COMPARTIR                                                     */
/* ------------------------------------------------------------------ */
(function initShare() {
  const GAME_URL = 'https://nw7d1q9-7gcep2t-4j4f.vercel.app';
  const btn = document.getElementById('btn-share');
  const toast = document.getElementById('share-toast');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    // 1. Intentar la Web Share API (móvil)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aprende Jugando – Lógica Computacional',
          text: '\uD83C\uDFAE Jugá y aprendé Lógica Computacional con este juego del IES9008 Manuel Belgrano. \uD83C\uDDE6\uD83C\uDDF7',
          url: GAME_URL
        });
        return;
      } catch (_) { /* usuario canceló o no soportado */ }
    }

    // 2. Copiar al portapapeles (escritorio)
    try {
      await navigator.clipboard.writeText(GAME_URL);
    } catch (_) {
      // Fallback antiguo
      const ta = document.createElement('textarea');
      ta.value = GAME_URL;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // 3. Mostrar toast por 2.5 s
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2500);
  });
}());

/* ------------------------------------------------------------------ */
/*  CONTADOR DE VISITAS                                                 */
/* ------------------------------------------------------------------ */
(function trackVisit() {
  // Usar countapi.xyz — namespace único para este proyecto
  const NAMESPACE = 'aprende-jugando-ies9008';
  const KEY = 'visitas';

  fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`)
    .then(r => r.json())
    .then(data => {
      // Guardar en localStorage para referencia local
      localStorage.setItem('aprendejugando_total_visitas', data.value);
      console.log('Visita registrada. Total:', data.value);

      // Enviar notificación a Fernando cada 10 visitas via ntfy.sh (servicio push gratuito)
      if (data.value % 10 === 0) {
        fetch('https://ntfy.sh/aprende-jugando-ies9008-fernando', {
          method: 'POST',
          headers: {
            'Title': '🎓 Aprende Jugando – Visitas',
            'Priority': 'default',
            'Tags': 'school,argentina'
          },
          body: `¡Ya llegaste a ${data.value} visitas en el juego! 🇦🇷`
        }).catch(() => {});
      }
    })
    .catch(() => {});
})();

/* ------------------------------------------------------------------ */
/*  INICIO AUTOMÁTICO                                                   */
/* ------------------------------------------------------------------ */
// Se activa cuando el usuario hace clic en el botón Jugar (ya enlazado arriba)
