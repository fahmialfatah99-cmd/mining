import { useState } from 'react'
import { PoolConfig } from '../App'
import { fetchAccountInfo, fetchCoinPrice, COINGECKO_IDS, formatHashrate, formatNumber, timeAgo } from '../utils/api'

interface Props {
  pool: PoolConfig
}

export default function WalletLookup({ pool }: Props) {
  const [wallet, setWallet] = useState('')
  const [accountData, setAccountData] = useState<any>(null)
  const [price, setPrice] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookupWallet = async () => {
    if (!wallet.trim()) return
    setLoading(true)
    setError(null)
    setAccountData(null)

    try {
      const [account, priceData] = await Promise.all([
        fetchAccountInfo(pool, wallet.trim()),
        fetchCoinPrice(COINGECKO_IDS[pool.symbol] || ''),
      ])

      if (!account || account.error) {
        setError('Wallet not found on this pool. Make sure the address is correct and has mined on this pool.')
      } else {
        setAccountData(account)
        setPrice(priceData)
      }
    } catch (err) {
      setError('Failed to fetch wallet data. Please try again.')
    }
    setLoading(false)
  }

  const coinPrice = price?.[COINGECKO_IDS[pool.symbol]]?.usd || 0

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-search text-yellow-400"></i>
          Lookup Miner Wallet
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Enter your wallet address to view real-time mining statistics from the {pool.name} pool.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookupWallet()}
            placeholder={`Enter ${pool.symbol} wallet address...`}
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 font-mono text-sm"
          />
          <button
            onClick={lookupWallet}
            disabled={loading || !wallet.trim()}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all"
          >
            {loading ? (
              <i className="fas fa-spinner animate-spin"></i>
            ) : (
              <><i className="fas fa-search mr-2"></i>Lookup</>
            )}
          </button>
        </div>

        {/* Example addresses */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Try example:</span>
          {pool.symbol === 'KAS' && (
            <button onClick={() => setWallet('kaspa:qz0zl4flq3kxwq7hh08zjm4fkmj0h4gq5k5zq5z5z5z5z5z5z5z5z5z5z5z5z')} className="text-xs text-blue-400 hover:text-blue-300 font-mono">
              kaspa:qz0zl4f...
            </button>
          )}
          {pool.symbol === 'XMR' && (
            <button onClick={() => setWallet('44AFFq5kSiGBoZ4NMDwYtN18BcibAJKPVkFZqgqBnMfKZdVxMnRpjJmRwXQrjBcBzKQmN5rQZqB5')} className="text-xs text-blue-400 hover:text-blue-300 font-mono">
              44AFFq5k...
            </button>
          )}
          {pool.symbol === 'ETC' && (
            <button onClick={() => setWallet('0x4f1a5cfbf397b1e67b64ad825d2b64ad82b64ad8')} className="text-xs text-blue-400 hover:text-blue-300 font-mono">
              0x4f1a5c...
            </button>
          )}
          {pool.symbol === 'ERG' && (
            <button onClick={() => setWallet('9f4QF8AD1nQ3nJahQVkMj8hFSVVzVom77b52JU7EW71Zexg6N8v')} className="text-xs text-blue-400 hover:text-blue-300 font-mono">
              9f4QF8...
            </button>
          )}
          {pool.symbol === 'ZEC' && (
            <button onClick={() => setWallet('t1V9h2P9n4sY8B3mK5jL7rN0qW2xR6vT8cZ')} className="text-xs text-blue-400 hover:text-blue-300 font-mono">
              t1V9h2...
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center gap-3">
          <i className="fas fa-exclamation-circle text-red-400"></i>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Account Data */}
      {accountData && (
        <div className="space-y-4">
          {/* Wallet Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <i className="fas fa-wallet text-yellow-400"></i>
                Miner Statistics
              </h3>
              <span className="text-xs text-gray-500">Pool: 2Miners {pool.symbol}</span>
            </div>

            <div className="font-mono text-xs text-gray-400 bg-gray-900/50 rounded-lg p-2 mb-4 break-all">
              {wallet}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Current Hashrate</div>
                <div className="text-lg font-bold text-green-400">
                  {accountData.currentHashrate ? formatHashrate(accountData.currentHashrate) : '0 H/s'}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Average Hashrate</div>
                <div className="text-lg font-bold text-blue-400">
                  {accountData.hashrate ? formatHashrate(accountData.hashrate) : '0 H/s'}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Pending Balance</div>
                <div className="text-lg font-bold text-yellow-400">
                  {accountData.balance ? (accountData.balance / 1e8).toFixed(6) : '0'} {pool.symbol}
                </div>
                {coinPrice > 0 && accountData.balance && (
                  <div className="text-xs text-gray-500">≈ ${((accountData.balance / 1e8) * coinPrice).toFixed(4)}</div>
                )}
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Total Paid</div>
                <div className="text-lg font-bold text-purple-400">
                  {accountData.paid ? (accountData.paid / 1e8).toFixed(6) : '0'} {pool.symbol}
                </div>
                {coinPrice > 0 && accountData.paid && (
                  <div className="text-xs text-gray-500">≈ ${((accountData.paid / 1e8) * coinPrice).toFixed(4)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Mining Activity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Shares Submitted</span>
                  <span className="text-white font-medium">{accountData.shares ? formatNumber(accountData.shares) : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Stale Shares</span>
                  <span className="text-white font-medium">{accountData.stales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Invalid Shares</span>
                  <span className="text-white font-medium">{accountData.invalid || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Workers Online</span>
                  <span className="text-green-400 font-medium">{accountData.workers?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Earnings</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Last Share</span>
                  <span className="text-white font-medium">{accountData.lastShare ? timeAgo(accountData.lastShare) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Payments</span>
                  <span className="text-white font-medium">{accountData.paymentsTotal || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Donation</span>
                  <span className="text-white font-medium">{accountData.donate ? `${accountData.donate}%` : '0%'}</span>
                </div>
                {coinPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total Value</span>
                    <span className="text-green-400 font-medium">
                      ${(((accountData.paid || 0) + (accountData.balance || 0)) / 1e8 * coinPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workers */}
          {accountData.workers && Object.keys(accountData.workers).length > 0 && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-microchip text-cyan-400"></i>
                  Workers ({Object.keys(accountData.workers).length})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/80">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-400 font-medium">Worker Name</th>
                      <th className="px-4 py-2 text-left text-gray-400 font-medium">Current HR</th>
                      <th className="px-4 py-2 text-left text-gray-400 font-medium">Avg HR</th>
                      <th className="px-4 py-2 text-left text-gray-400 font-medium">Last Share</th>
                      <th className="px-4 py-2 text-left text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(accountData.workers).map(([name, worker]: [string, any]) => (
                      <tr key={name} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                        <td className="px-4 py-2 font-mono text-white">{name}</td>
                        <td className="px-4 py-2 text-green-400">{worker.ch ? formatHashrate(worker.ch) : '0 H/s'}</td>
                        <td className="px-4 py-2 text-blue-400">{worker.h ? formatHashrate(worker.h) : '0 H/s'}</td>
                        <td className="px-4 py-2 text-gray-300">{worker.lastBeat ? timeAgo(worker.lastBeat) : 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            worker.offline ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {worker.offline ? 'Offline' : 'Online'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!accountData && !error && !loading && (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-wallet text-4xl mb-4 text-gray-600"></i>
          <p>Enter a wallet address above to view mining statistics</p>
          <p className="text-xs mt-2">Data fetched live from 2Miners API</p>
        </div>
      )}
    </div>
  )
}
