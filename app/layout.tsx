import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import ConditionalFooter from "@/components/ConditionalFooter"
import WhatsAppChat from "@/components/WhatsAppChat"

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "HER HIGHNESS | Premium Artificial Jewelry",
  description: "Discover our exquisite collection of premium artificial jewelry.",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen flex flex-col bg-[#FDFBF7]`}>
        <main className="flex-grow">
          {children}
        </main>
        <ConditionalFooter />
        <Toaster />
        <WhatsAppChat />
      </body>
    </html>
  )
}
