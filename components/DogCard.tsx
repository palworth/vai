import React from "react";

// Define the props type for our DogCard component.
type DogCardProps = {
  data: {
    name: string;
    breed: string;
    age: number;
    sex: string;
    weight: number;
    birthday?: any; // could be a Firestore Timestamp or string
  };
};

// Helper to format the birthday.
// If the birthday is a Firestore Timestamp (object with a "seconds" field),
// it converts it to a localized date string; otherwise, it returns the value as is.
const formatBirthday = (birthday: any): string => {
  if (birthday && typeof birthday === "object" && "seconds" in birthday) {
    const date = new Date(birthday.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return birthday ? String(birthday) : "N/A";
};

const DogCard: React.FC<DogCardProps> = ({ data }) => {
  // Off grey background for the card.
  const cardBackgroundColor = "#F0F0F0";

  return (
    <div
      className="rounded-xl p-6 shadow-md text-gray-800"
      style={{ backgroundColor: cardBackgroundColor }}
    >
      <h3 className="text-xl font-bold mb-2">{data.name}</h3>
      <p>
        <strong>Breed:</strong> {data.breed}
      </p>
      <p>
        <strong>Age:</strong> {data.age}
      </p>
      <p>
        <strong>Sex:</strong> {data.sex}
      </p>
      <p>
        <strong>Weight:</strong> {data.weight}
      </p>
      <p>
        <strong>Birthday:</strong> {formatBirthday(data.birthday)}
      </p>
    </div>
  );
};

export default DogCard;
