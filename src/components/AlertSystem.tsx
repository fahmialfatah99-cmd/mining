import { useState, useEffect, useCallback } from 'react'
import { POOLS } from '../App'
import { fetchPoolStats, fetchAllPrices, COINGECKO_IDS, formatHashrate } from '../utils/api'

interface Alert {
  id: string
  type: 'price' | 'hashrate' | 'block' | 'difficulty'
  poolId: string
  condition: string
  threshold: number
  triggered: boolean
  lastValue: number
  createdAt: number
}

export default function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem('cryptomine_alerts')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    type: 'price',
    poolId: POOLS[0].id,
    condition: 'above',
    threshold: 0,
  })
  const [notifications, setNotifications] = useState<string[]>([])
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    localStorage.setItem('cryptomine_alerts', JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermissionGranted(true)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPermissionGranted(permission === 'granted')
    }
  }

  const addAlert = () => {
    if (!newAlert.threshold || newAlert.threshold <= 0) return
    const alert: Alert = {
      id: Date.now().toString(),
      type: newAlert.type as Alert['type'],
      poolId: newAlert.poolId || POOLS[0].id,
      condition: newAlert.condition || 'above',
      threshold: newAlert.threshold,
      triggered: false,
      lastValue: 0,
      createdAt: Date.now(),
    }
    setAlerts(prev => [...prev, alert])
    setNewAlert({ type: 'price', poolId: POOLS[0].id, condition: 'above', threshold: 0 })
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const checkAlerts = useCallback(async () => {
    if (alerts.length === 0) return

    const prices = await fetchAllPrices()
    const triggeredAlerts: string[] = []

    for (const alert of alerts) {
      const pool = POOLS.find(p => p.id === alert.poolId)
      if (!pool) continue

      let currentValue = 0
      const coinId = COINGECKO_IDS[pool.symbol]

      switch (alert.type) {
        case 'price':
          currentValue = prices?.[coinId]?.usd || 0
          break
        case 'hashrate':
        case 'block':
        case 'difficulty': {
          const stats = await fetchPoolStats(pool)
          if (!stats) continue
          if (alert.type === 'hashrate') currentValue = stats.hashrate || 0
          else if (alert.type === 'block') currentValue = stats.blocksTotal || 0
          else currentValue = stats.networkDifficulty || 0
          break
        }
      }

      const wasTriggered = alert.condition === 'above'
        ? currentValue >= alert.threshold
        : currentValue <= alert.threshold

      if (wasTriggered && !alert.triggered) {
        triggeredAlerts.push(`${pool.symbol} ${alert.type} is ${alert.condition} ${alert.threshold} (current: ${currentValue})`)
      }

      setAlerts(prev => prev.map(a =>
        a.id === alert.id ? { ...a, lastValue: currentValue, triggered: wasTriggered } : a
      ))
    }

    if (triggeredAlerts.length > 0) {
      setNotifications(prev => [...triggeredAlerts, ...prev].slice(0, 20))

      // Browser notification
      if (permissionGranted) {
        new Notification('⛏️ CryptoMine Alert', {
          body: triggeredAlerts.join('\n'),
          icon: '⛏',
        })
      }
    }
  }, [alerts, permissionGranted])

  useEffect(() => {
    checkAlerts()
    const interval = setInterval(checkAlerts, 30000)
    return () => clearInterval(interval)
  }, [checkAlerts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fas fa-bell text-yellow-400"></i>
            Alert System
          </h3>
          {!permissionGranted && (
            <button
              onClick={requestPermission}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              <i className="fas fa-bell mr-1"></i> Enable Notifications
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400">
          Set alerts for price changes, hashrate drops, new blocks, and difficulty changes. Get notified via browser notifications.
        </p>
      </div>

      {/* Create Alert */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="font-semibold text-white mb-4">Create New Alert</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={newAlert.type}
            onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
          >
            <option value="price">💰 Price</option>
            <option value="hashrate">⚡ Hashrate</option>
            <option value="block">🧱 New Block</option>
            <option value="difficulty">📊 Difficulty</option>
          </select>

          <select
            value={newAlert.poolId}
            onChange={(e) => setNewAlert(prev => ({ ...prev, poolId: e.target.value }))}
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
          >
            {POOLS.map(p => (
              <option key={p.id} value={p.id}>{p.icon} {p.symbol}</option>
            ))}
          </select>

          <select
            value={newAlert.condition}
            onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value }))}
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>

          <input
            type="number"
            value={newAlert.threshold || ''}
            onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
            placeholder="Threshold value"
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
          />

          <button
            onClick={addAlert}
            disabled={!newAlert.threshold}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white text-sm"
          >
            <i className="fas fa-plus mr-1"></i> Create Alert
          </button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <i className="fas fa-list-check text-green-400"></i>
              Active Alerts ({alerts.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-700/50">
            {alerts.map(alert => {
              const pool = POOLS.find(p => p.id === alert.poolId)
              return (
                <div key={alert.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-700/20">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{pool?.icon}</span>
                    <div>
                      <div className="text-sm text-white font-medium">
                        {pool?.symbol} {alert.type} {alert.condition} {alert.threshold.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Current: {alert.lastValue.toLocaleString()} • 
                        Created: {new Date(alert.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      alert.triggered ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {alert.triggered ? '✓ Triggered' : 'Waiting'}
                    </span>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Notifications Log */}
      {notifications.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <i className="fas fa-history text-blue-400"></i>
              Notification History
            </h4>
            <button
              onClick={() => setNotifications([])}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-700/50">
            {notifications.map((notif, i) => (
              <div key={i} className="px-4 py-2 text-sm text-gray-300">
                <i className="fas fa-bell text-yellow-400 mr-2"></i>
                {notif}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
          <i className="fas fa-bell-slash text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400">No alerts configured</p>
          <p className="text-xs text-gray-500 mt-1">Create alerts to get notified about important events</p>
        </div>
      )}
    </div>
  )
}
