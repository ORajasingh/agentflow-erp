
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { connectDatabase } from "../config/database.js";

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in the environment."
    );
  }

  if (password.length < 12 || password.length > 256) {
    throw new Error(
      "The initial administrator password must be 12–256 characters."
    );
  }

  await connectDatabase();

  const existingAdmin = await User.findOne({ role: "admin" });

  if (existingAdmin) {
    throw new Error(
      "An administrator already exists. Initial setup has been refused."
    );
  }

  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    throw new Error(
      "That email already belongs to a user. Use a different email."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    isActive: true,
  });

  console.log(
    `Administrator created successfully: ${admin.email}`
  );
}

main()
  .catch((error) => {
    console.error("Administrator setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
