// src/services/ticketService.ts
import Ticket from '@/models/Ticket';
import Counter from '@/models/Counter'; // Your Counter model
import Platform from '@/models/Platform';
import Organization from '@/models/Organization';
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose"; // for ObjectId check

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

// export async function createTicket(data: any) {
//   const {
//     name,
//     email,
//     contactNumber,
//     subject,
//     description,
//     platform,
//     organization,
//     category,
//     priority,
//     attachments = [],
//   } = data;

//   // Convert platform & organization from name -> _id if needed
//   let platformId = platform;
//   let orgId = organization;

//   if (typeof platform === "string" && !platform.match(/^[0-9a-fA-F]{24}$/)) {
//     const platformDoc = await Platform.findOne({ name: platform });
//     if (!platformDoc) throw new Error("Invalid platform name");
//     platformId = platformDoc._id;
//   }

//   if (typeof organization === "string" && !organization.match(/^[0-9a-fA-F]{24}$/)) {
//     const orgDoc = await Organization.findOne({ name: organization });
//     if (!orgDoc) throw new Error("Invalid organization name");
//     orgId = orgDoc._id;
//   }

//   if (
//     !name ||
//     !email ||
//     !subject ||
//     !description ||
//     !category ||
//     !priority ||
//     !platformId ||
//     !orgId
//   ) {
//     throw new Error("Missing required fields");
//   }

//   // Generate serial number using counter
//   const counter = await Counter.findOneAndUpdate(
//     { name: "ticket" },
//     { $inc: { count: 1 } },
//     { new: true, upsert: true }
//   );

//   const serialNumber = `TICKET-${counter.count.toString().padStart(5, "0")}`;

//   // Create and save the ticket
//   const newTicket = await Ticket.create({
//     serialNumber,
//     name,
//     email,
//     contactNumber,
//     subject,
//     description,
//     category,
//     priority,
//     platformId,
//     orgId,
//     attachments,
//     status: "Open",
//   });

//   return newTicket;
// }

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

  // Validate subject
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

  // Resolve platform
let platformId;
if (mongoose.Types.ObjectId.isValid(platform)) {
  platformId = platform;
} else {
  const platformDoc = await Platform.findOne({ name: platform });
  if (!platformDoc) throw new Error("Invalid platform name");
  platformId = platformDoc._id;
}

// Resolve organization
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



// export async function createTicket(data: any) {
//   const {
//     name,
//     email,
//     contactNumber = "",
//     subject,
//     description,
//     category,
//     priority,
//     platform,
//     organization,
//     attachments = [],
//   } = data;

//   // Resolve platformId
//   let platformId = platform;
//   if (typeof platform === "string" && !platform.match(/^[0-9a-fA-F]{24}$/)) {
//     const platformDoc = await Platform.findOne({ name: platform });
//     if (!platformDoc) throw new Error("Invalid platform name");
//     platformId = platformDoc._id;
//   }

//   // Resolve orgId
//   let orgId = organization;
//   if (typeof organization === "string" && !organization.match(/^[0-9a-fA-F]{24}$/)) {
//     const orgDoc = await Organization.findOne({ name: organization });
//     if (!orgDoc) throw new Error("Invalid organization name");
//     orgId = orgDoc._id;
//   }

//   // Validate required fields
//   if (!name || !email || !subject || !description || !category || !priority || !platformId || !orgId) {
//     throw new Error("Missing required fields");
//   }

//   // Generate serial number
//   const counter = await Counter.findOneAndUpdate(
//     { name: "ticket" },
//     { $inc: { count: 1 } },
//     { new: true, upsert: true }
//   );

//   const serialNumber = `TICKET-${counter.count.toString().padStart(5, "0")}`;

//   // Create and return new ticket
//   const newTicket = await Ticket.create({
//     serialNumber,
//     name,
//     email,
//     contactNumber,
//     subject,
//     description,
//     category,
//     priority,
//     platformId,
//     orgId,
//     attachments,
//     status: "Open",
//   });

//   return newTicket;
// }


// export const createTicket = async (ticketData: any) => {
//   console.log("SERVICE: createTicket received initial data:", ticketData);
//   try {
//     const serialNumber = await getNextFormattedSerialNumber();

//     const ticketPayload = {
//       ...ticketData,
//       serialNumber: serialNumber
//     };
//     // Remove days from payload if it's NaN or not needed
//     if (isNaN(ticketPayload.days)) {
//       delete ticketPayload.days;
//     }


//     console.log("SERVICE: Payload to be saved (with serialNumber):", ticketPayload);

//     const ticket = new Ticket(ticketPayload);
//     const savedTicket = await ticket.save();
//     console.log("SERVICE: Successfully saved ticket:", savedTicket);
//     return savedTicket;
//   } catch (error) {
//     console.error("SERVICE Error in createTicket:", error);
//     throw error;
//   }
// };

export const getTicketStats = async () => {
  const [total, open, resolved, closed, today] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'Open' }),
    Ticket.countDocuments({ status: 'Resolved' }),
    Ticket.countDocuments({ status: 'Closed' }),
    Ticket.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
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
    .lean();

  if (!ticketDoc) return null;

  // Helper to convert _id to string inside arrays
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
      typeof ticketDoc.platformId === "object" && "_id" in ticketDoc.platformId
        ? ticketDoc.platformId._id.toString()
        : "",
    orgId:
      typeof ticketDoc.orgId === "object" && "_id" in ticketDoc.orgId
        ? ticketDoc.orgId._id.toString()
        : "",
    platformName:
      typeof ticketDoc.platformId === "object" && "name" in ticketDoc.platformId
        ? ticketDoc.platformId.name
        : "",
    organizationName:
      typeof ticketDoc.orgId === "object" && "name" in ticketDoc.orgId
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

