import { useState, useEffect, useCallback } from 'react'
import MiningDashboard from './components/MiningDashboard'
import MiningConsole from './components/MiningConsole'
import CryptoSelector from './components/CryptoSelector'
import StatsCards from './components/StatsCards'
import HashRateChart from './components/HashRateChart'
import WalletPanel from './components/WalletPanel'

export interface MiningState {
  isMining: boolean
  hashRate: number
  shares: number
  blocksFound: number
  earnings: number
  difficulty: number
  temperature: number
  power: number
  selectedCrypto: string
  logs: string[]
  hashRateHistory: number[]
}

function App() {
  const [miningState, setMiningState] = useState<MiningState>({
    isMining: false,
    hashRate: 0,
    shares: 0,
    blocksFound: 0,
    earnings: 0,
    difficulty: 1,
    temperature: 45,
    power: 0,
    selectedCrypto: 'BTC',
    logs: [],
    hashRateHistory: [],
  })

  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null)

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setMiningState(prev => ({
      ...prev,
      logs: [`[${timestamp}] ${message}`, ...prev.logs].slice(0, 50),
    }))
  }, [])

  const startMining = useCallback(() => {
    setMiningState(prev => ({ ...prev, isMining: true }))
    addLog('🚀 Mining started')
    addLog(`⛏️ Algorithm: SHA-256 | Pool: stratum+tcp://pool.cryptominer.pro:3333`)
    addLog(`🔗 Connected to ${miningState.selectedCrypto} network`)

    const id = setInterval(() => {
      setMiningState(prev => {
        if (!prev.isMining) return prev

        const baseHashRate = prev.selectedCrypto === 'BTC' ? 95 : prev.selectedCrypto === 'ETH' ? 45 : prev.selectedCrypto === 'LTC' ? 120 : 60
        const variance = (Math.random() - 0.5) * 20
        const newHashRate = Math.max(10, baseHashRate + variance)
        const shareFound = Math.random() > 0.7
        const newShares = prev.shares + (shareFound ? 1 : 0)
        const blockFound = Math.random() > 0.995
        const newBlocks = prev.blocksFound + (blockFound ? 1 : 0)
        const earningsPerShare = prev.selectedCrypto === 'BTC' ? 0.00001 : prev.selectedCrypto === 'ETH' ? 0.001 : prev.selectedCrypto === 'LTC' ? 0.01 : 0.0005
        const newEarnings = prev.earnings + (shareFound ? earningsPerShare : 0)
        const newTemp = 45 + (newHashRate / 120) * 30 + Math.random() * 3
        const newPower = 100 + (newHashRate / 120) * 200 + Math.random() * 10

        const newHistory = [...prev.hashRateHistory, newHashRate].slice(-30)

        // Add logs
        const timestamp = new Date().toLocaleTimeString()
        const newLogs: string[] = []
        if (shareFound) {
          newLogs.push(`[${timestamp}] ✅ Share accepted (${newHashRate.toFixed(1)} MH/s)`)
        }
        if (blockFound) {
          newLogs.push(`[${timestamp}] 💎 BLOCK FOUND! Reward: ${earningsPerShare} ${prev.selectedCrypto}`)
        }
        if (Math.random() > 0.9) {
          const nonce = Math.floor(Math.random() * 999999999).toString(16).padStart(8, '0')
          newLogs.push(`[${timestamp}] ⛏️ New job received | diff: ${(Math.random() * 10000).toFixed(0)} | nonce: 0x${nonce}`)
        }

        return {
          ...prev,
          hashRate: newHashRate,
          shares: newShares,
          blocksFound: newBlocks,
          earnings: newEarnings,
          temperature: newTemp,
          power: newPower,
          hashRateHistory: newHistory,
          logs: [...newLogs, ...prev.logs].slice(0, 50),
        }
      })
    }, 1000)

    setIntervalId(id)
  }, [addLog, miningState.selectedCrypto])

  const stopMining = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setMiningState(prev => ({ ...prev, isMining: false, hashRate: 0, power: 0 }))
    addLog('⛔ Mining stopped')
  }, [intervalId, addLog])

  const selectCrypto = useCallback((crypto: string) => {
    setMiningState(prev => ({ ...prev, selectedCrypto: crypto }))
    addLog(`🔄 Switched to ${crypto}`)
  }, [addLog])

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [intervalId])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-gem text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                CryptoMiner Pro
              </h1>
              <p className="text-xs text-gray-400">Advanced Mining Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${miningState.isMining ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{miningState.isMining ? 'Mining Active' : 'Idle'}</span>
            </div>
            <button
              onClick={miningState.isMining ? stopMining : startMining}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                miningState.isMining
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                  : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
              }`}
            >
              {miningState.isMining ? '⛔ Stop Mining' : '▶ Start Mining'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Crypto Selector */}
        <CryptoSelector selected={miningState.selectedCrypto} onSelect={selectCrypto} />

        {/* Stats Cards */}
        <StatsCards state={miningState} />

        {/* Charts, Dashboard and Wallet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <HashRateChart history={miningState.hashRateHistory} isMining={miningState.isMining} />
          <MiningDashboard state={miningState} />
          <WalletPanel state={miningState} />
        </div>

        {/* Mining Console */}
        <MiningConsole logs={miningState.logs} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>⚠️ This is a simulation dashboard for educational purposes only. No actual mining is performed.</p>
          <p className="mt-1">CryptoMiner Pro © 2026 | Built with React + Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}

export default App
