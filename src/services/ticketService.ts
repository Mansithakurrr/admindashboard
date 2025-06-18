// src/services/ticketService.ts
import Ticket from '@/models/Ticket';
import Counter from '@/models/Counter';
import Platform from '@/models/Platform';
import Organization from '@/models/Organization';
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

async function getNextFormattedSerialNumber(): Promise<string> {
  console.log("SERVICE: Attempting to find/update counter with name: 'ticket'");
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "ticket" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    if (!counter || typeof counter.value === 'undefined') {
      console.error("SERVICE CRITICAL: Counter not found or 'value' field is missing!");
      throw new Error("Failed to retrieve or update ticket serial number counter.");
    }

    const nextSequence = counter.value;
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
    id: Date.now().toString(),
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
  const currentTicket = await Ticket.findById(id);
  if (!currentTicket) {
    throw new Error("Ticket not found for update.");
  }

  const updatePayload: any = { $set: {} };
  const activitiesToLog: any[] = [];

  for (const key in updates) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
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
      else if (key === "platformData" && typeof updates[key] === "object") {
        const { platformId, platformName } = updates[key];
        if (currentTicket.platformId !== platformId) {
          activitiesToLog.push(
            createLogEntry("Admin", "Platform Changed", currentTicket.platformName, platformName)
          );
          updatePayload.$set["platformId"] = platformId;
          updatePayload.$set["platformName"] = platformName;
        }
      } else if (key === "organizationData" && typeof updates[key] === "object") {
        const { orgId, organizationName } = updates[key];
        if (currentTicket.orgId !== orgId) {
          activitiesToLog.push(
            createLogEntry("Admin", "Organization Changed", currentTicket.organizationName, organizationName)
          );
          updatePayload.$set["orgId"] = orgId;
          updatePayload.$set["organizationName"] = organizationName;
        }
      }
      else if (currentTicket[key as keyof typeof currentTicket] !== updates[key]) {
        if (key === "status") {
          activitiesToLog.push(
            createLogEntry("Admin", "Status Changed", currentTicket.status, updates[key])
          );
        } else if (key === "priority") {
          activitiesToLog.push(
            createLogEntry("Admin", "Priority Changed", currentTicket.priority, updates[key])
          );
        } else if (key === "category") {
          activitiesToLog.push(
            createLogEntry("Admin", "Category Changed", currentTicket.category, updates[key])
          );
        }else if (key === "orgId") {
          activitiesToLog.push(
            createLogEntry(
              "Admin",
              "Organization Changed",
              currentTicket.organizationName,
              updates.organizationName
            )
          );
        } else if (key === "platformId") {
          activitiesToLog.push(
            createLogEntry(
              "Admin",
              "Platform Changed",
              currentTicket.platformName,
              updates.platformName
            )
          );
        }
      

        updatePayload.$set[key] = updates[key];
      }
      

      // else if (
      //   currentTicket[key as keyof typeof currentTicket] !== updates[key]
      // ) {
      //   if (key === "status") {
      //     activitiesToLog.push(
      //       createLogEntry(
      //         "Admin",
      //         "Status Changed",
      //         currentTicket.status,
      //         updates[key]
      //       )
      //     );
      //   } else if (key === "priority") {
      //     activitiesToLog.push(
      //       createLogEntry(
      //         "Admin",
      //         "Priority Changed",
      //         currentTicket.priority,
      //         updates[key]
      //       )
      //     );
      //   } else if (key === "category") {
      //     activitiesToLog.push(
      //       createLogEntry(
      //         "Admin",
      //         "Category Changed",
      //         currentTicket.category,
      //         updates[key]
      //       )
      //     );
      //   }
      //   updatePayload.$set[key] = updates[key];
      // }
    }
  }
  if (activitiesToLog.length > 0) {
    updatePayload.$push = {
      activityLog: { $each: activitiesToLog, $position: 0 },
    };
  }

  if (Object.keys(updatePayload.$set).length === 0 && !updatePayload.$push) {
    console.log("No actual changes detected. Returning current ticket.");
    return currentTicket;
  }

  updatePayload.$set.updatedAt = new Date();

  return await Ticket.findByIdAndUpdate(id, updatePayload, { new: true });
};


// export async function patchTicket(id: string, updates: any) {
//   return await updateTicketById(id, updates);
// }
export async function updateResolvedRemarks(ticketId: string, remarks: string) {
  return await updateTicketById(ticketId, { resolvedRemarks: remarks });
}


