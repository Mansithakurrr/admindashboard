// src/components/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
}

// 1. Define the color mapping for the cards
// Note: We are using the lighter '100' shades for consistency with the table rows.
// const cardColorClasses: { [key: string]: string } = {
//   Today: "bg-amber-100 text-amber-800",       // Warm & attention-grabbing
//   Resolved: "bg-emerald-100 text-emerald-800", // Clean & success vibe
//   Closed: "bg-slate-100 text-slate-800",       // Muted for inactive
//   Total: "bg-indigo-100 text-indigo-800",      // Professional, standout
//   New: "bg-sky-100 text-sky-800",  
// };

const cardColorClasses: { [key: string]: string } = {
  Today: "bg-amber-100 text-amber-800",       // Warm & attention-grabbing
  Resolved: "bg-emerald-100 text-emerald-800", // Clean & success vibe
  Closed: "bg-slate-100 text-slate-800",       // Muted for inactive
  Total: "bg-indigo-100 text-indigo-800",      // Professional, standout
  New: "bg-sky-100 text-sky-800",
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
