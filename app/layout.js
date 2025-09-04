export const metadata = {
  title: 'Mindbloss',
  description: 'Transform mental clutter into crystal clarity',
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