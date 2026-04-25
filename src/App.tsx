/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, type MouseEvent, type TouchEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Maximize2
} from "lucide-react";

// --- DATA CONSTANTS ---

const FIRMAS_TAROT: Record<string, { firma: string; arquetipo: string }> = {
  "El Loco": { firma: "Ξ{T}", arquetipo: "Inicio, caos fértil" },
  "El Mago": { firma: "A{E}", arquetipo: "Acción creativa" },
  "La Sacerdotisa": { firma: "S{R}", arquetipo: "Sabiduría oculta" },
  "La Emperatriz": { firma: "E{M}", arquetipo: "Creación fértil" },
  "El Emperador": { firma: "S{T}", arquetipo: "Estructura" },
  "El Hierofante": { firma: "R{T}", arquetipo: "Transmisión" },
  "Los Enamorados": { firma: "R{R}", arquetipo: "Elección, relación" },
  "El Carro": { firma: "A{T}", arquetipo: "Dirección" },
  "La Justicia": { firma: "T{S}", arquetipo: "Balance" },
  "El Ermitaño": { firma: "Ξ{S}", arquetipo: "Introspección" },
  "La Rueda": { firma: "E{V}", arquetipo: "Ciclo" },
  "La Fuerza": { firma: "T{E}", arquetipo: "Instinto domado" },
  "El Colgado": { firma: "V{T}", arquetipo: "Inversión" },
  "La Muerte": { firma: "M{T}", arquetipo: "Transformación" },
  "La Templanza": { firma: "E{S}", arquetipo: "Integración" },
  "El Diablo": { firma: "S{V}", arquetipo: "Atadura" },
  "La Torre": { firma: "T{A}", arquetipo: "Ruptura" },
  "La Estrella": { firma: "E{R}", arquetipo: "Esperanza" },
  "La Luna": { firma: "V{R}", arquetipo: "Inconsciente" },
  "El Sol": { firma: "S{E}", arquetipo: "Claridad" },
  "El Juicio": { firma: "R{E}", arquetipo: "Despertar" },
  "El Mundo": { firma: "Ξ{E{R}}", arquetipo: "Integración total" },
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

const DrawingCanvas = ({ label, color = "#e8d5b7", height = 200, onSave }: { label: string, color?: string, height?: number, onSave?: (data: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

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
    ctx.strokeStyle = tool === "pen" ? color : "#0D0A18";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
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
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex justify-between items-center text-[0.6rem] uppercase tracking-[0.3em] text-mystic-purple mb-1 font-sans font-bold">
        <span>{label}</span>
        <div className="flex gap-4 items-center">
          <button onClick={() => setTool("pen")} className={`p-1 transition-colors ${tool === "pen" ? "text-amalgam-purple" : "text-mystic-dark-purple"}`}><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setTool("eraser")} className={`p-1 transition-colors ${tool === "eraser" ? "text-amalgam-orange" : "text-mystic-dark-purple"}`}><Eraser className="w-3.5 h-3.5" /></button>
          <input type="range" min="1" max="10" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-12 h-1 accent-amalgam-purple bg-mystic-dark-purple rounded-full appearance-none cursor-pointer" />
          <button onClick={clear} className="p-1 text-mystic-dark-purple hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [stepIndex, setStepIndex] = useState(0); // 0 = Intro, 1-10 = Steps, 11 = History
  const [history, setHistory] = useState<any[]>([]);
  
  const [session, setSession] = useState({
    date: new Date().toLocaleDateString("es-ES"),
    luna: "Cáncer",
    planeta: "Júpiter",
    pregunta: "",
    carta: "El Loco",
    polaridades: { p1: "", p2: "" },
    firma: "",
    pointX: "",
    pointA: { vision: "", drawData: "" },
    selectedPolarity: "",
    integracionDraw: "",
    extremos: { e1: "", e2: "", balance: "" },
    caminoAmor: "",
    reflexion: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("amalgam_grimorio");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const nextStep = () => setStepIndex(prev => Math.min(prev + 1, 10));
  const prevStep = () => setStepIndex(prev => Math.max(prev - 1, 0));

  const saveToGrimorio = () => {
    const newEntry = { ...session, id: Date.now() };
    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem("amalgam_grimorio", JSON.stringify(newHistory));
    setStepIndex(0); // Return after saving
  };

  // Compute Firma
  useEffect(() => {
    const ft = FIRMAS_TAROT[session.carta]?.firma || "Ξ";
    const fa = FIRMAS_ASTRO[session.luna]?.firma || "M{V}";
    setSession(s => ({ ...s, firma: `${ft} { ${fa} }` }));
  }, [session.carta, session.luna]);

  const step = stepIndex > 0 && stepIndex <= 10 ? PASOS[stepIndex - 1] : null;

  return (
    <div className="min-h-screen bg-[#0D0A18] text-[#e8d5b7] font-sans selection:bg-purple-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@300;500&display=swap');
        
        :root {
          --font-serif: 'Cormorant Garamond', serif;
          --font-sans: 'Inter', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        body {
          font-family: var(--font-serif);
          overflow-x: hidden;
        }

        .font-serif { font-family: var(--font-serif); }
        .font-sans { font-family: var(--font-sans); }
        .font-mono { font-family: var(--font-mono); }
        
        .bg-mystic {
          background: radial-gradient(circle at 50% 50%, #1a162e 0%, #0d0a18 100%);
        }
      `}</style>

      <AnimatePresence mode="wait">
        {stepIndex === 0 ? (
          <motion.div 
            key="intro"
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
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mystic bg-white/5 text-[0.6rem] uppercase tracking-[0.4em] text-amalgam-purple">
                <Compass className="w-3 h-3" />
                Motor Amalgam
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic mb-6 tracking-[0.15em] text-white uppercase glow-purple">
                Taller Vivo
              </h1>
              <p className="text-cream/60 max-w-md mx-auto mb-12 text-sm font-serif italic leading-relaxed tracking-wider">
                Navega tensiones, recibe perspectivas MAGI y encuentra tu camino amor 
                a través del tarot, la astrología y el dibujo sagrado.
              </p>

              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => setStepIndex(1)}
                  className="group relative px-10 py-4 border border-amalgam-orange shadow-[0_0_15px_rgba(255,154,60,0.2)] text-amalgam-orange font-semibold rounded-sm uppercase tracking-[0.2em] transition-all hover:bg-amalgam-orange/10 active:scale-95 text-xs"
                >
                  Comenzar Sesión
                </button>
                
                <button 
                  onClick={() => setStepIndex(11)}
                  className="px-8 py-3 text-mystic-purple hover:text-white transition-colors text-[0.6rem] tracking-[0.3em] uppercase"
                >
                  Ver Grimorio ({history.length})
                </button>

                <button 
                  onClick={() => setStepIndex(12)}
                  className="mt-4 flex items-center justify-center gap-2 text-[0.6rem] text-amalgam-orange/60 hover:text-amalgam-orange transition-colors uppercase tracking-[0.2em]"
                >
                  <Zap className="w-3 h-3" /> Llave de Emergencia
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : stepIndex === 11 ? (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen p-6 max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center mb-12 border-b border-mystic pb-6">
              <h2 className="text-3xl font-serif italic uppercase tracking-widest glow-purple">Grimorio de Sesiones</h2>
              <button onClick={() => setStepIndex(0)} className="p-2 hover:bg-white/5 rounded-full text-mystic-purple"><X /></button>
            </div>

            <div className="grid gap-6">
              {history.length === 0 ? (
                <div className="text-center py-24 text-mystic-purple/40 italic font-serif">Aún no has registrado sesiones en el campo.</div>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="bg-[#12101e] p-6 rounded-lg border border-mystic hover:border-amalgam-purple/40 transition-all group">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="text-[0.55rem] uppercase tracking-[0.3em] text-amalgam-purple mb-1 font-mono">{entry.date}</div>
                        <h3 className="text-xl font-serif italic text-white uppercase tracking-widest">{entry.carta} - <span className="text-amalgam-orange">{entry.luna}</span></h3>
                      </div>
                      <div className="font-mono text-xs bg-black/40 px-3 py-1 rounded-sm border border-mystic text-amalgam-purple glow-purple">{entry.firma}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-cream/70 font-serif">
                      <div className="space-y-2">
                        <div><span className="text-mystic-purple uppercase text-[0.6rem] tracking-widest mr-2 font-sans">Pregunta:</span> {entry.pregunta}</div>
                        <div><span className="text-mystic-purple uppercase text-[0.6rem] tracking-widest mr-2 font-sans">Tensión:</span> {entry.polaridades.p1} <span className="text-amalgam-purple italic">↔</span> {entry.polaridades.p2}</div>
                      </div>
                      <div className="space-y-2 border-l border-mystic pl-6">
                        <div className="text-amalgam-orange italic text-sm">" {entry.caminoAmor} "</div>
                        <div className="text-cream/40 line-clamp-2 mt-2 text-xs">{entry.reflexion}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : stepIndex === 12 ? (
          <motion.div 
            key="emergency"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="h-screen flex flex-col items-center justify-center p-8 bg-[#0D0A18] text-center"
          >
            <div className="w-16 h-16 rounded-full bg-amalgam-orange/5 border border-amalgam-orange/20 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(255,154,60,0.1)]">
              <Zap className="w-8 h-8 text-amalgam-orange" />
            </div>
            <h2 className="text-4xl font-serif italic mb-2 uppercase tracking-widest glow-orange text-white">Llave de Emergencia</h2>
            <p className="text-[0.6rem] uppercase tracking-[0.4em] text-mystic-purple mb-12">Protocolo Rápido de 3 Pasos</p>

            <div className="space-y-8 text-left max-w-sm w-full font-serif">
              <div className="flex gap-6 items-start group">
                <span className="text-amalgam-orange font-mono text-xs bg-amalgam-orange/10 px-2 py-1 rounded-sm border border-amalgam-orange/20">01</span>
                <p className="text-sm text-cream/70 leading-relaxed"><strong className="text-white block mb-1 uppercase tracking-[0.2em] text-[0.6rem] font-sans">Pausa & Aliento</strong> Cierra los ojos y respira 3 veces. Visualiza tu centro como un punto de luz fija.</p>
              </div>
              <div className="flex gap-6 items-start group">
                <span className="text-amalgam-orange font-mono text-xs bg-amalgam-orange/10 px-2 py-1 rounded-sm border border-amalgam-orange/20">02</span>
                <p className="text-sm text-cream/70 leading-relaxed"><strong className="text-white block mb-1 uppercase tracking-[0.2em] text-[0.6rem] font-sans">La Semilla</strong> Di en voz alta: "Acepto mi tensión". Elige una palabra que describa tu bloqueo actual.</p>
              </div>
              <div className="flex gap-6 items-start group">
                <span className="text-amalgam-orange font-mono text-xs bg-amalgam-orange/10 px-2 py-1 rounded-sm border border-amalgam-orange/20">03</span>
                <p className="text-sm text-cream/70 leading-relaxed"><strong className="text-white block mb-1 uppercase tracking-[0.2em] text-[0.6rem] font-sans">Camino Amor</strong> Haz un garabato de 10 segundos con tu mano no dominante y suéltalo. El taller está hecho.</p>
              </div>
            </div>

            <button 
              onClick={() => setStepIndex(0)}
              className="mt-16 px-10 py-3 border border-mystic text-mystic-purple rounded-sm text-[0.6rem] tracking-[0.3em] uppercase hover:bg-white/5 hover:text-white transition-all font-sans"
            >
              Regresar al Centro
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="session"
            className="min-h-screen flex flex-col lg:grid lg:grid-cols-[280px_1fr_320px] bg-[#0D0A18] relative overflow-hidden"
          >
            {/* Left Sidebar: Loop Info (Visible on Desktop) */}
            <aside className="hidden lg:flex flex-col p-8 border-r border-mystic h-screen sticky top-0 overflow-y-auto">
              <div className="text-[0.6rem] tracking-[0.4em] text-mystic-purple uppercase mb-8">Agent Loop // 10 Pasos</div>
              <ul className="space-y-4 text-[0.75rem] font-serif">
                {PASOS.map((p) => (
                  <li 
                    key={p.num} 
                    className={`transition-all duration-300 ${
                      p.num === stepIndex 
                        ? "text-amalgam-orange border-l-2 border-amalgam-orange pl-3 -ml-px" 
                        : p.num < stepIndex 
                          ? "text-amalgam-purple opacity-60" 
                          : "text-mystic-dark-purple"
                    }`}
                  >
                    <div className="font-bold uppercase tracking-widest">{p.num.toString().padStart(2, '0')}. {p.titulo}</div>
                    <div className="text-[0.6rem] italic opacity-60">{p.sub}</div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto pt-8">
                <div className="p-5 border border-mystic bg-[#12101e] rounded-lg shadow-xl">
                  <div className="text-[0.5rem] uppercase tracking-widest text-mystic-purple mb-2">Firma Actual</div>
                  <div className="text-xl font-mono italic text-amalgam-purple glow-purple tracking-tighter truncate">
                    {session.firma || "Ξ { M { V } }"}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content: The Wizard */}
            <div className="flex-1 flex flex-col pt-24 lg:pt-8 pb-32 px-6 max-w-2xl mx-auto w-full overflow-y-auto scrollbar-hide">
              {/* Header Progress Bar for all screens */}
              <div className="fixed top-0 lg:top-auto lg:relative left-0 right-0 h-0.5 bg-white/5 z-50 lg:mb-12">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amalgam-purple to-amalgam-orange shadow-[0_0_8px_rgba(255,154,60,0.3)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stepIndex / 10) * 100}%` }}
                />
              </div>

              {/* Step Navigation Header (Mobile and desktop sub-header) */}
              <div className="fixed top-0 lg:top-8 left-0 right-0 lg:relative lg:left-0 lg:right-0 p-4 lg:p-0 flex justify-between items-center bg-[#0D0A18]/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none z-40 border-b lg:border-0 border-mystic mb-8 transition-all">
                <div className="flex items-center gap-4 lg:hidden">
                  <span className="text-xs font-mono text-amalgam-purple bg-amalgam-purple/10 w-8 h-8 flex items-center justify-center rounded-sm">
                    {stepIndex}
                  </span>
                  <div>
                    <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-white leading-none">
                      {step?.titulo}
                    </h3>
                    <p className="text-[0.55rem] text-mystic-purple uppercase mt-1 leading-none italic">
                      {step?.sub}
                    </p>
                  </div>
                </div>

                <div className="flex-1 hidden lg:block border-b border-mystic pb-6">
                  <div className="text-[0.6rem] tracking-[0.4em] text-mystic-purple uppercase mb-1">
                    {step?.sub}
                  </div>
                  <h1 className="text-4xl font-light italic uppercase tracking-widest text-white glow-purple">
                    {step?.titulo}
                  </h1>
                </div>
                
                <div className="flex items-center gap-4">
                  <button onClick={() => setStepIndex(0)} className="text-mystic-purple hover:text-white transition-colors p-1"><X className="w-5 h-5" /></button>
                </div>
              </div>

            {/* MAIN STEP CONTENT */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={stepIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1"
              >
                {/* Step 1: Pausa */}
                {stepIndex === 1 && (
                  <div className="space-y-8 py-4 text-center">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} 
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="w-24 h-24 rounded-full border border-mystic mx-auto flex items-center justify-center bg-[#12101e] shadow-[0_0_20px_rgba(199,125,255,0.1)]"
                    >
                      <Activity className="text-amalgam-purple w-8 h-8 glow-purple" />
                    </motion.div>
                    <div className="font-serif italic text-3xl text-white uppercase tracking-widest glow-purple">"El campo respira. Abro el taller."</div>
                    <div className="space-y-8 text-left bg-[#12101e] p-8 rounded-lg border border-mystic shadow-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[0.6rem] uppercase tracking-[0.2em] text-mystic-purple font-sans font-bold">Luna en Signo</label>
                           <select 
                            value={session.luna} 
                            onChange={(e) => setSession(s => ({ ...s, luna: e.target.value }))}
                            className="w-full bg-[#0D0A18] border border-mystic rounded-sm p-3 text-xs text-cream font-serif italic outline-none focus:border-amalgam-purple/40 transition-all appearance-none cursor-pointer"
                           >
                             {Object.keys(FIRMAS_ASTRO).map(sign => <option key={sign} value={sign}>{sign}</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[0.6rem] uppercase tracking-[0.2em] text-mystic-purple font-sans font-bold">Planeta Regente</label>
                           <select 
                            value={session.planeta} 
                            onChange={(e) => setSession(s => ({ ...s, planeta: e.target.value }))}
                            className="w-full bg-[#0D0A18] border border-mystic rounded-sm p-3 text-xs text-cream font-serif italic outline-none focus:border-amalgam-purple/40 transition-all appearance-none cursor-pointer"
                           >
                             {PLANETAS.map(p => <option key={p} value={p}>{p}</option>)}
                           </select>
                        </div>
                      </div>
                      <div className="space-y-3 pt-6 border-t border-mystic/30">
                        <label className="text-[0.6rem] uppercase tracking-[0.2em] text-mystic-purple font-sans font-bold block">Intención / Pregunta</label>
                        <textarea 
                          value={session.pregunta}
                          onChange={(e) => setSession(s => ({ ...s, pregunta: e.target.value }))}
                          placeholder="¿Qué necesito soltar hoy?"
                          className="w-full bg-[#0D0A18] border border-mystic rounded-sm p-4 text-sm text-white placeholder:text-mystic-dark-purple font-serif italic min-h-[120px] outline-none focus:border-amalgam-purple/40 transition-colors resize-none shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Melchior - Polaridades */}
                {stepIndex === 2 && (
                  <div className="space-y-10 py-4 font-serif">
                    <div className="space-y-4">
                      <label className="text-[0.6rem] uppercase tracking-[0.2em] text-mystic-purple block font-sans font-bold">Carta de Tarot</label>
                      <select 
                        value={session.carta} 
                        onChange={(e) => setSession(s => ({ ...s, carta: e.target.value }))}
                        className="w-full bg-[#0D0A18] border border-mystic rounded-sm p-4 text-sm font-serif italic text-white appearance-none cursor-pointer outline-none focus:border-amalgam-purple/40 shadow-xl"
                      >
                        {Object.keys(FIRMAS_TAROT).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-sm text-[0.7rem] text-blue-300 italic">
                        {FIRMAS_TAROT[session.carta].arquetipo}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[0.6rem] uppercase tracking-[0.2em] text-mystic-purple block font-sans font-bold">Identificar dos opuestos claros</label>
                      <div className="grid grid-cols-2 gap-8">
                        <input 
                          value={session.polaridades.p1}
                          onChange={(e) => setSession(s => ({ ...s, polaridades: { ...s.polaridades, p1: e.target.value } }))}
                          placeholder="Polo A"
                          className="bg-transparent border-b border-mystic py-3 px-1 text-sm outline-none focus:border-blue-400 transition-colors placeholder:text-mystic-dark-purple italic"
                        />
                        <input 
                          value={session.polaridades.p2}
                          onChange={(e) => setSession(s => ({ ...s, polaridades: { ...s.polaridades, p2: e.target.value } }))}
                          placeholder="Polo B"
                          className="bg-transparent border-b border-mystic py-3 px-1 text-sm outline-none focus:border-blue-400 transition-colors placeholder:text-mystic-dark-purple italic"
                        />
                      </div>
                    </div>

                    <DrawingCanvas label="DIBUJO DE MELCHIOR (Arquitectura de la tensión)" color="#60a5fa" />
                  </div>
                )}

                {/* Step 3: Balthasar - Firma */}
                {stepIndex === 3 && (
                  <div className="space-y-8 py-4">
                    <div className="text-center space-y-4">
                      <div className="text-[0.6rem] uppercase tracking-[0.4em] text-purple-400/60">Firma Amalgam</div>
                      <div className="text-4xl md:text-5xl font-mono text-purple-300 italic tracking-tighter bg-black/30 py-8 rounded-3xl border border-white/5">
                        {session.firma}
                      </div>
                    </div>
                    
                    <p className="text-xs text-cream/40 italic leading-relaxed px-4">
                      Balthasar siente la conexión entre {session.carta} y la {session.luna}.
                      Deja que la firma fluya hacia el papel.
                    </p>

                    <DrawingCanvas label="DIBUJO DE BALTHASAR (Formas fluidas, manchas)" color="#c084fc" height={250} />
                  </div>
                )}

                {/* Step 4: Punto X */}
                {stepIndex === 4 && (
                  <div className="space-y-10 py-4 font-serif">
                    <div className="p-8 bg-[#12101e] rounded-lg border border-mystic shadow-xl space-y-6">
                      <p className="text-sm text-cream italic leading-relaxed">"Describe algo que ves ahora mismo, sin juzgar."</p>
                      <textarea 
                        value={session.pointX}
                        onChange={(e) => setSession(s => ({ ...s, pointX: e.target.value }))}
                        className="w-full bg-transparent border-b border-mystic p-3 text-sm outline-none focus:border-amalgam-purple/40 transition-colors h-20 italic font-serif"
                        placeholder="La luz en la ventana, una taza de té..."
                      />
                    </div>
                    <DrawingCanvas label="DIBUJO PUNTO X (Anclaje al presente)" color="#7a5a9a" />
                  </div>
                )}

                {/* Step 5: Punto A */}
                {stepIndex === 5 && (
                  <div className="space-y-10 py-4 font-serif">
                    <div className="space-y-4">
                      <p className="text-sm text-cream/80 italic text-center font-serif leading-relaxed">Visualiza la tensión integrada en el futuro.</p>
                      <DrawingCanvas 
                        label="DIBUJO PUNTO A (Imagen del futuro recordado)" 
                        color="#4ade80" 
                        onSave={(data) => setSession(s => ({ ...s, pointA: { ...s.pointA, drawData: data } }))}
                      />
                    </div>
                    <div className="space-y-3 pt-6">
                       <label className="text-[0.6rem] uppercase tracking-[0.2em] text-mystic-purple block font-sans font-bold">"En ese instante, la tensión se disuelve porque..."</label>
                       <textarea 
                          value={session.pointA.vision}
                          onChange={(e) => setSession(s => ({ ...s, pointA: { ...s.pointA, vision: e.target.value } }))}
                          className="w-full bg-[#12101e] border border-mystic rounded-sm p-4 text-sm text-white font-serif italic min-h-[100px] outline-none focus:border-amalgam-purple/40 shadow-inner"
                          placeholder="Escribe la revelación del futuro..."
                       />
                    </div>
                  </div>
                )}

                {/* Step 6: Casper - Polaridad Central */}
                {stepIndex === 6 && (
                  <div className="space-y-12 py-12">
                    <div className="text-center space-y-6">
                      <p className="text-[0.6rem] text-mystic-purple uppercase tracking-[0.4em] font-sans font-bold">Elige el polo que más resuena hoy</p>
                      <div className="flex flex-col gap-8 max-w-xs mx-auto">
                        <button 
                          onClick={() => setSession(s => ({ ...s, selectedPolarity: s.polaridades.p1 }))}
                          className={`p-8 rounded-sm border-2 transition-all font-serif italic ${session.selectedPolarity === session.polaridades.p1 ? "border-amalgam-orange bg-amalgam-orange/5 text-white shadow-[0_0_20px_rgba(255,154,60,0.15)]" : "border-mystic hover:border-amalgam-orange/40 text-cream/40"}`}
                        >
                          <div className="text-3xl uppercase tracking-widest">{session.polaridades.p1 || "Polo A"}</div>
                        </button>
                        <div className="text-[0.6rem] font-mono text-mystic-dark-purple">O</div>
                        <button 
                          onClick={() => setSession(s => ({ ...s, selectedPolarity: s.polaridades.p2 }))}
                          className={`p-8 rounded-sm border-2 transition-all font-serif italic ${session.selectedPolarity === session.polaridades.p2 ? "border-amalgam-orange bg-amalgam-orange/5 text-white shadow-[0_0_20px_rgba(255,154,60,0.15)]" : "border-mystic hover:border-amalgam-orange/40 text-cream/40"}`}
                        >
                          <div className="text-3xl uppercase tracking-widest">{session.polaridades.p2 || "Polo B"}</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Punto B - Integración */}
                {stepIndex === 7 && (
                  <div className="space-y-10 py-4">
                    <div className="space-y-3 text-center">
                      <p className="text-base text-cream italic font-serif leading-relaxed px-4">
                        Dibuja algo que integre los dos polos. Este es el dibujo principal de la sesión.
                      </p>
                      <div className="inline-flex items-center gap-4 text-[0.6rem] uppercase tracking-[0.4em] text-amalgam-orange font-mono bg-amalgam-orange/5 px-4 py-1.5 border border-amalgam-orange/10 rounded-full mt-2">
                        <span className="opacity-80">{session.polaridades.p1 || "Polo A"}</span>
                        <span className="text-amalgam-purple text-xs">↔</span>
                        <span className="opacity-80">{session.polaridades.p2 || "Polo B"}</span>
                      </div>
                    </div>
                    <DrawingCanvas 
                      label="EL DIBUJO DE INTEGRACIÓN (10-15 min de flujo)" 
                      color="#ff9a3c" 
                      height={380}
                      onSave={(data) => setSession(s => ({ ...s, integracionDraw: data }))}
                    />
                  </div>
                )}

                {/* Step 8: Extremos */}
                {stepIndex === 8 && (
                  <div className="space-y-10 py-4 font-serif italic">
                    <div className="grid gap-10">
                      <div className="space-y-3">
                        <label className="text-[0.6rem] uppercase tracking-[0.2em] text-amalgam-orange block font-sans font-bold not-italic">Extremo 1</label>
                        <textarea 
                          value={session.extremos.e1}
                          onChange={(e) => setSession(s => ({ ...s, extremos: { ...s.extremos, e1: e.target.value } }))}
                          placeholder={`Si me inclinara solo hacia ${session.polaridades.p1 || "el polo A"}...`}
                          className="w-full bg-[#12101e] border border-mystic rounded-sm p-5 text-sm italic outline-none focus:border-amalgam-orange/40 min-h-[100px] shadow-inner"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[0.6rem] uppercase tracking-[0.2em] text-amalgam-orange block font-sans font-bold not-italic">Extremo 2</label>
                        <textarea 
                          value={session.extremos.e2}
                          onChange={(e) => setSession(s => ({ ...s, extremos: { ...s.extremos, e2: e.target.value } }))}
                          placeholder={`Si me inclinara solo hacia ${session.polaridades.p2 || "el polo B"}...`}
                          className="w-full bg-[#12101e] border border-mystic rounded-sm p-5 text-sm italic outline-none focus:border-amalgam-orange/40 min-h-[100px] shadow-inner"
                        />
                      </div>
                      <div className="space-y-3 pt-8 border-t border-mystic">
                        <label className="text-[0.6rem] uppercase tracking-[0.2em] text-amalgam-purple block font-sans font-bold not-italic">Punto Medio de Deseo</label>
                        <textarea 
                          value={session.extremos.balance}
                          onChange={(e) => setSession(s => ({ ...s, extremos: { ...s.extremos, balance: e.target.value } }))}
                          placeholder="Me gustaría que mi camino estuviera en un balance entre..."
                          className="w-full bg-amalgam-purple/5 border border-amalgam-purple/20 rounded-sm p-5 text-sm italic outline-none focus:border-amalgam-purple/40 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 9: Camino Amor */}
                {stepIndex === 9 && (
                  <div className="space-y-16 py-12 text-center font-serif italic">
                    <Zap className="w-12 h-12 text-amalgam-orange mx-auto mb-4 animate-pulse glow-orange" />
                    <div className="space-y-8">
                      <h2 className="text-3xl font-serif italic uppercase tracking-widest text-white leading-relaxed">¿Cuál es la mínima <br/><span className="text-amalgam-orange glow-orange">acción viable</span>?</h2>
                      <textarea 
                        value={session.caminoAmor}
                        onChange={(e) => setSession(s => ({ ...s, caminoAmor: e.target.value }))}
                        className="w-full bg-transparent border-b border-mystic p-4 text-center font-serif italic text-2xl outline-none focus:border-amalgam-orange transition-all placeholder:text-mystic-dark-purple"
                        placeholder="Escribe la semilla de acción..."
                      />
                      <p className="text-[0.6rem] text-mystic-purple uppercase tracking-[0.4em] max-w-xs mx-auto font-sans font-bold leading-relaxed opacity-60">
                        Un pequeño gesto para <br/>manifestar hoy.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 10: Reporte de Memoria */}
                {stepIndex === 10 && (
                  <div className="space-y-10 py-4 text-center font-serif italic">
                    <Trophy className="w-16 h-16 text-amalgam-purple/40 mx-auto mb-2 glow-purple" />
                    <div className="font-serif text-3xl italic mb-6 uppercase tracking-widest text-white">"El campo respira. <br/>Cierro el taller."</div>
                    
                    <div className="space-y-4 text-left">
                      <label className="text-[0.6rem] uppercase tracking-[0.2em] text-mystic-purple mb-1 block font-sans font-bold not-italic">Reflexión Final</label>
                      <textarea 
                        value={session.reflexion}
                        onChange={(e) => setSession(s => ({ ...s, reflexion: e.target.value }))}
                        className="w-full bg-[#12101e] border border-mystic rounded-sm p-8 text-sm italic outline-none focus:border-amalgam-purple/40 min-h-[180px] shadow-2xl"
                        placeholder="¿Qué ha cambiado en mi mirada?"
                      />
                    </div>

                    <div className="pt-10">
                       <button 
                        onClick={saveToGrimorio}
                        className="w-full flex items-center justify-center gap-4 py-4 bg-amalgam-purple/5 border border-amalgam-purple/30 rounded-sm text-amalgam-purple font-bold uppercase text-[0.65rem] tracking-[0.4em] hover:bg-amalgam-purple/10 hover:text-white transition-all shadow-[0_0_20px_rgba(199,125,255,0.05)]"
                       >
                         <Save className="w-4 h-4" /> Guardar en Grimorio
                       </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation controls sticky bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] lg:right-[320px] p-6 flex justify-between gap-6 bg-gradient-to-t from-[#0D0A18] via-[#0D0A18] to-transparent z-40 border-t border-mystic bg-mystic-dark/95 backdrop-blur-sm">
              <button 
                onClick={prevStep}
                disabled={stepIndex === 1}
                className="group flex-1 flex items-center justify-center gap-3 py-3 px-6 border border-mystic bg-white/5 rounded-sm disabled:opacity-10 text-[0.65rem] uppercase tracking-[0.2em] transition-all hover:bg-white/10 active:scale-95"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Atrás
              </button>
              
              <button 
                onClick={nextStep}
                disabled={stepIndex === 10}
                className="group flex-[2] flex items-center justify-center gap-3 py-3 px-6 bg-[#1a1228] border border-amalgam-orange shadow-[0_0_15px_rgba(255,154,60,0.1)] text-amalgam-orange font-semibold rounded-sm text-[0.65rem] uppercase tracking-[0.2em] transition-all hover:bg-amalgam-orange/10 hover:shadow-[0_0_20px_rgba(255,154,60,0.2)] active:scale-98 disabled:opacity-5"
              >
                {stepIndex === 10 ? "Comenzar Cierre" : "Siguiente Paso"} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            </div>

            {/* Right Sidebar: MAGI Compass & Tarot (Visible on Desktop) */}
            <aside className="hidden lg:flex flex-col p-8 border-l border-mystic h-screen sticky top-0 overflow-y-auto bg-mystic-dark/50">
              <div className="text-[0.6rem] tracking-[0.4em] text-mystic-purple uppercase mb-6">Brújula MAGI</div>
              
              <div className="space-y-4">
                <div className={`p-5 bg-[#1a1228] border border-mystic rounded-lg transition-all duration-500 ${step?.cerebro === "Melchior" ? "ring-1 ring-blue-400/30 border-blue-400/30 translate-x-1" : "opacity-40"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[0.7rem] font-bold uppercase tracking-widest text-blue-300">Melchior</span>
                    <span className="font-mono text-[0.55rem] text-mystic-purple">ESTRUCTURA</span>
                  </div>
                  <p className="text-[0.7rem] italic text-cream/70 leading-relaxed font-serif">"¿Qué es innegable aquí?" — Analiza la geometría de la tensión.</p>
                </div>

                <div className={`p-5 bg-[#1a1228] border border-mystic rounded-lg transition-all duration-500 ${step?.cerebro === "Balthasar" ? "ring-1 ring-amalgam-purple/30 border-amalgam-purple/30 translate-x-1" : "opacity-40"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[0.7rem] font-bold uppercase tracking-widest text-amalgam-purple">Balthasar</span>
                    <span className="font-mono text-[0.55rem] text-mystic-purple">FLUJO</span>
                  </div>
                  <p className="text-[0.7rem] italic text-cream/70 leading-relaxed font-serif">"¿Qué quiere expandirse?" — Siente las conexiones orgánicas.</p>
                </div>

                <div className={`p-5 bg-[#1a1228] border border-mystic rounded-lg transition-all duration-500 ${step?.cerebro === "Casper" ? "ring-1 ring-amalgam-orange/30 border-amalgam-orange/30 translate-x-1" : "opacity-40"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[0.7rem] font-bold uppercase tracking-widest text-amalgam-orange">Casper</span>
                    <span className="font-mono text-[0.55rem] text-mystic-purple">DECISIÓN</span>
                  </div>
                  <p className="text-[0.7rem] italic text-cream/70 leading-relaxed font-serif">"¿Qué pequeño gesto es viable?" — Busca la síntesis pragmática.</p>
                </div>
              </div>

              {/* Current Context Card */}
              <div className="mt-auto aspect-[2/3] bg-mystic-dark border border-mystic rounded-xl relative overflow-hidden flex flex-col p-6 items-center justify-center text-center shadow-2xl">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#c77dff_0%,transparent_70%)]" />
                <div className="text-[0.55rem] uppercase tracking-[0.3em] text-mystic-purple mb-6 z-10">Carga Activa</div>
                <div className="text-5xl font-light mb-4 z-10 glow-orange">{session.carta === "El Loco" ? "0" : "•"}</div>
                <h4 className="text-xl font-serif italic text-white mb-2 z-10 uppercase tracking-widest">{session.carta || "Sin Carta"}</h4>
                <div className="text-[0.55rem] font-mono text-mystic-purple uppercase z-10 mt-auto">Amalgam Engine S3</div>
              </div>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
