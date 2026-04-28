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
}

export interface NarrativeResponse {
  narrativa: string;
  eventos: string;
  siguienteAccion?: string;
}

export async function getUniverseAnalysis(
  universe: string,
  arcano: string,
  lang: string
): Promise<UniverseAnalysis> {
  const prompt = `
    Eres el Analista Simbólico del Amalgam Engine.
    TU TAREA: Realizar un análisis profundo de la "Semilla de Universo" y su relación isomorfa con el "Arcano Maestro" del jugador.

    SEMILLA: ${universe}
    ARCANO: ${arcano}
    IDIOMA: ${lang}

    DEBES GENERAR:
    1. Arquetipo del Protagonista: Cómo se manifiesta ese Arcano como personaje en ese universo específico.
    2. Isomorfismos: 3-4 conceptos o elementos del universo que reflejan directamente la física simbólica del Arcano.
    3. Esqueleto Fractal (Skelton): Una estructura ósea de la historia (inicio, tensión, resolución simbólica) que se adapta al viaje del héroe.
    4. Atmósfera: La cualidad estética y tonal de este mundo.

    Genera un JSON en el idioma solicitado (${lang}).
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
            isomorphisms: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            skeleton: { type: Type.STRING },
            atmosphere: { type: Type.STRING },
          },
          required: ["archetype", "isomorphisms", "skeleton", "atmosphere"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as UniverseAnalysis;
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      archetype: "Desconocido",
      isomorphisms: [],
      skeleton: "Un camino oscuro",
      atmosphere: "Gris"
    };
  }
}

export async function getNarrativeAction(
  state: NarrativeState,
  userAction: string
): Promise<NarrativeResponse> {
  const prompt = `
    Eres el Amalgam Engine V8. Novela interactiva de alta fidelidad simbólica.
    
    CONOCIMIENTO PROFUNDO DEL MUNDO:
    - Análisis Estructural: ${JSON.stringify(state.analysis)}
    - Arquetipo Protagonista: ${state.analysis?.archetype}
    - Esqueleto Fractal: ${state.analysis?.skeleton}
    
    ESTADO DEL JUGADOR:
    - Universo: ${state.universe}
    - Arcano: ${state.arcano}
    - Viaje: ${state.stage}
    - Coherencia: ${state.coherence.toFixed(4)}
    - Tensión: ${state.tension.toFixed(4)}
    
    ACCIÓN DEL JUGADOR: "${userAction}"

    REGLAS:
    1. IDIOMA: ${state.lang}.
    2. Usa el Arquetipo y el Esqueleto Fractal para guiar la narrativa, pero que nazca de la interacción actual.
    3. No reveles términos técnicos. 
    4. Estilo literario coherente con: ${state.analysis?.atmosphere || state.universe}.
    4. RESPUESTA: Describe qué sucede, refleja el modo (integración/ruptura) y avanza sutilmente la etapa del héroe.
    5. DIBUJOS: Si el jugador menciona que ha realizado un dibujo, interpreta ese acto como una manifestación física de su alma que altera el entorno del relato.
    
    Genera un JSON con:
    - narrativa: 2-3 párrafos inmersivos (usa Markdown para énfasis si es necesario).
    - eventos: Una frase corta que describa el cambio simbólico (ej: "La brújula apunta al norte invisible").
    - siguienteAccion: Una invitación sugerida y misteriosa.
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
            narrativa: { type: Type.STRING },
            eventos: { type: Type.STRING },
            siguienteAccion: { type: Type.STRING },
          },
          required: ["narrativa", "eventos"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as NarrativeResponse;
  } catch (error) {
    console.error("Narrative Engine Error:", error);
    return {
      narrativa: "Una sombra cruza el campo de visión. El Motor Amalgam respira con dificultad, pero la historia debe continuar...",
      eventos: "Error de conexión con el motor central."
    };
  }
}
