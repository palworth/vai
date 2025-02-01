import Link from 'next/link'

export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[
        { title: 'Talk to VetAI', href: '/vetai-chat', description: 'Ask general health questions or discuss your dog\'s specific needs' },
        { title: 'Health & Wellness', href: '/health-wellness', description: 'Monitor health events and mental wellness' },
        { title: 'Diet & Exercise', href: '/diet-exercise', description: 'Manage your dog\'s nutrition and activity' },
        { title: 'Behavior', href: '/behavior', description: 'Track and improve your dog\'s behavior' },
        { title: 'Dogs', href: '/dogs', description: 'View and manage your dogs' },
        { title: 'Dashboards', href: '/dashboards', description: 'Access overall health and diet dashboards' },
        { title: 'Notificaitons', href: '/notifications', description: 'Access notifications' }
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
  )
}