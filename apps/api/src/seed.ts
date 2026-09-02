import "dotenv/config";

import { connectDatabase } from "./config/database.js";
import Product from "./models/Product.js";

const products = [
  {
    sku: "DELL-LAT-5450",
    name: "Dell Latitude 5450",
    category: "Laptops",
    brand: "Dell",
    description: "Business laptop for enterprise users.",
    price: 48000,
    costPrice: 42000,
    stockQuantity: 42,
    reorderLevel: 50,
    warehouse: "Main Warehouse",
    supplier: "Dell Technologies",
    isActive: true,
  },
  {
    sku: "HP-PRO-450",
    name: "HP ProBook 450",
    category: "Laptops",
    brand: "HP",
    description: "Professional business laptop.",
    price: 52000,
    costPrice: 45000,
    stockQuantity: 86,
    reorderLevel: 40,
    warehouse: "Main Warehouse",
    supplier: "HP India",
    isActive: true,
  },
  {
    sku: "LEN-E14-G5",
    name: "Lenovo ThinkPad E14",
    category: "Laptops",
    brand: "Lenovo",
    description: "Enterprise productivity laptop.",
    price: 54000,
    costPrice: 47000,
    stockQuantity: 18,
    reorderLevel: 25,
    warehouse: "South Warehouse",
    supplier: "Lenovo India",
    isActive: true,
  },
  {
    sku: "LOG-MX-M3",
    name: "Logitech MX Master 3",
    category: "Accessories",
    brand: "Logitech",
    description: "Wireless productivity mouse.",
    price: 8500,
    costPrice: 6500,
    stockQuantity: 124,
    reorderLevel: 50,
    warehouse: "Main Warehouse",
    supplier: "Logitech",
    isActive: true,
  },
  {
    sku: "SAM-SSD-1TB",
    name: "Samsung SSD 1TB",
    category: "Storage",
    brand: "Samsung",
    description: "1TB enterprise SSD storage.",
    price: 7500,
    costPrice: 5800,
    stockQuantity: 7,
    reorderLevel: 20,
    warehouse: "South Warehouse",
    supplier: "Samsung India",
    isActive: true,
  },
  {
    sku: "DELL-MON-24",
    name: "Dell 24-inch Monitor",
    category: "Monitors",
    brand: "Dell",
    description: "24-inch Full HD business monitor.",
    price: 14500,
    costPrice: 11500,
    stockQuantity: 64,
    reorderLevel: 25,
    warehouse: "Main Warehouse",
    supplier: "Dell Technologies",
    isActive: true,
  },
  {
    sku: "HP-MON-24",
    name: "HP 24-inch Monitor",
    category: "Monitors",
    brand: "HP",
    description: "24-inch Full HD monitor.",
    price: 13500,
    costPrice: 10500,
    stockQuantity: 31,
    reorderLevel: 20,
    warehouse: "Main Warehouse",
    supplier: "HP India",
    isActive: true,
  },
  {
    sku: "LOG-KB-K380",
    name: "Logitech K380 Keyboard",
    category: "Accessories",
    brand: "Logitech",
    description: "Compact wireless keyboard.",
    price: 3200,
    costPrice: 2400,
    stockQuantity: 76,
    reorderLevel: 30,
    warehouse: "South Warehouse",
    supplier: "Logitech",
    isActive: true,
  },
];

async function seed() {
  try {
    await connectDatabase();

    await Product.deleteMany({});

    await Product.insertMany(products);

    console.log(`✅ ${products.length} products inserted successfully`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Product seeding failed:", error);

    process.exit(1);
  }
}

seed();