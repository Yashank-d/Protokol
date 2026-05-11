"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { IconScale, IconTrendingDown, IconPlus, IconChartLine, IconEdit, IconCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { getTodayStr } from "@/lib/utils";
import { type WeightEntry } from "@/actions";
import { getOfflineWeightEntries, addOfflineWeightEntry, deleteOfflineWeightEntry } from "@/lib/store";
import SwipeToDelete from "./SwipeToDelete";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function WeightPane() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  const [startWeight, setStartWeight] = useState(98.0);
  const [targetWeight, setTargetWeight] = useState(78.0);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempStart, setTempStart] = useState(98.0);
  const [tempTarget, setTempTarget] = useState(78.0);

  useEffect(() => {
    getOfflineWeightEntries().then((data) => {
      setEntries(data);
      setIsLoading(false);
    });

    const saved = localStorage.getItem("beast_weight_goals");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.start) { setStartWeight(parsed.start); setTempStart(parsed.start); }
        if (parsed.target) { setTargetWeight(parsed.target); setTempTarget(parsed.target); }
      } catch { }
    }
  }, []);

  const saveGoals = () => {
    setStartWeight(tempStart);
    setTargetWeight(tempTarget);
    localStorage.setItem("beast_weight_goals", JSON.stringify({ start: tempStart, target: tempTarget }));
    setIsEditingGoals(false);
  };

  const current = entries.length > 0 ? entries[0].value : startWeight;
  const lost = Math.max(0, startWeight - current);
  const goalLoss = startWeight - targetWeight;
  const progress = goalLoss > 0 ? Math.max(0, Math.min(100, (lost / goalLoss) * 100)) : 0;

  // Prepare chart data (chronological order)
  const chartData = useMemo(() => {
    return [...entries]
      .reverse()
      .map(e => ({
        date: e.date.split("-").slice(1).join("/"), // MM/DD
        weight: e.value
      }))
      .slice(-14); // Last 14 entries
  }, [entries]);

  const handleLog = () => {
    const val = parseFloat(inputVal);
    if (isNaN(val) || val <= 0) return;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }

    const today = getTodayStr();
    setEntries((prev) => [{ id: Date.now(), date: today, value: val }, ...prev]);
    setInputVal("");

    startTransition(() => {
      addOfflineWeightEntry(today, val);
    });
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    startTransition(() => {
      deleteOfflineWeightEntry(id);
    });
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* 1. Hero Card */}
      <div className="rounded-3xl p-6 relative overflow-hidden bg-blue text-white shadow-[0_16px_32px_var(--blue-glow)]">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 opacity-80"><IconScale size={14} /> WEIGHT TRACKER</div>
          {!isEditingGoals ? (
            <button onClick={() => setIsEditingGoals(true)} className="opacity-50 hover:opacity-100 transition-opacity"><IconEdit size={16} /></button>
          ) : (
            <button onClick={saveGoals} className="text-green-300 opacity-100 transition-opacity bg-white/20 rounded-full p-1"><IconCheck size={14} /></button>
          )}
        </div>

        <div className="flex items-end gap-3 mb-6">
          <span className="font-extrabold text-[56px] leading-none tracking-tight">
            {isLoading ? "—" : current.toFixed(1)}
          </span>
          <span className="text-lg font-medium opacity-70 mb-2">kg</span>
        </div>

        <div className="flex justify-between border-t border-white/20 pt-5">
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold uppercase tracking-widest opacity-70 mb-1">START</span>
            {isEditingGoals ? (
              <input type="number" value={tempStart || ""} onChange={(e) => setTempStart(parseFloat(e.target.value))} className="w-16 bg-white/10 rounded px-1 py-0.5 text-xl font-bold outline-none border-b border-white/50" />
            ) : (
              <span className="font-extrabold text-2xl">{startWeight} <span className="text-sm font-medium opacity-70">kg</span></span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold uppercase tracking-widest opacity-70 mb-1">TARGET</span>
            {isEditingGoals ? (
              <input type="number" value={tempTarget || ""} onChange={(e) => setTempTarget(parseFloat(e.target.value))} className="w-16 bg-white/10 rounded px-1 py-0.5 text-xl font-bold outline-none border-b border-white/50" />
            ) : (
              <span className="font-extrabold text-2xl">{targetWeight} <span className="text-sm font-medium opacity-70">kg</span></span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold uppercase tracking-widest opacity-70 mb-1">LOST</span>
            <span className="font-extrabold text-2xl">{lost.toFixed(1)} <span className="text-sm font-medium opacity-70">kg</span></span>
          </div>
        </div>
      </div>

      {/* 2. Input (Directly actionable) */}
      <div className="rounded-2xl p-6 bg-surface border border-border flex gap-4 items-center">
        <input
          type="number"
          placeholder="Enter weight (kg)"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLog()}
          className="flex-1 bg-transparent outline-none text-lg font-bold placeholder:text-text-muted"
        />
        <button
          onClick={handleLog}
          disabled={isPending}
          className="w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 shadow-lg shadow-blue/20"
        >
          <IconPlus size={24} />
        </button>
      </div>

      {/* 3. Progress Bar */}
      <div className="rounded-2xl p-6 bg-surface border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold uppercase tracking-[1.5px] opacity-80 flex items-center gap-1.5">
            <IconTrendingDown size={14} /> PROGRESS
          </div>
          <span className="text-[12px] font-semibold text-text-muted">
            {Math.round(progress)}% of {goalLoss.toFixed(1)}kg goal
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 4. Weight Chart */}
      {chartData.length > 1 && (
        <div className="rounded-2xl p-6 bg-surface border border-border">
          <div className="text-[11px] font-bold uppercase tracking-[1.5px] opacity-80 flex items-center gap-1.5 mb-6">
            <IconChartLine size={14} /> WEIGHT TREND
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  dy={10}
                />
                <YAxis 
                  hide 
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--surface)", 
                    borderRadius: "12px", 
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                  itemStyle={{ color: "var(--blue)" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--blue)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. History */}
      {entries.length > 0 && (
        <div>
          <div className="font-bold text-[14px] text-text-muted uppercase tracking-[1.5px] mb-4 pl-1 flex items-center justify-between">
            <span>Recent Entries</span>
            <span className="text-[11px] font-normal normal-case tracking-normal opacity-60">← swipe to delete</span>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[60px] rounded-2xl bg-surface border border-border" />
                ))}
              </div>
            ) : (
              entries.slice(0, 10).map((entry) => (
                <SwipeToDelete key={entry.id} onDelete={() => handleDelete(entry.id)}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4 bg-surface border border-border flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{entry.date}</div>
                    </div>
                    <div className="font-bold text-xl">{entry.value} <span className="text-sm font-medium text-text-muted">kg</span></div>
                  </motion.div>
                </SwipeToDelete>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
