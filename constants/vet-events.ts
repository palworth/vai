import { EVENT_COLORS } from "@/constants/colors";

export const vetEvents = [
  {
    title: "Vet Appointment",
    backgroundColor: EVENT_COLORS.vetAppointment, // Royal Blue
    href: "vet-appointment",
  },
  {
    title: "Vaccination Appointment",
    backgroundColor: EVENT_COLORS.vaccinationAppointment, // Lime Green
    href: "vaccination-appointment",
  },
  {
    title: "Weight Change",
    backgroundColor: EVENT_COLORS.weightChange, // Orange Red
    href: "weight-change",
  },
  {
    title: "Poop Journal",
    backgroundColor: EVENT_COLORS.poopJournal, // Saddle Brown
    href: "poop-journal",
  },
  {
    title: "Health",
    backgroundColor: EVENT_COLORS.health, // Uses health color from the colors file
    href: "health",
  },
];
