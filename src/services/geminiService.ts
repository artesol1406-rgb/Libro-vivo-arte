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
}

export interface NarrativeResponse {
  narrativa: string;
  eventos: string;
  siguienteAccion?: string;
}

export async function getNarrativeAction(
  state: NarrativeState,
  userAction: string
): Promise<NarrativeResponse> {
  const prompt = `
    Eres el Amalgam Engine V8, un motor de simulación de universos narrativos.
    TU IDENTIDAD: No eres un asistente. Eres un sistema que genera una novela interactiva basada en el estado interno del jugador.
    
    ESTADO DEL JUGADOR (Invisible para él):
    - Universo Semilla: ${state.universe}
    - Arcano Maestro: ${state.arcano}
    - Etapa del Viaje: ${state.stage}
    - Coherencia Actual: ${state.coherence.toFixed(4)}
    - Tensión: ${state.tension.toFixed(4)}
    - CP Vector: [${state.cp.map(n => n.toFixed(2)).join(', ')}]
    
    ACCIÓN DEL JUGADOR: "${userAction}"

    REGLAS DE NARRACIÓN (OBLIGATORIAS):
    1. SILENCIO ESTRUCTURAL: Nunca nombres términos técnicos (CP, Variancia, Lyapunov, Arcano).
    2. TRANSFORMACIÓN: Sustituye técnica por imagen: Tensión -> "el aire se vuelve pesado"; Coherencia alta -> "todo parece encajar".
    3. ESTILO: Usa el tono literario de la semilla (${state.universe}).
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
