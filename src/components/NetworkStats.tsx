import { useState, useEffect } from 'react'
import { PoolConfig, POOLS } from '../App'
import { fetchPoolStats, fetchCoinPrice, COINGECKO_IDS, formatHashrate, formatNumber } from '../utils/api'

interface Props {
  pool: PoolConfig
}

interface PoolData {
  pool: PoolConfig
  stats: any
  price: any
}

export default function NetworkStats({ pool }: Props) {
  const [allPoolsData, setAllPoolsData] = useState<PoolData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'hashrate' | 'miners' | 'price' | 'difficulty'>('hashrate')

  useEffect(() => {
    const loadAllPools = async () => {
      setLoading(true)
      const results: PoolData[] = []

      const promises = POOLS.map(async (p) => {
        const [stats, price] = await Promise.all([
          fetchPoolStats(p),
          fetchCoinPrice(COINGECKO_IDS[p.symbol] || ''),
        ])
        return { pool: p, stats, price }
      })

      const data = await Promise.all(promises)
      setAllPoolsData(data.filter(d => d.stats !== null))
      setLoading(false)
    }

    loadAllPools()
    const interval = setInterval(loadAllPools, 60000)
    return () => clearInterval(interval)
  }, [])

  const sortedPools = [...allPoolsData].sort((a, b) => {
    switch (sortBy) {
      case 'hashrate':
        return (b.stats?.networkHashrate || 0) - (a.stats?.networkHashrate || 0)
      case 'miners':
        return (b.stats?.minersTotal || 0) - (a.stats?.minersTotal || 0)
      case 'price':
        return (b.price?.[COINGECKO_IDS[b.pool.symbol]]?.usd || 0) - (a.price?.[COINGECKO_IDS[a.pool.symbol]]?.usd || 0)
      case 'difficulty':
        return (b.stats?.networkDifficulty || 0) - (a.stats?.networkDifficulty || 0)
      default:
        return 0
    }
  })

  // Selected pool detail
  const selectedData = allPoolsData.find(d => d.pool.id === pool.id)
  const selectedStats = selectedData?.stats
  const selectedPrice = selectedData?.price?.[COINGECKO_IDS[pool.symbol]]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <i className="fas fa-network-wired text-cyan-400"></i>
          Network Statistics - All Pools
        </h3>
        <p className="text-sm text-gray-400">
          Real-time data from 2Miners pools across multiple cryptocurrencies
        </p>
      </div>

      {/* Selected Pool Detail */}
      {selectedStats && (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${pool.color} rounded-xl flex items-center justify-center text-2xl`}>
              {pool.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold">{pool.name} Network</h3>
              <p className="text-sm text-gray-400">{pool.algorithm} • Block Time: {selectedStats.blockTime || 'N/A'}s</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Network Hashrate</div>
              <div className="text-lg font-bold text-cyan-400">
                {selectedStats.networkHashrate ? formatHashrate(selectedStats.networkHashrate) : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Difficulty</div>
              <div className="text-lg font-bold text-purple-400">
                {selectedStats.networkDifficulty ? formatNumber(selectedStats.networkDifficulty) : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Block Height</div>
              <div className="text-lg font-bold text-white">
                {selectedStats.height ? selectedStats.height.toLocaleString() : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Coin Price</div>
              <div className="text-lg font-bold text-green-400">
                ${selectedPrice?.usd?.toLocaleString(undefined, { maximumFractionDigits: 6 }) || 'N/A'}
              </div>
              {selectedPrice?.usd_24h_change && (
                <div className={`text-xs ${selectedPrice.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedPrice.usd_24h_change >= 0 ? '+' : ''}{selectedPrice.usd_24h_change.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <i className="fas fa-table text-yellow-400"></i>
            Pool Comparison
          </h3>
          <div className="flex gap-1">
            {[
              { key: 'hashrate' as const, label: 'Hashrate' },
              { key: 'miners' as const, label: 'Miners' },
              { key: 'price' as const, label: 'Price' },
              { key: 'difficulty' as const, label: 'Difficulty' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  sortBy === s.key ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading data from all pools...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Coin</th>
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Algorithm</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Network HR</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Difficulty</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Pool HR</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Miners</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Price</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">24h</th>
                </tr>
              </thead>
              <tbody>
                {sortedPools.map(({ pool: p, stats, price: pr }) => {
                  const coinPrice = pr?.[COINGECKO_IDS[p.symbol]]?.usd || 0
                  const change = pr?.[COINGECKO_IDS[p.symbol]]?.usd_24h_change || 0

                  return (
                    <tr key={p.id} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.icon}</span>
                          <div>
                            <div className="font-semibold text-white">{p.symbol}</div>
                            <div className="text-xs text-gray-500">{p.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{p.algorithm}</td>
                      <td className="px-4 py-3 text-right text-cyan-400 font-medium">
                        {stats?.networkHashrate ? formatHashrate(stats.networkHashrate) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-400">
                        {stats?.networkDifficulty ? formatNumber(stats.networkDifficulty) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-green-400">
                        {stats?.hashrate ? formatHashrate(stats.hashrate) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {stats?.minersTotal ? formatNumber(stats.minersTotal) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        ${coinPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className={`px-4 py-3 text-right ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mining Difficulty Chart (Visual) */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-chart-bar text-orange-400"></i>
          Network Hashrate Comparison
        </h3>
        <div className="space-y-3">
          {sortedPools.map(({ pool: p, stats }) => {
            const maxHR = Math.max(...sortedPools.map(d => d.stats?.networkHashrate || 0))
            const percentage = maxHR > 0 ? ((stats?.networkHashrate || 0) / maxHR) * 100 : 0

            return (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-16 text-sm text-gray-300 font-medium">{p.symbol}</div>
                <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${p.color} rounded-full transition-all duration-1000 flex items-center justify-end px-2`}
                    style={{ width: `${Math.max(2, percentage)}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs text-white font-medium">
                        {stats?.networkHashrate ? formatHashrate(stats.networkHashrate) : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-24 text-right text-xs text-gray-400">
                  {stats?.networkHashrate ? formatHashrate(stats.networkHashrate) : 'N/A'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
