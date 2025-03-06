import { Play, Square, Trash2 } from 'lucide-react'

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
  {
    id: 3,
    name: 'LLaMA 2',
    status: 'Downloaded',
    size: '12GB',
    type: 'Language Model',
  },
  {
    id: 4,
    name: 'Mistral-7B',
    status: 'Active',
    size: '7GB',
    type: 'Language Model',
  }
];

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Local Models</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your locally installed AI models</p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Installed Models</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {models.map((model) => (
                    <tr key={model.id} className="group">
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{model.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          model.status === 'Active' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        }`}>
                          {model.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{model.size}</td>
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{model.type}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {model.status === 'Active' ? (
                            <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors" title="Stop Model">
                              <Square className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                            </button>
                          ) : (
                            <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors" title="Start Model">
                              <Play className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                            </button>
                          )}
                          <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors" title="Delete Model">
                            <Trash2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          </button>
                        </div>
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