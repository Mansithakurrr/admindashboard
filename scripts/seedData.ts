import "dotenv/config"; // 👈 Load .env variables early
import mongoose from "mongoose";
import Organization from "../src/models/Organization";
import Platform from "../src/models/Platform";
import process from "process";

// Optional debug output
console.log("MONGO_URI from env:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI!, {
  dbName: "ticketDB",
})
.then(async () => {
  console.log("Connected to DB");

  const orgs = ["Msil", "Rohtak", "Udyog Vihar", "Tag Avenue"];
  for (const name of orgs) {
    await Organization.updateOne({ name }, { name }, { upsert: true });
  }

  const platforms = ["Lighthouse", "Learn Tank", "Home Certify"];
  for (const name of platforms) {
    await Platform.updateOne({ name }, { name }, { upsert: true });
  }

  console.log("Seeding done.");
  mongoose.disconnect();
})
.catch((err) => console.error("DB connection error:", err));
