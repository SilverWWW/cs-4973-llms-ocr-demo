import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "OCR Practice App",
  description: "Practice your OCR skills with this app",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="light"
        >
          <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b">
              <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                  OCR Practice
                </Link>
                <nav>
                  <ul className="flex space-x-4">
                    <li>
                      <Link href="/" className="text-gray-600 hover:text-gray-900">
                        Practice
                      </Link>
                    </li>
                    <li>
                      <Link href="/stats" className="text-gray-600 hover:text-gray-900">
                        Stats
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>
            <main className="flex-1 bg-gray-50">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'