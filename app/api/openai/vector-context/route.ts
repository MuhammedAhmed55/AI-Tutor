import OpenAI from "openai";

export async function GET() {
  try {
    const vectorStoreId = process.env.VECTOR_STORE_ID!;
    const openaiApiKey = process.env.OPENAI_API_KEY!;
    if(!vectorStoreId || !openaiApiKey) {
      return Response.json({ context: "No vector store ID or openai API key found." });
    }
    
  const openaiClient = new OpenAI({
    apiKey: openaiApiKey,
  });
  

    const vectorStoreFiles = await openaiClient.vectorStores.files.list(
      vectorStoreId
    );

    if (!vectorStoreFiles.data || vectorStoreFiles.data.length === 0) {
      return Response.json({ context: "No documents found in vector store." });
    }

    const fileCount = vectorStoreFiles.data.length;
    const fileInfo = vectorStoreFiles.data
      .slice(0, 5)
      .map((file) => `- ${file.id}`)
      .join("\n");

    const context = `Found ${fileCount} documents in vector store.\nTop files:\n${fileInfo}`;

    return Response.json({ context });
  } catch (error) {
    console.error("Vector store context error:", error);
    return Response.json(
      { context: "Vector store context unavailable." },
      { status: 200 }
    );
  }
}
