const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Admin = mongoose.model("Admin", AdminSchema);

async function createAdmin() {
  const email = "admin@bigplutolabs.com";
  const plainPassword = "admin123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await Admin.create({ email, password: hashedPassword });
  console.log("Admin created");
  mongoose.disconnect();
}

createAdmin();
