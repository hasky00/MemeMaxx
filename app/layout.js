import "./globals.css"

export const metadata = {
  title: "MemeMaxx — AI Meme Generator",
  description: "Create and share memes powered by AI",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}