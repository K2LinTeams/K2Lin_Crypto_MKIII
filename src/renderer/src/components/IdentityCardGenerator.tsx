import { useRef, useEffect, useState } from 'react'
import { embed } from '../services/webStego'
import { generateIdentityId } from '../services/identity'
import { GlassButton } from './ui/GlassComponents'
import { Download, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OperatorTheme } from '../data/operators'

interface IdentityCardGeneratorProps {
  publicKey: string
  username?: string
  theme?: OperatorTheme
  onRegenerate: () => void
}

// Icon Paths (extracted from Lucide React)
const FACTION_ICONS: Record<string, string> = {
  // Shield (Shield)
  'Rhodes Island': "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  // FlaskConical
  'Rhine Lab': "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7",
  // Crown
  'Victoria': "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294zM5 21h14",
  // Package
  'Penguin Logistics': "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12M3.29 7 12 12 20.71 7m-4.5-2.73 9 5.15",
  // Anchor
  'Abyssal': "M12 6v16m7-9 2-1a9 9 0 0 1-18 0l2 1M9 11h6",
  // Mountain
  'Kjerag': "m8 3 4 8 5-5 5 15H2L8 3z",
  // Sword
  'Kazimierz': "m11 19-6-6m0 2-2-2m5-3-4 4M9.5 17.5 21 6V3h-3L6.5 14.5",
  // Flame
  'Yan': "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
}

