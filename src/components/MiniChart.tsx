import { useEffect, useRef } from 'react'

interface Props {
  data: { timestamp: number; value: number }[]
  color?: string
  label?: string
  unit?: string
  height?: number
}

export default function MiniChart({ data, color = '#3b82f6', label = '', unit = '', height = 120 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    ctx.clearRect(0, 0, w, h)

    const values = data.map(d => d.value)
    const max = Math.max(...values) * 1.1
    const min = Math.min(...values) * 0.9
    const range = max - min || 1

    // Grid lines
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.2)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, color + '40')
    gradient.addColorStop(1, color + '00')

    ctx.beginPath()
    ctx.moveTo(0, h)
    data.forEach((d, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((d.value - min) / range) * h * 0.85 - h * 0.05
      ctx.lineTo(x, y)
    })
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Line
    ctx.beginPath()
    data.forEach((d, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((d.value - min) / range) * h * 0.85 - h * 0.05
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // Current value dot
    const lastD = data[data.length - 1]
    const lastX = w
    const lastY = h - ((lastD.value - min) / range) * h * 0.85 - h * 0.05
    ctx.beginPath()
    ctx.arc(lastX - 3, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }, [data, color])

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-gray-500 text-xs">No data available</span>
      </div>
    )
  }

  const current = data[data.length - 1]?.value || 0
  const avg = data.reduce((s, d) => s + d.value, 0) / data.length

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">{label}</span>
          <span className="text-xs text-gray-500">
            Current: <span className="text-white font-medium">{current.toLocaleString()} {unit}</span>
            {' • '}Avg: <span className="text-gray-300">{avg.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unit}</span>
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg"
        style={{ height: `${height}px` }}
      />
    </div>
  )
}
