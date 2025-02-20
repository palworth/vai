"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { ActionMenu } from "./action-menu";
import { vetEvents } from "@/constants/vet-events";

interface FloatingActionButtonVetProps {
  dogId?: string;
  onRefresh?: () => void;
}

export function FloatingActionButtonVet({ dogId, onRefresh }: FloatingActionButtonVetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Custom success handler: collapse menu and call onRefresh if provided.
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
        events={vetEvents}
        dogId={dogId}
        // Pass the custom success handler to your form inside ActionMenu
        onRefresh={handleSuccess}
      />
    </>
  );
}
