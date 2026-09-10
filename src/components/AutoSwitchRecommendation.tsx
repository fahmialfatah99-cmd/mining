import { useState, useEffect } from 'react'
import { POOLS } from '../App'
import {
  fetchPoolStats,
  fetchAllPrices,
  COINGECKO_IDS,
  formatHashrate,
  calculateProfitability,
} from '../utils/api'

interface CoinProfit {
  pool: typeof POOLS[0]
  stats: any
  price: number
  change24h: number
  dailyRevenue: number
  dailyCost: number
  dailyProfit: number
  score: number
  coinsPerDay: number
}

const GPU_PRESETS = [
  { name: 'RTX 4090', power: 280 },
  { name: 'RTX 4080', power: 220 },
  { name: 'RTX 3090', power: 310 },
  { name: 'RTX 3080', power: 250 },
  { name: 'RX 7900 XTX', power: 290 },
  { name: 'RX 6800 XT', power: 220 },
]

// Approximate hashrates per algorithm per GPU
const HASHRATE_MAP: Record<string, Record<string, number>> = {
  'RTX 4090': { kHeavyHash: 42000000000, Ethash: 130000000, RandomX: 5000, KawPow: 55000000, Equihash: 180, Autolykos: 950000000, 'SHA-256': 100000000 },
  'RTX 4080': { kHeavyHash: 28000000000, Ethash: 85000000, RandomX: 3500, KawPow: 38000000, Equihash: 130, Autolykos: 650000000, 'SHA-256': 80000000 },
  'RTX 3090': { kHeavyHash: 25000000000, Ethash: 100000000, RandomX: 3800, KawPow: 42000000, Equihash: 140, Autolykos: 750000000, 'SHA-256': 80000000 },
  'RTX 3080': { kHeavyHash: 18000000000, Ethash: 75000000, RandomX: 2800, KawPow: 32000000, Equihash: 100, Autolykos: 550000000, 'SHA-256': 60000000 },
  'RX 7900 XTX': { kHeavyHash: 35000000000, Ethash: 110000000, RandomX: 4500, KawPow: 48000000, Equihash: 160, Autolykos: 850000000, 'SHA-256': 90000000 },
  'RX 6800 XT': { kHeavyHash: 20000000000, Ethash: 64000000, RandomX: 3200, KawPow: 30000000, Equihash: 110, Autolykos: 500000000, 'SHA-256': 55000000 },
}

