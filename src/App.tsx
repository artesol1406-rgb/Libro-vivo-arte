/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, type MouseEvent, type TouchEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getNarrativeAction } from "./services/geminiService";
import { 
  Moon, 
  Sun, 
  Sparkles, 
  Zap, 
  BookOpen, 
  Edit3, 
  Eye, 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Eraser, 
  Save, 
  Trash2,
  Trophy,
  Activity,
  Maximize2,
  Palette,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// --- DATA CONSTANTS ---

const PALETTES: Record<string, string[]> = {
  Melchior: ["#60a5fa", "#3b82f6", "#1d4ed8", "#93c5fd", "#ffffff"],
  Balthasar: ["#c084fc", "#a855f7", "#7e22ce", "#e9d5ff", "#ffffff"],
  Casper: ["#ff9a3c", "#f97316", "#ea580c", "#fdba74", "#ffffff"],
  Universal: ["#e8d5b7", "#ffffff", "#aaaaaa", "#7a5a9a", "#ff9a3c", "#60a5fa", "#c084fc"]
};

const TECNICAS = [
  {
    titulo: "Técnica Melchor (Estructura)",
    desc: "Usa líneas rectas, ángulos y estructuras geométricas. Define límites claros y la arquitectura de tu tensión. Sé seco, técnico.",
    color: "text-[#60a5fa]",
    cerebro: "Melchior"
  },
  {
    titulo: "Técnica Baltasar (Flujo)",
    desc: "Usa curvas, círculos, espirales y manchas orgánicas. Deja que la mano fluya sin levantar el lápiz. Sé poético.",
    color: "text-amalgam-purple",
    cerebro: "Balthasar"
  },
  {
    titulo: "Técnica Casper (Dirección)",
    desc: "Dibuja glifos, flechas, puntos o tachones rápidos. Es un trazo de decisión. Marca el camino hacia la acción.",
    color: "text-amalgam-orange",
    cerebro: "Casper"
  }
];

const ARCANOS = {
  0: "El Loco", 1: "El Mago", 2: "La Sacerdotisa", 3: "La Emperatriz",
  4: "El Emperador", 5: "El Hierofante", 6: "Los Enamorados",
  7: "El Carro", 8: "La Justicia", 9: "El Ermitaño", 10: "La Rueda",
  11: "La Fuerza", 12: "El Colgado", 13: "La Muerte", 14: "La Templanza",
  15: "El Diablo", 16: "La Torre", 17: "La Estrella", 18: "La Luna",
  19: "El Sol", 20: "El Juicio", 21: "El Mundo"
};

const HERO_JOURNEY_STAGES = [
  "Mundo ordinario", "Llamada a la aventura", "Rechazo de la llamada",
  "Encuentro con el mentor", "Umbral", "Pruebas, aliados, enemigos",
  "Acercamiento", "Prueba difícil", "Recompensa", "Camino de regreso",
  "Resurrección", "Regreso con el elixir"
];

const PERSONALITY_SIGNATURES: Record<string, string> = {
  "P1_L": "control_estructural", "P1_E": "ansiedad_control",
  "P2_L": "orden", "P2_E": "confianza_flujo",
  "P3_L": "expansión", "P3_E": "contracción",
  "P4_L": "luz", "P4_E": "sombra",
  "P5_L": "conexión", "P5_E": "aislamiento",
  "P6_L": "acción", "P6_E": "reacción",
  "P7_L": "creación", "P7_E": "disolución",
  "P8_L": "memoria", "P8_E": "olvido",
  "P9_L": "verbo", "P9_E": "silencio",
  "P10_L": "forma", "P10_E": "vacío",
  "P11_L": "centro", "P11_E": "periferia",
  "P12_L": "tiempo", "P12_E": "eternidad",
  "P13_L": "vida", "P13_E": "muerte",
  "P14_L": "sabiduría", "P14_E": "locura",
  "P15_L": "poder", "P15_E": "servicio",
  "P16_L": "identidad", "P16_E": "disolucion_identidad"
};

const FIRMAS_ASTRO: Record<string, { firma: string; desc: string }> = {
  "Aries": { firma: "A{T}", desc: "Impulso pionero" },
  "Tauro": { firma: "S{E}", desc: "Arraigo sensorial" },
  "Géminis": { firma: "R{A}", desc: "Comunicación dual" },
  "Cáncer": { firma: "M{V}", desc: "Memoria emocional" },
  "Leo": { firma: "E{A}", desc: "Expresión creativa" },
  "Virgo": { firma: "S{T}", desc: "Análisis al servicio" },
  "Libra": { firma: "R{E}", desc: "Armonía estética" },
  "Escorpio": { firma: "T{M}", desc: "Profundidad transformadora" },
  "Sagitario": { firma: "E{R}", desc: "Expansión interior" },
  "Capricornio": { firma: "S{V}", desc: "Contención pragmática" },
  "Acuario": { firma: "Ξ{E}", desc: "Originalidad visionaria" },
  "Piscis": { firma: "V{R}", desc: "Sueño, fusión" },
};

const PLANETAS = ["Sol", "Luna", "Marte", "Mercurio", "Júpiter", "Venus", "Saturno"];

interface Step {
  num: number;
  titulo: string;
  sub: string;
  icon: ReactNode;
  cerebro: "Melchior" | "Balthasar" | "Casper" | "Universal";
}

const PASOS: Step[] = [
  { num: 1, titulo: "Pausa (Ξ)", sub: "Preparación del espacio", icon: <Activity className="w-5 h-5" />, cerebro: "Universal" },
  { num: 2, titulo: "Extraer Polaridades", sub: "Melchior analiza la tensión", icon: <Maximize2 className="w-5 h-5" />, cerebro: "Melchior" },
  { num: 3, titulo: "Firma del Estado", sub: "Balthasar siente el flujo", icon: <Sparkles className="w-5 h-5" />, cerebro: "Balthasar" },
  { num: 4, titulo: "Punto X", sub: "Presente neutral", icon: <Eye className="w-5 h-5" />, cerebro: "Universal" },
  { num: 5, titulo: "Punto A", sub: "Futuro recordado", icon: <Compass className="w-5 h-5" />, cerebro: "Universal" },
  { num: 6, titulo: "Par de Polos", sub: "Casper elige lo esencial", icon: <Zap className="w-5 h-5" />, cerebro: "Casper" },
  { num: 7, titulo: "Punto B", sub: "Dibujo de integración", icon: <Edit3 className="w-5 h-5" />, cerebro: "Universal" },
  { num: 8, titulo: "Generar Extremos", sub: "Explorando los límites", icon: <Maximize2 className="w-5 h-5" />, cerebro: "Universal" },
  { num: 9, titulo: "Camino Amor", sub: "Casper decide la acción", icon: <Zap className="w-5 h-5" />, cerebro: "Casper" },
  { num: 10, titulo: "Reporte de Memoria", sub: "Cierre del taller", icon: <Check className="w-5 h-5" />, cerebro: "Universal" },
];

// --- COMPONENTS ---

const DrawingCanvas = ({ label, paletteKey = "Universal", height = 200, onSave }: { label: string, paletteKey?: string, height?: number, onSave?: (data: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [activeColor, setActiveColor] = useState(PALETTES[paletteKey][0]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setActiveColor(PALETTES[paletteKey][0]);
  }, [paletteKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set initial canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = height;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [height]);

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === "pen" ? activeColor : "#0D0A18";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const save = () => {
    if (onSave && canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const getPos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : (e as unknown as MouseEvent).clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : (e as unknown as MouseEvent).clientY - rect.top;
    return { x, y };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-[0.6rem] uppercase tracking-[0.3em] text-mystic-purple font-sans font-bold">
          <div className="flex items-center gap-2">
            <span>{label}</span>
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className="p-1 hover:text-white transition-colors flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span className="text-[0.5rem] tracking-widest">{showGuide ? "Ocultar Guía" : "Guía"}</span>
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setTool("pen")} className={`p-1 transition-colors ${tool === "pen" ? "text-amalgam-purple" : "text-mystic-dark-purple"}`}><Edit3 className="w-3.5 h-3.5" /></button>
            <button onClick={() => setTool("eraser")} className={`p-1 transition-colors ${tool === "eraser" ? "text-amalgam-orange" : "text-mystic-dark-purple"}`}><Eraser className="w-3.5 h-3.5" /></button>
            <input type="range" min="1" max="10" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-12 h-1 accent-amalgam-purple bg-mystic-dark-purple rounded-full appearance-none cursor-pointer" />
            <button onClick={clear} className="p-1 text-mystic-dark-purple hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <AnimatePresence>
          {showGuide && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#12101e] border border-mystic/40 rounded-sm mb-2">
                {TECNICAS.map(t => (
                  <div key={t.titulo} className="space-y-1">
                    <div className={`text-[0.55rem] font-bold uppercase tracking-wider ${t.color}`}>{t.titulo}</div>
                    <p className="text-[0.65rem] text-cream/50 italic leading-relaxed font-serif">{t.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2 items-center bg-[#12101e] p-2 rounded-sm border border-mystic/30">
          <Palette className="w-3 h-3 text-mystic-purple mr-1" />
          {PALETTES[paletteKey].map((c) => (
            <button
              key={c}
              onClick={() => {
                setActiveColor(c);
                setTool("pen");
              }}
              className={`w-5 h-5 rounded-full border transition-all ${activeColor === c && tool === "pen" ? "scale-125 border-white ring-2 ring-amalgam-purple/20" : "border-transparent opacity-60 hover:opacity-100"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full bg-[#0D0A18] border border-mystic rounded-sm cursor-crosshair touch-none shadow-inner"
      />

      <div className="flex justify-center mt-4">
        <button 
          onClick={save}
          className="px-8 py-3 bg-amalgam-purple text-white text-[0.7rem] uppercase tracking-[0.3em] font-bold hover:bg-amalgam-purple/80 transition-all rounded-sm flex items-center gap-3 shadow-[0_0_20px_rgba(199,125,255,0.2)] active:scale-95"
        >
          <Save className="w-4 h-4" /> Finalizar y Guardar Trazo
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [stepIndex, setStepIndex] = useState(0); // 0 = Intro, 1-10 = Steps, 11 = History
  const [history, setHistory] = useState<any[]>([]);
  
  const [session, setSession] = useState({
    date: new Date().toLocaleDateString("es-ES"),
    birthDate: { day: "", month: "", year: "" },
    universeSeed: "",
    lifeArcanum: "",
    personalitySignature: "",
    engine: {
      cp: Array(7).fill(0).map(() => Math.random()),
      step: 0,
      coherence: 0.5,
      tension: 0,
      karma: Array(7).fill(0),
    },
    narrativeLog: [] as { id: number; text: string; role: 'engine' | 'player'; events?: string }[],
    input: "",
    currentView: 'start' as 'start' | 'init' | 'novel' | 'workshop' | 'history',
    isAiLoading: false,
    isDrawing: false,
    drawingType: 'Universal',
    // Legacy fields carried over for integration rituals
    pregunta: "",
    interpretation: null as any | null,
  });

  const calculateLifeArcanum = (d: string, m: string, y: string) => {
    let sum = parseInt(d) + parseInt(m) + parseInt(y);
    while (sum > 21) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return (ARCANOS as Record<number, string>)[sum] || ARCANOS[0];
  };

  const updateEngine = (action: string) => {
    const forceMap: Record<string, number> = {
      "explorar": 0.05, "luchar": -0.1, "dialogar": 0.02,
      "huir": -0.05, "meditar": 0.1, "default": 0.0
    };
    
    const force = forceMap[action.toLowerCase()] || forceMap["default"];
    const newCp = session.engine.cp.map(v => Math.max(0, Math.min(1, v + force + (Math.random() - 0.5) * 0.01)));
    
    // Variance as a proxy for incoherence
    const mean = newCp.reduce((a, b) => a + b, 0) / 7;
    const variancia = newCp.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 7;
    const coherence = 1 - variancia;
    
    setSession(s => ({
      ...s,
      engine: {
        ...s.engine,
        cp: newCp,
        step: s.engine.step + 1,
        coherence,
        tension: variancia * 2, // Simple tension heuristic
      }
    }));
    return { cp: newCp, coherence, tension: variancia * 2 };
  };

  useEffect(() => {
    const saved = localStorage.getItem("amalgam_grimorio");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleNarrativeAction = async (action: string) => {
    if (!action.trim()) return;

    // Update internal state
    const { cp, coherence, tension } = updateEngine(action);
    
    // Add player action to log
    setSession(s => ({
      ...s,
      input: "",
      narrativeLog: [...s.narrativeLog, { id: Date.now(), text: action, role: 'player' }]
    }));

    // Get engine response
    setSession(s => ({ ...s, isAiLoading: true }));
    try {
      const stage = HERO_JOURNEY_STAGES[Math.min(session.engine.step, HERO_JOURNEY_STAGES.length - 1)];
      const res = await getNarrativeAction({
        cp,
        coherence,
        tension,
        stage,
        arcano: session.lifeArcanum,
        universe: session.universeSeed,
        history: session.narrativeLog.map(l => l.text)
      }, action);

      setSession(s => ({
        ...s,
        isAiLoading: false,
        narrativeLog: [...s.narrativeLog, { 
          id: Date.now() + 1, 
          text: res.narrativa, 
          role: 'engine',
          events: res.eventos
        }]
      }));
    } catch (e) {
      setSession(s => ({ ...s, isAiLoading: false }));
    }
  };

  const handleInit = () => {
    if (!session.birthDate.day || !session.birthDate.month || !session.birthDate.year || !session.universeSeed) return;
    
    const arcano = calculateLifeArcanum(session.birthDate.day, session.birthDate.month, session.birthDate.year);
    setSession(s => ({ 
      ...s, 
      lifeArcanum: arcano,
      currentView: 'novel',
      narrativeLog: [{
        id: Date.now(),
        role: 'engine',
        text: `El Arcano ${arcano} se activa. Te encuentras en el umbral de ${session.universeSeed}. El tejido de la realidad comienza a vibrar con tu presencia...`
      }]
    }));
  };

  const step = stepIndex > 0 && stepIndex <= 10 ? PASOS[stepIndex - 1] : null;

  return (
    <div className="min-h-screen bg-[#0D0A18] text-[#e8d5b7] font-sans selection:bg-purple-500/30">
      <AnimatePresence mode="wait">
        {session.currentView === 'start' ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col items-center justify-center p-6 bg-mystic relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px]" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[128px]" />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center z-10 font-serif"
            >
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mystic bg-white/5 text-[0.6rem] uppercase tracking-[0.4em] text-amalgam-purple font-sans font-bold">
                <Compass className="w-3 h-3" />
                Amalgam Engine V9
              </div>
              <h1 className="text-6xl md:text-8xl font-serif italic mb-6 tracking-[0.1em] text-white uppercase glow-purple drop-shadow-2xl">
                Amalgama
              </h1>
              <p className="text-cream/60 max-w-sm mx-auto mb-16 text-sm font-serif italic leading-relaxed tracking-wider">
                Motor de Novela Interactiva basado en Física Simbólica.
                Arte, Vida, Identidad y Sombra en una danza fractal.
              </p>

              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={() => setSession(s => ({ ...s, currentView: 'init' }))}
                  className="group relative px-12 py-5 border border-amalgam-orange shadow-[0_0_30px_rgba(255,154,60,0.1)] text-amalgam-orange font-bold rounded-sm uppercase tracking-[0.3em] transition-all hover:bg-amalgam-orange/10 active:scale-95 text-xs bg-black/40"
                >
                  Nuevo Destino
                </button>
                
                <button 
                  onClick={() => setSession(s => ({ ...s, currentView: 'history' }))}
                  className="px-8 py-3 text-mystic-purple hover:text-white transition-colors text-[0.6rem] tracking-[0.3em] uppercase font-sans font-bold"
                >
                  Grimorio Antiguo ({history.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : session.currentView === 'init' ? (
          <motion.div 
            key="init"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen flex items-center justify-center p-6 bg-mystic"
          >
            <div className="max-w-md w-full space-y-12 bg-[#12101e] p-12 rounded-sm border border-mystic shadow-2xl relative">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amalgam-purple/20 border border-amalgam-purple flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amalgam-purple" />
               </div>
               
               <div className="text-center space-y-3">
                 <div className="text-[0.6rem] uppercase tracking-[0.4em] text-amalgam-purple font-sans font-bold">Inicialización del Sistema</div>
                 <h2 className="text-3xl font-serif italic text-white uppercase tracking-widest">Contrato de Origen</h2>
               </div>
               
               <div className="space-y-8">
                 <div className="space-y-4">
                   <label className="text-[0.6rem] uppercase tracking-widest text-mystic-purple font-sans font-bold block">1. Fecha de Nacimiento (Sino Estructural)</label>
                   <div className="grid grid-cols-3 gap-3">
                     <input 
                       placeholder="Día" 
                       className="bg-black/50 border border-mystic/30 p-4 text-xs outline-none focus:border-amalgam-purple transition-all text-white placeholder:text-mystic-purple/40"
                       value={session.birthDate.day}
                       onChange={e => setSession(s => ({ ...s, birthDate: { ...s.birthDate, day: e.target.value } }))}
                     />
                     <input 
                       placeholder="Mes" 
                       className="bg-black/50 border border-mystic/30 p-4 text-xs outline-none focus:border-amalgam-purple transition-all text-white placeholder:text-mystic-purple/40"
                       value={session.birthDate.month}
                       onChange={e => setSession(s => ({ ...s, birthDate: { ...s.birthDate, month: e.target.value } }))}
                     />
                     <input 
                       placeholder="Año" 
                       className="bg-black/50 border border-mystic/30 p-4 text-xs outline-none focus:border-amalgam-purple transition-all text-white placeholder:text-mystic-purple/40"
                       value={session.birthDate.year}
                       onChange={e => setSession(s => ({ ...s, birthDate: { ...s.birthDate, year: e.target.value } }))}
                     />
                   </div>
                 </div>

                 <div className="space-y-4">
                   <label className="text-[0.6rem] uppercase tracking-widest text-mystic-purple font-sans font-bold block">2. Semilla de Universo (Destino Elegido)</label>
                   <textarea 
                     placeholder="Ej: El mundo de Harry Potter, una ciudad de cristal y vapor..."
                     className="w-full h-32 bg-black/50 border border-mystic/30 p-5 text-sm outline-none focus:border-amalgam-purple transition-all italic font-serif text-white placeholder:text-mystic-purple/40 resize-none"
                     value={session.universeSeed}
                     onChange={e => setSession(s => ({ ...s, universeSeed: e.target.value }))}
                   />
                 </div>

                 <button 
                   onClick={handleInit}
                   disabled={!session.birthDate.day || !session.universeSeed}
                   className="w-full py-5 bg-amalgam-purple/5 border border-amalgam-purple text-amalgam-purple uppercase tracking-[0.4em] text-[0.7rem] font-bold hover:bg-amalgam-purple hover:text-white transition-all shadow-[0_0_30px_rgba(199,125,255,0.05)] active:scale-[0.98] disabled:opacity-30"
                 >
                   Invocar Realidad
                 </button>
               </div>
            </div>
          </motion.div>
        ) : session.currentView === 'novel' ? (
          <motion.div 
            key="novel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col bg-[#0D0A18] font-serif"
          >
            {/* Header / HUD */}
            <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-[#0D0A18]/80 backdrop-blur-xl border-b border-mystic/30">
               <div className="flex items-center gap-10">
                  <div className="flex flex-col">
                    <span className="text-[0.5rem] uppercase tracking-[0.4em] text-amalgam-purple font-sans font-bold mb-1">Sino Arcano</span>
                    <span className="text-sm italic text-white tracking-widest uppercase">{session.lifeArcanum}</span>
                  </div>
                  <div className="hidden md:flex gap-10">
                    <div className="flex flex-col">
                      <span className="text-[0.5rem] uppercase tracking-[0.4em] text-mystic-purple font-sans font-bold mb-1">Coherencia</span>
                      <div className="w-24 h-1 bg-mystic-dark-purple overflow-hidden">
                        <motion.div 
                          animate={{ width: `${(session.engine.coherence * 100)}%` }}
                          className="h-full bg-amalgam-purple"
                        />
                      </div>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={() => {
                   const newHistory = [{...session, id: Date.now()}, ...history];
                   setHistory(newHistory);
                   localStorage.setItem("amalgam_grimorio", JSON.stringify(newHistory));
                   setSession(s => ({ ...s, currentView: 'start' }));
                 }}
                 className="text-[0.5rem] uppercase tracking-[0.4em] px-4 py-2 hover:bg-red-500/10 hover:text-red-400 text-mystic-purple border border-transparent hover:border-red-500/20 transition-all font-sans font-bold"
               >
                 Guardar y Salir
               </button>
            </div>

            {/* Narrative Area */}
            <div className="flex-1 overflow-y-auto px-6 pt-32 pb-48 space-y-12 max-w-4xl mx-auto w-full scroll-smooth">
              <AnimatePresence mode="popLayout">
                {session.narrativeLog.map((log, idx) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`flex flex-col ${log.role === 'player' ? 'items-end' : 'items-start'}`}
                  >
                    {log.role === 'engine' ? (
                      <div className="space-y-6 max-w-[95%]">
                        <p className="text-xl md:text-2xl font-serif italic text-cream leading-[1.6] drop-shadow-lg whitespace-pre-wrap selection:bg-amalgam-purple/40">
                          {log.text}
                        </p>
                        {log.events && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-3 px-4 py-2 bg-amalgam-purple/5 border border-amalgam-purple/20 rounded-sm"
                          >
                            <Sparkles className="w-3 h-3 text-amalgam-purple" />
                            <span className="text-[0.55rem] uppercase tracking-[0.2em] text-amalgam-purple italic font-sans font-bold">{log.events}</span>
                          </motion.div>
                        )}
                        {idx === session.narrativeLog.length - 1 && (
                           <div className="flex flex-wrap gap-3 pt-4">
                              {["Explorar", "Meditar", "Hablar", "Dibujar"].map(opt => (
                                <button 
                                  key={opt}
                                  onClick={() => {
                                    if (opt === 'Dibujar') {
                                      setSession(s => ({ ...s, isDrawing: true, drawingType: 'Universal' }));
                                    } else {
                                      handleNarrativeAction(opt);
                                    }
                                  }}
                                  disabled={session.isAiLoading}
                                  className="px-4 py-2 border border-mystic hover:border-amalgam-orange hover:text-amalgam-orange transition-all text-[0.6rem] uppercase tracking-widest text-mystic-purple font-sans font-bold"
                                >
                                  {opt}
                                </button>
                              ))}
                           </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 bg-[#12101e] border-r-4 border-amalgam-orange/50 px-8 py-4 shadow-2xl relative overflow-hidden">
                        <p className="text-sm font-mono text-amalgam-orange uppercase tracking-[0.2em]">{log.text}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {session.isAiLoading && (
                <div className="flex items-center gap-3 p-4">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-amalgam-purple shadow-[0_0_10px_rgba(199,125,255,0.5)]" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-2 h-2 rounded-full bg-amalgam-purple shadow-[0_0_10px_rgba(199,125,255,0.5)]" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-2 h-2 rounded-full bg-amalgam-purple shadow-[0_0_10px_rgba(199,125,255,0.5)]" />
                  <span className="text-[0.6rem] uppercase tracking-[0.3em] text-amalgam-purple italic animate-pulse font-sans font-bold ml-2">Sincronizando Realidad...</span>
                </div>
              )}
            </div>

            {/* Input Overlay */}
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0D0A18] via-[#0D0A18] to-transparent z-40">
               <div className="max-w-3xl mx-auto relative">
                 <input 
                   disabled={session.isAiLoading}
                   value={session.input}
                   onChange={e => setSession(s => ({ ...s, input: e.target.value }))}
                   onKeyDown={e => e.key === 'Enter' && handleNarrativeAction(session.input)}
                   placeholder="Escribe tu intención..."
                   className="w-full bg-[#12101e]/80 backdrop-blur-xl border border-mystic p-6 pl-14 rounded-sm text-sm font-mono text-white placeholder:text-mystic-purple/40 focus:border-amalgam-orange transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] outline-none"
                 />
                 <Edit3 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-amalgam-orange/50" />
                 <button 
                  disabled={session.isAiLoading}
                  onClick={() => handleNarrativeAction(session.input)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-amalgam-orange hover:text-white transition-all active:scale-95 disabled:opacity-20"
                 >
                   <ArrowRight className="w-6 h-6" />
                 </button>
               </div>
            </div>
          </motion.div>
        ) : session.currentView === 'history' ? (
          <motion.div 
            key="history"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="min-h-screen p-8 pt-16 max-w-4xl mx-auto bg-mystic"
          >
            <div className="flex justify-between items-center mb-16 border-b border-mystic/40 pb-8">
              <div className="space-y-1">
                <span className="text-[0.6rem] uppercase tracking-[0.4em] text-amalgam-purple font-sans font-bold">Registro Akáshico</span>
                <h2 className="text-4xl font-serif italic uppercase tracking-widest text-white glow-purple">Grimorio de Sesiones</h2>
              </div>
              <button 
                onClick={() => setSession(s => ({ ...s, currentView: 'start' }))} 
                className="p-3 hover:bg-white/5 rounded-full text-mystic-purple border border-mystic/40 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid gap-8">
              {history.length === 0 ? (
                <div className="text-center py-32 text-mystic-purple/40 italic font-serif text-xl">Aún no has registrado sesiones.</div>
              ) : (
                history.map((entry: any) => (
                  <div key={entry.id} className="bg-[#12101e] p-8 rounded-sm border border-mystic hover:border-amalgam-purple/40 transition-all group relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-1 h-full bg-amalgam-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div>
                        <div className="text-[0.6rem] uppercase tracking-[0.3em] text-amalgam-purple mb-2 font-mono font-bold">{entry.date}</div>
                        <h3 className="text-2xl font-serif italic text-white uppercase tracking-widest">{entry.universeSeed || "Universo Sin Nombre"}</h3>
                      </div>
                      <div className="font-mono text-[0.6rem] bg-black/40 px-4 py-2 border border-mystic text-amalgam-purple glow-purple tracking-widest">{entry.lifeArcanum}</div>
                    </div>
                    <div className="text-sm text-cream/70 font-serif italic leading-relaxed line-clamp-3">
                      {entry.narrativeLog?.[entry.narrativeLog.length-1]?.text || "Sin registros."}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {session.isDrawing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md p-6 flex items-center justify-center"
          >
            <div className="w-full max-w-4xl space-y-6">
              <div className="flex justify-between items-center bg-[#12101e] p-6 border border-mystic rounded-t-sm">
                <div className="flex flex-col">
                  <span className="text-[0.6rem] uppercase tracking-[0.4em] text-amalgam-purple font-sans font-bold mb-1">Acto de Creación</span>
                  <span className="text-xl italic text-white tracking-widest uppercase">Dibujo Simbólico</span>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex gap-2">
                     {['Melchior', 'Balthasar', 'Casper', 'Universal'].map(p => (
                       <button 
                         key={p}
                         onClick={() => setSession(s => ({ ...s, drawingType: p }))}
                         className={`px-3 py-1 text-[0.5rem] uppercase tracking-widest font-bold border transition-all ${session.drawingType === p ? 'bg-white text-black border-white' : 'text-mystic-purple border-mystic/30 hover:border-amalgam-purple'}`}
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                   <button 
                    onClick={() => setSession(s => ({ ...s, isDrawing: false }))}
                    className="p-2 text-red-400 hover:text-red-300"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>
              </div>
              <div className="bg-[#050505] p-2 border-x border-b border-mystic">
                <DrawingCanvas 
                  label={`Dibujo de tipo ${session.drawingType}`} 
                  paletteKey={session.drawingType} 
                  height={500}
                  onSave={(data) => {
                    handleNarrativeAction("Realicé un dibujo simbólico en el campo.");
                    setSession(s => ({ ...s, isDrawing: false }));
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-[0.6rem] text-mystic-purple uppercase tracking-[0.3em] italic">
                  Captura la esencia de este momento. El guardado enviará la energía al motor.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
