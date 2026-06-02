import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { question, options } = await req.json();

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        question,
        is_open: true,
      })
      .select()
      .single();

    if (pollError) {
      return Response.json({ error: pollError.message }, { status: 500 });
    }

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(
        options.map((text: string, index: number) => ({
          poll_id: poll.id,
          text,
          position: index,
        }))
      );

    if (optionsError) {
      return Response.json({ error: optionsError.message }, { status: 500 });
    }

    return Response.json(poll);
  } catch (err) {
    return Response.json({ error: "Failed to create poll" }, { status: 500 });
  }
}