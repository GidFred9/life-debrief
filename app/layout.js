export const metadata = {
  title: 'Life Debrief - AI Journaling',
  description: 'Journal with AI that gives real insights',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}