export function IdentityCardGenerator({ publicKey, username = 'AGENT', theme = 'Rhodes Island', onRegenerate }: IdentityCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { t } = useTranslation('identity')

  const generateCard = async () => {
    setIsGenerating(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ensure font is loaded
    try {
      await document.fonts.load('bold 48px "Comfortaa"')
      await document.fonts.load('16px "Comfortaa"')
    } catch (e) {
      console.warn('Font loading failed, falling back', e)
    }

    // 1. Draw Visuals
    const width = 600
    const height = 350
    canvas.width = width
    canvas.height = height

    // Define Themes
    const themes = {
      'Rhodes Island': {
        bg: ['#1e293b', '#0f172a'], // slate-800 to slate-900 (Dark Blue)
        textPrimary: '#e2e8f0', // slate-200
        textSecondary: '#94a3b8', // slate-400
        logoStart: '#00f2ff',
        logoEnd: '#3b82f6',
        iconColor: ['#3b82f6', '#1d4ed8']
      },
      'Rhine Lab': {
        bg: ['#ffffff', '#ecfccb'], // White to lime-100
        textPrimary: '#1a2e05', // heavy green/black
        textSecondary: '#65a30d', // lime-600
        logoStart: '#f97316', // orange
        logoEnd: '#84cc16', // lime
        iconColor: ['#84cc16', '#3f6212'] // lime-500 to lime-800
      },
      'Victoria': {
        bg: ['#450a0a', '#7f1d1d'], // red-950 to red-900
        textPrimary: '#fef3c7', // amber-100
        textSecondary: '#d97706', // amber-600
        logoStart: '#fbbf24', // amber
        logoEnd: '#ef4444', // red
        iconColor: ['#fbbf24', '#b45309'] // amber-400 to amber-700
      },
      'Penguin Logistics': {
        bg: ['#2e1065', '#581c87'], // violet-950 to purple-900
        textPrimary: '#f3e8ff', // purple-100
        textSecondary: '#c084fc', // purple-400
        logoStart: '#ffffff',
        logoEnd: '#d8b4fe',
        iconColor: ['#d8b4fe', '#7e22ce'] // purple-300 to purple-700
      },
      'Abyssal': {
        bg: ['#020617', '#172554'], // slate-950 to blue-950
        textPrimary: '#f1f5f9', // slate-100
        textSecondary: '#ef4444', // red-500
        logoStart: '#ef4444',
        logoEnd: '#1e40af',
        iconColor: ['#ef4444', '#991b1b'] // red-500 to red-800
      },
      'Kjerag': {
        bg: ['#f8fafc', '#cbd5e1'], // slate-50 to slate-300
        textPrimary: '#1e293b', // slate-800
        textSecondary: '#64748b', // slate-500
        logoStart: '#94a3b8',
        logoEnd: '#bae6fd',
        iconColor: ['#bae6fd', '#0ea5e9'] // sky-200 to sky-500
      },
      'Kazimierz': {
        bg: ['#1c1917', '#451a03'], // dark with amber tint
        textPrimary: '#fcd34d', // amber-300
        textSecondary: '#fbbf24', // amber-400
        logoStart: '#fbbf24',
        logoEnd: '#f59e0b',
        iconColor: ['#fbbf24', '#d97706'] // amber-400 to amber-600
      },
      'Yan': {
        bg: ['#2c1a1d', '#500724'], // Dark Red/Brown
        textPrimary: '#fecdd3', // rose-200
        textSecondary: '#fb7185', // rose-400
        logoStart: '#fb7185',
        logoEnd: '#e11d48',
        iconColor: ['#fb7185', '#be123c'] // rose-400 to rose-700
      }
    }

    const activeTheme = themes[theme] || themes['Rhodes Island']

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, activeTheme.bg[0])
    gradient.addColorStop(1, activeTheme.bg[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // --- Faction Icon Watermark ---
    const iconPathData = FACTION_ICONS[theme] || FACTION_ICONS['Rhodes Island']
    if (iconPathData) {
      ctx.save()

      // Position bottom-right, large
      // Original Lucide icons are 24x24
      // We want it to be ~250px
      const scale = 12
      ctx.translate(width - 40, height + 40) // Bottom right corner
      ctx.scale(scale, scale)
      ctx.rotate(-25 * Math.PI / 180) // Rotate -25 deg
      ctx.translate(-24, -24) // Center anchor

      const iconGradient = ctx.createLinearGradient(0, 0, 24, 24)
      // Use theme icon colors or default white fade
      if (activeTheme.iconColor) {
          iconGradient.addColorStop(0, activeTheme.iconColor[0])
          iconGradient.addColorStop(1, activeTheme.iconColor[1])
      } else {
          iconGradient.addColorStop(0, '#ffffff')
          iconGradient.addColorStop(1, '#cccccc')
      }

      ctx.fillStyle = iconGradient
      // Low opacity for watermark effect
      ctx.globalAlpha = 0.15

      const path = new Path2D(iconPathData)
      ctx.fill(path)

      ctx.restore()
    }
    // ------------------------------

    // Header: CRYPTO 3 Logo (Gradient Text)
    const logoGradient = ctx.createLinearGradient(40, 30, 200, 30)
    logoGradient.addColorStop(0, activeTheme.logoStart)
    logoGradient.addColorStop(1, activeTheme.logoEnd)

    ctx.font = 'bold 24px "Comfortaa", "Inter", sans-serif'
    ctx.fillStyle = logoGradient
    ctx.textAlign = 'left'
    ctx.fillText('CRYPTO 3', 40, 50)

    // Name
    ctx.fillStyle = activeTheme.textPrimary
    ctx.font = 'bold 48px "Comfortaa", "Inter", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(username.toUpperCase(), 40, 140)

    // ID / Key Label
    ctx.fillStyle = activeTheme.textSecondary
    ctx.font = '16px "Comfortaa", "Inter", sans-serif'
    ctx.fillText('ID (12 DIGIT / X25519)', 40, 260)

    // ID Value (Generated 12-digit code)
    const identityId = await generateIdentityId(publicKey)

    ctx.fillStyle = activeTheme.textPrimary
    ctx.font = '32px "Comfortaa", "Courier New", monospace'
    ctx.fillText(identityId, 40, 300)

    // 2. Embed Data (Steganography)
    try {
      // Get raw image buffer from the visual canvas
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Failed to create blob')

      const imageBuffer = await blob.arrayBuffer()

      // New Payload: Standard Wrapped JSON Object
      const payloadObj = {
        c3_type: 'identity',
        payload: {
          name: username,
          publicKey: publicKey
        }
      }

      const payload = JSON.stringify(payloadObj)
      const dataBuffer = new TextEncoder().encode(payload).buffer

      // Embed logic returns a Uint8Array representing the NEW PNG with data
      const pngData = await embed(imageBuffer, dataBuffer)

      // Create Download URL from the STEGO image
      const finalBlob = new Blob([pngData as unknown as ArrayBuffer], { type: 'image/png' })
      const url = URL.createObjectURL(finalBlob)
      setDownloadUrl(url)
    } catch (e) {
      console.error('Failed to generate card:', e)
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate on mount or when inputs change
  useEffect(() => {
    if (publicKey) {
      generateCard()
    }
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, username, theme])

  return (
    <div className="flex flex-col gap-4 items-center">
      {/*
          We hide the canvas because it only contains the visual data.
          We show the IMG which contains the STEGO data (via downloadUrl).
          This ensures "Right Click -> Save" gets the correct file.
          We keep canvas for generation logic but hide it visually if we have a result.
      */}
      <div className="relative group rounded-xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          className={`w-full h-auto max-w-[400px] ${downloadUrl ? 'hidden' : 'block'}`}
          style={{ width: '100%', height: 'auto' }}
        />
        {downloadUrl && (
           <img
             src={downloadUrl}
             alt="Digital Identity Card"
             className="w-full h-auto max-w-[400px] object-contain block"
           />
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm">
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
          {t('regenerate')}
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
            {t('download')}
          </GlassButton>
        )}
      </div>
    </div>
  )
}
