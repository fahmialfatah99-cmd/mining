import { useState, useEffect } from 'react'
import { PoolConfig } from '../App'
import { fetchPoolStats, fetchCoinPrice, COINGECKO_IDS, formatHashrate } from '../utils/api'

interface Props {
  pool: PoolConfig
}

// GPU hashrate data (approximate real-world values)
const GPU_DATA: Record<string, Record<string, { hashrate: number; power: number; unit: string }>> = {
  kHeavyHash: {
    'RTX 4090': { hashrate: 42000, power: 280, unit: 'MH/s' },
    'RTX 4080': { hashrate: 28000, power: 220, unit: 'MH/s' },
    'RTX 4070 Ti': { hashrate: 22000, power: 180, unit: 'MH/s' },
    'RTX 3090': { hashrate: 25000, power: 310, unit: 'MH/s' },
    'RTX 3080': { hashrate: 18000, power: 250, unit: 'MH/s' },
    'RTX 3070': { hashrate: 12000, power: 160, unit: 'MH/s' },
    'RTX 3060 Ti': { hashrate: 9500, power: 130, unit: 'MH/s' },
    'RX 7900 XTX': { hashrate: 35000, power: 290, unit: 'MH/s' },
    'RX 6800 XT': { hashrate: 20000, power: 220, unit: 'MH/s' },
  },
  Ethash: {
    'RTX 4090': { hashrate: 130, power: 180, unit: 'MH/s' },
    'RTX 4080': { hashrate: 85, power: 150, unit: 'MH/s' },
    'RTX 4070 Ti': { hashrate: 65, power: 130, unit: 'MH/s' },
    'RTX 3090': { hashrate: 100, power: 220, unit: 'MH/s' },
    'RTX 3080': { hashrate: 75, power: 180, unit: 'MH/s' },
    'RTX 3070': { hashrate: 50, power: 130, unit: 'MH/s' },
    'RTX 3060 Ti': { hashrate: 42, power: 110, unit: 'MH/s' },
    'RX 7900 XTX': { hashrate: 110, power: 200, unit: 'MH/s' },
    'RX 6800 XT': { hashrate: 64, power: 150, unit: 'MH/s' },
  },
  RandomX: {
    'RTX 4090': { hashrate: 5000, power: 280, unit: 'H/s' },
    'RTX 4080': { hashrate: 3500, power: 220, unit: 'H/s' },
    'RTX 3090': { hashrate: 3800, power: 310, unit: 'H/s' },
    'RTX 3080': { hashrate: 2800, power: 250, unit: 'H/s' },
    'RTX 3070': { hashrate: 2000, power: 160, unit: 'H/s' },
    'RX 7900 XTX': { hashrate: 4500, power: 290, unit: 'H/s' },
    'RX 6800 XT': { hashrate: 3200, power: 220, unit: 'H/s' },
  },
  KawPow: {
    'RTX 4090': { hashrate: 55, power: 250, unit: 'MH/s' },
    'RTX 4080': { hashrate: 38, power: 200, unit: 'MH/s' },
    'RTX 3090': { hashrate: 42, power: 280, unit: 'MH/s' },
    'RTX 3080': { hashrate: 32, power: 220, unit: 'MH/s' },
    'RTX 3070': { hashrate: 22, power: 150, unit: 'MH/s' },
    'RX 7900 XTX': { hashrate: 48, power: 260, unit: 'MH/s' },
    'RX 6800 XT': { hashrate: 30, power: 190, unit: 'MH/s' },
  },
  Equihash: {
    'RTX 4090': { hashrate: 180, power: 280, unit: 'Sol/s' },
    'RTX 4080': { hashrate: 130, power: 220, unit: 'Sol/s' },
    'RTX 3090': { hashrate: 140, power: 310, unit: 'Sol/s' },
    'RTX 3080': { hashrate: 100, power: 250, unit: 'Sol/s' },
    'RTX 3070': { hashrate: 70, power: 160, unit: 'Sol/s' },
    'RX 7900 XTX': { hashrate: 160, power: 290, unit: 'Sol/s' },
    'RX 6800 XT': { hashrate: 110, power: 220, unit: 'Sol/s' },
  },
  Autolykos: {
    'RTX 4090': { hashrate: 950, power: 180, unit: 'MH/s' },
    'RTX 4080': { hashrate: 650, power: 150, unit: 'MH/s' },
    'RTX 3090': { hashrate: 750, power: 220, unit: 'MH/s' },
    'RTX 3080': { hashrate: 550, power: 180, unit: 'MH/s' },
    'RTX 3070': { hashrate: 380, power: 130, unit: 'MH/s' },
    'RX 7900 XTX': { hashrate: 850, power: 200, unit: 'MH/s' },
    'RX 6800 XT': { hashrate: 500, power: 150, unit: 'MH/s' },
  },
  'SHA-256': {
    'RTX 4090': { hashrate: 100, power: 280, unit: 'MH/s' },
    'RTX 3090': { hashrate: 80, power: 310, unit: 'MH/s' },
    'RTX 3080': { hashrate: 60, power: 250, unit: 'MH/s' },
  },
}

