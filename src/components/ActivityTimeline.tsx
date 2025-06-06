// src/components/ActivityTimeline.tsx
"use client"

import React from 'react';
import { ActivityLogEntry } from '@/types/ticket'; // Assuming you have this type defined

interface ActivityTimelineProps {
  activities: ActivityLogEntry[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return <p className="text-center text-gray-500 mt-4">No activity has been recorded for this ticket.</p>;
  }

  // Sort activities by timestamp, OLDEST first, to show a chronological timeline
  const sortedActivities = [...activities].sort((a, b) => {
    // Convert timestamp strings to Date objects for accurate comparison
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateA - dateB; // Ascending order (oldest first)
  });

  return (
    <div className=" max-h-[calc(100vh-200px)] overflow-y-auto p-6 ">
      {sortedActivities.map((activity, index) => (
        <div key={activity.id || index} className="relative pl-8">
          {/* Timeline Dot and Line */}
          <div className="absolute left-0 top-1 h-full">
            <span className="absolute left-[-5.5px] top-0 block h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white"></span>
            {/* Don't draw a line for the very last item in the timeline */}
            {index < sortedActivities.length - 1 && (
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
            {/* {activity.from && activity.to && (
              <p className="text-sm text-gray-600">
                Changed from <span className="font-medium text-red-600">{activity.from}</span> to <span className="font-medium text-green-600">{activity.to}</span>
              </p>
            )} */}
            {activity.details && (
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded break-words">
                {activity.details}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
