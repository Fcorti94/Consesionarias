import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import { getSiteConfig } from '@/lib/config-actions'
import WhatsAppButton from '@/components/WhatsAppButton'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  return {
    title: `${config.brand_name} — ${config.brand_tagline}`,
    description: config.hero_subtitle || config.brand_tagline,
  }
}

function hexToRgb(hex: string) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  return { r: parseInt(m[1].slice(0,2),16), g: parseInt(m[1].slice(2,4),16), b: parseInt(m[1].slice(4,6),16) }
}
function lighten(hex: string, amt: number) {
  const rgb = hexToRgb(hex); if (!rgb) return hex
  const l = (c: number) => Math.min(255, Math.round(c + (255-c)*amt))
  const h = (c: number) => l(c).toString(16).padStart(2,'0')
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`
}
function luminance(hex: string) {
  const rgb = hexToRgb(hex); if (!rgb) return 1
  return (0.299*rgb.r + 0.587*rgb.g + 0.114*rgb.b) / 255
}

function buildDarkCss(base: string) {
  const card    = lighten(base, 0.12)
  const card2   = lighten(base, 0.06)
  const hover   = lighten(base, 0.18)
  const border1 = lighten(base, 0.22)
  const border2 = lighten(base, 0.30)
  const input   = lighten(base, 0.05)
  return `
  html { color-scheme: dark; }
  body { background-color: ${base} !important; color: #e2e8f0 !important; }
  .bg-white     { background-color: ${card} !important; }
  .bg-slate-50  { background-color: ${base} !important; }
  .bg-slate-100 { background-color: ${card2} !important; }
  .bg-slate-800 { background-color: ${card2} !important; }
  .bg-slate-900 { background-color: ${base} !important; }
  .text-slate-900 { color: #f1f5f9 !important; }
  .text-slate-800 { color: #e2e8f0 !important; }
  .text-slate-700 { color: #cbd5e1 !important; }
  .text-slate-600 { color: #94a3b8 !important; }
  .text-slate-500 { color: #64748b !important; }
  .text-white     { color: #ffffff !important; }
  .border-slate-100 { border-color: ${border1} !important; }
  .border-slate-200 { border-color: ${border2} !important; }
  .border-slate-700 { border-color: ${border1} !important; }
  .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,.55) !important; }
  .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,.65) !important; }
  .shadow-xl { box-shadow: 0 20px 25px rgba(0,0,0,.75) !important; }
  input:not([type=color]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]),
  textarea, select {
    background-color: ${input} !important;
    color: #e2e8f0 !important;
    border-color: ${border1} !important;
  }
  input::placeholder, textarea::placeholder { color: #475569 !important; }
  .nav-dropdown-menu > div { background-color: ${card} !important; border-color: ${border1} !important; }
  .focus-within\\:bg-white:focus-within { background-color: ${card} !important; }
  .hover\\:bg-slate-50:hover  { background-color: ${card} !important; }
  .hover\\:bg-slate-100:hover { background-color: ${hover} !important; }
  .hover\\:bg-white:hover     { background-color: ${hover} !important; }
`
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig()

  const darkBase  = config.dark_color?.trim()
  const isDark    = !!darkBase && luminance(darkBase) < 0.5
  const darkCss   = isDark ? buildDarkCss(darkBase) : ''

  // Collect unique Google Fonts needed by section_styles (skip Inter, already loaded)
  const usedFonts = Object.values(config.section_styles ?? {})
    .map(s => s.fontFamily)
    .filter((f): f is string => !!f && f !== 'Inter')
  const uniqueFonts = [...new Set(usedFonts)]
  const googleFontsUrl = uniqueFonts.length > 0
    ? `https://fonts.googleapis.com/css2?${uniqueFonts.map(f => `family=${f.replace(/ /g, '+')}:ital,wght@0,400;0,600;0,700;1,400`).join('&')}&display=swap`
    : null

  return (
    <html lang="es" className={isDark ? `${inter.className} dark` : inter.className}>
      <head>
        {googleFontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={googleFontsUrl} rel="stylesheet" />
          </>
        )}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${config.primary_color};
              --primary-hover: ${config.primary_hover_color};
            }
            ${darkCss}
          `
        }} />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50">
        <CartProvider>{children}</CartProvider>
        <WhatsAppButton whatsapp={config.whatsapp} brandName={config.brand_name} />
        <Analytics />
      </body>
    </html>
  )
}