// export const getTicketById = async (id: string) => {
//   if (!isValidObjectId(id)) return null;

//   const ticketDoc = await Ticket.findById(id)
//     .populate("platformId", "name")
//     .populate("orgId", "name")
//     .lean();

//   if (!ticketDoc) return null;

//   return {
//     _id: ticketDoc._id.toString(),
//     serialNumber: ticketDoc.serialNumber || "",
//     subject: {
//       title: ticketDoc.subject?.title || "",
//       description: ticketDoc.subject?.description || "",
//     },
//     name: ticketDoc.name || "",
//     email: ticketDoc.email || "",
//     contactNumber: ticketDoc.contactNumber || "",
//     platformId:
//       typeof ticketDoc.platformId === "object" && "_id" in ticketDoc.platformId
//         ? ticketDoc.platformId._id.toString()
//         : "",
//     orgId:
//       typeof ticketDoc.orgId === "object" && "_id" in ticketDoc.orgId
//         ? ticketDoc.orgId._id.toString()
//         : "",
//     platformName:
//       typeof ticketDoc.platformId === "object" && "name" in ticketDoc.platformId
//         ? ticketDoc.platformId.name
//         : "",
//     organizationName:
//       typeof ticketDoc.orgId === "object" && "name" in ticketDoc.orgId
//         ? ticketDoc.orgId.name
//         : "",
//     status: ticketDoc.status,
//     category: ticketDoc.category,
//     priority: ticketDoc.priority,
//     type: ticketDoc.type || "Support",
//     resolvedRemarks: ticketDoc.resolvedRemarks || "",
//     attachments: ticketDoc.attachments || [],
//     activityLog: ticketDoc.activityLog || [],
//     comments: ticketDoc.comments || [],
//     createdAt: ticketDoc.createdAt?.toISOString() || "",
//     updatedAt: ticketDoc.updatedAt?.toISOString() || "",
//     __v: ticketDoc.__v,
//   };
// };


// export const updateTicketById = async (id: string, updates: any) => {
//   updates.updatedAt = new Date();
//   return await Ticket.findByIdAndUpdate(id, updates, { new: true });
// };


// export const updateTicketById = async (id: string, updates: any) => {
//   if (!isValidObjectId(id)) return null;

//   const ticket = await Ticket.findById(id);
//   if (!ticket) return null;

//   // Handle activity log push if provided
//   if (updates.activityLog && Array.isArray(updates.activityLog)) {
//     ticket.activityLog.push(...updates.activityLog);
//   }

//   // Merge other fields (excluding 'activityLog')
//   const fieldsToIgnore = ["activityLog", "_id", "__v"];
//   Object.entries(updates).forEach(([key, value]) => {
//     if (!fieldsToIgnore.includes(key)) {
//       if (key === "subject" && typeof value === "object") {
//         // Merge subject fields individually
//         ticket.subject = {
//           ...ticket.subject,
//           ...value,
//         };
//       } else {
//         (ticket as any)[key] = value;
//       }
//     }
//   });

//   // Always update `updatedAt`
//   ticket.updatedAt = new Date();

//   await ticket.save();
//   return ticket.toObject();
// };


export async function patchTicket(id: string, updates: any) {
  return await updateTicketById(id, updates);
}

export const updateTicketById = async (id: string, updates: any) => {
  if (!isValidObjectId(id)) return null;

  const ticket = await Ticket.findById(id);
  if (!ticket) return null;

  const fieldsToIgnore = ["_id", "__v", "comments"];
  const allowedFields = [
    "status",
    "priority",
    "category",
    "subject",
    "resolvedRemarks",
    "activityLog",
    "attachments",
  ];

  // Append activity log if provided
  if (Array.isArray(updates.activityLog)) {
    ticket.activityLog.push(...updates.activityLog);
  }

  // Update allowed fields
  for (const [key, value] of Object.entries(updates)) {
    if (!fieldsToIgnore.includes(key) && allowedFields.includes(key)) {
      if (key === "subject" && typeof value === "object") {
        ticket.subject = {
          ...ticket.subject,
          ...value,
        };
      } else if (key !== "activityLog") {
        (ticket as any)[key] = value;
      }
    }
  }

  ticket.updatedAt = new Date();
  await ticket.save();

  // Return formatted ticket using existing formatter
  return await getTicketById(ticket._id.toString());
};


export const deleteTicketById = async (id: string) => {
  if (!isValidObjectId(id)) return null;

  return await Ticket.findByIdAndDelete(id);
};


export async function updateResolvedRemarks(ticketId: string, remarks: string) {
  if (!isValidObjectId(ticketId)) return null;

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return null;

  const newLog = {
    id: Date.now().toString(),
    timestamp: new Date(),
    user: "You", // or pass user from frontend if available
    action: "Resolved Remarks Updated",
    details: `Remarks added/updated: "${remarks}"`
  };

  ticket.resolvedRemarks = remarks;
  ticket.activityLog.push(newLog);
  await ticket.save();

  return ticket.toObject();
}
