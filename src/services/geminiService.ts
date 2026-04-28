import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MagiInterpretation {
  firma: string;
  melchior: string; // The "Structure" perspective
  balthasar: string; // The "Flow" perspective
  casper: string; // The "Action" perspective
  poema: string; // A short mystical concluding verse
}

export interface NarrativeState {
  cp: number[];
  tension: number;
  coherence: number;
  stage: string;
  arcano: string;
  universe: string;
  history: string[];
  lang: string;
  analysis?: UniverseAnalysis;
}

export interface UniverseAnalysis {
  archetype: string;
  isomorphisms: string[];
  skeleton: string;
  atmosphere: string;
  lugares: { nombre: string; firma: string; desc: string }[];
  npcs: { nombre: string; arquetipo: string; polaridad: string }[];
  tensiones: string[];
  arcanosMapeo: { arcano: string; elemento: string; opuesto: string }[];
  chakrasMapeo: { nombre: string; forma: string; desafio: string }[];
}

export interface PreludeQuestion {
  id: number;
  pregunta: string;
  opcionA: { texto: string; efecto: number[] };
  opcionB: { texto: string; efecto: number[] };
}

export interface NarrativeResponse {
  narrativa: string;
  eventos: string;
  siguienteAccion?: string;
  preguntaIdentidad: string;
  firmaActual: string;
  integraOpuesto: boolean;
}

function cleanJson(text: string): string {
  try {
    // Try to find the first block that looks like JSON
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      return match[0];
    }
    return text;
  } catch {
    return text;
  }
}

export async function getPreludeQuestions(
  universe: string,
  lang: string
): Promise<PreludeQuestion[]> {
  const prompt = `
    Como el Constructor de Identidades del Amalgam Engine.
    PARA EL UNIVERSO: ${universe}
    IDIOMA: ${lang}

    GENERA 5 PREGUNTAS DE PRELUDIO. Cada una debe medir una tensión polar en el jugador (Ej: Orden vs Caos, Acción vs Contemplación).
    Las opciones deben ser evocadoras y ligadas al tono del universo.
    Cada opción debe tener un "efecto" que es un array de 7 números (del -0.2 al 0.2) representando el impacto en el vector CP.

    RETORNA UN JSON con la propiedad "questions" que sea una lista de objetos con id, pregunta, opcionA y opcionB (con texto y efecto).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  pregunta: { type: Type.STRING },
                  opcionA: {
                    type: Type.OBJECT,
                    properties: {
                      texto: { type: Type.STRING },
                      efecto: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                    },
                    required: ["texto", "efecto"]
                  },
                  opcionB: {
                    type: Type.OBJECT,
                    properties: {
                      texto: { type: Type.STRING },
                      efecto: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                    },
                    required: ["texto", "efecto"]
                  }
                },
                required: ["id", "pregunta", "opcionA", "opcionB"]
              }
            }
          },
          required: ["questions"]
        }
      },
    });

    const cleaned = cleanJson(response.text || "{}");
    const data = JSON.parse(cleaned);
    return data.questions || [];
  } catch (error) {
    console.error("Prelude Error:", error);
    return [];
  }
}

export async function getUniverseAnalysis(
  universe: string,
  arcano: string,
  lang: string
): Promise<UniverseAnalysis> {
  const prompt = `
    Eres el Analista Ontológico del Amalgam Engine V9.
    Realiza un análisis fractal de la Semilla: ${universe} con el Arcano: ${arcano}.

    DEBES GENERAR UN JSON CON LOS SIGUIENTES CAMPOS (TODOS DEBEN SER STRINGS O ARRAYS DE STRINGS, NUNCA OBJETOS ANIDADOS DENTRO DE LAS PROPIEDADES DE TEXTO):
    1. archetype: Arquetipo del jugador (String).
    2. isomorphisms: Conceptos base (Array of Strings).
    3. skeleton: El esqueleto de la historia (Un solo bucle del Viaje del Héroe).
    4. atmosphere: Tono estético.
    5. lugares: 3 lugares vinculados al NOE (Objeto con nombre, firma, desc como Strings).
    6. npcs: 3 personajes con polaridades (Objeto con nombre, arquetipo, polaridad como Strings).
    7. tensiones: 3 tensiones nucleares (Array of Strings).
    8. arcanosMapeo: Mapea 10 de los 21 Arcanos restantes a elementos del mundo en pares de opuestos (Ej: El Sol y La Luna representados por dos facciones).
    9. chakrasMapeo: Define los 7 Chakras/puntos de poder en este mundo, su FORMA y el DESAFÍO de integración.

    IMPORTANTE: No devuelvas objetos para 'arquetipo' o 'polaridad'. Deben ser descripciones en texto plano.

    Genera el JSON en ${lang}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: { type: Type.STRING },
            isomorphisms: { type: Type.ARRAY, items: { type: Type.STRING } },
            skeleton: { type: Type.STRING },
            atmosphere: { type: Type.STRING },
            lugares: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING },
                  firma: { type: Type.STRING },
                  desc: { type: Type.STRING },
                },
                required: ["nombre", "firma", "desc"]
              }
            },
            npcs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING },
                  arquetipo: { type: Type.STRING },
                  polaridad: { type: Type.STRING },
                },
                required: ["nombre", "arquetipo", "polaridad"]
              }
            },
            tensiones: { type: Type.ARRAY, items: { type: Type.STRING } },
            arcanosMapeo: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  arcano: { type: Type.STRING },
                  elemento: { type: Type.STRING },
                  opuesto: { type: Type.STRING },
                },
                required: ["arcano", "elemento", "opuesto"]
              }
            },
            chakrasMapeo: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING },
                  forma: { type: Type.STRING },
                  desafio: { type: Type.STRING },
                },
                required: ["nombre", "forma", "desafio"]
              }
            }
          },
          required: ["archetype", "isomorphisms", "skeleton", "atmosphere", "lugares", "npcs", "tensiones", "arcanosMapeo", "chakrasMapeo"],
        },
      },
    });

    const cleaned = cleanJson(response.text || "{}");
    return JSON.parse(cleaned) as UniverseAnalysis;
  } catch (error) {
    return {
      archetype: "Desconocido",
      isomorphisms: [],
      skeleton: "Un camino oscuro",
      atmosphere: "Gris",
      lugares: [],
      npcs: [],
      tensiones: [],
      arcanosMapeo: [],
      chakrasMapeo: []
    };
  }
}

