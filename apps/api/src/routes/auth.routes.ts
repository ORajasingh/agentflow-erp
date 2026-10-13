
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      password.length > 256
    ) {
      res.status(400).json({
        success: false,
        message: "Valid email and password are required.",
      });
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    // Use the same message whether the email or password is wrong.
    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      console.error("JWT_SECRET is missing or too short.");
      res.status(500).json({
        success: false,
        message: "Authentication is not configured correctly.",
      });
      return;
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      secret,
      {
        subject: user._id.toString(),
        expiresIn: "1h",
        issuer: "agentflow-erp",
        audience: "agentflow-erp-api",
      }
    );

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        expiresIn: 3600,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to log in right now.",
    });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Account is unavailable.",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Failed to load current user:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load account.",
    });
  }
});

export default router;
