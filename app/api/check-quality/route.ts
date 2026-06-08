import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a question quality checker for a community Q&A app. Analyze this question and respond with ONLY a JSON object like this: {"score": 8, "label": "Good", "tip": "Your question is clear and specific."}. Score is 1-10. Label is one of: "Poor", "Fair", "Good", "Excellent". Tip is one short sentence of feedback. Question: "${question}"`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  try {
    const clean = text?.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Response.json(parsed);
  } catch {
    return Response.json({ score: 5, label: "Fair", tip: "Try to be more specific." });
  }
}