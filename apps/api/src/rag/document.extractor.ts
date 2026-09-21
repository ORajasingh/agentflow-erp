import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromFile(
  filePath: string
): Promise<string> {
  const extension = path
    .extname(filePath)
    .toLowerCase();

  const fileBuffer =
    await fs.readFile(filePath);

  // ----------------------------------------
  // PDF
  // ----------------------------------------

  if (extension === ".pdf") {
    const parser = new PDFParse({
      data: fileBuffer,
    });

    try {
      const result = await parser.getText();

      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  // ----------------------------------------
  // DOCX
  // ----------------------------------------

  if (extension === ".docx") {
    const result =
      await mammoth.extractRawText({
        buffer: fileBuffer,
      });

    return result.value.trim();
  }

  // ----------------------------------------
  // TXT
  // ----------------------------------------

  if (extension === ".txt") {
    return fileBuffer
      .toString("utf-8")
      .trim();
  }

  throw new Error(
    `Unsupported file type: ${extension}`
  );
}