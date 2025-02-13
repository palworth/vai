
"use client";
import { InstructorInfo } from "@/components/InstructorInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Utensils, ShoppingBag, Weight } from "lucide-react";
import type { DataItem } from "../utils/types";

interface DietScheduleCardProps {
  data: DataItem & {
    type: "diet-schedule";
    scheduleName: string;
    feedingTimes: ("morning" | "evening" | "all day")[];
    foodType: string;
    brandName: string;
    quantity: number;
    dogName?: string;
    dogImageUrl?: string;
    breed: string;
  };
}

function formatFeedingTimes(times: ("morning" | "evening" | "all day")[]) {
  if (times.includes("all day")) {
    return "All Day";
  }
  return times.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(" and ");
}

export function GuidedProgramCard({ data }: DietScheduleCardProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              Diet Schedule
            </Badge>
            <CardTitle>{data.scheduleName}</CardTitle>
          </div>
          <InstructorInfo
            name={data.dogName || "Unknown Dog"}
            imageUrl={data.dogImageUrl}
            breed={data.breed}
          />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <dt className="sr-only">Feeding Times</dt>
              <dd>
                <span className="font-medium">Feeding Times:</span>{" "}
                {formatFeedingTimes(data.feedingTimes)}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-muted-foreground" />
            <div>
              <dt className="sr-only">Food Type</dt>
              <dd>
                <span className="font-medium">Food:</span> {data.foodType}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
            <div>
              <dt className="sr-only">Brand</dt>
              <dd>
                <span className="font-medium">Brand:</span> {data.brandName}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="w-5 h-5 text-muted-foreground" />
            <div>
              <dt className="sr-only">Quantity</dt>
              <dd>
                <span className="font-medium">Quantity:</span> {data.quantity} g
              </dd>
            </div>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
