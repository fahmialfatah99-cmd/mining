import { useState, useEffect, useCallback } from 'react'
import { POOLS, PoolConfig } from '../App'
import {
  fetchAccountInfo,
  fetchAllPrices,
  COINGECKO_IDS,
  formatHashrate,
  formatNumber,
  saveWallets,
  loadWallets,
  exportToCSV,
} from '../utils/api'

interface WalletEntry {
  address: string
  poolId: string
  label: string
  addedAt: number
}

interface WalletData {
  entry: WalletEntry
  pool: PoolConfig
  account: any
  price: number
  loading: boolean
  error: string | null
}

export default function MultiWalletTracker() {
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [walletData, setWalletData] = useState<WalletData[]>([])
  const [newAddress, setNewAddress] = useState('')
  const [newPool, setNewPool] = useState(POOLS[0].id)
  const [newLabel, setNewLabel] = useState('')
  const [prices, setPrices] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Load saved wallets
  useEffect(() => {
    const saved = loadWallets().map(w => ({
      address: w.address,
      poolId: w.poolId,
      label: w.label,
      addedAt: Date.now(),
    }))
    setWallets(saved)
  }, [])

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (wallets.length === 0) return
    setRefreshing(true)

    const allPrices = await fetchAllPrices()
    setPrices(allPrices)

    const results = await Promise.all(
      wallets.map(async (entry) => {
        const pool = POOLS.find(p => p.id === entry.poolId) || POOLS[0]
        try {
          const account = await fetchAccountInfo(pool, entry.address)
          const coinId = COINGECKO_IDS[pool.symbol]
          const price = allPrices?.[coinId]?.usd || 0
          return { entry, pool, account, price, loading: false, error: account ? null : 'Wallet not found' }
        } catch {
          return { entry, pool, account: null, price: 0, loading: false, error: 'Failed to fetch' }
        }
      })
    )

    setWalletData(results)
    setRefreshing(false)
  }, [wallets])

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 30000)
    return () => clearInterval(interval)
  }, [fetchAllData])

  const addWallet = () => {
    if (!newAddress.trim()) return
    const entry: WalletEntry = {
      address: newAddress.trim(),
      poolId: newPool,
      label: newLabel.trim() || `Wallet ${wallets.length + 1}`,
      addedAt: Date.now(),
    }
    const updated = [...wallets, entry]
    setWallets(updated)
    saveWallets(updated)
    setNewAddress('')
    setNewLabel('')
  }

  const removeWallet = (index: number) => {
    const updated = wallets.filter((_, i) => i !== index)
    setWallets(updated)
    saveWallets(updated)
  }

  const totalBalance = walletData.reduce((sum, d) => {
    if (!d.account?.balance) return sum
    return sum + (d.account.balance / 1e8) * d.price
  }, 0)

  const totalPaid = walletData.reduce((sum, d) => {
    if (!d.account?.paid) return sum
    return sum + (d.account.paid / 1e8) * d.price
  }, 0)

  const totalHashrate = walletData.reduce((sum, d) => {
    if (!d.account?.currentHashrate) return sum
    return sum + d.account.currentHashrate
  }, 0)

  const handleExport = () => {
    const data = walletData.map(d => ({
      Label: d.entry.label,
      Pool: d.pool.symbol,
      Address: d.entry.address,
      CurrentHashrate: d.account?.currentHashrate || 0,
      AvgHashrate: d.account?.hashrate || 0,
      PendingBalance: d.account ? (d.account.balance / 1e8).toFixed(8) : '0',
      TotalPaid: d.account ? (d.account.paid / 1e8).toFixed(8) : '0',
      USDValue: d.account ? ((d.account.balance / 1e8) * d.price).toFixed(4) : '0',
      Workers: d.account?.workers ? Object.keys(d.account.workers).length : 0,
    }))
    exportToCSV(data, 'wallet_tracker')
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 rounded-xl p-4 border border-green-800/50">
          <div className="text-xs text-green-400/70 uppercase tracking-wide mb-1">Total Balance</div>
          <div className="text-xl font-bold text-green-400">${totalBalance.toFixed(4)}</div>
          <div className="text-xs text-gray-500 mt-1">{wallets.length} wallet(s) tracked</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 rounded-xl p-4 border border-purple-800/50">
          <div className="text-xs text-purple-400/70 uppercase tracking-wide mb-1">Total Earned</div>
          <div className="text-xl font-bold text-purple-400">${totalPaid.toFixed(4)}</div>
          <div className="text-xs text-gray-500 mt-1">All-time paid</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-xl p-4 border border-blue-800/50">
          <div className="text-xs text-blue-400/70 uppercase tracking-wide mb-1">Combined Hashrate</div>
          <div className="text-xl font-bold text-blue-400">{formatHashrate(totalHashrate)}</div>
          <div className="text-xs text-gray-500 mt-1">Current total</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 rounded-xl p-4 border border-yellow-800/50">
          <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">Active Workers</div>
          <div className="text-xl font-bold text-yellow-400">
            {walletData.reduce((sum, d) => sum + (d.account?.workers ? Object.keys(d.account.workers).length : 0), 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Across all wallets</div>
        </div>
      </div>

      {/* Add Wallet Form */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-plus-circle text-green-400"></i>
          Add Wallet to Track
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g., My Rig)"
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
          <select
            value={newPool}
            onChange={(e) => setNewPool(e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500"
          >
            {POOLS.map(p => (
              <option key={p.id} value={p.id}>{p.icon} {p.symbol} - {p.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addWallet()}
            placeholder="Wallet address..."
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
          <button
            onClick={addWallet}
            disabled={!newAddress.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white text-sm"
          >
            <i className="fas fa-plus mr-1"></i> Add
          </button>
        </div>
      </div>

      {/* Wallet List */}
      {walletData.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <i className="fas fa-list text-yellow-400"></i>
              Tracked Wallets
            </h3>
            <div className="flex gap-2">
              <button
                onClick={fetchAllData}
                disabled={refreshing}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300"
              >
                <i className={`fas fa-sync-alt mr-1 ${refreshing ? 'animate-spin' : ''}`}></i>
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                <i className="fas fa-download mr-1"></i>
                Export CSV
              </button>
            </div>
          </div>

          <div className="space-y-2 p-3">
            {walletData.map((data, i) => (
              <div key={i} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${data.pool.color} rounded-lg flex items-center justify-center text-sm`}>
                      {data.pool.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{data.entry.label}</div>
                      <div className="text-xs text-gray-500 font-mono truncate max-w-[200px] md:max-w-[400px]">
                        {data.entry.address}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeWallet(i)}
                    className="text-gray-500 hover:text-red-400 text-sm"
                    title="Remove wallet"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                {data.error ? (
                  <div className="text-red-400 text-xs flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {data.error}
                  </div>
                ) : data.account ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Hashrate</div>
                      <div className="text-sm font-semibold text-green-400">
                        {data.account.currentHashrate ? formatHashrate(data.account.currentHashrate) : '0 H/s'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pending</div>
                      <div className="text-sm font-semibold text-yellow-400">
                        {(data.account.balance / 1e8).toFixed(6)} {data.pool.symbol}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Paid</div>
                      <div className="text-sm font-semibold text-purple-400">
                        {(data.account.paid / 1e8).toFixed(6)} {data.pool.symbol}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">USD Value</div>
                      <div className="text-sm font-semibold text-white">
                        ${((data.account.balance / 1e8) * data.price).toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Workers</div>
                      <div className="text-sm font-semibold text-cyan-400">
                        {data.account.workers ? Object.keys(data.account.workers).length : 0} online
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs">Loading...</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {wallets.length === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
          <i className="fas fa-wallet text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400">No wallets tracked yet</p>
          <p className="text-xs text-gray-500 mt-1">Add your mining wallet addresses above to track them all in one place</p>
        </div>
      )}
    </div>
  )
}
