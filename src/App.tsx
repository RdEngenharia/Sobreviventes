import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Brain, Battery, Utensils, AlertTriangle, ChevronRight, Droplets, Terminal, Sparkles, RotateCcw, Clock } from "lucide-react";
import { Agent, INITIAL_STATE, TurnData } from "./types";
import { generateNextTurn } from "./services/geminiService";

const AUTO_UPDATE_INTERVAL = 3 * 60 * 60 * 1000; // 3 horas em milissegundos

export default function App() {
  const [history, setHistory] = useState<TurnData[]>(() => {
    const saved = localStorage.getItem("island_survival_history");
    return saved ? JSON.parse(saved) : [INITIAL_STATE];
  });
  const [lastUpdate, setLastUpdate] = useState<number>(() => {
    const saved = localStorage.getItem("island_survival_last_update");
    return saved ? parseInt(saved, 10) : Date.now();
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intervention, setIntervention] = useState("");
  const [timeToNext, setTimeToNext] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentTurn = history[history.length - 1];

  // Salva no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("island_survival_history", JSON.stringify(history));
    localStorage.setItem("island_survival_last_update", lastUpdate.toString());
  }, [history, lastUpdate]);

  const handleNextTurn = useCallback(async (isAuto = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const stateWithIntervention = isAuto 
        ? { ...currentTurn, intervencao_usuario: "A passagem do tempo (Ciclo Automático de 3h)" }
        : { ...currentTurn, intervencao_usuario: intervention };
        
      const nextTurn = await generateNextTurn(stateWithIntervention);
      setHistory(prev => [...prev, nextTurn]);
      setLastUpdate(Date.now());
      setIntervention("");
      
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "A conexão com a ilha falhou.");
    } finally {
      setLoading(false);
    }
  }, [currentTurn, intervention, loading]);

  const handleReset = () => {
    if (confirm("Deseja realmente resetar a simulação para o Turno 1? Todo o histórico será perdido.")) {
      setHistory([INITIAL_STATE]);
      setLastUpdate(Date.now());
      localStorage.removeItem("island_survival_history");
      localStorage.removeItem("island_survival_last_update");
    }
  };

  // Lógica de Ciclo Automático
  useEffect(() => {
    const checkUpdate = () => {
      const now = Date.now();
      const elapsed = now - lastUpdate;
      const remaining = AUTO_UPDATE_INTERVAL - elapsed;

      if (remaining <= 0) {
        handleNextTurn(true);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeToNext(`${hours}h ${minutes}m`);
      }
    };

    checkUpdate();
    const interval = setInterval(checkUpdate, 60000); // Checa a cada minuto
    return () => clearInterval(interval);
  }, [lastUpdate, handleNextTurn]);

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-[#e0f2f1] font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex justify-between items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative">
          <div className="group cursor-pointer" onClick={handleReset}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-all">
              <Activity className="w-6 h-6 text-emerald-400 group-hover:hidden animate-pulse" />
              <RotateCcw className="w-6 h-6 text-red-400 hidden group-hover:block" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-emerald-50">Island Survival Engine</h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-emerald-500/60 font-mono tracking-wider">PROTOCOL_ISLAND_05_VER</p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800 rounded-full">
                <Clock className="w-2.5 h-2.5 text-zinc-500" />
                <span className="text-[8px] text-zinc-400 font-mono uppercase tracking-tighter">Prox Ciclo: {timeToNext}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 relative">
          <button 
            onClick={handleReset}
            className="flex flex-col items-end group"
            title="Resetar para Turno 1"
          >
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest group-hover:text-red-400 transition-colors">Voltar ao Início</span>
            <span className="text-2xl font-mono text-emerald-400 font-bold tracking-tighter group-hover:text-red-400 transition-colors">0{history.length}</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-10">
        {/* Environment & Problem */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8"
        >
          {/* Situation Log */}
          <div className="xl:col-span-7 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Terminal className="w-32 h-32" />
            </div>
            <h2 className="text-[10px] text-emerald-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              RELATÓRIO DE AMBIENTE
            </h2>
            <div className="space-y-4">
              <p className="text-2xl text-zinc-100 font-serif leading-tight italic max-w-3xl">
                "{currentTurn.turno_descricao}"
              </p>
              <div className="flex gap-2 pt-4">
                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-400 uppercase font-mono">Bio-Scan: Ativo</span>
                <span className="px-2 py-1 bg-zinc-800 border border-white/5 rounded text-[9px] text-zinc-400 uppercase font-mono">Umidade: 88%</span>
              </div>
            </div>
          </div>

          {/* Current Danger */}
          <div className="xl:col-span-5 bg-red-500/5 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,#ef444411,transparent_50%)]" />
            <h2 className="text-[10px] text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              AMEAÇA DETECTADA
            </h2>
            <p className="text-3xl font-black text-white tracking-tight leading-none">
              {currentTurn.problema_atual}
            </p>
          </div>
        </motion.section>

        {/* Agents Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {currentTurn.agentes.map((agent, index) => (
              <AgentCard key={agent.nome} agent={agent} delay={index * 0.05} />
            ))}
          </AnimatePresence>
        </section>

        {/* Divine Intervention Terminal */}
        <section className="bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 text-[10px] uppercase tracking-[0.3em] font-bold">
            <Sparkles className="w-4 h-4" />
            Terminal de Intervenção
          </div>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNextTurn()}
              placeholder="Digite um evento (ex: 'Um coqueiro aparece', 'Tempestade tropical')..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600 text-emerald-50"
            />
            <button 
              onClick={handleNextTurn}
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-30 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? "Processando..." : "Próximo Turno"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="mt-3 text-[10px] text-red-500 uppercase tracking-widest font-bold font-mono">{error}</p>}
          <p className="mt-3 text-[10px] text-zinc-500 italic opacity-60">
            * Inicie a intervenção ou apenas clique em "Próximo Turno" para a IA decidir o destino deles.
          </p>
        </section>

        {/* Result Area */}
        <div ref={scrollRef}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/60 border border-white/5 rounded-3xl p-8 font-mono text-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/30" />
            <div className="flex items-center gap-2 mb-4 text-zinc-500 text-[9px] uppercase tracking-widest font-bold">
              SYSTEM_CYCLE_STATE // {history.length}
            </div>
            <p className="text-emerald-400/90 leading-relaxed text-lg italic">
              {currentTurn.resultado_final}
            </p>
            {loading && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-20 h-20">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-t-2 border-r-2 border-emerald-500 rounded-full"
                    />
                    <Activity className="absolute inset-0 m-auto w-6 h-6 text-emerald-500" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.5em] text-emerald-500 animate-pulse font-bold">Calculando Variáveis da Ilha...</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>


      {/* Decorative */}
      <footer className="p-10 text-center opacity-30">
        <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-zinc-600">
          Nexus Neural Core // Bio-Feedback Loop // v.1.2
        </p>
      </footer>
    </div>
  );
}

