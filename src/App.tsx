import { useState } from 'react'
import PoolMonitor from './components/PoolMonitor'
import WalletLookup from './components/WalletLookup'
import ProfitCalculator from './components/ProfitCalculator'
import NetworkStats from './components/NetworkStats'
import MultiWalletTracker from './components/MultiWalletTracker'
import AutoSwitchRecommendation from './components/AutoSwitchRecommendation'
import PriceTicker from './components/PriceTicker'
import AlertSystem from './components/AlertSystem'

type Tab = 'monitor' | 'wallet' | 'calculator' | 'network' | 'multi' | 'autoswitch' | 'alerts'

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
  const [activeTab, setActiveTab] = useState<Tab>('autoswitch')
  const [selectedPool, setSelectedPool] = useState<PoolConfig>(POOLS[0])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: 'autoswitch' as Tab, label: 'Auto-Switch', icon: 'fas fa-exchange-alt', shortLabel: 'Switch' },
    { id: 'monitor' as Tab, label: 'Pool Monitor', icon: 'fas fa-satellite-dish', shortLabel: 'Monitor' },
    { id: 'multi' as Tab, label: 'Multi-Wallet', icon: 'fas fa-layer-group', shortLabel: 'Wallets' },
    { id: 'wallet' as Tab, label: 'Wallet Lookup', icon: 'fas fa-wallet', shortLabel: 'Lookup' },
    { id: 'calculator' as Tab, label: 'Calculator', icon: 'fas fa-calculator', shortLabel: 'Calc' },
    { id: 'network' as Tab, label: 'Network', icon: 'fas fa-network-wired', shortLabel: 'Network' },
    { id: 'alerts' as Tab, label: 'Alerts', icon: 'fas fa-bell', shortLabel: 'Alerts' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-xl">
                ⛏
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  CryptoMine Tools
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Real Mining Dashboard v2.0</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Pool Selector */}
              <select
                value={selectedPool.id}
                onChange={(e) => setSelectedPool(POOLS.find(p => p.id === e.target.value) || POOLS[0])}
                className="hidden md:block bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                {POOLS.map(pool => (
                  <option key={pool.id} value={pool.id}>
                    {pool.icon} {pool.coin}
                  </option>
                ))}
              </select>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-1 mt-3 -mb-3 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-3 space-y-2">
            <select
              value={selectedPool.id}
              onChange={(e) => setSelectedPool(POOLS.find(p => p.id === e.target.value) || POOLS[0])}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-2"
            >
              {POOLS.map(pool => (
                <option key={pool.id} value={pool.id}>
                  {pool.icon} {pool.coin} - {pool.name}
                </option>
              ))}
            </select>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <i className={`${tab.icon} mr-2 w-5`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Price Ticker */}
      <PriceTicker />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'autoswitch' && <AutoSwitchRecommendation />}
        {activeTab === 'monitor' && <PoolMonitor pool={selectedPool} />}
        {activeTab === 'multi' && <MultiWalletTracker />}
        {activeTab === 'wallet' && <WalletLookup pool={selectedPool} />}
        {activeTab === 'calculator' && <ProfitCalculator pool={selectedPool} />}
        {activeTab === 'network' && <NetworkStats pool={selectedPool} />}
        {activeTab === 'alerts' && <AlertSystem />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">Data Sources</h4>
              <ul className="text-gray-500 space-y-1">
                <li>• 2Miners Pool API (real-time)</li>
                <li>• CoinGecko API (prices)</li>
                <li>• Auto-refresh every 30s</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Supported Coins</h4>
              <ul className="text-gray-500 space-y-1">
                <li>• KAS, ETC, ERG, ZEC</li>
                <li>• XMR, RVN, ETHW, BCH</li>
                <li>• 8 mining pools tracked</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Features</h4>
              <ul className="text-gray-500 space-y-1">
                <li>• Auto-switch recommendations</li>
                <li>• Multi-wallet tracking</li>
                <li>• Alert system & CSV export</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-4 pt-4 text-center text-xs text-gray-600">
            <p>CryptoMine Tools v2.0 © 2026 • Real-time data from live mining pools</p>
            <p className="mt-1">⚠️ Not financial advice. Always DYOR before mining.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
