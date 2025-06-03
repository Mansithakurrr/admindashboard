// src/services/ticketService.ts
import Ticket from '@/models/Ticket';
import Counter from '@/models/Counter'; // Your Counter model

// Helper function to get the next sequence for serialNumber
async function getNextFormattedSerialNumber(): Promise<string> {
  console.log("SERVICE: Attempting to find/update counter with name: 'ticket'");
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'ticket' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    
    if (!counter || typeof counter.value === 'undefined') {
      console.error("SERVICE CRITICAL: Counter not found or 'value' field is missing!");
      throw new Error("Failed to retrieve or update ticket serial number counter.");
    }
    
    const nextSequence = counter.value;
    // Format the serial number (e.g., T-00001)
    const plainSerialNumber = String(nextSequence);
    console.log("SERVICE: Generated plain serialNumber:", plainSerialNumber);
    return plainSerialNumber;

  } catch (error) {
    console.error("SERVICE Error in getNextFormattedSerialNumber:", error);
    throw error;
  }
}

export const createTicket = async (ticketData: any) => {
  // This function now expects ticketData WITHOUT serialNumber.
  // It will generate the serialNumber itself.
  console.log("SERVICE: createTicket received initial data:", ticketData);
  try {
    const serialNumber = await getNextFormattedSerialNumber();
    
    const ticketPayload = { 
      ...ticketData, 
      serialNumber: serialNumber 
      // Remove 'days' if not explicitly provided by form and not required with default in schema
    };
    // Remove days from payload if it's NaN or not needed
    if (isNaN(ticketPayload.days)) {
        delete ticketPayload.days;
    }


    console.log("SERVICE: Payload to be saved (with serialNumber):", ticketPayload);
    
    const ticket = new Ticket(ticketPayload);
    const savedTicket = await ticket.save();
    console.log("SERVICE: Successfully saved ticket:", savedTicket);
    return savedTicket;
  } catch (error) {
    console.error("SERVICE Error in createTicket:", error);
    throw error;
  }
};

export const getTicketStats = async () => {
  const [total, open, resolved, closed] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'Open' }),
    Ticket.countDocuments({ status: 'Resolved' }),
    Ticket.countDocuments({ status: 'Closed' }),
  ]);
  return { total, open, resolved, closed };
};

export const getTickets = async (query: any, page: number, limit: number) => {
  try {
    const total = await Ticket.countDocuments(query);
    const ticketsArray = await Ticket.find(query) // Renamed for clarity
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    // === THE FIX IS HERE ===
    // Change 'data: ticketsArray' to 'tickets: ticketsArray'
    return { tickets: ticketsArray, total, page, limit, totalPages }; 
    // =======================

  } catch (error) {
    console.error("Error in getTickets service:", error);
    throw error; 
  }
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
