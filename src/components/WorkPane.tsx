"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { IconCamera, IconPlus, IconCurrencyRupee, IconBrandInstagram, IconUsers, IconPhoto, IconChartBar } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { getTodayStr } from "@/lib/utils";
import { getWorkEntries, addWorkEntry, deleteWorkEntry, type WorkEntry } from "@/actions";
import SwipeToDelete from "./SwipeToDelete";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";

const WORK_TYPES = [
  "Shoot completed",
  "Client pitched",
  "Instagram posted",
  "Income received",
];

const COLORS = ["#a855f7", "#3b82f6", "#ec4899", "#22c55e"];

export default function WorkPane() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [selectedType, setSelectedType] = useState(WORK_TYPES[0]);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    getWorkEntries().then((data) => {
      setEntries(data);
      setIsLoading(false);
    });
  }, []);

  // Aggregate stats
  const shoots = entries.filter((e) => e.type === "Shoot completed").length;
  const clients = entries.filter((e) => e.type === "Client pitched").length;
  const posts = entries.filter((e) => e.type === "Instagram posted").length;
  const income = entries
    .filter((e) => e.type === "Income received")
    .reduce((sum, e) => sum + e.amount, 0);

  // Chart data: Counts per type
  const chartData = useMemo(() => {
    return WORK_TYPES.map((type, index) => ({
      name: type.split(" ")[0],
      count: entries.filter(e => e.type === type).length,
      color: COLORS[index]
    }));
  }, [entries]);

  const handleLog = () => {
    if (!note.trim()) return;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }

    const today = getTodayStr();
    const amt = selectedType === "Income received" ? parseFloat(amount) || 0 : 0;

    setEntries((prev) => [
      { id: Date.now(), date: today, type: selectedType, note: note.trim(), amount: amt },
      ...prev,
    ]);
    setNote("");
    setAmount("");

    startTransition(() => {
      addWorkEntry(today, selectedType, note.trim(), amt);
    });
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    startTransition(() => {
      deleteWorkEntry(id);
    });
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* 1. Hero Card */}
      <div className="rounded-3xl p-6 relative overflow-hidden bg-purple text-white shadow-[0_16px_32px_var(--purple-glow)]">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] flex items-center gap-1.5 mb-3 opacity-80">
          <IconCamera size={14} /> PHOTOGRAPHY WORK
        </div>
        <div className="font-bold text-[26px] leading-[1.1] mb-8 tracking-tight">
          Track every shoot, pitch & post.
        </div>

        <div className="grid grid-cols-4 gap-3 border-t border-white/20 pt-5">
          <div className="flex flex-col items-center">
            <IconPhoto size={18} className="mb-1 opacity-70" />
            <span className="font-extrabold text-xl">{shoots}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider opacity-60">Shoots</span>
          </div>
          <div className="flex flex-col items-center">
            <IconUsers size={18} className="mb-1 opacity-70" />
            <span className="font-extrabold text-xl">{clients}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider opacity-60">Pitched</span>
          </div>
          <div className="flex flex-col items-center">
            <IconBrandInstagram size={18} className="mb-1 opacity-70" />
            <span className="font-extrabold text-xl">{posts}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider opacity-60">Posts</span>
          </div>
          <div className="flex flex-col items-center">
            <IconCurrencyRupee size={18} className="mb-1 opacity-70" />
            <span className="font-extrabold text-xl">{income > 0 ? `${(income / 1000).toFixed(income >= 1000 ? 0 : 1)}k` : "0"}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider opacity-60">Income</span>
          </div>
        </div>
      </div>

      {/* 2. Log Form (Actionable) */}
      <div className="rounded-2xl p-6 bg-surface border border-border flex flex-col gap-5">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] opacity-80">NEW LOG</div>

        <div className="flex flex-wrap gap-2">
          {WORK_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all ${
                selectedType === t
                  ? "bg-purple text-white border-purple shadow-md shadow-purple/20 scale-105"
                  : "bg-transparent text-text-muted border-border hover:border-text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="What did you do?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLog()}
          className="w-full bg-transparent outline-none text-lg font-bold placeholder:text-text-muted border-b-2 border-border pb-3 focus:border-purple transition-colors"
        />

        {selectedType === "Income received" && (
          <input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent outline-none text-lg font-bold placeholder:text-text-muted border-b-2 border-border pb-3 focus:border-purple transition-colors"
          />
        )}

        <button
          onClick={handleLog}
          disabled={isPending || !note.trim()}
          className="w-full py-4 rounded-2xl bg-purple text-white font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40 shadow-lg shadow-purple/20"
        >
          <IconPlus size={20} /> Log Activity
        </button>
      </div>

      {/* 3. Activity Chart */}
      {entries.length > 0 && (
        <div className="rounded-2xl p-6 bg-surface border border-border">
          <div className="text-[11px] font-bold uppercase tracking-[1.5px] opacity-80 flex items-center gap-1.5 mb-6">
            <IconChartBar size={14} /> ACTIVITY DISTRIBUTION
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: "var(--text-muted)" }}
                  dy={10}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. History */}
      {entries.length > 0 && (
        <div>
          <div className="font-bold text-[14px] text-text-muted uppercase tracking-[1.5px] mb-4 pl-1 flex items-center justify-between">
            <span>Activity Log</span>
            <span className="text-[11px] font-normal normal-case tracking-normal opacity-60">← swipe to delete</span>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[72px] rounded-2xl bg-surface border border-border" />
                ))}
              </div>
            ) : (
              entries.slice(0, 15).map((entry) => (
                <SwipeToDelete key={entry.id} onDelete={() => handleDelete(entry.id)}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4 bg-surface border border-border flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                        {entry.date}
                      </div>
                      <div className="font-semibold text-sm truncate">
                        {entry.type}: {entry.note}
                      </div>
                    </div>
                    {entry.amount > 0 && (
                      <div className="font-bold text-green text-base flex-shrink-0 ml-3">
                        +₹{entry.amount.toLocaleString()}
                      </div>
                    )}
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
