"use client";

import { useState, useEffect, useTransition } from "react";
import { IconNotebook, IconThumbUp, IconAlertCircle, IconTarget, IconPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { getTodayStr } from "@/lib/utils";
import { getReviewEntries, addReviewEntry, deleteReviewEntry, type ReviewEntry } from "@/actions";
import SwipeToDelete from "./SwipeToDelete";

export default function ReviewPane() {
  const [entries, setEntries] = useState<ReviewEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [well, setWell] = useState("");
  const [broke, setBroke] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    getReviewEntries().then((data) => {
      setEntries(data);
      setIsLoading(false);
    });
  }, []);

  const handleSave = () => {
    if (!well.trim() && !broke.trim() && !goal.trim()) return;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }

    const today = getTodayStr();

    setEntries((prev) => [
      { id: Date.now(), date: today, well: well.trim(), broke: broke.trim(), goal: goal.trim() },
      ...prev,
    ]);
    setWell("");
    setBroke("");
    setGoal("");

    startTransition(() => {
      addReviewEntry(today, well.trim(), broke.trim(), goal.trim());
    });
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    startTransition(() => {
      deleteReviewEntry(id);
    });
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Hero Card */}
      <div className="rounded-3xl p-6 relative overflow-hidden bg-green text-black shadow-[0_16px_32px_var(--green-glow)]">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] flex items-center gap-1.5 mb-3 opacity-70">
          <IconNotebook size={14} /> WEEKLY REVIEW
        </div>
        <div className="font-bold text-[26px] leading-[1.1] mb-4 tracking-tight">
          Reflect. Adjust. Dominate.
        </div>
        <div className="text-sm font-medium opacity-60">
          {entries.length} review{entries.length !== 1 ? "s" : ""} logged
        </div>
      </div>

      {/* Review Form */}
      <div className="rounded-2xl p-5 bg-surface border border-border flex flex-col gap-5">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px] opacity-80">NEW REVIEW</div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-green">
            <IconThumbUp size={14} /> What went well?
          </label>
          <textarea
            placeholder="Wins, progress, good decisions..."
            value={well}
            onChange={(e) => setWell(e.target.value)}
            rows={2}
            className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-text-muted border border-border rounded-xl p-3 resize-none focus:border-green transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-red">
            <IconAlertCircle size={14} /> What broke discipline?
          </label>
          <textarea
            placeholder="Slip-ups, missed targets..."
            value={broke}
            onChange={(e) => setBroke(e.target.value)}
            rows={2}
            className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-text-muted border border-border rounded-xl p-3 resize-none focus:border-red transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-amber">
            <IconTarget size={14} /> Next week&apos;s goal
          </label>
          <textarea
            placeholder="Focus area for the week..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={2}
            className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-text-muted border border-border rounded-xl p-3 resize-none focus:border-amber transition-colors"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || (!well.trim() && !broke.trim() && !goal.trim())}
          className="w-full py-3 rounded-xl bg-green text-black font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          <IconPlus size={16} /> Save Review
        </button>
      </div>

      {/* History */}
      {entries.length > 0 && (
        <div>
          <div className="font-bold text-[14px] text-text-muted uppercase tracking-[1.5px] mb-4 pl-1 flex items-center justify-between">
            <span>Past Reviews</span>
            <span className="text-[11px] font-normal normal-case tracking-normal opacity-60">← swipe to delete</span>
          </div>
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-[120px] rounded-2xl bg-surface border border-border" />
                ))}
              </div>
            ) : (
              entries.slice(0, 10).map((entry) => (
                <SwipeToDelete key={entry.id} onDelete={() => handleDelete(entry.id)}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-5 bg-surface border border-border flex flex-col gap-3"
                  >
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      {entry.date}
                    </div>
                    {entry.well && (
                      <div className="flex gap-2 items-start">
                        <IconThumbUp size={14} className="text-green flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          <strong className="text-green">Well:</strong> {entry.well}
                        </span>
                      </div>
                    )}
                    {entry.broke && (
                      <div className="flex gap-2 items-start">
                        <IconAlertCircle size={14} className="text-red flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          <strong className="text-red">Broke:</strong> {entry.broke}
                        </span>
                      </div>
                    )}
                    {entry.goal && (
                      <div className="flex gap-2 items-start">
                        <IconTarget size={14} className="text-amber flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          <strong className="text-amber">Goal:</strong> {entry.goal}
                        </span>
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
