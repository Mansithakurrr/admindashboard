// src/app/dashboard/allTickets/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react"; // Make sure useRef is imported
import { Ticket } from "@/types/ticketTypes";
import { columns } from "../columns";
import { TicketsDataTable } from "@/components/TicketsDataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

const PAGE_LIMIT = 10; // Set this back to 10 to clearly test pagination/infinite scroll

async function fetchPaginatedTickets(
  page: number,
  limit: number
): Promise<{ tickets: Ticket[]; totalPages: number; total: number }> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const fetchUrl = `/api/tickets?page=${page}&limit=${limit}`;
  // console.log(`AllTicketsPage: Fetching from URL: ${fetchUrl}`); // Keep this log
  const response = await fetch(fetchUrl, { cache: "no-store" });
  if (!response.ok) {
    const errorData = await response.text();
    // console.error(
    //   `AllTicketsPage: API request failed (${response.status}):`,
    //   errorData
    // ); // Keep this log
    throw new Error(`Failed to fetch tickets (${response.status})`);
  }
  const data = await response.json();
  // console.log(
  //   `AllTicketsPage: API Response for page ${page}, limit ${limit}:`,
  //   data
  // ); // Keep this log
  return {
    tickets: data.tickets || [],
    totalPages: data.totalPages || 0,
    total: data.total || 0,
  };
}

export default function AllTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalTickets, setTotalTickets] = useState(0);

  const initialLoadEffectRan = useRef(false); // To ensure initial load runs once

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  const loadMoreTickets = useCallback(
    async (pageToLoad: number) => {
      if (isLoading || (pageToLoad > 1 && !hasMore)) {
        // Check hasMore only for subsequent pages
        console.log(
          `AllTicketsPage: loadMoreTickets - returning early. PageToLoad: ${pageToLoad}, isLoading: ${isLoading}, hasMore: ${hasMore}`
        );
        return;
      }

      console.log(
        `AllTicketsPage: loadMoreTickets called. Fetching page: ${pageToLoad}`
      );
      setIsLoading(true);
      try {
        const data = await fetchPaginatedTickets(pageToLoad, PAGE_LIMIT);

        setTickets((prevTickets) => {
          // If it's the first page, replace tickets. Otherwise, append.
          const newTickets =
            pageToLoad === 1 ? data.tickets : [...prevTickets, ...data.tickets];
          console.log(
            `AllTicketsPage: setTickets called. Previous length: ${prevTickets.length}, New items: ${data.tickets.length}, Resulting length: ${newTickets.length}`
          );
          return newTickets;
        });

        setTotalTickets(data.total);
        const newHasMoreState = pageToLoad < data.totalPages;
        setHasMore(newHasMoreState);

        if (newHasMoreState) {
          setCurrentPage(pageToLoad + 1);
        }

        console.log(
          `AllTicketsPage: Load successful for page ${pageToLoad}. Next Page will be: ${
            newHasMoreState ? pageToLoad + 1 : pageToLoad
          }, HasMore: ${newHasMoreState}, TotalPages: ${data.totalPages}`
        );
      } catch (error) {
        console.error(
          "AllTicketsPage: Failed to load tickets for page " + pageToLoad + ":",
          error
        );
        setHasMore(false);
      }
      setIsLoading(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [isLoading, hasMore]
  ); // Removed currentPage, pass it as an argument

  // Effect for initial load
  useEffect(() => {
    if (!initialLoadEffectRan.current) {
      console.log(
        "AllTicketsPage: Initial load effect. Resetting and fetching page 1."
      );
      setTickets([]);
      setCurrentPage(1);
      setHasMore(true);
      setTotalTickets(0);
      setIsLoading(false);

      loadMoreTickets(1); // Call with explicit page number 1
      initialLoadEffectRan.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMoreTickets]); // Add loadMoreTickets as dependency

  // Effect for subsequent loads (infinite scroll)
  useEffect(() => {
    console.log(
      `AllTicketsPage: inView effect. InView: ${inView}, HasMore: ${hasMore}, IsLoading: ${isLoading}, CurrentPage: ${currentPage}`
    );
    // Trigger if inView, hasMore, not loading, and it's not the initial state before first load attempt (currentPage > 1)
    if (inView && hasMore && !isLoading && currentPage > 1) {
      loadMoreTickets(currentPage);
    }
  }, [inView, hasMore, isLoading, currentPage, loadMoreTickets]);

  // ===== ADD THIS useEffect TO MONITOR 'tickets' STATE =====
  useEffect(() => {
    console.log(
      "AllTicketsPage: 'tickets' state has changed. New length:",
      tickets.length
    );
    if (tickets.length > 0) {
      // console.log("AllTicketsPage: First ticket in state:", tickets[0]?._id, tickets[0]?.subject?.title);
    }
  }, [tickets]);
  // =========================================================

  return (
    <div className="container mx-auto p-4 py-6">
      <div className="flex items-center mb-6">
        {/* <Button asChild variant="outline"> */}
        <Link
          href="/dashboard"
          className="text-blue-500 hover:underline text-sm flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-left"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </Link>
        {/* </Button> */}
        <h1 className="text-3xl font-bold ml-6">
          All Tickets (
          {totalTickets > 0
            ? totalTickets
            : isLoading && tickets.length === 0
            ? "Loading..."
            : tickets.length}
          )
        </h1>
      </div>

      <TicketsDataTable
        columns={columns}
        data={tickets} // This 'tickets' state is passed here
        showPagination={false}
      />

      {isLoading && <p className="text-center py-4">Loading more tickets...</p>}

      {!isLoading && hasMore && (
        <div
          ref={ref}
          className="h-10 py-4 text-center text-sm text-muted-foreground"
        >
          {/* Scroll to load more... */}
        </div>
      )}

      {!isLoading && !hasMore && tickets.length > 0 && (
        <p className="text-center py-4 text-gray-500">
          You've reached the end of the list.
        </p>
      )}
      {!isLoading && !hasMore && tickets.length === 0 && !isLoading && (
        <p className="text-center py-4 text-gray-500">No tickets found.</p>
      )}
    </div>
  );
}
