import { useState, useEffect } from 'react'
import { MiningState } from '../App'

interface Props {
  state: MiningState
}

export default function MiningDashboard({ state }: Props) {
  const [gpuStats, setGpuStats] = useState([
    { temp: 35, load: 0, fan: 0, hashRate: 0 },
    { temp: 35, load: 0, fan: 0, hashRate: 0 },
    { temp: 35, load: 0, fan: 0, hashRate: 0 },
  ])
  const [currentHash, setCurrentHash] = useState('')

  useEffect(() => {
    if (state.isMining) {
      const interval = setInterval(() => {
        setGpuStats([
          { temp: 58 + Math.random() * 15, load: 88 + Math.random() * 12, fan: 65 + Math.random() * 25, hashRate: state.hashRate * 0.35 + (Math.random() - 0.5) * 5 },
          { temp: 62 + Math.random() * 12, load: 90 + Math.random() * 10, fan: 70 + Math.random() * 20, hashRate: state.hashRate * 0.35 + (Math.random() - 0.5) * 5 },
          { temp: 55 + Math.random() * 18, load: 85 + Math.random() * 15, fan: 60 + Math.random() * 30, hashRate: state.hashRate * 0.30 + (Math.random() - 0.5) * 5 },
        ])
        
        // Generate random hash
        const chars = '0123456789abcdef'
        let hash = ''
        for (let i = 0; i < 16; i++) {
          hash += chars[Math.floor(Math.random() * chars.length)]
        }
        setCurrentHash(hash)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setGpuStats([
        { temp: 35, load: 0, fan: 0, hashRate: 0 },
        { temp: 35, load: 0, fan: 0, hashRate: 0 },
        { temp: 35, load: 0, fan: 0, hashRate: 0 },
      ])
      setCurrentHash('')
    }
  }, [state.isMining, state.hashRate])

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
        <i className="fas fa-server text-cyan-400"></i>
        Mining Rig Status
      </h3>

      {/* Hash Animation */}
      {state.isMining && (
        <div className="mb-3 bg-gray-900/50 rounded-lg p-2 overflow-hidden">
          <div className="text-xs text-gray-500 mb-1">Current Hash</div>
          <div className="font-mono text-xs text-green-400 truncate animate-pulse">
            0x{currentHash}...
          </div>
        </div>
      )}

      {/* GPU Cards */}
      <div className="space-y-3">
        {gpuStats.map((gpu, i) => (
          <div key={i} className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-4">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              state.isMining ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
            }`}>
              <i className="fas fa-display text-sm"></i>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white font-medium">GPU {i + 1} - RTX 4090</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  state.isMining ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                }`}>
                  {state.isMining ? 'Active' : 'Idle'}
                </span>
              </div>
              <div className="flex gap-3 mt-1">
                <span className={`text-xs ${gpu.temp > 75 ? 'text-red-400' : gpu.temp > 60 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  🌡️ {gpu.temp.toFixed(0)}°C
                </span>
                <span className="text-xs text-gray-400">
                  ⚡ {gpu.load.toFixed(0)}%
                </span>
                <span className="text-xs text-gray-400">
                  🌀 {gpu.fan.toFixed(0)}%
                </span>
                <span className="text-xs text-blue-400">
                  {gpu.hashRate.toFixed(1)} MH/s
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pool Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Pool Configuration</div>
        <div className="bg-gray-900/50 rounded-lg p-3 font-mono text-xs text-gray-300">
          <div>Pool: stratum+tcp://pool.cryptominer.pro:3333</div>
          <div>Worker: rig01.worker01</div>
          <div>Algorithm: {state.selectedCrypto === 'BTC' ? 'SHA-256' : state.selectedCrypto === 'ETH' ? 'Ethash' : state.selectedCrypto === 'LTC' ? 'Scrypt' : 'RandomX'}</div>
        </div>
      </div>
    </div>
  )
}
