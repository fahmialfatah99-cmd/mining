import { PoolConfig } from '../App'

// 2Miners API endpoints
export async function fetchPoolStats(pool: PoolConfig) {
  try {
    const res = await fetch(`${pool.apiBase}/stats`)
    if (!res.ok) throw new Error('Failed to fetch pool stats')
    return await res.json()
  } catch (err) {
    console.error('Pool stats error:', err)
    return null
  }
}

export async function fetchAccountInfo(pool: PoolConfig, wallet: string) {
  try {
    const res = await fetch(`${pool.apiBase}/accounts/${wallet}`)
    if (!res.ok) throw new Error('Failed to fetch account')
    return await res.json()
  } catch (err) {
    console.error('Account error:', err)
    return null
  }
}

export async function fetchBlocks(pool: PoolConfig, limit = 20) {
  try {
    const res = await fetch(`${pool.apiBase}/blocks?limit=${limit}`)
    if (!res.ok) throw new Error('Failed to fetch blocks')
    return await res.json()
  } catch (err) {
    console.error('Blocks error:', err)
    return null
  }
}

export async function fetchPayments(pool: PoolConfig, limit = 20) {
  try {
    const res = await fetch(`${pool.apiBase}/payments?limit=${limit}`)
    if (!res.ok) throw new Error('Failed to fetch payments')
    return await res.json()
  } catch (err) {
    console.error('Payments error:', err)
    return null
  }
}

export async function fetchMiners(pool: PoolConfig) {
  try {
    const res = await fetch(`${pool.apiBase}/miners`)
    if (!res.ok) throw new Error('Failed to fetch miners')
    return await res.json()
  } catch (err) {
    console.error('Miners error:', err)
    return null
  }
}

// CoinGecko API for prices (free, no key needed)
export async function fetchCoinPrice(coinId: string) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
    )
    if (!res.ok) throw new Error('Failed to fetch price')
    return await res.json()
  } catch (err) {
    console.error('Price error:', err)
    return null
  }
}

// Map pool coins to CoinGecko IDs
export const COINGECKO_IDS: Record<string, string> = {
  KAS: 'kaspa',
  ETC: 'ethereum-classic',
  ERG: 'ergo',
  ZEC: 'zcash',
  XMR: 'monero',
  RVN: 'ravencoin',
  ETHW: 'ethereum-pow-iou',
  BCH: 'bitcoin-cash',
}

// Format hashrate
export function formatHashrate(hashrate: number): string {
  if (hashrate === 0) return '0 H/s'
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s']
  const i = Math.floor(Math.log(hashrate) / Math.log(1000))
  const value = hashrate / Math.pow(1000, i)
  return `${value.toFixed(2)} ${units[i] || units[units.length - 1]}`
}

// Format number
export function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toFixed(2)
}

// Format coin amount
export function formatCoinAmount(amount: number, symbol: string): string {
  if (amount >= 1) return `${amount.toFixed(4)} ${symbol}`
  return `${amount.toFixed(8)} ${symbol}`
}

// Time ago
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Fetch account shares statistics
export async function fetchAccountShares(pool: PoolConfig, wallet: string, range: string = '6h') {
  try {
    const res = await fetch(`${pool.apiBase}/accounts/${wallet}/shares/${range}`)
    if (!res.ok) throw new Error('Failed to fetch shares')
    return await res.json()
  } catch (err) {
    console.error('Shares error:', err)
    return null
  }
}

// Fetch account rewards
export async function fetchAccountRewards(pool: PoolConfig, wallet: string) {
  try {
    const res = await fetch(`${pool.apiBase}/accounts/${wallet}/rewards`)
    if (!res.ok) throw new Error('Failed to fetch rewards')
    return await res.json()
  } catch (err) {
    console.error('Rewards error:', err)
    return null
  }
}

// Fetch account payments
export async function fetchAccountPayments(pool: PoolConfig, wallet: string) {
  try {
    const res = await fetch(`${pool.apiBase}/accounts/${wallet}/payments`)
    if (!res.ok) throw new Error('Failed to fetch payments')
    return await res.json()
  } catch (err) {
    console.error('Payments error:', err)
    return null
  }
}

// Fetch worker hashrate history
export async function fetchWorkerHashrate(pool: PoolConfig, wallet: string, worker: string, range: string = '6h') {
  try {
    const res = await fetch(`${pool.apiBase}/workers/${wallet}/${worker}/${range}`)
    if (!res.ok) throw new Error('Failed to fetch worker hashrate')
    return await res.json()
  } catch (err) {
    console.error('Worker hashrate error:', err)
    return null
  }
}

// Fetch all coin prices at once
export async function fetchAllPrices() {
  try {
    const ids = Object.values(COINGECKO_IDS).join(',')
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    )
    if (!res.ok) throw new Error('Failed to fetch prices')
    return await res.json()
  } catch (err) {
    console.error('All prices error:', err)
    return null
  }
}

// Export data to CSV
export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// LocalStorage helpers
export function saveWallets(wallets: { address: string; poolId: string; label: string }[]) {
  localStorage.setItem('cryptomine_wallets', JSON.stringify(wallets))
}

export function loadWallets(): { address: string; poolId: string; label: string }[] {
  try {
    const data = localStorage.getItem('cryptomine_wallets')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Calculate profitability score for auto-switch
export function calculateProfitability(
  hashrate: number,
  power: number,
  networkHashrate: number,
  blockReward: number,
  blockTime: number,
  coinPrice: number,
  poolFee: number,
  electricityCost: number
): { dailyRevenue: number; dailyCost: number; dailyProfit: number; score: number } {
  const blocksPerDay = 86400 / blockTime
  const dailyCoins = networkHashrate > 0
    ? (hashrate / networkHashrate) * blocksPerDay * blockReward * (1 - poolFee / 100)
    : 0
  const dailyRevenue = dailyCoins * coinPrice
  const dailyCost = (power / 1000) * 24 * electricityCost
  const dailyProfit = dailyRevenue - dailyCost
  const score = dailyCost > 0 ? dailyProfit / dailyCost : dailyProfit > 0 ? 999 : 0

  return { dailyRevenue, dailyCost, dailyProfit, score }
}
