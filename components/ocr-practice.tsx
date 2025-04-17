"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type OcrImage, getRandomOcrImage, updateOcrImageStats } from "@/app/actions"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function OcrPractice() {
  const [currentImage, setCurrentImage] = useState<OcrImage | null>(null)
  const [userInput, setUserInput] = useState("")
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Load a random image on component mount
  useEffect(() => {
    loadRandomImage()
  }, [])

  const loadRandomImage = async () => {
    setLoading(true)
    setResult(null)
    setUserInput("")
    setUpdateError(null)

    try {
      const image = await getRandomOcrImage()
      setCurrentImage(image)
    } catch (error) {
      // Simplified error handling
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentImage || !userInput.trim()) return

    // Compare user input with correct text (case sensitive)
    const isCorrect = userInput.trim() === currentImage.correct_text
    setResult(isCorrect ? "correct" : "incorrect")

    try {
      // Update stats using our simplified function
      await updateOcrImageStats(currentImage.id, isCorrect)
      setUpdateError(null)
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">OCR Practice</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          ) : currentImage ? (
            <div className="space-y-6">
              <div className="relative border rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center h-80">
                <img
                  src={currentImage.image_path || "/placeholder.svg"}
                  alt="Text to recognize"
                  className="max-h-full max-w-full object-contain w-full h-full"
                  style={{ objectFit: "contain" }}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div>
                  <label htmlFor="text-input" className="block text-sm font-medium mb-1">
                    {/* Empty label as requested */}
                  </label>
                  <Input
                    id="text-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type the text you see in the image"
                    disabled={!!result}
                    className="w-full"
                    autoComplete="off"
                    name="ocr-input" // Unique name to avoid browser grouping with other inputs
                  />
                </div>

                {result && (
                  <Alert className={result === "correct" ? "bg-green-50" : "bg-red-50"}>
                    <AlertDescription className="flex items-center gap-2">
                      {result === "correct" ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>Correct!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span>
                            Incorrect.{" "}
                            <span className="font-medium">The correct text is: "{currentImage.correct_text}"</span>
                          </span>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {updateError && (
                  <Alert className="bg-yellow-50">
                    <AlertDescription className="text-yellow-800">
                      Error updating statistics: {updateError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  {!result ? (
                    <Button type="submit" className="w-full">
                      Submit Answer
                    </Button>
                  ) : (
                    <Button type="button" onClick={loadRandomImage} className="w-full">
                      Next Image
                    </Button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No images found. Please upload some OCR images to your Supabase database.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={loadRandomImage} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Load Another Image
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