export async function getNarrativeAction(
  state: NarrativeState,
  userAction: string
): Promise<NarrativeResponse> {
  const prompt = `
    Eres el Amalgam Engine V9.
    
    ESTADO ACTUAL:
    - Análisis: ${JSON.stringify(state.analysis)}
    - CP Actual (Identidad): [${state.cp.map(n => n.toFixed(2)).join(', ')}] (Establece la perspectiva del mundo).
    - Etapa Viaje del Héroe: ${state.stage}
    - Nivel de Integración: ${state.coherence.toFixed(2)}
    
    ACCIÓN: "${userAction}"

    REGLAS ONTOLÓGICAS:
    1. IDIOMA: ${state.lang}.
    2. DIÁLOGOS ORIGINALES: No uses frases genéricas. Los NPCs deben hablar desde su polaridad específica (${state.analysis?.npcs.map(n => n.nombre + ": " + n.polaridad).join(", ")}) filtrada por el CP del jugador.
    3. PERSPECTIVA DINÁMICA: El CP [${state.cp.map(n => n.toFixed(2)).join(', ')}] es la lente del jugador. Si el CP es alto en tensiones destructivas, el mundo se ve hostil; si es armónico, se ve interconectado. No describas el mundo de forma objetiva, describe la PERCEPCIÓN del jugador.
    4. TENSIÓN NUCLEARES: Cada interacción debe girar en torno a: ${state.analysis?.tensiones.join(", ")}.
    5. INTEGRACIÓN: Evalúa si el jugador está resolviendo o exacerbando las tensiones. Pon "integraOpuesto: true" solo si hay un avance real en la resolución de una dualidad.
    6. PREGUNTA: La pregunta final debe ser una encrucijada filosófica ligada al Arcano Maestro y la Etapa del Héroe actual.
    
    JSON: { narrativa, eventos, siguienteAccion, preguntaIdentidad, firmaActual, integraOpuesto }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const cleaned = cleanJson(response.text || "{}");
    return JSON.parse(cleaned) as NarrativeResponse;
  } catch (error) {
    return {
      narrativa: "El motor busca una nueva geodésica.",
      eventos: "Falla de sincronización.",
      preguntaIdentidad: "¿Cómo reconstruirás el vacío?",
      firmaActual: "S { Ξ }",
      integraOpuesto: false
    };
  }
}

