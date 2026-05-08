import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, Brain, Battery, Utensils, AlertTriangle, 
  ChevronRight, Droplets, Terminal, Sparkles, RotateCcw, 
  Clock, Heart, Shield, Thermometer, Wind, Box, 
  Sun, Moon, CloudRain, Zap, Skull, TrendingUp
} from "lucide-react";
import { Agent, INITIAL_STATE, TurnData, Status } from "./types";
import { generateNextTurn } from "./services/geminiService";

const AUTO_UPDATE_INTERVAL = 3 * 60 * 60 * 1000;

export default function App() {
  const [history, setHistory] = useState<TurnData[]>(() => {
    const saved = localStorage.getItem("island_survival_history");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migração simples: se o primeiro turno não tiver estado_ilha, reseta
      if (parsed.length > 0 && !parsed[0].estado_ilha) {
        return [INITIAL_STATE];
      }
      return parsed;
    }
    return [INITIAL_STATE];
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

  useEffect(() => {
    localStorage.setItem("island_survival_history", JSON.stringify(history));
    localStorage.setItem("island_survival_last_update", lastUpdate.toString());
  }, [history, lastUpdate]);

  const handleNextTurn = useCallback(async (isAuto = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const stateWithIntervention = { 
        ...currentTurn, 
        intervencao_usuario: isAuto ? "A passagem do tempo (Ciclo Automático de 3h)" : intervention 
      };
        
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
    if (confirm("Deseja realmente resetar a simulação? Todo o histórico será perdido.")) {
      setHistory([INITIAL_STATE]);
      setLastUpdate(Date.now());
      localStorage.removeItem("island_survival_history");
      localStorage.removeItem("island_survival_last_update");
    }
  };

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
    const interval = setInterval(checkUpdate, 60000);
    return () => clearInterval(interval);
  }, [lastUpdate, handleNextTurn]);

  const getEnvIcon = () => {
    if (!currentTurn?.estado_ilha) return <Wind className="w-5 h-5 text-zinc-400" />;
    switch(currentTurn.estado_ilha.clima) {
      case "Ensolarado": return <Sun className="w-5 h-5 text-yellow-400" />;
      case "Chuvoso": return <CloudRain className="w-5 h-5 text-blue-400" />;
      case "Tempestade": return <Zap className="w-5 h-5 text-purple-400" />;
      default: return <Wind className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getPeriodIcon = () => {
    if (!currentTurn?.estado_ilha) return <Sun className="w-5 h-5 text-orange-400" />;
    return currentTurn.estado_ilha.periodo === "Noite" || currentTurn.estado_ilha.periodo === "Madrugada" 
      ? <Moon className="w-5 h-5 text-indigo-400" />
      : <Sun className="w-5 h-5 text-orange-400" />;
  };

  return (
    <div className="min-h-screen bg-[#070b0a] text-[#e0f2f1] font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="group cursor-pointer" onClick={handleReset}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-all shadow-inner">
              <Activity className="w-6 h-6 text-emerald-400 group-hover:hidden animate-pulse" />
              <RotateCcw className="w-6 h-6 text-red-400 hidden group-hover:block" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.4em] uppercase text-emerald-50 drop-shadow-sm">Island Engine 2.0</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-[8px] text-emerald-400 font-mono uppercase font-bold">Live Stream</span>
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">/ {timeToNext} para auto-ciclo</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="grid grid-cols-2 gap-4 border-l border-white/10 pl-8">
            <div className="text-right">
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest block mb-1">Passagem</span>
              <span className="text-2xl font-mono text-zinc-200 font-black">T{currentTurn?.turno_numero || history.length}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{currentTurn?.estado_ilha?.temperatura || "--"}°C</span>
              <div className="flex gap-1 mt-1">
                {getEnvIcon()}
                {getPeriodIcon()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Environment Summary */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-10 relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Terminal className="w-48 h-48" />
              </div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-4 max-w-4xl">
                  <h2 className="text-[10px] text-emerald-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Crônicas da Sobrevivência
                  </h2>
                  <p className="text-3xl text-zinc-100 font-serif leading-[1.1] italic indent-8">
                    "{currentTurn.turno_descricao}"
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-xs">
                  <h3 className="text-[9px] text-red-400 uppercase tracking-widest font-black mb-3">Ameaça do Ciclo</h3>
                  <p className="text-lg font-bold text-red-50 leading-tight">
                    {currentTurn.problema_atual}
                  </p>
                </div>
              </div>

              {/* Skills/Health Legend or something? No, let's put inventory here */}
              <div className="flex flex-wrap gap-3 border-t border-white/5 pt-8">
                <div className="bg-emerald-500/5 px-4 py-2 rounded-xl flex items-center gap-3 border border-emerald-500/10">
                  <Box className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-100">Inventário Coletivo:</span>
                  {currentTurn?.estado_ilha?.inventario_coletivo?.map((item, i) => (
                    <span key={i} className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5">
                      {item.item} ({item.quantidade})
                    </span>
                  ))}
                  {(!currentTurn?.estado_ilha?.inventario_coletivo || currentTurn.estado_ilha.inventario_coletivo.length === 0) && <span className="text-[10px] text-zinc-600 italic">Vazio</span>}
                </div>
              </div>
            </motion.section>

            {/* Agents Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {currentTurn.agentes.map((agent, index) => (
                  <AgentCard key={agent.nome} agent={agent} delay={index * 0.05} />
                ))}
              </AnimatePresence>
            </section>
          </div>

          {/* Side Control Panel */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl h-fit">
              <h3 className="text-[10px] text-emerald-400 uppercase tracking-[0.3em] font-black mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                COMANDOS DIVINOS
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Intervenção Direta</label>
                  <textarea 
                    value={intervention}
                    onChange={(e) => setIntervention(e.target.value)}
                    placeholder="Ex: 'Encontram carcaça de tubarão', 'Elena encontra uma faca'..."
                    className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all h-32 resize-none placeholder:text-zinc-700 text-emerald-50"
                  />
                </div>

                <button 
                  onClick={() => handleNextTurn()}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-500 text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-30 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  {loading ? "Sincronizando..." : "Executar Ciclo"}
                </button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold leading-tight">{error}</p>
                  </motion.div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-zinc-600 font-bold">
                  <span>Simulações Anteriores</span>
                  <span>{history.length - 1} ARQUIVOS</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {history.slice().reverse().map((turn, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono text-emerald-500">TURNO_{turn.turno_numero || history.length - i}</span>
                        <span className="text-[8px] text-zinc-600">{turn?.estado_ilha?.periodo || "--"}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate group-hover:text-zinc-200 transition-colors">{turn.resultado_final}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Final Conclusion Header/Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <h4 className="text-[10px] text-zinc-500 uppercase tracking-[1em] mb-6 font-bold">CONCLUSÃO DO CICLO ATUAL</h4>
          <p className="text-3xl text-emerald-50 font-serif italic max-w-5xl mx-auto leading-tight">
            {currentTurn.resultado_final}
          </p>
        </motion.div>
      </main>

      <footer className="p-12 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.6em] text-zinc-700 opacity-50">
          Neural Survival Engine // Protocolo Omega // v.2.0.4
        </p>
      </footer>
    </div>
  );
}

function AgentCard({ agent, delay }: { agent: Agent; delay: number; key?: React.Key }) {
  const isDead = !agent.vivo || (agent.status?.saude ?? 0) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative bg-[#0d1312] border ${isDead ? 'border-red-500/30' : 'border-white/5'} rounded-3xl overflow-hidden group hover:border-emerald-500/20 transition-all shadow-2xl`}
    >
      {isDead && (
        <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Skull className="w-12 h-12 text-red-500/40" />
        </div>
      )}

      {/* Profile Header */}
      <div className={`p-5 border-b border-white/5 ${isDead ? 'bg-red-500/5' : 'bg-gradient-to-br from-emerald-500/5 to-transparent'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-black uppercase tracking-tighter ${isDead ? 'text-zinc-500 line-through' : 'text-white'}`}>
              {agent.nome}
            </h3>
            <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${isDead ? 'border-zinc-800 text-zinc-600' : 'border-emerald-500/20 text-emerald-500/60'}`}>
              {agent.profissao}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider ${isDead ? 'bg-zinc-900 text-zinc-700' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {agent.emocao_atual}
              </span>
              {!isDead && agent.interesse_romantico && (
                <span className="flex items-center gap-1 text-[8px] text-pink-400 font-bold uppercase tracking-wider animate-pulse">
                  <Heart className="w-2.5 h-2.5 fill-pink-400/20" />
                  {agent.interesse_romantico}
                </span>
              )}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${isDead ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'} animate-pulse`} />
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Vital Stats */}
        <div className="grid grid-cols-1 gap-3">
          <StatBar icon={<Heart className="w-3 h-3" />} label="Saúde" value={agent.status?.saude ?? 0} color={(agent.status?.saude ?? 0) < 30 ? "bg-red-500" : "bg-red-500/80"} />
          <StatBar icon={<Utensils className="w-3 h-3" />} label="Fome" value={agent.status?.fome ?? 0} color="bg-orange-500/80" />
          <StatBar icon={<Droplets className="w-3 h-3" />} label="Sede" value={agent.status?.sede ?? 0} color="bg-blue-500/80" />
          <StatBar icon={<Battery className="w-3 h-3" />} label="Energia" value={agent.status?.energia ?? 0} color="bg-emerald-500/80" />
          <StatBar icon={<Brain className="w-3 h-3" />} label="Sanidade" value={agent.status?.sanidade ?? 0} color="bg-purple-500/80" />
        </div>

        {/* Skills Section */}
        {!isDead && agent.habilidades && (
          <div className="space-y-3 pt-2">
            <h4 className="text-[8px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              Progressão de Habilidades
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.habilidades.map((skill, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg">
                  <span className="text-[9px] text-zinc-400 font-medium">{skill.nome}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Lvl {skill.nivel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action/Thoughts */}
        <div className="space-y-4 pt-2">
          <div className="bg-black/60 rounded-2xl p-4 border border-white/5 relative">
            <div className="absolute top-2 right-3 text-zinc-800"><Terminal size={10} /></div>
            <p className="text-[11px] text-emerald-50/70 italic leading-relaxed">
              "{agent.pensamento}"
            </p>
          </div>
          <div className="flex items-start gap-3 pl-1">
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isDead ? 'bg-zinc-800' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`} />
            <p className={`text-[11px] leading-tight font-bold ${isDead ? 'text-zinc-600' : 'text-zinc-100'}`}>
              {agent.acao}
            </p>
          </div>
        </div>

        {/* Relationships */}
        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2">
             <Shield className="w-3 h-3 text-zinc-600" />
             <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-black">Dinâmica Social</span>
          </div>
          <p className="text-[9px] text-zinc-500 font-medium leading-normal italic px-2">
            {agent.relacionamento}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatBar({ icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const isCritical = value < 30;
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
        <div className="flex items-center gap-2">
          <span className={isCritical ? "text-red-500 animate-pulse" : "text-zinc-500"}>{icon}</span>
          {label}
        </div>
        <span className={`${isCritical ? "text-red-500" : "text-zinc-400"} font-mono`}>{Math.round(value)}%</span>
      </div>
      <div className="h-1 bg-black/50 rounded-full overflow-hidden border border-white/5 p-[1px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          className={`h-full rounded-full transition-all duration-1000 ${isCritical ? "bg-red-500" : color}`} 
        />
      </div>
    </div>
  );
}
