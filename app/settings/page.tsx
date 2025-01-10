export default function Settings() {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Settings</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Manage your account settings and preferences.</p>
                </div>
                {/* Add settings options here */}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  