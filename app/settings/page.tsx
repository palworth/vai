import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAuthCookie } from '@/utils/auth'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  try {
    if (!token || !verifyAuthCookie({ token: token.value })) {
      redirect('/auth/login')
    }
  } catch (error) {
    console.error("Error verifying auth cookie:", error);
    redirect('/auth/login'); // Redirect on error as well
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <SettingsForm />
        </div>
      </main>
    </div>
  )
}

