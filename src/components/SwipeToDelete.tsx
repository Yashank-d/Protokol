"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { IconTrash } from "@tabler/icons-react";

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

export default function SwipeToDelete({ children, onDelete, className = "" }: SwipeToDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-120, -60], [1, 0]);
  const deleteScale = useTransform(x, [-120, -60], [1, 0.6]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      setIsDeleting(true);
      // Haptic feedback
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
      setTimeout(() => onDelete(), 300);
    }
  };

  if (isDeleting) {
    return (
      <motion.div
        initial={{ height: "auto", opacity: 1 }}
        animate={{ height: 0, opacity: 0, marginBottom: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      />
    );
  }

  return (
    <div ref={constraintsRef} className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Delete background */}
      <motion.div
        className="absolute inset-0 bg-red flex items-center justify-end pr-6 rounded-2xl"
        style={{ opacity: deleteOpacity }}
      >
        <motion.div style={{ scale: deleteScale }}>
          <IconTrash size={22} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
