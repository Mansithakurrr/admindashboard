import TicketsListWithPagination from "@/components/TicketsListWithPagination";

export default function TicketsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">All Tickets</h1>
      <TicketsListWithPagination />
    </div>
  );
}
