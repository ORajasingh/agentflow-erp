import "dotenv/config";
import productRoutes from "./routes/product.routes.js";
import cors from "cors";
import express from "express";
import customerRoutes from "./routes/customer.routes.js";
import { connectDatabase } from "./config/database.js";
import salesOrderRoutes from "./routes/sales-order.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
const app = express();

const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/sales-orders", salesOrderRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "AgentFlow ERP API is running",
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `🚀 AgentFlow API running on http://localhost:${PORT}`
    );
  });
}

startServer();