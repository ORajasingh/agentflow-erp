export interface DocumentChunk {
  content: string;
  chunkIndex: number;
}

export function chunkDocument(
  text: string,
  chunkSize = 1000,
  overlap = 150
): DocumentChunk[] {
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleanedText) {
    return [];
  }

  const chunks: DocumentChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(
      start + chunkSize,
      cleanedText.length
    );

    const content = cleanedText
      .slice(start, end)
      .trim();

    if (content) {
      chunks.push({
        content,
        chunkIndex,
      });

      chunkIndex++;
    }

    if (end >= cleanedText.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}