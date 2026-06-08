import { NextRequest } from "next/server";

const CATEGORIES = [
  "Technology",
  "General",
  "Help & Support",
  "Discussion",
  "Learning",
  "Career",
];

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a category classifier for a community Q&A app. Given a question, respond with ONLY one category from this list, nothing else: ${CATEGORIES.join(", ")}. Question: "${question}"`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const category = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    // Return full data for debugging
    return Response.json({ category, debug: data });
  } catch (err: any) {
    return Response.json({ error: err.message });
  }
}