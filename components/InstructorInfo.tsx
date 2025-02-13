"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrintIcon as Paw } from "lucide-react";

interface InstructorInfoProps {
  name: string;
  imageUrl?: string;
  breed: string;
}

export function InstructorInfo({ name, imageUrl, breed }: InstructorInfoProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Paw className="w-3 h-3" />
          {breed}
        </span>
      </div>
    </div>
  );
}
