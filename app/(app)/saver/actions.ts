"use server"

import { generateText, Output, embed } from "ai"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categorizationSchema = z.object({
  title: z.string().describe("A concise, descriptive title for the saved content (max 80 chars)"),
  summary: z.string().describe("A 1-2 sentence summary of the key information"),
  category: z.enum([
    "person",
    "task",
    "note",
    "link",
    "idea",
    "meeting",
    "project",
    "reference",
    "general",
  ]).describe("The primary category that best fits this content"),
  tags: z.array(z.string()).describe("3-6 relevant tags/keywords for searchability"),
  metadata: z.object({
    content_type: z.string().describe("The detected type of content, e.g. 'linkedin_profile', 'task_description', 'meeting_notes', 'article_snippet', 'contact_info', 'free_text'"),
    sentiment: z.enum(["positive", "neutral", "negative"]).nullable().describe("Overall sentiment if applicable"),
    urgency: z.enum(["high", "medium", "low"]).nullable().describe("Urgency level if the content describes something actionable"),
    entities: z.array(z.string()).describe("Named entities extracted (people, companies, products, places)"),
  }).describe("Structured metadata extracted from the content"),
})

export async function saveItem(rawText: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in to save items" }
  }

  if (!rawText.trim()) {
    return { error: "Please enter some content to save" }
  }

  if (rawText.length > 50000) {
    return { error: "Content is too long. Please limit to 50,000 characters." }
  }

  try {
    // Step 1: AI categorization using structured output
    const { output: categorization } = await generateText({
      model: "openai/gpt-4.1-mini",
      output: Output.object({ schema: categorizationSchema }),
      messages: [
        {
          role: "system",
          content: `You are a data categorization assistant. Analyze the user's pasted text and extract structured metadata. Be precise with the category selection. For tags, choose descriptive keywords that would help find this content later. For entities, extract any named people, companies, products, or places mentioned.`,
        },
        {
          role: "user",
          content: rawText,
        },
      ],
    })

    if (!categorization) {
      return { error: "Failed to categorize content. Please try again." }
    }

    // Step 2: Generate embedding for semantic search
    const { embedding } = await embed({
      model: "openai/text-embedding-3-small",
      value: `${categorization.title}\n${categorization.summary}\n${rawText.substring(0, 8000)}`,
    })

    // Step 3: Store in Supabase with embedding
    const { data, error: insertError } = await supabase
      .from("saved_items")
      .insert({
        user_id: user.id,
        raw_text: rawText,
        title: categorization.title,
        summary: categorization.summary,
        category: categorization.category,
        tags: categorization.tags,
        metadata: categorization.metadata,
        embedding: JSON.stringify(embedding),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return { error: "Failed to save item. Please try again." }
    }

    revalidatePath("/saver")
    revalidatePath("/saved")

    return {
      success: true,
      item: {
        id: data.id,
        title: categorization.title,
        summary: categorization.summary,
        category: categorization.category,
        tags: categorization.tags,
        metadata: categorization.metadata,
      },
    }
  } catch (err) {
    console.error("Save error:", err)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteItem(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in" }
  }

  const { error } = await supabase
    .from("saved_items")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: "Failed to delete item" }
  }

  revalidatePath("/saver")
  revalidatePath("/saved")
  return { success: true }
}
