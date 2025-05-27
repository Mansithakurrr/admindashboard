// controllers/ticketController.ts
import {
  createTicket,
  getTicketStats,
  getTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
} from '@/services/ticketService';

export async function fetchStats() {
  return await getTicketStats();
}

export async function fetchTickets(params: URLSearchParams) {
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '10');
  const status = params.get('status');
  const search = params.get('search');

  const query: any = {};
  if (status) query.status = status;
  if (search) query.subject = { $regex: search, $options: 'i' };

  return await getTickets(query, page, limit);
}

export async function fetchTicket(id: string) {
  return await getTicketById(id);
}

export async function patchTicket(id: string, updates: any) {
  return await updateTicketById(id, updates);
}

export async function removeTicket(id: string) {
  return await deleteTicketById(id);
}

export async function postTicket(data: any) {
  return await createTicket(data);
}
