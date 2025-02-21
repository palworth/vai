"use client";

import { useMemo, useState } from "react";

export interface VetEvent {
  id: string;
  eventDate: string; // ISO date string, e.g. "2025-02-19T03:06:31.000Z"
  type: string; // "vetAppointment" or "vaccinationAppointment"
  data: {
    appointmentType?: string;
    vaccinationsType?: string;
    vetName?: string;
    notes?: string;
    vetDocuments?: string[];
  };
}

interface VetDocumentsProps {
  events: VetEvent[];
}

export default function VetDocuments({ events }: VetDocumentsProps) {
  // Local state to control the modal display; when set, it contains the docs for that event.
  const [selectedDocuments, setSelectedDocuments] = useState<string[] | null>(null);

  // Filter events to only those with vetDocuments attached, and sort from newest to oldest by eventDate.
  const eventsWithDocs = useMemo(() => {
    return events
      .filter((event) => {
        const docs = event.data?.vetDocuments;
        return docs && docs.length > 0 &&
          (event.type === "vetAppointment" || event.type === "vaccinationAppointment");
      })
      .sort(
        (a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );
  }, [events]);

  // Helper to format the event date into separate date and time strings.
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return {
      datePart: dateObj.toLocaleDateString("en-US", { dateStyle: "medium" }),
      timePart: dateObj.toLocaleTimeString("en-US", { timeStyle: "short" }),
    };
  };

  // Inline modal for viewing documents.
  const modal = selectedDocuments && (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={() => setSelectedDocuments(null)}
    >
      <div
        className="bg-white p-4 rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Vet Documents</h3>
        {selectedDocuments.map((docUrl, idx) => {
          // Minimal approach: if the URL includes "pdf" (case-insensitive), assume it's a PDF.
          const isPDF = docUrl.toLowerCase().includes("pdf");
          return (
            <div key={idx} className="mb-4 border-b pb-2">
              {isPDF ? (
                <iframe
                  src={docUrl}
                  className="w-full h-64 border"
                  title={`PDF Preview ${idx}`}
                />
              ) : (
                <img
                  src={docUrl}
                  alt={`Vet Document ${idx}`}
                  className="max-w-full max-h-64"
                />
              )}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(docUrl);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = blobUrl;
                      a.download = "document";
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(blobUrl);
                    } catch (error) {
                      console.error("Download error:", error);
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow transition duration-300 ease-in-out"
                >
                  Download
                </button>
              </div>
            </div>
          );
        })}
        <button
          onClick={() => setSelectedDocuments(null)}
          className="mt-4 w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="border p-4 mb-4 rounded shadow bg-gray-50">
      <h3 className="text-xl font-semibold mb-4">Veterinary Documents</h3>
      <div className="space-y-4">
        {eventsWithDocs.length === 0 ? (
          <p>No vet documents found.</p>
        ) : (
          eventsWithDocs.map((event) => {
            const { datePart, timePart } = formatDate(event.eventDate);
            const typeLabel =
              event.type === "vetAppointment"
                ? event.data.appointmentType
                : event.data.vaccinationsType;
            return (
              <div
                key={event.id}
                className="border rounded-lg shadow-lg p-4 flex justify-between items-start"
              >
                <div className="w-2/3">
                  <p>
                    <strong>
                      {event.type === "vetAppointment"
                        ? "Appointment Type:"
                        : "Vaccination Type:"}
                    </strong>{" "}
                    {typeLabel || "N/A"}
                  </p>
                  <p>
                    <strong>Vet Name:</strong> {event.data.vetName || "N/A"}
                  </p>
                  {event.data.notes && (
                    <p>
                      <strong>Notes:</strong> {event.data.notes}
                    </p>
                  )}
                </div>
                <div className="w-1/3 text-right flex flex-col items-end">
                  <div>
                    <p className="font-semibold">{datePart}</p>
                    <p className="text-sm text-gray-500">{timePart}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDocuments(event.data.vetDocuments!)}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
                  >
                    view documents
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {modal}
    </div>
  );
}
