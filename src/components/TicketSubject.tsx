// src/components/TicketSubject.tsx
import React from "react";

interface TicketSubjectProps {
  title: string;
  description: string;
}

const TicketSubject: React.FC<TicketSubjectProps> = ({
  title,
  description,
}) => {
  return (
    <div className="max-w-xs bg-white rounded-md shadow-lg p-2">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-gray-600 text-sm truncate">{description}</p>
    </div>
  );
};

export default TicketSubject;
