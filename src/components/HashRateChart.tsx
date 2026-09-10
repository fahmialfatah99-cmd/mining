import { useEffect, useRef } from 'react'

interface Props {
  history: number[]
  isMining: boolean
}

export default function HashRateChart({ history, isMining }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 5; i++) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    if (history.length < 2) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Start mining to see hash rate chart', width / 2, height / 2)
      return
    }

    const maxVal = Math.max(...history) * 1.2
    const minVal = Math.min(...history) * 0.8
    const range = maxVal - minVal || 1

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)')

    ctx.beginPath()
    ctx.moveTo(0, height)

    history.forEach((val, i) => {
      const x = (i / (history.length - 1)) * width
      const y = height - ((val - minVal) / range) * height * 0.8 - height * 0.1
      if (i === 0) ctx.lineTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line
    ctx.beginPath()
    history.forEach((val, i) => {
      const x = (i / (history.length - 1)) * width
      const y = height - ((val - minVal) / range) * height * 0.8 - height * 0.1
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = isMining ? '#3b82f6' : '#6b7280'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw current point
    if (history.length > 0) {
      const lastX = width
      const lastY = height - ((history[history.length - 1] - minVal) / range) * height * 0.8 - height * 0.1
      ctx.beginPath()
      ctx.arc(lastX - 2, lastY, 4, 0, Math.PI * 2)
      ctx.fillStyle = isMining ? '#3b82f6' : '#6b7280'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(lastX - 2, lastY, 7, 0, Math.PI * 2)
      ctx.strokeStyle = isMining ? 'rgba(59, 130, 246, 0.4)' : 'rgba(107, 114, 128, 0.4)'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }, [history, isMining])

  const avgHashRate = history.length > 0 ? (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1) : '0.0'
  const maxHashRate = history.length > 0 ? Math.max(...history).toFixed(1) : '0.0'
  const minHashRate = history.length > 0 ? Math.min(...history).toFixed(1) : '0.0'

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <i className="fas fa-chart-line text-blue-400"></i>
          Hash Rate Monitor
        </h3>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-400">Avg: <span className="text-blue-400 font-semibold">{avgHashRate} MH/s</span></span>
          <span className="text-gray-400">Max: <span className="text-green-400 font-semibold">{maxHashRate}</span></span>
          <span className="text-gray-400">Min: <span className="text-red-400 font-semibold">{minHashRate}</span></span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-lg"
        style={{ width: '100%', height: '192px' }}
      ></canvas>
    </div>
  )
}
