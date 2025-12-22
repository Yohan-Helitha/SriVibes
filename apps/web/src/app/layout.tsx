export const metadata = {
  title: 'SriVibes Admin',
  description: 'SriVibes Admin Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