export default function AutoSwitchRecommendation() {
  const [selectedGpu, setSelectedGpu] = useState('RTX 4090')
  const [electricityCost, setElectricityCost] = useState(0.10)
  const [coinProfits, setCoinProfits] = useState<CoinProfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculate = async () => {
      setLoading(true)
      const allPrices = await fetchAllPrices()

      const results: CoinProfit[] = []

      for (const pool of POOLS) {
        const stats = await fetchPoolStats(pool)
        if (!stats) continue

        const coinId = COINGECKO_IDS[pool.symbol]
        const price = allPrices?.[coinId]?.usd || 0
        const change24h = allPrices?.[coinId]?.usd_24h_change || 0

        const gpuPreset = GPU_PRESETS.find(g => g.name === selectedGpu)
        if (!gpuPreset) continue

        const hashrate = HASHRATE_MAP[selectedGpu]?.[pool.algorithm] || 0
        if (hashrate === 0) continue

        const profit = calculateProfitability(
          hashrate,
          gpuPreset.power,
          stats.networkHashrate || 0,
          stats.blockReward || 0,
          stats.blockTime || 120,
          price,
          stats.fee || 1,
          electricityCost
        )

        const blocksPerDay = 86400 / (stats.blockTime || 120)
        const coinsPerDay = (stats.networkHashrate || 0) > 0
          ? (hashrate / stats.networkHashrate) * blocksPerDay * (stats.blockReward || 0) * (1 - (stats.fee || 1) / 100)
          : 0

        results.push({
          pool,
          stats,
          price,
          change24h,
          dailyRevenue: profit.dailyRevenue,
          dailyCost: profit.dailyCost,
          dailyProfit: profit.dailyProfit,
          score: profit.score,
          coinsPerDay,
        })
      }

      results.sort((a, b) => b.dailyProfit - a.dailyProfit)
      setCoinProfits(results)
      setLoading(false)
    }

    calculate()
    const interval = setInterval(calculate, 120000) // Every 2 min
    return () => clearInterval(interval)
  }, [selectedGpu, electricityCost])

  const bestCoin = coinProfits.length > 0 ? coinProfits[0] : null
  const gpuPreset = GPU_PRESETS.find(g => g.name === selectedGpu)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/20 rounded-xl p-6 border border-yellow-800/50">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <i className="fas fa-exchange-alt text-yellow-400"></i>
          Auto-Switch Recommendation Engine
        </h3>
        <p className="text-sm text-gray-400">
          Real-time profitability analysis across all supported coins. Auto-calculates the most profitable coin to mine with your hardware.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Your GPU</label>
            <select
              value={selectedGpu}
              onChange={(e) => setSelectedGpu(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
            >
              {GPU_PRESETS.map(gpu => (
                <option key={gpu.name} value={gpu.name}>{gpu.name} ({gpu.power}W)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Electricity ($/kWh)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={electricityCost}
              onChange={(e) => setElectricityCost(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Power Consumption</label>
            <div className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
              {gpuPreset?.power || 0}W • ${(gpuPreset ? (gpuPreset.power / 1000) * 24 * electricityCost : 0).toFixed(2)}/day
            </div>
          </div>
        </div>
      </div>

      {/* Best Recommendation */}
      {bestCoin && !loading && (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/10 rounded-xl p-6 border border-green-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-green-400 uppercase tracking-wide font-semibold mb-2">
                🏆 Most Profitable Right Now
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 bg-gradient-to-br ${bestCoin.pool.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {bestCoin.pool.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{bestCoin.pool.name}</div>
                  <div className="text-sm text-gray-400">{bestCoin.pool.algorithm} • ${bestCoin.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">
                ${bestCoin.dailyProfit.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">profit/day</div>
              <div className={`text-sm mt-1 ${bestCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {bestCoin.change24h >= 0 ? '▲' : '▼'} {Math.abs(bestCoin.change24h).toFixed(2)}% (24h)
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-900/30 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Revenue</div>
              <div className="text-sm font-semibold text-green-300">${bestCoin.dailyRevenue.toFixed(4)}</div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Electricity</div>
              <div className="text-sm font-semibold text-red-300">-${bestCoin.dailyCost.toFixed(4)}</div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Coins/Day</div>
              <div className="text-sm font-semibold text-yellow-300">{bestCoin.coinsPerDay.toFixed(6)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <i className="fas fa-trophy text-yellow-400"></i>
            Profitability Rankings (Live)
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Calculating profitability across all pools...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">#</th>
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Coin</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Revenue/Day</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Cost/Day</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Profit/Day</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">Profit/Month</th>
                  <th className="px-4 py-2 text-right text-gray-400 font-medium">ROI Score</th>
                </tr>
              </thead>
              <tbody>
                {coinProfits.map((coin, i) => (
                  <tr key={coin.pool.id} className={`border-t border-gray-700/50 hover:bg-gray-700/20 ${i === 0 ? 'bg-green-900/10' : ''}`}>
                    <td className="px-4 py-3">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{coin.pool.icon}</span>
                        <div>
                          <div className="font-semibold text-white">{coin.pool.symbol}</div>
                          <div className="text-xs text-gray-500">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-green-400">${coin.dailyRevenue.toFixed(4)}</td>
                    <td className="px-4 py-3 text-right text-red-400">-${coin.dailyCost.toFixed(4)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${coin.dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${coin.dailyProfit.toFixed(4)}
                    </td>
                    <td className={`px-4 py-3 text-right ${coin.dailyProfit * 30 >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      ${(coin.dailyProfit * 30).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        coin.score > 2 ? 'bg-green-500/20 text-green-400' :
                        coin.score > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {coin.score.toFixed(2)}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
