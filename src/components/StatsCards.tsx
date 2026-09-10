import { MiningState } from '../App'

interface Props {
  state: MiningState
}

const cryptoInfo: Record<string, { name: string; icon: string; color: string; price: number }> = {
  BTC: { name: 'Bitcoin', icon: '₿', color: 'from-orange-400 to-yellow-500', price: 67500 },
  ETH: { name: 'Ethereum', icon: 'Ξ', color: 'from-blue-400 to-purple-500', price: 3450 },
  LTC: { name: 'Litecoin', icon: 'Ł', color: 'from-gray-300 to-gray-500', price: 85 },
  XMR: { name: 'Monero', icon: 'ɱ', color: 'from-orange-500 to-red-600', price: 165 },
}

export default function StatsCards({ state }: Props) {
  const crypto = cryptoInfo[state.selectedCrypto] || cryptoInfo.BTC
  const earningsUSD = state.earnings * crypto.price

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Hash Rate */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Hash Rate</span>
          <i className="fas fa-microchip text-blue-400"></i>
        </div>
        <div className="text-2xl font-bold text-white">
          {state.hashRate.toFixed(1)} <span className="text-sm text-gray-400">MH/s</span>
        </div>
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (state.hashRate / 150) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Earnings */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Earnings</span>
          <i className="fas fa-coins text-yellow-400"></i>
        </div>
        <div className="text-2xl font-bold text-white">
          {state.earnings.toFixed(6)} <span className="text-sm text-gray-400">{state.selectedCrypto}</span>
        </div>
        <div className="text-sm text-green-400 mt-1">≈ ${earningsUSD.toFixed(4)} USD</div>
      </div>

      {/* Shares & Blocks */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Shares / Blocks</span>
          <i className="fas fa-cubes text-purple-400"></i>
        </div>
        <div className="text-2xl font-bold text-white">
          {state.shares} <span className="text-sm text-gray-400">/ {state.blocksFound}</span>
        </div>
        <div className="text-sm text-purple-400 mt-1">Difficulty: {state.difficulty.toFixed(1)}</div>
      </div>

      {/* Temperature & Power */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Temp / Power</span>
          <i className="fas fa-thermometer-half text-red-400"></i>
        </div>
        <div className="text-2xl font-bold text-white">
          {state.temperature.toFixed(0)}°C
        </div>
        <div className="text-sm text-orange-400 mt-1">⚡ {state.power.toFixed(0)}W</div>
      </div>
    </div>
  )
}
