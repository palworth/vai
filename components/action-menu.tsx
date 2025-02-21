"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { EventCard } from "@/types";
import { Modal } from "./ui/modal";
import { AddEventForm } from "@/components/add-event-forms/add-event-form";
import { VetEventsForm } from "@/components/add-event-forms/VetEventsForm";
import { DietEventsForm } from "@/components/add-event-forms/DietEventsForm";

interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventCard[];
  dogId?: string;
  onRefresh?: () => void; // New prop to trigger refresh
}

// Define event type sets.
const vetEventTypes = new Set([
  "Vet Appointment",
  "Vaccination Appointment",
  "Weight Change",
  "Health",
  "Poop Journal",
]);

const dietEventTypes = new Set(["Diet Exception", "Diet Schedule"]);

// Define excluded event types.
const excludedEventTypes = new Set(["Vet Hub", "Diet"]);

export function ActionMenu({ isOpen, onClose, events, dogId, onRefresh }: ActionMenuProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const router = useRouter();

  // Filter out excluded event types.
  const filteredEvents = events.filter(event => !excludedEventTypes.has(event.title));

  // A helper callback that closes the modal and menu immediately after a save.
  const handleSuccess = () => {
    setSelectedEvent(null);
    onClose();
    if (onRefresh) {
      onRefresh();
    }
  };

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
              {filteredEvents.map((event, index) => (
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
                    transition: { delay: (filteredEvents.length - 1 - index) * 0.05 },
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
        {selectedEvent && dietEventTypes.has(selectedEvent.title) ? (
          <DietEventsForm
            eventType={selectedEvent.title as "Diet Exception" | "Diet Schedule"}
            dogId={dogId!}
            onSuccess={handleSuccess}
          />
        ) : selectedEvent && vetEventTypes.has(selectedEvent.title) ? (
          <VetEventsForm
            eventType={
              selectedEvent.title as
                | "Vet Appointment"
                | "Vaccination Appointment"
                | "Weight Change"
                | "Health"
                | "Poop Journal"
            }
            dogId={dogId!}
            onSuccess={handleSuccess}
          />
        ) : (
          <AddEventForm
            eventType={selectedEvent ? selectedEvent.title : ""}
            onSuccess={handleSuccess}
          />
        )}
      </Modal>
    </>
  );
}
