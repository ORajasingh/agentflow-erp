import dotenv from "dotenv";

dotenv.config({
  path: "apps/api/.env",
});
import mongoose from "mongoose";
import Product from "../models/Product.js";

async function main() {
  try {
    console.log("🔌 Connecting to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected successfully");

    const product = await Product.findOne({
      name: /Dell Latitude 5450/i,
    });

    if (!product) {
      console.log("❌ Dell Latitude 5450 not found");
      return;
    }

    console.log("\n📦 Product found:");
    console.log({
      id: String(product._id),
      name: product.name,
      sku: product.sku,
      supplier: product.supplier,
      price: product.price,
      costPrice: product.costPrice,
      isActive: product.isActive,
    });
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 MongoDB disconnected");
  }
}

main();