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

const DARK_CSS = `
  html { color-scheme: dark; }
  body { background-color: #0f172a !important; color: #e2e8f0 !important; }
  .bg-white     { background-color: #1e293b !important; }
  .bg-slate-50  { background-color: #0f172a !important; }
  .bg-slate-100 { background-color: #111827 !important; }
  .bg-slate-800 { background-color: #0c1326 !important; }
  .bg-slate-900 { background-color: #020617 !important; }
  .text-slate-900 { color: #f1f5f9 !important; }
  .text-slate-800 { color: #e2e8f0 !important; }
  .text-slate-700 { color: #cbd5e1 !important; }
  .text-slate-600 { color: #94a3b8 !important; }
  .text-slate-500 { color: #64748b !important; }
  .text-white     { color: #ffffff !important; }
  .border-slate-100 { border-color: #334155 !important; }
  .border-slate-200 { border-color: #3f4f6e !important; }
  .border-slate-700 { border-color: #1e3049 !important; }
  .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,.55) !important; }
  .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,.65) !important; }
  .shadow-xl { box-shadow: 0 20px 25px rgba(0,0,0,.75) !important; }
  input:not([type=color]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]),
  textarea, select {
    background-color: #0f172a !important;
    color: #e2e8f0 !important;
    border-color: #334155 !important;
  }
  input::placeholder, textarea::placeholder { color: #475569 !important; }
  .nav-dropdown-menu > div { background-color: #1e293b !important; border-color: #334155 !important; }
  .focus-within\\:bg-white:focus-within { background-color: #1e293b !important; }
  .hover\\:bg-slate-50:hover  { background-color: #1e293b !important; }
  .hover\\:bg-slate-100:hover { background-color: #263044 !important; }
  .hover\\:bg-white:hover     { background-color: #263044 !important; }
`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig()

  return (
    <html lang="es" className={config.dark_mode ? `${inter.className} dark` : inter.className}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${config.primary_color};
              --primary-hover: ${config.primary_hover_color};
            }
            ${config.dark_mode ? DARK_CSS : ''}
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