function AgentCard({ agent, delay }: { agent: Agent; delay: number; key?: React.Key }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111816] border border-white/5 rounded-2xl overflow-hidden group hover:border-emerald-500/20 transition-all hover:bg-[#15201d]"
    >
      <div className="p-4 border-b border-white/5 bg-gradient-to-tr from-emerald-500/5 to-transparent">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">{agent.nome}</h3>
            <span className="text-[8px] font-mono text-emerald-500/60 uppercase tracking-widest border border-emerald-500/20 px-1.5 py-0.5 rounded">
              {agent.profissao}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-2.5">
          <StatBar icon={<Utensils className="w-2.5 h-2.5" />} label="Fome" value={agent.status.fome} color="bg-orange-500/80" />
          <StatBar icon={<Droplets className="w-2.5 h-2.5" />} label="Sede" value={agent.status.sede} color="bg-cyan-500/80" />
          <StatBar icon={<Battery className="w-2.5 h-2.5" />} label="Ene" value={agent.status.energia} color="bg-emerald-500/80" />
          <StatBar icon={<Brain className="w-2.5 h-2.5" />} label="Psi" value={agent.status.sanidade} color="bg-purple-500/80" />
        </div>

        <div className="space-y-3 pt-2">
          <div className="bg-black/40 rounded-lg p-2.5 border border-white/5">
            <p className="text-[10px] text-zinc-400 italic leading-snug">
              "{agent.pensamento}"
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1 w-1 h-1 bg-emerald-500 rounded-full" />
            <p className="text-[10px] text-emerald-50 font-medium leading-tight">
              {agent.acao}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5">
          <p className="text-[8px] text-zinc-500 font-mono text-center uppercase tracking-widest">
            {agent.relacionamento}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatBar({ icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-zinc-500 font-bold">
        <div className="flex items-center gap-1">
          {icon}
          {label}
        </div>
        <span className={value < 30 ? "text-red-500" : "text-zinc-400"}>{value}%</span>
      </div>
      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}
