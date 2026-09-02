import "dotenv/config";

import { connectDatabase } from "./config/database.js";
import Customer from "./models/Customer.js";

const customers = [
  {
    customerId: "CUS-001",
    companyName: "ABC Electronics",
    contactPerson: "Rajesh Kumar",
    email: "rajesh@abcelectronics.com",
    phone: "+91 98765 43210",
    industry: "Electronics",
    city: "Chennai",
    country: "India",
    totalOrders: 24,
    totalValue: 4280000,
    status: "Active",
  },
  {
    customerId: "CUS-002",
    companyName: "TechWorld Solutions",
    contactPerson: "Arun Prakash",
    email: "arun@techworld.in",
    phone: "+91 98421 12345",
    industry: "Technology",
    city: "Bangalore",
    country: "India",
    totalOrders: 18,
    totalValue: 3140000,
    status: "Active",
  },
  {
    customerId: "CUS-003",
    companyName: "Nova Systems",
    contactPerson: "Priya Menon",
    email: "priya@novasystems.in",
    phone: "+91 97890 56789",
    industry: "IT Services",
    city: "Coimbatore",
    country: "India",
    totalOrders: 12,
    totalValue: 1870000,
    status: "Active",
  },
  {
    customerId: "CUS-004",
    companyName: "FutureTech India",
    contactPerson: "Karthik Raj",
    email: "karthik@futuretech.in",
    phone: "+91 99521 45678",
    industry: "Technology",
    city: "Madurai",
    country: "India",
    totalOrders: 7,
    totalValue: 920000,
    status: "Prospect",
  },
  {
    customerId: "CUS-005",
    companyName: "Southern Computers",
    contactPerson: "Daniel Joseph",
    email: "daniel@southerncomputers.in",
    phone: "+91 98654 32109",
    industry: "Computer Retail",
    city: "Thoothukudi",
    country: "India",
    totalOrders: 31,
    totalValue: 5260000,
    status: "Active",
  },
];

async function seedCustomers() {
  try {
    await connectDatabase();

    await Customer.deleteMany({});

    await Customer.insertMany(customers);

    console.log(
      `✅ ${customers.length} customers inserted successfully`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Customer seeding failed:", error);

    process.exit(1);
  }
}

seedCustomers();
