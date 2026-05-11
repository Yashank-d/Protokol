"use client";

import { useState, useEffect, useCallback } from "react";
import { IconMoon, IconSun, IconLayoutDashboard, IconScale, IconAperture, IconNotebook } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import HabitPane from "./HabitPane";
import WeightPane from "./WeightPane";
import WorkPane from "./WorkPane";
import ReviewPane from "./ReviewPane";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("habits");
  const [theme, setTheme] = useState<string | null>(null); // null = not yet loaded
  const [dateInfo, setDateInfo] = useState({ day: "Loading", date: "..." });

  useEffect(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem("beast_tracker");
    let savedTheme: string | null = null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme) savedTheme = parsed.theme;
      } catch {
        // ignore
      }
    }

    // 2. Auto-detect system preference if no saved theme
    if (!savedTheme) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      savedTheme = prefersDark ? "dark" : "light";
    }

    setTheme(savedTheme);

    const d = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    setDateInfo({
      day: days[d.getDay()],
      date: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    });
  }, []);

  useEffect(() => {
    if (!theme) return;
    if (theme === "light") {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Haptic
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }

    const saved = localStorage.getItem("beast_tracker");
    let state: Record<string, unknown> = {};
    if (saved) {
      try { state = JSON.parse(saved); } catch {
        // ignore
      }
    }
    state = { ...state, theme: newTheme };
    localStorage.setItem("beast_tracker", JSON.stringify(state));
  };

  const handleTabSwitch = useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    // Haptic on tab switch
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
    setActiveTab(tabId);
  }, [activeTab]);

  const tabs = [
    { id: "habits", icon: IconLayoutDashboard, label: "Habits" },
    { id: "weight", icon: IconScale, label: "Weight" },
    { id: "work", icon: IconAperture, label: "Work" },
    { id: "review", icon: IconNotebook, label: "Review" },
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Header */}
      <header className="flex justify-between items-center p-6 pb-3 flex-shrink-0 z-10">
        <div className="flex flex-col">
          <span className="font-bold text-[28px] tracking-tight">{dateInfo.day}</span>
          <span className="text-[13px] text-text-muted font-medium uppercase tracking-widest mt-1">
            {dateInfo.date}
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-surface border border-border text-text transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <IconMoon size={20} /> : <IconSun size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-[120px] scrollbar-none relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "habits" && <HabitPane />}
            {activeTab === "weight" && <WeightPane />}
            {activeTab === "work" && <WorkPane />}
            {activeTab === "review" && <ReviewPane />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom Nav */}
      <div className="absolute bottom-0 left-0 w-full px-5 pb-6 z-50 bg-gradient-to-t from-bg via-bg to-transparent">
        <nav className="flex p-1.5 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-nav-bg backdrop-blur-xl border border-nav-border transition-colors duration-300">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-full transition-all relative ${
                  isActive ? "text-text" : "text-text-muted hover:text-text"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-nav-active rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={22} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
