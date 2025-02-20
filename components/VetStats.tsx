"use client";

import { useMemo } from "react";

interface VetEvent {
  id: string;
  eventDate: string; // ISO date string, e.g. "2025-02-19T03:06:31.000Z"
  type: string; // e.g. "vetAppointment" or "vaccinationAppointment"
  data?: {
    appointmentType?: string;
    vetName?: string;
    vaccinationsType?: string;
  };
}

interface VetStatsProps {
  events: VetEvent[];
}

export default function VetStats({ events }: VetStatsProps) {
  const now = new Date();

  // useMemo to compute next upcoming appointments when events change.
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

    const nextVetAppointment = futureVetAppointments[0] || null;
    const nextVaccinationAppointment = futureVaccinations[0] || null;

    return { nextVetAppointment, nextVaccinationAppointment };
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

  return (
    <div className="border p-4 mb-4 rounded shadow bg-gray-50">
      <h3 className="text-xl font-semibold mb-2">Next Appointments</h3>
      <p>
        <strong>Next Vet Appointment:</strong>{" "}
        {nextVetAppointment
          ? formatDate(nextVetAppointment.eventDate)
          : "None"}
      </p>
      <p>
        <strong>Next Vaccination Appointment:</strong>{" "}
        {nextVaccinationAppointment
          ? formatDate(nextVaccinationAppointment.eventDate)
          : "None"}
      </p>
    </div>
  );
}
