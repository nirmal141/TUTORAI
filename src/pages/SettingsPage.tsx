export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-950/30 to-amber-950/30 blur-3xl opacity-50 transform rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-900/20 to-amber-900/20 blur-3xl opacity-50 transform -rotate-12" />
      </div>

      <div className="relative p-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 mb-8">
          Settings
        </h1>
        <div className="max-w-2xl space-y-6">
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-orange-500/20">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-400 mb-2">
                  Theme
                </label>
                <select className="w-full bg-zinc-800 border border-orange-500/20 rounded-md px-3 py-2 text-orange-200">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-400 mb-2">
                  Language
                </label>
                <select className="w-full bg-zinc-800 border border-orange-500/20 rounded-md px-3 py-2 text-orange-200">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-orange-500/20">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-400">Email Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-400">Desktop Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-orange-500/20">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">Privacy Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-400">Share Usage Data</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 