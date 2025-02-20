// File: /components/floating-action-button-poop.tsx
"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { ActionMenu } from "./action-menu";
import { poopEvents } from "@/constants/poop-events";

interface FloatingActionButtonPoopProps {
  dogId?: string;
  onRefresh?: () => void; // New callback to refresh events
}

export function FloatingActionButtonPoop({ dogId, onRefresh }: FloatingActionButtonPoopProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        className="fixed bottom-20 right-4 w-12 h-12 bg-black rounded-full shadow-lg flex items-center justify-center z-50"
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <motion.div initial={false} animate={{ rotate: isOpen ? 45 : 0 }}>
          {isOpen ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
        </motion.div>
      </motion.button>

      <ActionMenu isOpen={isOpen} onClose={() => setIsOpen(false)} events={poopEvents} dogId={dogId} onRefresh={onRefresh} />
    </>
  );
}
