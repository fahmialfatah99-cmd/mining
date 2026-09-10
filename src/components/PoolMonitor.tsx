import { useState, useEffect } from 'react'
import { PoolConfig } from '../App'
import { fetchPoolStats, fetchBlocks, fetchCoinPrice, COINGECKO_IDS, formatHashrate, formatNumber, timeAgo } from '../utils/api'

interface Props {
  pool: PoolConfig
}

export default function PoolMonitor({ pool }: Props) {
  const [stats, setStats] = useState<any>(null)
  const [blocks, setBlocks] = useState<any[]>([])
  const [price, setPrice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, blocksData, priceData] = await Promise.all([
        fetchPoolStats(pool),
        fetchBlocks(pool, 10),
        fetchCoinPrice(COINGECKO_IDS[pool.symbol] || ''),
      ])

      if (!statsData) {
        setError('Failed to load pool data. The pool API might be temporarily unavailable.')
      } else {
        setStats(statsData)
        setBlocks(blocksData || [])
        setPrice(priceData)
        setLastUpdate(new Date())
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [pool.id])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {pool.name} pool data...</p>
          <p className="text-xs text-gray-500 mt-1">Connecting to {pool.apiBase}</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
        <i className="fas fa-exclamation-triangle text-red-400 text-3xl mb-3"></i>
        <p className="text-red-300">{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm">
          Retry
        </button>
      </div>
    )
  }

  const coinPrice = price?.[COINGECKO_IDS[pool.symbol]]?.usd || 0
  const priceChange = price?.[COINGECKO_IDS[pool.symbol]]?.usd_24h_change || 0

  return (
    <div className="space-y-6">
      {/* Pool Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${pool.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
            {pool.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{pool.name} Pool</h2>
            <p className="text-sm text-gray-400">2Miners • {pool.algorithm} • Auto-refresh 30s</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-400">
            ${coinPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </div>
          <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="fas fa-users"
          iconColor="text-blue-400"
          label="Active Miners"
          value={stats?.minersTotal ? formatNumber(stats.minersTotal) : 'N/A'}
        />
        <StatCard
          icon="fas fa-tachometer-alt"
          iconColor="text-green-400"
          label="Pool Hashrate"
          value={stats?.hashrate ? formatHashrate(stats.hashrate) : 'N/A'}
        />
        <StatCard
          icon="fas fa-cube"
          iconColor="text-purple-400"
          label="Blocks Found"
          value={stats?.blocksTotal?.toString() || 'N/A'}
        />
        <StatCard
          icon="fas fa-clock"
          iconColor="text-yellow-400"
          label="Last Block"
          value={stats?.now ? timeAgo(Math.floor(stats.now - (stats?.lastBlockFound || 0) / 1000)) : 'N/A'}
        />
      </div>

      {/* Network Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Network Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Network Hashrate</span>
              <span className="text-white font-medium">{stats?.networkHashrate ? formatHashrate(stats.networkHashrate) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Difficulty</span>
              <span className="text-white font-medium">{stats?.networkDifficulty ? formatNumber(stats.networkDifficulty) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Block Height</span>
              <span className="text-white font-medium">{stats?.height ? stats.height.toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Block Reward</span>
              <span className="text-white font-medium">{stats?.blockReward ? `${stats.blockReward} ${pool.symbol}` : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Pool Info</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Fee</span>
              <span className="text-white font-medium">{stats?.fee || '1'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Min Payout</span>
              <span className="text-white font-medium">{stats?.minPaymentThreshold ? `${stats.minPaymentThreshold / 1e8} ${pool.symbol}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Payment Scheme</span>
              <span className="text-white font-medium">PPLNS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Last Update</span>
              <span className="text-gray-300 text-sm">{lastUpdate?.toLocaleTimeString() || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Blocks */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <i className="fas fa-cubes text-purple-400"></i>
            Recent Blocks
          </h3>
          <span className="text-xs text-gray-500">{blocks.length} blocks shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-4 py-2 text-left text-gray-400 font-medium">Height</th>
                <th className="px-4 py-2 text-left text-gray-400 font-medium">Status</th>
                <th className="px-4 py-2 text-left text-gray-400 font-medium">Reward</th>
                <th className="px-4 py-2 text-left text-gray-400 font-medium">Time</th>
                <th className="px-4 py-2 text-left text-gray-400 font-medium">Miner</th>
              </tr>
            </thead>
            <tbody>
              {blocks.slice(0, 8).map((block, i) => (
                <tr key={i} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                  <td className="px-4 py-2 font-mono text-blue-400">{block?.height?.toLocaleString() || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      block?.category === 'confirmed' || block?.mature ? 'bg-green-500/20 text-green-400' :
                      block?.category === 'immature' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {block?.category || block?.mature ? 'Confirmed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-green-400">{block?.reward ? (block.reward / 1e8).toFixed(4) : 'N/A'} {pool.symbol}</td>
                  <td className="px-4 py-2 text-gray-300">{block?.timestamp ? timeAgo(block.timestamp / 1000) : 'N/A'}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-400 truncate max-w-[120px]">
                    {block?.miner ? `${block.miner.slice(0, 6)}...${block.miner.slice(-4)}` : 'N/A'}
                  </td>
                </tr>
              ))}
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No blocks found yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, iconColor, label, value }: { icon: string; iconColor: string; label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <i className={`${icon} ${iconColor}`}></i>
        <span className="text-gray-400 text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )
}