export async function createTicket(data: any) {
  const {
    name,
    email,
    contactNumber,
    subject,
    category,
    priority,
    platform,
    organization,
    attachments = [],
    type,
  } = data;

  if (!subject || !subject.title || !subject.description) {
    throw new Error("Subject title and description are required");
  }

  const validCategories = ["bugs", "Tech support", "new feature", "others"];
  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
  }

  const validPriorities = ["low", "medium", "high"];
  if (priority && !validPriorities.includes(priority)) {
    throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(", ")}`);
  }

  let platformId;
  if (mongoose.Types.ObjectId.isValid(platform)) {
    platformId = platform;
  } else {
    const platformDoc = await Platform.findOne({ name: platform });
    if (!platformDoc) throw new Error("Invalid platform name");
    platformId = platformDoc._id;
  }

  let orgId;
  if (mongoose.Types.ObjectId.isValid(organization)) {
    orgId = organization;
  } else {
    const orgDoc = await Organization.findOne({ name: organization });
    if (!orgDoc) throw new Error("Invalid organization name");
    orgId = orgDoc._id;
  }

  const serialNumber = await getNextFormattedSerialNumber();

  const newTicket = await Ticket.create({
    serialNumber,
    name,
    email,
    contactNumber,
    subject,
    category,
    priority,
    platformId,
    orgId,
    attachments,
    type,
    status: "New",
  });

  return newTicket;
}

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
      .populate('platformId', 'name')     // Only populate the `name` field
      .populate('orgId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();  // <-- Add this


    const tickets = ticketsArray.map(ticket => ({
      ...ticket,
      platformName: ticket.platformId?.name || '',
      organizationName: ticket.orgId?.name || ticket.orgId,
      platformId: ticket.platformId?._id || ticket.platformId,
      orgId: ticket.orgId?._id || ticket.orgId,
    }));

    const totalPages = Math.ceil(total / limit);

    // === THE FIX IS HERE ===
    // Change 'data: ticketsArray' to 'tickets: ticketsArray'

    return { tickets, total, page, limit, totalPages };
    // =======================
  } catch (error) {
    console.error("Error in getTickets service:", error);
    throw error;
  }
};



export const getTicketById = async (id: string) => {
  if (!isValidObjectId(id)) return null;

  const ticketDoc = await Ticket.findById(id)
    .populate("platformId", "name")
    .populate("orgId", "name")
    .lean() as any

  if (!ticketDoc) return null;

  const sanitizeArray = (arr: any[]) =>
    arr.map((item) => ({
      ...item,
      _id: item._id?.toString?.() ?? item._id,
    }));

  return {
    _id: ticketDoc._id.toString(),
    serialNumber: ticketDoc.serialNumber || "",
    subject: {
      title: ticketDoc.subject?.title || "",
      description: ticketDoc.subject?.description || "",
    },
    name: ticketDoc.name || "",
    email: ticketDoc.email || "",
    contactNumber: ticketDoc.contactNumber || "",
    platformId:
    ticketDoc.platformId && typeof ticketDoc.platformId === "object" && "_id" in ticketDoc.platformId
      ? ticketDoc.platformId._id.toString()
      : "",
  orgId:
    ticketDoc.orgId && typeof ticketDoc.orgId === "object" && "_id" in ticketDoc.orgId
      ? ticketDoc.orgId._id.toString()
      : "",
  platformName:
    ticketDoc.platformId && typeof ticketDoc.platformId === "object" && "name" in ticketDoc.platformId
      ? ticketDoc.platformId.name
      : "",
  organizationName:
    ticketDoc.orgId && typeof ticketDoc.orgId === "object" && "name" in ticketDoc.orgId
      ? ticketDoc.orgId.name
      : "",
    status: ticketDoc.status,
    category: ticketDoc.category,
    priority: ticketDoc.priority,
    type: ticketDoc.type || "Support",
    resolvedRemarks: ticketDoc.resolvedRemarks || "",

    attachments: sanitizeArray(ticketDoc.attachments || []),
    comments: sanitizeArray(ticketDoc.comments || []),
    activityLog: sanitizeArray(ticketDoc.activityLog || []),

    createdAt: ticketDoc.createdAt?.toISOString() || "",
    updatedAt: ticketDoc.updatedAt?.toISOString() || "",
    __v: ticketDoc.__v,
  };
};




export const deleteTicketById = async (id: string) => {
  if (!isValidObjectId(id)) return null;

  return await Ticket.findByIdAndDelete(id);
};