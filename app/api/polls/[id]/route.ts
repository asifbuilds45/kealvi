import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: poll } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  const { data: options } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", id)
    .order("position");

  return Response.json({ poll, options });
}