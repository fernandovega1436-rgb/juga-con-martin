/* ============================================================
   JUGÁ CON MARTÍN – Lógica Computacional
   IES9008 Manuel Belgrano
   script.js  –  Lógica pedagógica + banco de preguntas
   ============================================================ */

'use strict';

/* ------------------------------------------------------------------ */
/*  AUDIO (Web Audio API – sin archivos externos)                      */
/* ------------------------------------------------------------------ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(freq, type, duration, vol = 0.4) {
  try {
    const c = getCtx();
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
En Ciencias de la Computación, la lógica formal sirve para:
<br><br>
• <strong>Demostrar</strong> que los programas funcionan correctamente.<br>
• <strong>Especificar</strong> el comportamiento de sistemas sin ambigüedad.<br>
• <strong>Construir</strong> sistemas de inteligencia artificial (como PROLOG, surgido en 1972).
<br><br>
Existen dos tipos principales de lógica formal: la <strong>Lógica Proposicional</strong> (de proposiciones) y la <strong>Lógica de Predicados</strong>.`
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
      { text: 'No, porque su valor de verdad depende de los valores de x e y', correct: false },
      { text: 'No en el sentido estricto: es una proposición abierta (depende de variables)', correct: true }
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
  <tr><td>Recíproca</td><td>q → p</td><td>Se obtiene invirtiendo antecedente y consecuente</td></tr>
  <tr><td>Contrarrecíproca</td><td>-q → -p</td><td>Equivalente lógica a la directa</td></tr>
</table>
<br>
<strong>Importante:</strong> la implicación directa y su contrarrecíproca son <strong>equivalentes</strong>. La recíproca NO es equivalente a la directa en general.
<br><br>
<span class='example'>Directa: "Si p entonces q" (p → q)<br>
Recíproca: "Si q entonces p" (q → p)<br>
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
  justAnsweredCorrect: false
};

// Separamos los ítems en secuencia principal + colchón de refuerzo
let mainSequence = [];
const RETRY_POOL = [];

/* ------------------------------------------------------------------ */
/*  DOM REFS                                                            */
/* ------------------------------------------------------------------ */
const $ = id => document.getElementById(id);
const screenStart   = $('screen-start');
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

/* ------------------------------------------------------------------ */
/*  INICIALIZACIÓN                                                      */
/* ------------------------------------------------------------------ */
function buildSequence() {
  mainSequence = [...CURRICULUM];
  state.totalItems = mainSequence.length;
  state.currentIndex = 0;
  state.score = 0;
  state.errorCount = 0;
  state.difficultTopics = [];
  state.retryQueue = [];
  state.phase = 'main';
  state.awaitingJustification = false;
}

$('btn-play').addEventListener('click', () => {
  buildSequence();
  switchScreen(screenStart, screenGame);
  showCurrentItem();
});

$('btn-restart').addEventListener('click', () => {
  switchScreen(screenGame, screenStart);
});

/* ------------------------------------------------------------------ */
/*  NAVEGACIÓN                                                          */
/* ------------------------------------------------------------------ */
function switchScreen(from, to) {
  from.classList.remove('active');
  to.style.display = 'flex';
  to.classList.add('active');
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

  cardQ.classList.remove('hidden');

  item.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.dataset.correct = opt.correct;
    btn.dataset.idx = idx;
    btn.addEventListener('click', () => handleAnswer(btn, opt.correct, item, grid));
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
    showPopup(true, '🐷 ¡Excelente cabeza de chancho!');

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
          state.currentIndex++;
          showCurrentItem();
        };
      }, 1600);
    }
  } else {
    btn.classList.add('wrong');
    soundError();
    showPopup(false, '🔔 ¡Te equivocaste chinchulín!');
    state.errorCount++;
    state.wrongAnswerCount++;

    // Re-habilitar botones correctos para reintentar
    setTimeout(() => {
      hidePopup();
      allBtns.forEach(b => {
        if (!b.classList.contains('wrong') && !b.classList.contains('correct')) {
          b.disabled = false;
        }
      });

      // Si erró 2 veces → marcar tema difícil
      if (state.errorCount >= 2) {
        const sequence = state.phase === 'main' ? mainSequence : state.retryQueue;
        const currentItem = sequence[state.currentIndex];
        // Agregar a cola de repaso si no está ya
        const alreadyQueued = state.retryQueue.some(i => i === currentItem);
        if (!alreadyQueued && state.phase === 'main') {
          // Crear variante de refuerzo si la tiene, o re-usar el mismo ítem
          state.retryQueue.push(currentItem);
        }
      }
    }, 1500);
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
      const allJ = justGrid.querySelectorAll('.option-btn');
      allJ.forEach(b => b.disabled = true);

      if (opt.correct) {
        btn.classList.add('correct');
        soundSuccess();
        showPopup(true, '🐷 ¡Excelente cabeza de chancho!');
        state.score += (state.errorCount === 0 ? 10 : 5);
        scoreEl.textContent = state.score;
        setTimeout(() => {
          hidePopup();
          $('btn-continue-q').classList.remove('hidden');
          $('btn-continue-q').onclick = () => {
            state.currentIndex++;
            showCurrentItem();
          };
        }, 1600);
      } else {
        btn.classList.add('wrong');
        soundError();
        showPopup(false, '🔔 ¡Te equivocaste chinchulín!');
        setTimeout(() => {
          hidePopup();
          allJ.forEach(b => {
            if (!b.classList.contains('wrong') && !b.classList.contains('correct')) {
              b.disabled = false;
            }
          });
        }, 1500);
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
  hideAllCards();
  cardEnd.classList.remove('hidden');
  $('final-score').textContent = state.score;

  const total = mainSequence.length;
  const pct   = Math.round((state.score / (total * 10)) * 100);
  let msg = '';
  if (pct >= 90)      msg = '¡Sos un crack de la lógica! 🧠';
  else if (pct >= 70) msg = '¡Muy bien! Dominás los conceptos principales.';
  else if (pct >= 50) msg = 'Bien encaminado, seguí practicando.';
  else                msg = 'Revisá los apuntes y volvé a intentarlo. ¡Podés!';

  $('end-msg').textContent = msg;
  progressFill.style.width = '100%';
  progressLabel.textContent = 'Completado';
}

/* ------------------------------------------------------------------ */
/*  INICIO AUTOMÁTICO                                                   */
/* ------------------------------------------------------------------ */
// Se activa cuando el usuario hace clic en el botón Jugar (ya enlazado arriba)
