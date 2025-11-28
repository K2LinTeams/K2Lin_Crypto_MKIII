import { useRef, useEffect, useState } from 'react'
import { embed } from '../services/webStego'
import { generateIdentityId } from '../services/identity'
import { GlassButton } from './ui/GlassComponents'
import { Download, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface IdentityCardGeneratorProps {
  publicKey: string
  username?: string
  onRegenerate: () => void
}

export function IdentityCardGenerator({ publicKey, username = 'AGENT', onRegenerate }: IdentityCardGeneratorProps) {
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

    // Background - Flat, Minimalist, Gradient 135deg Light Blue to Light Pink
    // 135deg is Top-Left to Bottom-Right.
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#E0F2FE') // sky-100/200ish
    gradient.addColorStop(1, '#FCE7F3') // pink-100/200ish
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Text Styles - Dark for contrast on light background
    const textColorPrimary = '#334155' // slate-700
    const textColorSecondary = '#64748b' // slate-500

    // Header: CRYPTO 3 Logo (Gradient Text)
    const logoGradient = ctx.createLinearGradient(40, 30, 200, 30)
    logoGradient.addColorStop(0, '#00f2ff') // cyan (accent-primary approx)
    logoGradient.addColorStop(1, '#ff00ff') // magenta (accent-secondary approx)

    ctx.font = 'bold 24px "Comfortaa", "Inter", sans-serif'
    ctx.fillStyle = logoGradient
    ctx.textAlign = 'left'
    ctx.fillText('CRYPTO 3', 40, 50)

    // Name
    ctx.fillStyle = textColorPrimary
    ctx.font = 'bold 48px "Comfortaa", "Inter", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(username.toUpperCase(), 40, 140)

    // ID / Key Label
    ctx.fillStyle = textColorSecondary
    ctx.font = '16px "Comfortaa", "Inter", sans-serif'
    ctx.fillText('ID (12 DIGIT / X25519)', 40, 260)

    // ID Value (Generated 12-digit code)
    const identityId = await generateIdentityId(publicKey)

    ctx.fillStyle = textColorPrimary
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
  }, [publicKey, username])

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
