"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function getAggregateStats() {
  const supabase = createServerSupabaseClient()

  // Get the sum of correct and incorrect counts
  const { data, error } = await supabase.from("ocr_images").select("correct_count, incorrect_count")

  if (error || !data) {
    console.error("Error fetching aggregate stats:", error)
    return {
      totalCorrect: 0,
      totalIncorrect: 0,
      accuracy: 0,
      totalAttempts: 0,
    }
  }

  // Calculate totals
  const totalCorrect = data.reduce((sum, item) => sum + (item.correct_count || 0), 0)
  const totalIncorrect = data.reduce((sum, item) => sum + (item.incorrect_count || 0), 0)
  const totalAttempts = totalCorrect + totalIncorrect
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

  return {
    totalCorrect,
    totalIncorrect,
    accuracy,
    totalAttempts,
  }
}
