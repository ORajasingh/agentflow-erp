
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.js";
import { connectDatabase } from "../config/database.js";

async function createEmployee() {
  const name = process.env.EMPLOYEE_NAME?.trim();
  const email = process.env.EMPLOYEE_EMAIL?.trim().toLowerCase();
  const password = process.env.EMPLOYEE_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Set EMPLOYEE_NAME, EMPLOYEE_EMAIL, and EMPLOYEE_PASSWORD."
    );
  }

  if (password.length < 12 || password.length > 256) {
    throw new Error("Password must be between 12 and 256 characters.");
  }

  await connectDatabase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error(
      `A user with email ${email} already exists. No account was created.`
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const employee = await User.create({
    name,
    email,
    passwordHash,
    role: "employee",
    isActive: true,
  });

  console.log("Employee account created successfully.");
  console.log(`Name: ${employee.name}`);
  console.log(`Email: ${employee.email}`);
  console.log(`Role: ${employee.role}`);
  console.log(`Active: ${employee.isActive}`);
}

createEmployee()
   .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error("Employee creation failed:", message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

