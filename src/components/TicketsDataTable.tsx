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
}

// 2. DEFINE STATUS OPTIONS FOR THE FILTER DROPDOWN
// const STATUS_FILTER_OPTIONS: (Ticket['status'] | 'All')[] = [
//   "All", "New", "Open", "Hold", "InProgress", "Resolved", "Closed"
// ];

export function TicketsDataTable<TData extends Ticket, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]); // Explicit type
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  ); // Explicit type
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({}); // Explicit type
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
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

  return (
    <div className="w-full mt-8 bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center py-4 space-x-4">
        {" "}
        {/* Added space-x-4 for better spacing */}
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
              {" "}
              {/* Standardized height */}
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
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} ticket(s) selected.
        </div> */}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}


        {/* 3. ADD THE STATUS FILTER DROPDOWN */}
// {/* <Select
//           value={(table.getColumn("status")?.getFilterValue() as string) ?? "All"}
//           onValueChange={(value) =>
//             table.getColumn("status")?.setFilterValue(value === "All" ? undefined : value)
//           }
//         >
//           <SelectTrigger className="w-[180px] h-10"> {/* Standardized height */}
//             <SelectValue placeholder="Filter by Status" />
//           </SelectTrigger>
//           <SelectContent>
//             {STATUS_FILTER_OPTIONS.map((statusOption) => (
//               <SelectItem key={statusOption} value={statusOption}>
//                 {statusOption}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select> */}