export default function ProfitCalculator({ pool }: Props) {
  const [stats, setStats] = useState<any>(null)
  const [price, setPrice] = useState<any>(null)
  const [gpuCount, setGpuCount] = useState(1)
  const [selectedGpu, setSelectedGpu] = useState('RTX 4090')
  const [electricityCost, setElectricityCost] = useState(0.10) // $/kWh
  const [poolFee, setPoolFee] = useState(1) // %

  const algo = pool.algorithm
  const gpuOptions = GPU_DATA[algo] || GPU_DATA['Ethash']

  useEffect(() => {
    const loadData = async () => {
      const [statsData, priceData] = await Promise.all([
        fetchPoolStats(pool),
        fetchCoinPrice(COINGECKO_IDS[pool.symbol] || ''),
      ])
      setStats(statsData)
      setPrice(priceData)
    }
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [pool.id])

  const coinPrice = price?.[COINGECKO_IDS[pool.symbol]]?.usd || 0
  const networkHashrate = stats?.networkHashrate || 0
  const blockReward = stats?.blockReward || 0
  const blockTime = stats?.blockTime || 120 // seconds

  const gpuSpecs = gpuOptions[selectedGpu] || { hashrate: 0, power: 0, unit: 'MH/s' }
  const totalHashrate = gpuSpecs.hashrate * gpuCount
  const totalPower = gpuSpecs.power * gpuCount

  // Calculate daily earnings
  // Formula: (your_hashrate / network_hashrate) * blocks_per_day * block_reward
  const blocksPerDay = 86400 / blockTime
  const dailyCoins = networkHashrate > 0
    ? (totalHashrate / networkHashrate) * blocksPerDay * blockReward * (1 - poolFee / 100)
    : 0
  const dailyRevenue = dailyCoins * coinPrice
  const dailyElectricity = (totalPower / 1000) * 24 * electricityCost
  const dailyProfit = dailyRevenue - dailyElectricity

  const monthlyProfit = dailyProfit * 30
  const yearlyProfit = dailyProfit * 365

  return (
    <div className="space-y-6">
      {/* Calculator Header */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <i className="fas fa-calculator text-yellow-400"></i>
          Mining Profitability Calculator
        </h3>
        <p className="text-sm text-gray-400">
          Calculate estimated earnings for mining {pool.name} ({pool.algorithm})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-5">
          <h4 className="font-semibold text-white">Hardware Configuration</h4>

          {/* GPU Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">GPU Model</label>
            <select
              value={selectedGpu}
              onChange={(e) => setSelectedGpu(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
            >
              {Object.keys(gpuOptions).map(gpu => (
                <option key={gpu} value={gpu}>{gpu}</option>
              ))}
            </select>
          </div>

          {/* GPU Count */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Number of GPUs</label>
            <input
              type="number"
              min={1}
              max={100}
              value={gpuCount}
              onChange={(e) => setGpuCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* Electricity Cost */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Electricity Cost ($/kWh)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={electricityCost}
              onChange={(e) => setElectricityCost(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
            />
            <div className="flex gap-2 mt-2">
              {[0.05, 0.08, 0.10, 0.12, 0.15, 0.20].map(cost => (
                <button
                  key={cost}
                  onClick={() => setElectricityCost(cost)}
                  className={`px-2 py-1 text-xs rounded ${
                    electricityCost === cost ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ${cost}
                </button>
              ))}
            </div>
          </div>

          {/* Pool Fee */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Pool Fee (%)</label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={poolFee}
              onChange={(e) => setPoolFee(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* Hardware Summary */}
          <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Hashrate</span>
              <span className="text-green-400 font-medium">{totalHashrate.toLocaleString()} {gpuSpecs.unit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Power</span>
              <span className="text-yellow-400 font-medium">{totalPower}W</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Efficiency</span>
              <span className="text-blue-400 font-medium">
                {(totalHashrate / totalPower).toFixed(2)} {gpuSpecs.unit}/W
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Daily Profit */}
          <div className={`rounded-xl p-6 border ${
            dailyProfit >= 0
              ? 'bg-green-900/20 border-green-800'
              : 'bg-red-900/20 border-red-800'
          }`}>
            <div className="text-sm text-gray-400 mb-1">Daily Profit</div>
            <div className={`text-3xl font-bold ${dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${dailyProfit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Revenue: ${dailyRevenue.toFixed(2)} - Electricity: ${dailyElectricity.toFixed(2)}
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
            <h4 className="font-semibold text-white text-sm">Earnings Breakdown</h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coins/Day</span>
                <span className="text-white">{dailyCoins.toFixed(6)} {pool.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue/Day</span>
                <span className="text-green-400">${dailyRevenue.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Electricity/Day</span>
                <span className="text-red-400">-${dailyElectricity.toFixed(4)}</span>
              </div>
              <hr className="border-gray-700" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-300">Net Profit/Day</span>
                <span className={dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${dailyProfit.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Projections */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h4 className="font-semibold text-white text-sm mb-3">Projections</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-400">Weekly</div>
                <div className={`text-sm font-bold ${dailyProfit * 7 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(dailyProfit * 7).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Monthly</div>
                <div className={`text-sm font-bold ${monthlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${monthlyProfit.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Yearly</div>
                <div className={`text-sm font-bold ${yearlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${yearlyProfit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Market Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h4 className="font-semibold text-white text-sm mb-3">Market Data (Live)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{pool.symbol} Price</span>
                <span className="text-white">${coinPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network HR</span>
                <span className="text-white">{stats?.networkHashrate ? formatHashrate(stats.networkHashrate) : 'Loading...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Block Reward</span>
                <span className="text-white">{blockReward} {pool.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Block Time</span>
                <span className="text-white">{blockTime}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
        <p className="text-yellow-300/80 text-xs">
          <i className="fas fa-info-circle mr-1"></i>
          <strong>Disclaimer:</strong> Estimates are based on current network difficulty and coin price. 
          Actual earnings may vary due to difficulty changes, price fluctuations, pool luck, and hardware performance. 
          This is not financial advice.
        </p>
      </div>
    </div>
  )
}
