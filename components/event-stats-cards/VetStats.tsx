"use client";

import { useMemo } from "react";

interface VetEvent {
  id: string;
  eventDate: string; // ISO date string
  type: string;      // "vetAppointment" or "vaccinationAppointment"
  dogName?: string;  // May store dog's name top-level
  data?: {
    dogName?: string;         // Or it might be nested here
    appointmentType?: string;
    vetName?: string;
    vaccinationsType?: string;
  };
}

interface Dog {
  id: string;
  name: string;
  // ... any other dog properties
}

interface VetStatsProps {
  events: VetEvent[];
  selectedDog?: Dog | null; // We pass this in from the parent
}

export default function VetStats({ events, selectedDog }: VetStatsProps) {
  const now = new Date();

  const { nextVetAppointment, nextVaccinationAppointment } = useMemo(() => {
    // Filter future events (eventDate > now).
    const futureEvents = events.filter((evt) => {
      const evtDate = new Date(evt.eventDate);
      return evtDate > now;
    });

    // Filter by type.
    const futureVetAppointments = futureEvents.filter(
      (evt) => evt.type === "vetAppointment"
    );
    const futureVaccinations = futureEvents.filter(
      (evt) => evt.type === "vaccinationAppointment"
    );

    // Sort each array ascending by date.
    futureVetAppointments.sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
    futureVaccinations.sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );

    return {
      nextVetAppointment: futureVetAppointments[0] || null,
      nextVaccinationAppointment: futureVaccinations[0] || null,
    };
  }, [events, now]);

  // Helper to format event date.
  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "None";
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // We only show "for DogName" if NO dog is selected
  // (meaning we are displaying events for all dogs).
  function maybeShowDogName(evt: VetEvent): string {
    if (selectedDog) {
      // A single dog is selected, so skip showing dog name
      return "";
    }
    // No dog is selected, so we show the dog's name if we have it
    const name = evt.dogName || evt.data?.dogName;
    return name ? ` for ${name}` : "";
  }

  return (
    <div className="border p-4 mb-4 rounded shadow bg-gray-50">
      <h3 className="text-xl font-semibold mb-2">Next Appointments</h3>
      <p>
        <strong>Next Vet Appointment:</strong>{" "}
        {nextVetAppointment
          ? `${formatDate(nextVetAppointment.eventDate)}${maybeShowDogName(nextVetAppointment)}`
          : "None"}
      </p>
      <p>
        <strong>Next Vaccination Appointment:</strong>{" "}
        {nextVaccinationAppointment
          ? `${formatDate(nextVaccinationAppointment.eventDate)}${maybeShowDogName(nextVaccinationAppointment)}`
          : "None"}
      </p>
    </div>
  );
}
