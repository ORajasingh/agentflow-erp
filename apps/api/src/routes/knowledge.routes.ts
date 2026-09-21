import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";

import KnowledgeDocument from "../models/KnowledgeDocument.js";
import { ingestFile } from "../services/rag/rag.service.js";

const router = Router();

// ----------------------------------------
// Upload directory
// ----------------------------------------

const uploadDir = path.resolve(
  process.cwd(),
  "uploads/knowledge"
);

// ----------------------------------------
// Multer configuration
// ----------------------------------------

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },

  filename: (_req, file, cb) => {
    const timestamp = Date.now();

    const safeName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    cb(
      null,
      `${timestamp}-${safeName}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".txt",
    ];

    if (
      allowedExtensions.includes(extension)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF, DOCX, and TXT files are allowed"
        )
      );
    }
  },
});

// ========================================
// GET /api/knowledge
// List knowledge documents
// ========================================

router.get("/", async (_req, res) => {
  try {
    const documents =
      await KnowledgeDocument.aggregate([
        {
          $group: {
            _id: {
              title: "$title",
              source: "$source",
            },

            chunkCount: {
              $sum: 1,
            },

            createdAt: {
              $min: "$createdAt",
            },

            updatedAt: {
              $max: "$updatedAt",
            },
          },
        },

        {
          $sort: {
            updatedAt: -1,
          },
        },

        {
          $project: {
            _id: 0,

            title: "$_id.title",
            source: "$_id.source",

            chunkCount: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);

    res.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error(
      "❌ Failed to fetch knowledge documents:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch knowledge documents",
    });
  }
});

// ========================================
// GET /api/knowledge/:source
// Get chunks belonging to a document
// ========================================

router.get(
  "/document",
  async (req, res) => {
    try {
      const { source } = req.query;

      if (
        !source ||
        typeof source !== "string"
      ) {
        res.status(400).json({
          success: false,
          message: "Source is required",
        });

        return;
      }

      const documents =
        await KnowledgeDocument.find({
          source,
        })
          .sort({
            chunkIndex: 1,
          })
          .select(
            "title source content chunkIndex metadata createdAt updatedAt"
          )
          .lean();

      if (documents.length === 0) {
        res.status(404).json({
          success: false,
          message:
            "Knowledge document not found",
        });

        return;
      }

      res.json({
        success: true,
        data: {
          title: documents[0].title,
          source: documents[0].source,
          chunkCount: documents.length,
          chunks: documents,
        },
      });
    } catch (error) {
      console.error(
        "❌ Failed to fetch knowledge document:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch knowledge document",
      });
    }
  }
);

// ========================================
// DELETE /api/knowledge
// Delete all chunks of a document
// ========================================

router.delete("/", async (req, res) => {
  try {
    const { source } = req.query;

    if (
      !source ||
      typeof source !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Source is required",
      });

      return;
    }

    const result =
      await KnowledgeDocument.deleteMany({
        source,
      });

    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        message:
          "Knowledge document not found",
      });

      return;
    }

    console.log(
      `🗑️ Knowledge document deleted: ${source} (${result.deletedCount} chunks)`
    );

    res.json({
      success: true,
      message:
        "Knowledge document deleted successfully",
      data: {
        source,
        chunksDeleted:
          result.deletedCount,
      },
    });
  } catch (error) {
    console.error(
      "❌ Failed to delete knowledge document:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete knowledge document",
    });
  }
});

// ========================================
// POST /api/knowledge/upload
// Upload and ingest document
// ========================================

router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    let uploadedFilePath: string | undefined;

    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message:
            "Please upload a PDF, DOCX, or TXT file",
        });

        return;
      }

      uploadedFilePath =
        req.file.path;

      const title =
        req.body.title ||
        req.file.originalname;

      const source =
        req.file.originalname;
        // ----------------------------------------
// Check for duplicate document
// ----------------------------------------

const existingDocument =
  await KnowledgeDocument.findOne({
    source,
  });

if (existingDocument) {
  res.status(409).json({
    success: false,
    message:
      "This document has already been uploaded",
    data: {
      title: existingDocument.get("title"),
      source: existingDocument.get("source"),
    },
  });

  return;
}
      console.log(
        `📄 Knowledge document upload: ${source}`
      );

      const result =
        await ingestFile(
          uploadedFilePath,
          title,
          source,
          {
            originalName:
              req.file.originalname,

            mimeType:
              req.file.mimetype,

            fileSize:
              req.file.size,

            uploadedAt:
              new Date(),
          }
        );

      res.status(201).json({
        success: true,
        message:
          "Knowledge document uploaded and ingested successfully",

        data: result,
      });
    } catch (error: any) {
      console.error(
        "❌ Knowledge document ingestion failed:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Failed to ingest knowledge document",
      });
    } finally {
      if (uploadedFilePath) {
        try {
          await fs.unlink(
            uploadedFilePath
          );
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }
);

export default router;