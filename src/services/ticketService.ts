// src/services/ticketService.ts
import Ticket from "@/models/Ticket";
import Counter from "@/models/Counter"; // Your Counter model

// Helper function to get the next sequence for serialNumber
async function getNextFormattedSerialNumber(): Promise<string> {
  console.log("SERVICE: Attempting to find/update counter with name: 'ticket'");
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "ticket" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    if (!counter || typeof counter.value === "undefined") {
      console.error(
        "SERVICE CRITICAL: Counter not found or 'value' field is missing!"
      );
      throw new Error(
        "Failed to retrieve or update ticket serial number counter."
      );
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
// Helper function to create a log entry
const createLogEntry = (
  user: string,
  action: string,
  from?: string,
  to?: string,
  details?: string
) => {
  return {
    id: Date.now().toString(), // Or use a UUID library
    timestamp: new Date(),
    user: user || "System",
    action,
    from,
    to,
    details,
  };
};

// --- THIS IS THE MAIN FUNCTION TO UPDATE ---
export const updateTicketById = async (id: string, updates: any) => {
  // 'updates' is the object from the frontend, e.g., { status: 'Resolved' } or { subject: { title: 'New Title' } }

  // 1. Fetch the ticket first to get its current state for comparison
  const currentTicket = await Ticket.findById(id);
  if (!currentTicket) {
    throw new Error("Ticket not found for update.");
  }

  // 2. Prepare the payload for MongoDB
  const updatePayload: any = { $set: {} };
  const activitiesToLog: any[] = [];

  // Iterate over the keys in the 'updates' object
  for (const key in updates) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      // Handle nested subject updates
      if (key === "subject" && typeof updates.subject === "object") {
        if (
          updates.subject.title &&
          currentTicket.subject.title !== updates.subject.title
        ) {
          activitiesToLog.push(
            createLogEntry(
              "Admin",
              "Title Updated",
              currentTicket.subject.title,
              updates.subject.title
            )
          );
          updatePayload.$set["subject.title"] = updates.subject.title;
        }
        if (
          updates.subject.description &&
          currentTicket.subject.description !== updates.subject.description
        ) {
          activitiesToLog.push(createLogEntry("Admin", "Description Updated"));
          updatePayload.$set["subject.description"] =
            updates.subject.description;
        }
      }
      // Handle top-level field updates like status, priority, etc.
      else if (
        currentTicket[key as keyof typeof currentTicket] !== updates[key]
      ) {
        if (key === "status") {
          activitiesToLog.push(
            createLogEntry(
              "Admin",
              "Status Changed",
              currentTicket.status,
              updates[key]
            )
          );
        } else if (key === "priority") {
          activitiesToLog.push(
            createLogEntry(
              "Admin",
              "Priority Changed",
              currentTicket.priority,
              updates[key]
            )
          );
        } else if (key === "category") {
          activitiesToLog.push(
            createLogEntry(
              "Admin",
              "Category Changed",
              currentTicket.category,
              updates[key]
            )
          );
        }
        // Add more 'else if' blocks here for other fields you want to log

        // Add the field to the update payload
        updatePayload.$set[key] = updates[key];
      }
    }
  }

  // 3. Add any new activity log entries to be pushed to the array
  if (activitiesToLog.length > 0) {
    updatePayload.$push = {
      activityLog: { $each: activitiesToLog, $position: 0 },
    }; // $each to add multiple, $position: 0 to add to the start (newest first)
  }

  // 4. Ensure there's something to update to avoid an empty database call
  if (Object.keys(updatePayload.$set).length === 0 && !updatePayload.$push) {
    console.log("No actual changes detected. Returning current ticket.");
    return currentTicket;
  }

  // Add the automatic updatedAt timestamp
  updatePayload.$set.updatedAt = new Date();

  // 5. Perform the update with both $set (for fields) and $push (for activity log)
  return await Ticket.findByIdAndUpdate(id, updatePayload, { new: true });
};

export const createTicket = async (ticketData: any) => {
  console.log("SERVICE: createTicket received initial data:", ticketData);
  try {
    const serialNumber = await getNextFormattedSerialNumber();

    const ticketPayload = {
      ...ticketData,
      serialNumber: serialNumber,
    };
    // Remove days from payload if it's NaN or not needed
    if (isNaN(ticketPayload.days)) {
      delete ticketPayload.days;
    }

    console.log(
      "SERVICE: Payload to be saved (with serialNumber):",
      ticketPayload
    );

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
  const [total, open, resolved, closed, today] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: "Open" }),
    Ticket.countDocuments({ status: "Resolved" }),
    Ticket.countDocuments({ status: "Closed" }),
    Ticket.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);
  return { total, open, resolved, closed, today };
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

// export const updateTicketById = async (id: string, updates: any) => {
//   updates.updatedAt = new Date();
//   return await Ticket.findByIdAndUpdate(id, updates, { new: true });
// };

export const deleteTicketById = async (id: string) => {
  return await Ticket.findByIdAndDelete(id);
};

export async function updateResolvedRemarks(ticketId: string, remarks: string) {
  // This can now just call the main update function
  return await updateTicketById(ticketId, { resolvedRemarks: remarks });
}
// export async function updateResolvedRemarks(ticketId: string, remarks: string) {
//   const updatedTicket = await Ticket.findByIdAndUpdate(
//     ticketId,
//     { resolvedRemarks: remarks },
//     { new: true }
//   );
//   return updatedTicket;
// }
