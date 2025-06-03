'use client';

import React, { useEffect, useState } from 'react';
import TicketsTable from './TicketsTable';

interface Ticket {
  sno: number;
  serialNumber: string;
  subject: {
    title: string;
    description: string;
  };
  name: string;
  platformName: string;
  Organization: string;
  status: 'New' | 'Open' | 'Hold' | 'InProgress' | 'Resolved' | 'Closed';
  category: 'bugs' | 'Tech support' | 'new feature' | 'others';
  priority: 'low' | 'medium' | 'high';
  type: 'Support' | 'Complaint' | 'Feedback';
  days: number;
  createdAt?: Date;
  updatedAt?: Date;
  closedAt?: Date;
}

const TicketsListWithPagination: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const LIMIT = 10;

  const fetchTickets = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?page=${pageNumber}&limit=${LIMIT}`);
      const data = await res.json();

      if (data.tickets) {
        setTickets((prev) => [...prev, ...data.tickets]);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(page);
  }, [page]);

  const handleViewMore = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  return (
    <div>
      <TicketsTable tickets={tickets} startingIndex={(page - 1) * LIMIT} />
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleViewMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md shadow-md hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Loading more...' : 'View More Tickets'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketsListWithPagination;
