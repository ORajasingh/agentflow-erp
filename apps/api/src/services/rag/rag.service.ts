import KnowledgeDocument from "../../models/KnowledgeDocument.js";
import { generateEmbedding } from "../../rag/embeddings.js";
import { chunkDocument } from "../../rag/document.chunker.js";
import { extractTextFromFile } from "../../rag/document.extractor.js";
import { searchKnowledge } from "./vector.service.js";

export async function ingestDocument(
  title: string,
  source: string,
  text: string,
  metadata: Record<string, unknown> = {}
) {
  const chunks = chunkDocument(text);

  if (chunks.length === 0) {
    throw new Error(
      "Document does not contain readable text"
    );
  }

  const results = [];

  for (const chunk of chunks) {
    const embedding =
      await generateEmbedding(chunk.content);

    const document =
      await KnowledgeDocument.create({
        title,
        source,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        embedding,
        metadata,
      });

    results.push(document);
  }

  return {
    title,
    source,
    chunksCreated: results.length,
  };
}

/**
 * Ingest a PDF, DOCX, or TXT file
 */
export async function ingestFile(
  filePath: string,
  title: string,
  source: string,
  metadata: Record<string, unknown> = {}
) {
  // Extract text from the file
  const text =
    await extractTextFromFile(filePath);

  if (!text.trim()) {
    throw new Error(
      "Document does not contain readable text"
    );
  }

  // Send extracted text through the
  // existing RAG ingestion pipeline
  return await ingestDocument(
    title,
    source,
    text,
    metadata
  );
}

export async function retrieveKnowledge(
  query: string,
  limit = 5
) {
  const queryEmbedding =
    await generateEmbedding(query);

  return await searchKnowledge(
    queryEmbedding,
    limit
  );
}