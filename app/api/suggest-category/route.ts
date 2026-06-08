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
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );
  const data = await response.json();
  return Response.json({ models: data.models?.map((m: any) => m.name) });
}