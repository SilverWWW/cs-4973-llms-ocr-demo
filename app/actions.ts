"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type OcrImage = {
  id: string
  image_path: string
  correct_text: string
  correct_count: number
  incorrect_count: number
  created_at: string
}

export async function getRandomOcrImage(): Promise<OcrImage | null> {
  const supabase = createServerSupabaseClient()

  // Count total images
  const { count, error: countError } = await supabase.from("ocr_images").select("*", { count: "exact", head: true })

  if (countError || !count) {
    console.error("Error counting OCR images:", countError)
    return null
  }

  // Generate a random offset
  const randomOffset = Math.floor(Math.random() * count)

  // Get a single random image using the offset
  const { data, error } = await supabase.from("ocr_images").select("*").range(randomOffset, randomOffset).limit(1)

  if (error || !data || data.length === 0) {
    console.error("Error fetching random OCR image:", error)
    return null
  }

  return data[0] as OcrImage
}

export async function updateOcrImageStats(id: string, isCorrect: boolean): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()
    const counterType = isCorrect ? "correct" : "incorrect"

    // Use the RPC function
    const { error } = await supabase.rpc("increment_counter", {
      image_id: id,
      counter_type: counterType,
    })

    if (error) {
      throw new Error(`Failed to update counter: ${error.message}`)
    }

    // Revalidate the page
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating OCR image stats:", error)
    throw error
  }
}
