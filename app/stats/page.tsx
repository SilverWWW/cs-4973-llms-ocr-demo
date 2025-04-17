"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase"
import { RefreshCw } from "lucide-react"

type StatsData = {
  totalCorrect: number
  totalIncorrect: number
  accuracy: number
  totalAttempts: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData>({
    totalCorrect: 0,
    totalIncorrect: 0,
    accuracy: 0,
    totalAttempts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch of stats
    fetchStats()

    // Set up realtime subscription
    const supabase = getSupabaseClient()

    // Subscribe to changes on the ocr_images table
    const subscription = supabase
      .channel("ocr_stats_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (insert, update, delete)
          schema: "public",
          table: "ocr_images",
        },
        () => {
          // When any change happens, refresh the stats
          fetchStats()
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      // Get all records to calculate stats on the client
      const { data, error } = await supabase.from("ocr_images").select("correct_count, incorrect_count")

      if (error) throw error

      if (data) {
        // Calculate totals
        const totalCorrect = data.reduce((sum, item) => sum + (item.correct_count || 0), 0)
        const totalIncorrect = data.reduce((sum, item) => sum + (item.incorrect_count || 0), 0)
        const totalAttempts = totalCorrect + totalIncorrect
        const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

        setStats({
          totalCorrect,
          totalIncorrect,
          accuracy,
          totalAttempts,
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-center">OCR System Statistics</CardTitle>
          {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Total Attempts" value={stats.totalAttempts.toLocaleString()} className="bg-gray-50" />
              <StatCard title="Overall Accuracy" value={`${stats.accuracy.toFixed(2)}%`} className="bg-blue-50" />
              <StatCard title="Correct Answers" value={stats.totalCorrect.toLocaleString()} className="bg-green-50" />
              <StatCard title="Incorrect Answers" value={stats.totalIncorrect.toLocaleString()} className="bg-red-50" />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Accuracy Breakdown</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${stats.accuracy}%` }}
                  aria-label={`${stats.accuracy.toFixed(2)}% accuracy`}
                  role="progressbar"
                  aria-valuenow={stats.accuracy}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  className = "",
}: {
  title: string
  value: string
  className?: string
}) {
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
