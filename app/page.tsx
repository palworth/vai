import Link from 'next/link'
import { Settings } from 'lucide-react'

/**
 * Home Component
 * 
 * This is the main page of the VetAI application. It's protected by the AuthWrapper,
 * so only authenticated users can access it.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">VetAI</h1>
          <Link href="/settings">
            <Settings className="h-6 w-6 text-gray-500 hover:text-gray-700" />
          </Link>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6">
            {[
              { title: 'Talk to VetAI', href: '/vetai-chat', description: 'Ask general health questions or discuss your dog\'s specific needs' },
              { title: 'Health & Wellness', href: '/health-wellness', description: 'Monitor health events and mental wellness' },
              { title: 'Diet & Exercise', href: '/diet-exercise', description: 'Manage your dog\'s nutrition and activity' },
              { title: 'Behavior', href: '/behavior', description: 'Track and improve your dog\'s behavior' },
            ].map((box) => (
              <Link
                key={box.title}
                href={box.href}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{box.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{box.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

