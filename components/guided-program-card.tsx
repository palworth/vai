import { Card } from "@/components/ui/card";
import { InstructorInfo } from "@/components/InstructorInfo";
import type { DataItem } from "../utils/types";

interface DietScheduleCardProps {
  data: DataItem & {
    type: "diet-schedule";
    scheduleName: string;
    feedingTimes: string[];
    foodType: string;
    brandName: string;
    quantity: number;
    dogName?: string;
  };
}

export function GuidedProgramCard({ data }: DietScheduleCardProps) {
  return (
    <Card className="bg-gray-50 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="space-y-2 mb-4 sm:mb-0">
          {/* Tag */}
          <span className="inline-block px-3 py-1 bg-white rounded-full text-sm text-gray-600">
            Diet Schedule
          </span>
          {/* Schedule Name */}
          <h2 className="text-2xl font-bold">{data.scheduleName}</h2>
          {/* Details */}
          <div className="space-y-1 text-gray-600">
            <div className="flex items-center gap-2">
              {/* Feeding Times Icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="currentColor"
                  d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"
                />
              </svg>
              <span>Feeding Times: {data.feedingTimes.join(", ")}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Food Type Icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="currentColor"
                  d="M4 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4z"
                />
              </svg>
              <span>Food: {data.foodType}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Brand Icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="currentColor"
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.41-2 5.67-5 9.88C9 14.67 7 11.41 7 9z"
                />
              </svg>
              <span>Brand: {data.brandName}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Quantity Icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M3 3h18v2H3z" />
              </svg>
              <span>Quantity: {data.quantity} g</span>
            </div>
          </div>
        </div>
        {/* Use InstructorInfo to display the dog's name */}
        <InstructorInfo name={data.dogName || "Unknown Dog"} />
      </div>
    </Card>
  );
}
