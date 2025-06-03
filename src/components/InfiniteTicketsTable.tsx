"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Ticket } from "@/types/ticket";
import { columns } from "@/app/dashboard/columns";
import { TicketsDataTable } from "./TicketsDataTable";

export default function InfiniteTicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef<HTMLDivElement | null>(null);

  const fetchTickets = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/tickets?page=${page}&limit=10`);
      const data = await res.json();

      if (Array.isArray(data?.tickets)) {
        setTickets((prev) => [...prev, ...data.tickets]);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  // Fetch on page change
  useEffect(() => {
    fetchTickets();
  }, [page]);

  // Intersection observer to load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => loader.current && observer.unobserve(loader.current);
  }, [hasMore]);

  return (
    <>
      <TicketsDataTable columns={columns} data={tickets} />
      {hasMore && (
        <div ref={loader} className="text-center py-4 text-gray-500">
          Loading more...
        </div>
      )}
      {!hasMore && (
        <div className="text-center py-4 text-gray-400">No more tickets.</div>
      )}
    </>
  );
}
