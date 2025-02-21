"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { ActionMenu } from "../action-menu";
import { dietEvents } from "@/constants/diet-events";

interface FloatingActionButtonDietProps {
  dogId?: string;
  onRefresh?: () => void;
}

export function FloatingActionButtonDiet({ dogId, onRefresh }: FloatingActionButtonDietProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    if (onRefresh) {
      onRefresh();
    }
  };

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

      <ActionMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        events={dietEvents}
        dogId={dogId}
        onRefresh={handleSuccess}
      />
    </>
  );
}
