import { useState, useEffect } from 'react'
import { POOLS } from '../App'
import { fetchAllPrices, COINGECKO_IDS } from '../utils/api'

export default function PriceTicker() {
  const [prices, setPrices] = useState<any>(null)

  useEffect(() => {
    const loadPrices = async () => {
      const data = await fetchAllPrices()
      setPrices(data)
    }
    loadPrices()
    const interval = setInterval(loadPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!prices) return null

  return (
    <div className="bg-gray-800/30 border-b border-gray-800 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap py-2">
        {[...POOLS, ...POOLS].map((pool, i) => {
          const coinId = COINGECKO_IDS[pool.symbol]
          const price = prices?.[coinId]?.usd || 0
          const change = prices?.[coinId]?.usd_24h_change || 0
          const volume = prices?.[coinId]?.usd_24h_vol || 0
          const marketCap = prices?.[coinId]?.usd_market_cap || 0

          return (
            <div key={`${pool.id}-${i}`} className="inline-flex items-center gap-2 px-4 border-r border-gray-700/50">
              <span className="text-sm">{pool.icon}</span>
              <span className="text-xs font-semibold text-white">{pool.symbol}</span>
              <span className="text-xs text-gray-300">${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
              <span className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? '▲' : '▼'}{Math.abs(change).toFixed(1)}%
              </span>
              {volume > 0 && (
                <span className="text-xs text-gray-500">
                  Vol: ${(volume / 1e6).toFixed(1)}M
                </span>
              )}
              {marketCap > 0 && (
                <span className="text-xs text-gray-500">
                  MC: ${(marketCap / 1e9).toFixed(2)}B
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
