import { useRef, useEffect, useState } from 'react'
import { embed } from '../services/webStego'
import { generateIdentityId } from '../services/identity'
import { GlassButton } from './ui/GlassComponents'
import { Download, RefreshCcw } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OperatorTheme, OPERATORS } from '../data/operators'
import { renderToStaticMarkup } from 'react-dom/server'

interface IdentityCardGeneratorProps {
  publicKey: string
  username?: string
  theme?: OperatorTheme
  isCustomName?: boolean
  onRegenerate: () => void
}

export function IdentityCardGenerator({ publicKey, username = 'AGENT', theme = 'Rhodes Island', isCustomName = false, onRegenerate }: IdentityCardGeneratorProps) {
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
    // We define a more flexible type locally to accommodate 'stripes'
    type ThemeConfig = {
      bg: string[]
      textPrimary: string
      textSecondary: string
      logoStart: string
      logoEnd: string
      stripes?: string[]
    }

    const themes: Record<string, ThemeConfig> = {
      'Rhodes Island': {
        bg: ['#1e293b', '#0f172a'], // slate-800 to slate-900 (Dark Blue)
        textPrimary: '#e2e8f0', // slate-200
        textSecondary: '#94a3b8', // slate-400
        logoStart: '#00f2ff',
        logoEnd: '#3b82f6'
      },
      'Rhine Lab': {
        bg: ['#ffffff', '#ecfccb'], // White to lime-100 (Clinical/Greenish)
        textPrimary: '#1a2e05', // heavy green/black
        textSecondary: '#65a30d', // lime-600
        logoStart: '#f97316', // orange
        logoEnd: '#84cc16' // lime
      },
      'Victoria': {
        bg: ['#450a0a', '#7f1d1d'], // red-950 to red-900
        textPrimary: '#fef3c7', // amber-100
        textSecondary: '#d97706', // amber-600
        logoStart: '#fbbf24', // amber
        logoEnd: '#ef4444' // red
      },
      'Penguin Logistics': {
        bg: ['#2e1065', '#581c87'], // violet-950 to purple-900
        textPrimary: '#f3e8ff', // purple-100
        textSecondary: '#c084fc', // purple-400
        logoStart: '#ffffff',
        logoEnd: '#d8b4fe'
      },
      'Abyssal': {
        bg: ['#020617', '#172554'], // slate-950 to blue-950
        textPrimary: '#f1f5f9', // slate-100
        textSecondary: '#ef4444', // red-500 (Blood/Eyes)
        logoStart: '#ef4444',
        logoEnd: '#1e40af'
      },
      'Kjerag': {
        bg: ['#f8fafc', '#cbd5e1'], // slate-50 to slate-300 (Snow)
        textPrimary: '#1e293b', // slate-800
        textSecondary: '#64748b', // slate-500
        logoStart: '#94a3b8',
        logoEnd: '#bae6fd'
      },
      'Kazimierz': {
        bg: ['#1c1917', '#451a03'], // dark with amber tint
        textPrimary: '#fcd34d', // amber-300
        textSecondary: '#fbbf24', // amber-400
        logoStart: '#fbbf24',
        logoEnd: '#f59e0b'
      },
      'Yan': {
        bg: ['#2c1a1d', '#500724'], // Dark Red/Brown
        textPrimary: '#fecdd3', // rose-200
        textSecondary: '#fb7185', // rose-400
        logoStart: '#fb7185',
        logoEnd: '#e11d48'
      },
      'sakura': {
        bg: ['#fbcfe8', '#f472b6'], // pink-200 to pink-400 (Soft Pink)
        textPrimary: '#831843', // pink-900 (Deep Pink text)
        textSecondary: '#be185d', // pink-700
        logoStart: '#db2777',
        logoEnd: '#ffffff'
      },
      'cyberpunk': {
        bg: ['#facc15', '#020617'], // yellow-400 to slate-950 (Cyberpunk High Contrast)
        textPrimary: '#fef08a', // yellow-200
        textSecondary: '#38bdf8', // sky-400 (Neon Blue)
        logoStart: '#ef4444', // red
        logoEnd: '#22d3ee' // cyan
      },
      'light': {
        bg: ['#f1f5f9', '#cbd5e1'], // slate-100 to slate-300
        textPrimary: '#0f172a', // slate-900
        textSecondary: '#64748b', // slate-500
        logoStart: '#334155',
        logoEnd: '#94a3b8'
      },
      'midnight': {
        bg: ['#0f172a', '#020617'], // slate-900 to slate-950
        textPrimary: '#e2e8f0', // slate-200
        textSecondary: '#64748b', // slate-500
        logoStart: '#3b82f6',
        logoEnd: '#6366f1'
      },
      'lone-trail': {
        bg: ['#0f1d18', '#162620'], // fallback for gradient logic if needed
        textPrimary: '#ffffff', // white
        textSecondary: '#ffffff', // white
        logoStart: '#ffffff',
        logoEnd: '#ffffff',
        stripes: ['#81c2ac', '#eea837', '#9c2c23']
      }
    }

    const activeTheme = themes[theme] || themes['Rhodes Island']

    // Background Gradient or Stripes
    if (theme === 'lone-trail' && activeTheme.stripes) {
      // Draw 3 vertical stripes
      const stripeWidth = width / 3

      // Stripe 1 (Green)
      ctx.fillStyle = activeTheme.stripes[0]
      ctx.fillRect(0, 0, stripeWidth, height)

      // Stripe 2 (Gold)
      ctx.fillStyle = activeTheme.stripes[1]
      ctx.fillRect(stripeWidth, 0, stripeWidth, height)

      // Stripe 3 (Red)
      ctx.fillStyle = activeTheme.stripes[2]
      ctx.fillRect(stripeWidth * 2, 0, stripeWidth, height)
    } else {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, activeTheme.bg[0])
      gradient.addColorStop(1, activeTheme.bg[1])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

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

    // --- WATERMARK ICON LOGIC ---
    try {
      let IconComponent = LucideIcons.Shield

      if (!isCustomName) {
        // Try to find the operator specific icon
        const operator = OPERATORS.find(op => op.name === username)
        if (operator && operator.icon && LucideIcons[operator.icon]) {
          IconComponent = LucideIcons[operator.icon]
        }
      } else {
        // Custom name - use theme specific icons
        if (theme === 'sakura' && LucideIcons['Flower2']) IconComponent = LucideIcons['Flower2']
        else if (theme === 'sakura' && LucideIcons['Flower']) IconComponent = LucideIcons['Flower']
        else if (theme === 'cyberpunk' && LucideIcons['Zap']) IconComponent = LucideIcons['Zap']
        else if (theme === 'light' && LucideIcons['Sun']) IconComponent = LucideIcons['Sun']
        else if (theme === 'midnight' && LucideIcons['Moon']) IconComponent = LucideIcons['Moon']
        else if (theme === 'lone-trail' && LucideIcons['Rocket']) IconComponent = LucideIcons['Rocket']
      }

      const svgString = renderToStaticMarkup(
        <IconComponent
          size={300}
          color={activeTheme.textSecondary}
          strokeWidth={1}
        />
      )

      // Need to URL encode the SVG string properly
      const img = new Image()
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      ctx.save()
      ctx.globalAlpha = 0.1 // Semi-transparent
      // Position bottom right, rotated
      // Shifted more towards center (width - 120, height - 70)
      ctx.translate(width - 120, height - 70)
      ctx.rotate(-15 * Math.PI / 180)
      // Draw centered at the translated point
      ctx.drawImage(img, -150, -150, 300, 300)
      ctx.restore()

      URL.revokeObjectURL(url)

    } catch (err) {
      console.warn('Failed to render watermark icon', err)
    }

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
  }, [publicKey, username, theme, isCustomName])

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
