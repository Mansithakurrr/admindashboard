// services/ticketService.ts
import  Ticket from '@/models/Ticket';
import  Counter from '@/models/Counter';

async function getNextSerialNumber(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { name: 'ticket' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return `${counter.value.toString()}`;
}

export const createTicket = async (ticketData: any) => {
  const serialNumber = await getNextSerialNumber();
  const ticket = new Ticket({ ...ticketData, serialNumber });
  return await ticket.save();
};

export const getTicketStats = async () => {
  const [total, open, resolved, closed] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'Open' }),
    Ticket.countDocuments({ status: 'Resolve' }),
    Ticket.countDocuments({ status: 'Closed' }),
  ]);
  return { total, open, resolved, closed };
};

export const getTickets = async (query: any, page: number, limit: number) => {
  const total = await Ticket.countDocuments(query);
  const data = await Ticket.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return { data, total, page, limit };
};

export const getTicketById = async (id: string) => {
  return await Ticket.findById(id);
};

export const updateTicketById = async (id: string, updates: any) => {
  updates.updatedAt = new Date();
  return await Ticket.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteTicketById = async (id: string) => {
  return await Ticket.findByIdAndDelete(id);
};
