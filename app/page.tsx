import OcrPractice from "@/components/ocr-practice"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">OCR Practice App</h1>
        <OcrPractice />
      </div>
    </main>
  )
}
