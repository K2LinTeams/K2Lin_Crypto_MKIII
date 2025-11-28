import { useRef, useEffect, useState } from 'react'
import { embed } from '../services/webStego'
import { GlassButton } from './ui/GlassComponents'
import { Download, RefreshCcw } from 'lucide-react'

interface IdentityCardGeneratorProps {
  publicKey: string
  username?: string
  onRegenerate: () => void
}

export function IdentityCardGenerator({ publicKey, username = 'AGENT', onRegenerate }: IdentityCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateCard = async () => {
    setIsGenerating(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. Draw Visuals
    const width = 600
    const height = 350
    canvas.width = width
    canvas.height = height

    // Background - Dark Sci-Fi
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#020617')
    gradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Grid Overlay
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)'
    ctx.lineWidth = 1
    const gridSize = 30
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Border Frame
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, width - 40, height - 40)

    // Header Text
    ctx.fillStyle = '#06b6d4'
    ctx.font = 'bold 24px "Courier New", monospace'
    ctx.fillText('IDENTITY ACCESS CARD', 40, 60)

    // Username
    ctx.fillStyle = '#ecfeff'
    ctx.font = 'bold 40px "Courier New", monospace'
    ctx.fillText(username.toUpperCase(), 40, 120)

    // Label
    ctx.fillStyle = '#94a3b8'
    ctx.font = '16px "Courier New", monospace'
    ctx.fillText('CLEARANCE LEVEL: 5', 40, 150)
    ctx.fillText(`ID: ${publicKey.substring(30, 46)}...`, 40, 180)

    // Decorative Graphic (Chip)
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)'
    ctx.fillRect(width - 120, 40, 80, 60)
    ctx.strokeStyle = '#06b6d4'
    ctx.strokeRect(width - 120, 40, 80, 60)

    // 2. Embed Data (Steganography)
    try {
      // Get raw image buffer
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Failed to create blob')

      const imageBuffer = await blob.arrayBuffer()
      const dataBuffer = new TextEncoder().encode(publicKey).buffer // Fix: Get .buffer from Uint8Array

      // Embed
      const pngData = await embed(imageBuffer, dataBuffer)

      // Create Download URL
      // Fix TS2322: Explicitly cast to ArrayBuffer to satisfy BlobPart typing
      const finalBlob = new Blob([pngData as unknown as ArrayBuffer], { type: 'image/png' })
      const url = URL.createObjectURL(finalBlob)
      setDownloadUrl(url)
    } catch (e) {
      console.error('Failed to generate card:', e)
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate on mount or when key changes
  useEffect(() => {
    if (publicKey) {
      generateCard()
    }
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }, [publicKey, username])

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-accent-primary/20">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-w-[400px]"
          style={{ width: '100%', height: 'auto' }}
        />
        {isGenerating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <RefreshCcw className="animate-spin text-accent-primary" size={32} />
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full justify-center">
        <GlassButton
          variant="secondary"
          onClick={onRegenerate}
          icon={<RefreshCcw size={16} />}
        >
          Regenerate Keys
        </GlassButton>

        {downloadUrl && (
          <GlassButton
            variant="primary"
            onClick={() => {
              const a = document.createElement('a')
              a.href = downloadUrl
              a.download = `identity_${username}.png`
              a.click()
            }}
            icon={<Download size={16} />}
          >
            Download Card
          </GlassButton>
        )}
      </div>
    </div>
  )
}
