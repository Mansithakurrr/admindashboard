// src/components/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
}

// Corrected the keys to match the 'title' prop from Dashboard.tsx
const cardColorClasses: { [key: string]: string } = {
  "Total": "bg-indigo-100 text-indigo-800",
  "Today's": "bg-amber-100 text-amber-800", // Changed "Today" to "Today's"
  "Open": "bg-sky-100 text-sky-800",       // Changed "New" to "Open"
  "Resolved": "bg-emerald-100 text-emerald-800",
  "Closed": "bg-slate-100 text-slate-800",
};

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  // Look up the color class. If a title doesn't have a specific color,
  // it will default to 'bg-white'.
  const bgColor = cardColorClasses[title] || "bg-white";

  return (
    // Apply the dynamic background color class here
    <div className={`p-6 rounded-lg shadow-md ${bgColor} hover:scale-105 transition-all`}>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default StatCard;