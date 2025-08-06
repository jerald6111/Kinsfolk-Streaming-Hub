import './globals.css'

export const metadata = {
  title: 'Kinsfolk Streaming Hub - Unified Streaming Experience',
  description: 'Apple TV-style streaming hub for all your content',
  manifest: '/manifest.json'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}