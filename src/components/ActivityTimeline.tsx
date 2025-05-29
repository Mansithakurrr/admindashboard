"use client"

import React from 'react';
// import { ActivityLogEntry } from '@/lib/mockData'; 

interface ActivityTimelineProps {
  activities: any[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return <p className="text-gray-500">No activity recorded yet.</p>;
  }

  // Sort activities by timestamp, most recent first
  const sortedActivities = [...activities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="space-y-6">
      {sortedActivities.map((activity) => (
        <div key={activity.id} className="relative pl-8">
          {/* Timeline Dot and Line */}
          <div className="absolute left-0 top-1 h-full">
            <span className="absolute left-[-5.5px] top-0 block h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-900"></span>
            <span className="absolute left-0 top-3 block h-full w-0.5 bg-gray-200 dark:bg-gray-700"></span>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold text-gray-700">{activity.action}</p>
              <p className="text-xs text-gray-400">
                {activity.timestamp.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            {activity.user && <p className="text-xs text-gray-500 mb-2">by {activity.user}</p>}
            {activity.from && activity.to && (
              <p className="text-sm text-gray-600">
                Changed from <span className="font-medium">{activity.from}</span> to <span className="font-medium">{activity.to}</span>
              </p>
            )}
            {activity.details && (
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                {activity.details}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};