// src/components/TicketsDataTable.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation"; // 1. IMPORT useRouter
import {
  ColumnDef,
  // ... other imports from @tanstack/react-table
  flexRender,
  getCoreRowModel,
  ColumnFiltersState, // Import ColumnFiltersState if you use it explicitly for typing setColumnFilters
  SortingState, // Import SortingState
  VisibilityState, // Import VisibilityState
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row, // Import Row type
} from "@tanstack/react-table";
// ... other imports (Button, DropdownMenu, Input, Table etc.)
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Ticket } from "@/lib/mockData"; // Assuming Ticket type is needed here or passed via TData
import { Ticket } from "../types/ticket";

// 1. IMPORT SHADCN UI SELECT COMPONENTS
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

interface DataTableProps<TData extends Ticket, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean; // <-- NEW PROP
}

// 2. DEFINE STATUS OPTIONS FOR THE FILTER DROPDOWN
// const STATUS_FILTER_OPTIONS: (Ticket['status'] | 'All')[] = [
//   "All", "New", "Open", "Hold", "InProgress", "Resolved", "Closed"
// ];

export function TicketsDataTable<TData extends Ticket, TValue>({
  columns,
  data,
  showPagination = true, // <-- DEFAULT TO TRUE
}: DataTableProps<TData, TValue>) {
  console.log("TicketsDataTable: Received data prop length:", data.length);
  console.log(
    "TicketsDataTable: Received data prop (first 5 items):",
    data.slice(0, 5)
  );

  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>([]); // Explicit type
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  ); // Explicit type
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({}); // Explicit type
  // const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    // Conditionally include pagination related models and state
    // If showPagination is false, we don't need getPaginationRowModel for the final output.
    // The table.getRowModel() will then refer to the model before pagination (e.g., filtered/sorted).
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(showPagination // Only include pagination model and state if pagination is shown
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          // Manual pagination can be true if you control pageIndex/pageSize via state,
          // but if you want it to paginate the 'data' prop internally:
          // autoResetPageIndex: false, // Or true depending on desired behavior
        }
      : {
          // When pagination is off, ensure we are not trying to manage its state
          // Or, you can explicitly set a very large page size if pagination is not truly off.
          // However, omitting getPaginationRowModel when showPagination is false might be cleaner
          // if TanStack Table correctly falls back to getFilteredRowModel for table.getRowModel().
          // Let's try ensuring the page size is large enough if pagination model is always included.
        }),

    // If getPaginationRowModel is always included, try this:
    // initialState: {
    //   pagination: {
    //     pageSize: showPagination ? 10 : data.length, // Default page size for dashboard, all data for allTickets
    //   },
    // },
    // Or more simply, when showPagination is false, TanStack Table V8 by default will show all rows
    // if getPaginationRowModel is used but no specific page size is limiting it.
    // The issue might be that an initial page size of 10 is "sticking".

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // onRowSelectionChange: setRowSelection, // Remove if row selection checkboxes are gone
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      // rowSelection, // Remove if row selection checkboxes are gone
      // If pagination is active, its state needs to be here too.
      // pagination: showPagination ? undefined : { pageIndex: 0, pageSize: data.length }, // This could work
    },
    // Ensure pagination is manually handled or effectively disabled when showPagination is false
    manualPagination: !showPagination, // If true, you must provide pageCount, pageIndex, pageSize
    pageCount: !showPagination ? 1 : undefined, // If manual and !showPagination, only 1 page (all data)
  });
  const handleRowClick = (row: Row<TData>) => {
    const ticketId = row.original._id;
    if (ticketId) {
      // Ensure ticketId is not undefined
      router.push(`/dashboard/tickets/${ticketId}`);
    } else {
      console.error("Ticket ID is undefined for row:", row.original);
    }
  };
  console.log(
    "TicketsDataTable: Data length passed to table instance:",
    data.length
  );
  console.log(
    "TicketsDataTable: table.getRowModel().rows.length:",
    table.getRowModel().rows.length
  );
  console.log(
    "TicketsDataTable: table.getState().pagination:",
    table.getState().pagination
  );

  return (
    <div className="w-full mt-8 bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center py-4 space-x-4 bg-white z-50">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm h-10" // Standardized height with Select
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto h-10">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
