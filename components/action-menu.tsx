// File: /components/action-menu.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { EventCard } from "@/types";
import { Modal } from "./ui/modal";
import { AddEventForm } from "@/components/add-event-form";
import { PoopJournalForm } from "@/components/PoopJournalForm";

interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventCard[];
  dogId?: string;
  onRefresh?: () => void; // New prop to trigger refresh
}

export function ActionMenu({ isOpen, onClose, events, dogId, onRefresh }: ActionMenuProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const router = useRouter();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed right-0 bottom-40 flex flex-col-reverse items-end gap-4 z-50 pr-4"
            >
              {events.map((event, index) => (
                <motion.button
                  key={event.title}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    transition: { delay: index * 0.05 },
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    transition: { delay: (events.length - 1 - index) * 0.05 },
                  }}
                  className="flex items-center justify-end gap-3 w-full"
                  onClick={() => {
                    setSelectedEvent(event);
                  }}
                >
                  <span className="text-sm font-medium">{event.title}</span>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: event.backgroundColor }}
                  >
                    <span className="text-white text-lg">
                      {event.title[0].toUpperCase()}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent ? selectedEvent.title : ""}
      >
        {selectedEvent?.title === "Poop Journal" ? (
          <PoopJournalForm
            dogId={dogId!}
            onSuccess={() => {
              setSelectedEvent(null);
              onClose();
              // Call the refresh callback passed from the page
              if (onRefresh) {
                onRefresh();
              }
            }}
          />
        ) : (
          <AddEventForm
            eventType={selectedEvent ? selectedEvent.title : ""}
            onSuccess={() => {
              setSelectedEvent(null);
              onClose();
              if (onRefresh) {
                onRefresh();
              }
            }}
          />
        )}
      </Modal>
    </>
  );
}
