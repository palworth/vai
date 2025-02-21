"use client";
import { useRouter } from "next/navigation";
import { InstructorInfo } from "@/components/DogInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Utensils, ShoppingBag, Weight } from "lucide-react";
import { EVENT_COLORS } from "@/constants/colors";

interface DietScheduleCardProps {
  data: any; // merged data from API response
}

function formatFeedingTimes(times: string[] | undefined): string {
  if (!times || times.length === 0) return "N/A";
  // Normalize feeding times: convert "allDay" to "all day"
  const normalized = times.map((t) =>
    t.toLowerCase() === "allday" ? "all day" : t.toLowerCase()
  );
  if (normalized.includes("all day")) {
    return "All Day";
  }
  return normalized
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(" and ");
}

export function DietScheduleCardNew({ data }: DietScheduleCardProps) {
  const router = useRouter();

  // Merge the root-level data with nested data.
  const mergedData = {
    id: data.id,
    eventDate: data.eventDate,
    scheduleName: data.scheduleName || (data.data && data.data.scheduleName) || "Diet Schedule",
    feedingTimes: data.feedingTimes || (data.data && data.data.feedingTimes) || [],
    foodType: data.foodType || (data.data && data.data.foodType) || "",
    brandName: data.brandName || (data.data && data.data.brandName) || "",
    quantity: data.quantity || (data.data && data.data.quantity),
    dogName: data.dogName,
    dogImageUrl: data.dogImageUrl || (data.data && data.data.dogImageUrl) || null,
    breed: data.breed || data.dogBreed || "",
  };

  const handleClick = () => {
    router.push(`/diet-schedule/${mergedData.id}`);
  };

  return (
    <div
      className="border rounded-lg shadow-lg p-4 flex justify-between items-start transition duration-300"
      onClick={handleClick}
    >
      <Card className={`${EVENT_COLORS["diet-schedule-bg"]}`}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                Diet Schedule
              </Badge>
              <CardTitle>{mergedData.scheduleName}</CardTitle>
            </div>
            <InstructorInfo
              name={mergedData.dogName || "Unknown Dog"}
              imageUrl={mergedData.dogImageUrl}
              breed={mergedData.breed}
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
                  {formatFeedingTimes(mergedData.feedingTimes)}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-muted-foreground" />
              <div>
                <dt className="sr-only">Food Type</dt>
                <dd>
                  <span className="font-medium">Food:</span> {mergedData.foodType}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <div>
                <dt className="sr-only">Brand</dt>
                <dd>
                  <span className="font-medium">Brand:</span> {mergedData.brandName}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="w-5 h-5 text-muted-foreground" />
              <div>
                <dt className="sr-only">Quantity</dt>
                <dd>
                  <span className="font-medium">Quantity:</span> {mergedData.quantity} g
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
