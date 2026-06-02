import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { option_id, user_id } = await req.json();

  const { error } = await supabase
    .from("poll_votes")
    .insert({
      poll_id: id,
      option_id,
      user_id,
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ ok: true });
}