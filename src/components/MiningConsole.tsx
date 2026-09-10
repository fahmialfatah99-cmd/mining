interface Props {
  logs: string[]
}

export default function MiningConsole({ logs }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-750 border-b border-gray-700">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <i className="fas fa-terminal text-green-400"></i>
          Mining Console
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div className="p-4 h-64 overflow-y-auto font-mono text-sm bg-gray-900/50">
        {logs.length === 0 ? (
          <div className="text-gray-500">
            <p>$ cryptominer-pro --start</p>
            <p className="mt-1">Waiting for mining to start...</p>
            <p className="text-gray-600 mt-1">Click "Start Mining" to begin simulation</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={`py-0.5 ${
                log.includes('⛔') ? 'text-red-400' :
                log.includes('🚀') ? 'text-green-400' :
                log.includes('✅') ? 'text-green-300' :
                log.includes('⚠') ? 'text-yellow-400' :
                log.includes('🔗') ? 'text-blue-400' :
                log.includes('💎') ? 'text-purple-400' :
                'text-gray-300'
              }`}
            >
              {log}
            </div>
          ))
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-green-400">$</span>
          <span className="text-gray-400 animate-pulse">_</span>
        </div>
      </div>
    </div>
  )
}
