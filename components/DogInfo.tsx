"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrintIcon as Paw } from "lucide-react";

interface InstructorInfoProps {
  name: string;
  imageUrl?: string;
  breed: string;
  size?: "small" | "large"; // <-- new optional prop
}

export function InstructorInfo({ name, imageUrl, breed, size = "small" }: InstructorInfoProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Decide on classes based on size
  const isLarge = size === "large";

  return (
    <div className="flex items-center gap-3">
      {/* Make the avatar bigger if size="large" */}
      <Avatar className={isLarge ? "w-16 h-16" : ""}>
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        {/* Bigger text for name if size="large" */}
        <span className={isLarge ? "text-3xl font-bold" : "text-sm font-medium"}>
          {name}
        </span>
        {/* Bigger text for breed if size="large" */}
        <span
          className={
            isLarge
              ? "text-xl text-muted-foreground flex items-center gap-1"
              : "text-xs text-muted-foreground flex items-center gap-1"
          }
        >
          <Paw className={isLarge ? "w-4 h-4" : "w-3 h-3"} />
          {breed}
        </span>
      </div>
    </div>
  );
}
