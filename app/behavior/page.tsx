import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAuthCookie } from '@/utils/auth'
import BehaviorForm from '@/components/BehaviorForm'

export default async function BehaviorPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  if (!token || !verifyAuthCookie({ token: token.value })) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Behavior</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <BehaviorForm />
        </div>
      </main>
    </div>
  )
}

