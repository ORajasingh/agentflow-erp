import { Router } from "express";

import Supplier from "../models/Supplier.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const suppliers = await Supplier.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(
      req.params.id
    ).lean();

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier not found",
      });

      return;
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error("Failed to fetch supplier:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch supplier",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      supplierId,
      companyName,
      contactPerson,
      email,
      phone,
      category,
      address,
      city,
      country,
      rating = 0,
    } = req.body;

    if (
      !supplierId ||
      !companyName ||
      !contactPerson ||
      !email ||
      !phone
    ) {
      res.status(400).json({
        success: false,
        message:
          "supplierId, companyName, contactPerson, email and phone are required",
      });

      return;
    }

    const existingSupplier = await Supplier.findOne({
      supplierId,
    });

    if (existingSupplier) {
      res.status(409).json({
        success: false,
        message: "Supplier ID already exists",
      });

      return;
    }

    const supplier = await Supplier.create({
      supplierId,
      companyName,
      contactPerson,
      email,
      phone,
      category,
      address,
      city,
      country,
      rating,
      status: "Active",
    });

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("Failed to create supplier:", error);

    res.status(400).json({
      success: false,
      message: "Failed to create supplier",
    });
  }
});

export default router;