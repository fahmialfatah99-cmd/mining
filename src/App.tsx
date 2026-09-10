import { useState } from 'react'
import PoolMonitor from './components/PoolMonitor'
import WalletLookup from './components/WalletLookup'
import ProfitCalculator from './components/ProfitCalculator'
import NetworkStats from './components/NetworkStats'

type Tab = 'monitor' | 'wallet' | 'calculator' | 'network'

export interface PoolConfig {
  id: string
  name: string
  coin: string
  symbol: string
  apiBase: string
  icon: string
  color: string
  algorithm: string
}

export const POOLS: PoolConfig[] = [
  { id: 'kas', name: 'Kaspa', coin: 'KAS', symbol: 'KAS', apiBase: 'https://kas.2miners.com/api', icon: '💎', color: 'from-green-400 to-emerald-600', algorithm: 'kHeavyHash' },
  { id: 'etc', name: 'Ethereum Classic', coin: 'ETC', symbol: 'ETC', apiBase: 'https://etc.2miners.com/api', icon: 'Ξ', color: 'from-green-500 to-teal-600', algorithm: 'Ethash' },
  { id: 'erg', name: 'Ergo', coin: 'ERG', symbol: 'ERG', apiBase: 'https://ergo.2miners.com/api', icon: '⬡', color: 'from-red-500 to-rose-600', algorithm: 'Autolykos' },
  { id: 'zec', name: 'Zcash', coin: 'ZEC', symbol: 'ZEC', apiBase: 'https://zec.2miners.com/api', icon: 'ⓩ', color: 'from-orange-500 to-yellow-500', algorithm: 'Equihash' },
  { id: 'xmr', name: 'Monero', coin: 'XMR', symbol: 'XMR', apiBase: 'https://xmr.2miners.com/api', icon: 'ɱ', color: 'from-orange-600 to-red-600', algorithm: 'RandomX' },
  { id: 'rvn', name: 'Ravencoin', coin: 'RVN', symbol: 'RVN', apiBase: 'https://rvn.2miners.com/api', icon: '🦅', color: 'from-gray-400 to-gray-600', algorithm: 'KawPow' },
  { id: 'ethw', name: 'EthereumPoW', coin: 'ETHW', symbol: 'ETHW', apiBase: 'https://ethw.2miners.com/api', icon: '⟠', color: 'from-blue-500 to-indigo-600', algorithm: 'Ethash' },
  { id: 'bch', name: 'Bitcoin Cash', coin: 'BCH', symbol: 'BCH', apiBase: 'https://bch.2miners.com/api', icon: '₿', color: 'from-green-500 to-green-700', algorithm: 'SHA-256' },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('monitor')
  const [selectedPool, setSelectedPool] = useState<PoolConfig>(POOLS[0])

  const tabs = [
    { id: 'monitor' as Tab, label: 'Pool Monitor', icon: 'fas fa-satellite-dish' },
    { id: 'wallet' as Tab, label: 'Wallet Lookup', icon: 'fas fa-wallet' },
    { id: 'calculator' as Tab, label: 'Profit Calculator', icon: 'fas fa-calculator' },
    { id: 'network' as Tab, label: 'Network Stats', icon: 'fas fa-network-wired' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <i className="fas fa-pickaxe text-white text-lg">⛏</i>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  CryptoMine Tools
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Real Mining Dashboard</p>
              </div>
            </div>

            {/* Pool Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedPool.id}
                onChange={(e) => setSelectedPool(POOLS.find(p => p.id === e.target.value) || POOLS[0])}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                {POOLS.map(pool => (
                  <option key={pool.id} value={pool.id}>
                    {pool.icon} {pool.coin} - {pool.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 -mb-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-yellow-400 border-t border-x border-gray-700'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'monitor' && <PoolMonitor pool={selectedPool} />}
        {activeTab === 'wallet' && <WalletLookup pool={selectedPool} />}
        {activeTab === 'calculator' && <ProfitCalculator pool={selectedPool} />}
        {activeTab === 'network' && <NetworkStats pool={selectedPool} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-xs">
          <p>Data dari 2Miners API & CoinGecko API • Real-time mining pool statistics</p>
          <p className="mt-1">CryptoMine Tools © 2026 • Connected to live mining pools</p>
        </div>
      </footer>
    </div>
  )
}

export default App
