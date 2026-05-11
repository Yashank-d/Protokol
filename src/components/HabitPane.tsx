"use client";

import { useState, useEffect, useRef, useTransition, useCallback, useMemo } from "react";
import { IconFlame, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { getTodayStr } from "@/lib/utils";
import { motion } from "framer-motion";
import { getHistory, toggleHabit as toggleHabitAction } from "@/actions";
import confetti from "canvas-confetti";

const HABITS = [
  { 
    id: "water", 
    title: "500ml water on wake-up",
    desc: "You've been without water for 7–8 hours. Dehydration is the #1 cause of morning brain fog and that heavy, don't-want-to-move feeling. Down 500ml before your phone, before coffee, before anything.",
    tag: "Kills morning fog"
  },
  { 
    id: "phone_morn", 
    title: "No phone first 30 mins",
    desc: "The moment you open reels, your brain gets a dopamine hit it can't recover from for hours. Those 30 minutes without a screen are what separates a productive day from a wasted one. Protect them hard.",
    tag: "Dopamine reset"
  },
  { 
    id: "gym", 
    title: "Gym / swim done",
    desc: "You already have this habit. That makes you more disciplined than most people — you just haven't channelled it into the rest of your day yet. Show up. Every rep is building the version of you that travels the world with a camera.",
    tag: "You already own this"
  },
  { 
    id: "photo", 
    title: "Photography deep work block",
    desc: "25 minutes. Phone in another room. No YouTube, no reels. Edit, learn, pitch, shoot, plan — anything that moves your photography career forward. This single block, done daily, is 150+ hours of real work in a year.",
    tag: "Career builder"
  },
  { 
    id: "rice", 
    title: "No rice at night",
    desc: "At night your metabolism slows significantly. Heavy carbs at this hour get stored as fat, not burned as energy. Switch to rotis, dal, and sabzi. This one change alone can drop 3–4kg over two months without doing anything else differently.",
    tag: "Fastest fat loss hack"
  },
  { 
    id: "phone_eve", 
    title: "Phone down by 10pm",
    desc: "Blue light delays melatonin production by up to 90 minutes. That's why you can't sleep at night and can't wake up in the morning. Phone goes to another room — not on silent, not face down. Another room. This fixes your sleep within 2 weeks.",
    tag: "Fixes daytime sleepiness"
  },
  { 
    id: "journal", 
    title: "Wrote 3 lines in notebook",
    desc: "What did I do. What did I feel. What is tomorrow's one task. Takes 3 minutes. Ends the day with closure instead of guilt. Over 30 days it becomes the most honest record of who you're becoming. Don't skip it — this is the habit that makes all others stick.",
    tag: "The glue habit"
  },
];

const bentoConfig = [
  { id: "water",      spanCol: "col-span-2", spanRow: "row-span-1" }, // Wide
  { id: "phone_morn", spanCol: "col-span-1", spanRow: "row-span-1" }, // Half
  { id: "gym",        spanCol: "col-span-1", spanRow: "row-span-1" }, // Half
  { id: "photo",      spanCol: "col-span-2", spanRow: "row-span-1" }, // Wide — moved up, was narrow + mismatched
  { id: "rice",       spanCol: "col-span-2", spanRow: "row-span-1" }, // Wide
  { id: "phone_eve",  spanCol: "col-span-1", spanRow: "row-span-1" }, // Half
  { id: "journal",    spanCol: "col-span-1", spanRow: "row-span-1" }, // Half
];

export default function HabitPane() {
  const [history, setHistory] = useState<Record<string, Record<string, boolean>>>({});
  const [stats, setStats] = useState({ streak: 0, best: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [celebrated, setCelebrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getHistory().then((data) => {
      setHistory(data);
      setIsLoading(false);
    });
  }, []);

  const checkAllDone = useCallback((hist: Record<string, Record<string, boolean>>) => {
    const today = getTodayStr();
    const todayData = hist[today];
    if (!todayData) return false;
    return HABITS.every((h) => todayData[h.id]);
  }, []);

  useEffect(() => {
    let currentStreak = 0;
    let bestStreak = 0;
    let totalLogged = 0;

    const sortedDates = Object.keys(history).sort();
    let tempStreak = 0;
    let lastDate: string | null = null;

    for (const date of sortedDates) {
      let completedCount = 0;
      HABITS.forEach((h, index) => {
        if (history[date][h.id] || history[date][index]) completedCount++;
      });

      if (completedCount > 0) totalLogged++;

      if (completedCount === HABITS.length) {
        if (!lastDate) {
          tempStreak = 1;
        } else {
          const prev = new Date(lastDate);
          const curr = new Date(date);
          const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) tempStreak++;
          else tempStreak = 1;
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        lastDate = date;
      } else {
        tempStreak = 0;
        lastDate = null;
      }
    }

    const today = getTodayStr();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, "0")}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;

    if (lastDate === today || lastDate === yesterday) {
      currentStreak = tempStreak;
    }

    setStats({ streak: currentStreak, best: bestStreak, total: totalLogged });
  }, [history]);

  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      const container = scrollRef.current;
      if (container.scrollWidth > container.clientWidth) {
        container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      }
    }
  }, [history, isLoading]);

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#ff5722", "#ffc400", "#00e676"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#ff5722", "#ffc400", "#00e676"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const toggleHabit = (id: string) => {
    const today = getTodayStr();

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }

    const newHistory = { ...history };
    if (!newHistory[today]) newHistory[today] = {};
    newHistory[today] = { ...newHistory[today] };
    newHistory[today][id] = !newHistory[today][id];
    setHistory(newHistory);

    if (!celebrated && checkAllDone(newHistory)) {
      setCelebrated(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([50, 80, 50, 80, 100]);
      }
      fireConfetti();
    }

    startTransition(() => {
      toggleHabitAction(today, id);
    });
  };

  // 100-Day Challenge Grid Data
  const challengeGridData = useMemo(() => {
    const today = getTodayStr();
    const sortedDates = Object.keys(history).sort();
    
    let startDateStr = today;
    for (const date of sortedDates) {
      let count = 0;
      HABITS.forEach((h, index) => {
        if (history[date][h.id] || history[date][index]) count++;
      });
      if (count > 0) {
        startDateStr = date;
        break;
      }
    }

    const d = new Date(startDateStr);
    const gridDays = [];
    for (let i = 0; i < 100; i++) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      let count = 0;
      if (history[dateStr]) {
        HABITS.forEach((h, index) => {
          if (history[dateStr][h.id] || history[dateStr][index]) count++;
        });
      }
      gridDays.push({ date: dateStr, count, isFuture: dateStr > today });
      d.setDate(d.getDate() + 1);
    }
    return gridDays;
  }, [history]);

  const renderCalendar = () => {
    const d = new Date();
    const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
    const todayStr = getTodayStr();
    d.setDate(d.getDate() - 3);
    const elements = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayName = dayNames[d.getDay()];
      const dayNum = d.getDate();
      let statusClass = "";
      if (dateStr <= todayStr) {
        let completedCount = 0;
        if (history[dateStr]) {
          HABITS.forEach((h, index) => {
            if (history[dateStr][h.id] || history[dateStr][index]) completedCount++;
          });
        }
        if (completedCount === HABITS.length) statusClass = "border-green text-green opacity-60";
        else if (completedCount > 0) statusClass = "border-amber text-amber opacity-60";
        else statusClass = "border-red text-red opacity-50";
      } else {
        statusClass = "border-border text-text opacity-35";
      }
      const isToday = dateStr === todayStr;
      elements.push(
        <div key={dateStr} className={`flex-shrink-0 w-11 h-[60px] rounded-[22px] flex flex-col items-center justify-center bg-transparent border border-border transition-all duration-200 ${statusClass} ${isToday ? "opacity-100 scale-110 border-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-10" : ""}`}>
          <span className="text-[10px] font-semibold uppercase mb-1">{dayName}</span>
          <span className="font-bold text-base">{dayNum}</span>
        </div>
      );
      d.setDate(d.getDate() + 1);
    }
    return elements;
  };

  const today = getTodayStr();
  const todayHistory = history[today] || {};
  const doneCount = HABITS.filter((h, index) => todayHistory[h.id] || todayHistory[index]).length;

  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col gap-6 pt-4 pb-20">
      
      {/* 1. Hero Card */}
      <div className="rounded-3xl p-6 relative overflow-hidden bg-orange text-white shadow-[0_16px_32px_var(--orange-glow)] border-none">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] flex items-center gap-1.5 mb-3 opacity-80">
          <IconFlame size={14} /> MY MISSION
        </div>
        <div className="font-bold text-[26px] leading-[1.1] mb-4 tracking-tight">
          To stay focused & dangerous.
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke="white" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(doneCount / HABITS.length) * 97.4} 97.4`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-sm">
              {doneCount}/{HABITS.length}
            </span>
          </div>
          <div className="text-sm font-medium opacity-80">
            {doneCount === HABITS.length
              ? "🔥 Perfect day! All habits locked in."
              : doneCount > 0
              ? `${HABITS.length - doneCount} more to go. Keep pushing.`
              : "Fresh start. Let's crush it today."}
          </div>
        </div>
      </div>

      {/* 2. Consistency Timeline (The week view) */}
      <div className="rounded-2xl p-6 bg-surface border border-border">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3 opacity-80">CONSISTENCY TIMELINE</div>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-1 justify-center scrollbar-none py-2.5">
          {renderCalendar()}
        </div>
      </div>

      {/* 3. Habit List (Moved below Consistency Timeline) */}
      <div>
        <div className="flex flex-col gap-1 mb-5 pl-1">
          <span className="text-3xl font-bold tracking-tight text-text">{todayFormatted}</span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-text-muted uppercase tracking-[1.5px]">Today&apos;s Protocol</span>
            {isPending && <IconLoader2 size={14} className="animate-spin text-text-muted" />}
          </div>
        </div>
        
       <div className="grid grid-cols-2 gap-[10px]">
  {isLoading ? (
    <div className="animate-pulse col-span-2 flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[140px] rounded-2xl bg-surface border border-border" />
      ))}
    </div>
  ) : (
    HABITS.map((h, index) => {
      const isDone = todayHistory[h.id] || todayHistory[index];
      const config = bentoConfig[index];
      const isWide = config.spanCol === "col-span-2";

      const textClass = isWide
        ? "text-[19px] font-extrabold leading-tight tracking-tight"
        : "text-[14px] font-bold leading-tight tracking-tight";

      return (
        <motion.div
          key={h.id}
          whileTap={{ scale: 0.97 }}
          onClick={() => toggleHabit(h.id)}
          className={`
            ${config.spanCol}
            rounded-[24px] p-[18px] flex flex-col
            cursor-pointer transition-all duration-300 border-none
            ${isDone ? "bg-orange text-[#1A1A1A]" : "bg-surface text-text"}
            ${isWide ? "min-h-[140px]" : "h-[110px]"}
          `}
        >
          {/* Top: title + check */}
          <div className="flex justify-between items-start gap-2 flex-1">
            <div className={`${textClass} flex-1`}>{h.title}</div>
            {isDone ? (
              <motion.div
                animate={{ scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <IconCheck size={20} stroke={3} className="text-[#1A1A1A]" />
              </motion.div>
            ) : (
              <div className="flex-shrink-0 w-[24px] h-[24px] rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-orange/60" />
              </div>
            )}
          </div>

          {/* Wide: description */}
          {isWide && (
            <div className={`text-[12px] leading-[1.4] mt-2 ${isDone ? "text-black/70" : "text-white/45"}`}>
              {h.desc}
            </div>
          )}

          {/* Bottom: tag (wide) or status (narrow) */}
          <div className="mt-4">
            {isWide ? (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${isDone ? "bg-black/10 text-black/60" : "bg-white/6 text-white/40"}`}>
                {h.tag}
              </span>
            ) : (
              <span className={`text-[11px] font-semibold ${isDone ? "text-black/50" : "text-white/20"}`}>
                {isDone ? "✓ Done" : "Tap to mark"}
              </span>
            )}
          </div>
        </motion.div>
      );
    })
  )}
