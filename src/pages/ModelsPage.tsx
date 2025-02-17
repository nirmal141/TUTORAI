const models = [
  {
    id: 1,
    name: 'GPT-4 Local',
    status: 'Active',
    size: '8GB',
    type: 'Language Model',
  },
  {
    id: 2,
    name: 'BERT Base',
    status: 'Downloaded',
    size: '4GB',
    type: 'Language Model',
  },
  // Add more models as needed
];

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-950/30 to-amber-950/30 blur-3xl opacity-50 transform rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-900/20 to-amber-900/20 blur-3xl opacity-50 transform -rotate-12" />
      </div>

      <div className="relative p-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 mb-8">
          Local Models
        </h1>
        <div className="bg-zinc-900 rounded-lg shadow-md border border-orange-500/20">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">Installed Models</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-zinc-800">
                    <th className="px-6 py-3 text-left text-sm font-medium text-orange-400">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-orange-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-orange-400">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-orange-400">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-orange-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {models.map((model) => (
                    <tr key={model.id}>
                      <td className="px-6 py-4 text-sm text-orange-200">{model.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          model.status === 'Active' 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-blue-900/50 text-blue-400'
                        }`}>
                          {model.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-orange-200">{model.size}</td>
                      <td className="px-6 py-4 text-sm text-orange-200">{model.type}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-orange-500 hover:text-orange-400">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 