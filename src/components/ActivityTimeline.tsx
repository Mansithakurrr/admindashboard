// src/components/ActivityTimeline.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ActivityLogEntry } from "@/types/ticket";
import { Button } from "@/components/ui/button";

interface ActivityTimelineProps {
  activities: ActivityLogEntry[];
}

const ITEMS_PER_PAGE = 5;

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedActivities = useMemo(() => {
    if (!activities) return [];
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
  }, [activities]);

  const totalPages = Math.ceil(sortedActivities.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentActivities = sortedActivities.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (!activities || activities.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        No activity has been recorded for this ticket.
      </p>
    );
  }

  return (
    <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-6">
      <div className="space-y-6">
        {currentActivities.map((activity, index) => (
          <div key={activity.id || index} className="relative pl-8">
            <div className="absolute left-0 top-1">
              <span className="absolute left-[-5.5px] top-0 block h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white"></span>
              {(index < currentActivities.length - 1 ||
                currentPage < totalPages) && (
                <span className="absolute left-0 top-3 block h-full w-0.5 bg-gray-200"></span>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-1 flex-wrap">
                <p className="font-semibold text-gray-700">{activity.action}</p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              {activity.user && (
                <p className="text-xs text-gray-500 mb-2">by {activity.user}</p>
              )}
              {activity.details && (
                <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 border rounded break-words">
                  {activity.details}
                </p>

              )}
              {activity.from && (
                <p className="text-xs font-semibold text-gray-500 mb-2">from {activity.from}</p>
              )}
              {activity.to && (
                <p className="text-xs font-semibold text-gray-500 mb-2">to {activity.to}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-6 mt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