</div>
      </div>

      {/* 4. 100-Day Journey Grid */}
      <div className="rounded-2xl p-6 bg-surface border border-border overflow-hidden">
        <div className="text-[14px] font-bold tracking-tight mb-5 text-text">
          My 100-Day Journey
        </div>
        
        {/* Stats */}
        <div className="flex justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-text-muted mb-1">Total completed</span>
            <span className="font-semibold text-sm">{stats.total} days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-text-muted mb-1">Longest streak</span>
            <span className="font-semibold text-sm">{stats.best} days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-text-muted mb-1">Current streak</span>
            <span className="font-semibold text-sm">{stats.streak} days</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-wrap gap-[6px] pb-2">
          {challengeGridData.map((day, i) => {
            const isToday = day.date === today;
            let bgClass = ""; 
            
            if (day.count > 0) {
              if (day.count === HABITS.length) {
                bgClass = "bg-green border border-green shadow-[0_0_8px_var(--green-glow)]"; // Completed
              } else {
                bgClass = "bg-amber border border-amber shadow-[0_0_8px_var(--amber-glow)]"; // Partial
              }
            } else {
              // Empty or future
              if (isToday) {
                bgClass = "border border-orange bg-transparent"; // Highlight today with orange border
              } else {
                bgClass = "border border-white/40 bg-transparent opacity-20"; // Standard empty
              }
            }

            return (
              <div 
                key={i} 
                className={`w-[18px] h-[18px] rounded-[4px] transition-all duration-300 ${bgClass}`}
                title={day.isFuture ? `Day ${i + 1} (Future)` : `Day ${i + 1}: ${day.count} habits done`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 flex items-center justify-between text-[10px] text-text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-[2px] border border-white/40 bg-transparent opacity-50" />
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-[2px] bg-amber" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-[2px] bg-green" />
            <span>Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
