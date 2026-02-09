import { createClient } from "@/lib/supabase/server"
import { embed } from "ai"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { query, category } = await req.json()

  if (!query || typeof query !== "string") {
    return Response.json({ error: "Query is required" }, { status: 400 })
  }

  try {
    // Generate embedding for the search query
    const { embedding } = await embed({
      model: "openai/text-embedding-3-small",
      value: query,
    })

    // Search using the vector similarity function
    const { data, error } = await supabase.rpc("search_saved_items", {
      query_embedding: JSON.stringify(embedding),
      match_user_id: user.id,
      match_count: 20,
      match_threshold: 0.3,
    })

    if (error) {
      console.error("Search error:", error)
      return Response.json({ error: "Search failed" }, { status: 500 })
    }

    // Filter by category if provided
    const results = category && category !== "all"
      ? (data ?? []).filter((item: { category: string }) => item.category === category)
      : data ?? []

    return Response.json({ results })
  } catch (err) {
    console.error("Search error:", err)
    return Response.json({ error: "Search failed" }, { status: 500 })
  }
}
