import KnowledgeDocument from "../../models/KnowledgeDocument.js";

export async function searchKnowledge(
  queryEmbedding: number[],
  limit = 5
) {
  const results =
    await KnowledgeDocument.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: Math.max(
            limit * 10,
            50
          ),
          limit,
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          source: 1,
          content: 1,
          chunkIndex: 1,
          metadata: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

  return results;
}