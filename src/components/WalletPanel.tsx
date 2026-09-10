import { MiningState } from '../App'

interface Props {
  state: MiningState
}

const cryptoPrices: Record<string, { price: number; change: number }> = {
  BTC: { price: 67542.30, change: 2.4 },
  ETH: { price: 3456.78, change: -0.8 },
  LTC: { price: 85.42, change: 1.2 },
  XMR: { price: 165.20, change: 3.1 },
}

export default function WalletPanel({ state }: Props) {
  const crypto = cryptoPrices[state.selectedCrypto] || cryptoPrices.BTC
  const earningsUSD = state.earnings * crypto.price
  const dailyEstimate = state.isMining ? (state.earnings / Math.max(1, state.shares)) * 144 * crypto.price : 0

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
        <i className="fas fa-wallet text-yellow-400"></i>
        Wallet & Earnings
      </h3>

      {/* Wallet Address */}
      <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
        <div className="text-xs text-gray-400 mb-1">Wallet Address</div>
        <div className="text-sm font-mono text-gray-300 truncate">
          0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        </div>
      </div>

      {/* Balance */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Balance</span>
          <span className="text-white font-semibold">{state.earnings.toFixed(6)} {state.selectedCrypto}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">USD Value</span>
          <span className="text-green-400 font-semibold">${earningsUSD.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Daily Estimate</span>
          <span className="text-blue-400 font-semibold">${dailyEstimate.toFixed(4)}/day</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Current Price</span>
          <span className={`font-semibold ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${crypto.price.toLocaleString()} ({crypto.change >= 0 ? '+' : ''}{crypto.change}%)
          </span>
        </div>
      </div>

      {/* Mining Efficiency */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Mining Efficiency</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                state.temperature > 75 ? 'bg-red-500' : state.temperature > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (state.hashRate / 150) * 100)}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-400">
            {state.isMining ? `${((state.hashRate / state.power) * 1000).toFixed(1)} KH/W` : '0 KH/W'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">Uptime</div>
          <div className="text-sm font-semibold text-white">
            {state.isMining ? `${Math.floor(state.shares / 60)}h ${state.shares % 60}m` : '0h 0m'}
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">Acceptance</div>
          <div className="text-sm font-semibold text-green-400">
            {state.shares > 0 ? `${Math.min(99.9, 95 + Math.random() * 4.9).toFixed(1)}%` : '0%'}
          </div>
        </div>
      </div>
    </div>
  )
}
