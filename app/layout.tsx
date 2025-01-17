import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import { AuthWrapper } from './components/AuthWrapper'
import { PageLayout } from '@/components/PageLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VetAI',
  description: 'Health app for dogs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthWrapper>
            <PageLayout>
              {children}
            </PageLayout>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}

