// src/components/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
}

// 1. Define the color mapping for the cards
// Note: We are using the lighter '100' shades for consistency with the table rows.
const cardColorClasses: { [key: string]: string } = {
  Open: "bg-blue-100",
  Resolved: "bg-green-100",
  Closed: "bg-gray-200",
  Total: "bg-red-100",
  New: "bg-blue-100",
};

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  // 2. Look up the color class based on the card's title.
  // If a title doesn't match (like "Total"), it will default to 'bg-white'.
  const bgColor = cardColorClasses[title] || "bg-white";

  return (
    // 3. Apply the dynamic background color class here
    <div className={`p-8 rounded-lg shadow-md ${bgColor} hover:scale-105 transition-all`}>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default StatCard;
