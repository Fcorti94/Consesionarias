import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/config-actions'
import { DEFAULT_CATEGORIES } from '@/lib/types'
import type { Product } from '@/lib/types'
import HeaderWrapper from '@/components/HeaderWrapper'
import ProductDetailClient from './ProductDetailClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('name,description,image_url').eq('id', id).single()
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: product.name,
    description: product.description ?? product.name,
    openGraph: product.image_url ? { images: [product.image_url] } : undefined,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: related }, config] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).eq('active', true).single(),
    supabase.from('products').select('*').eq('active', true).limit(20),
    getSiteConfig(),
  ])

  if (!product) notFound()

  const relatedProducts = (related ?? [])
    .filter((p: Product) => p.id !== product.id && p.category === product.category)
    .slice(0, 4)

  const categories = Array.isArray(config.categories) ? config.categories : DEFAULT_CATEGORIES
  const categoryLabel = categories.find((c) => c.slug === product.category)?.label ?? product.category

  return (
    <>
      <HeaderWrapper />
      <main className="min-h-screen bg-slate-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition">Inicio</Link>
            <span>/</span>
            <Link href="/productos" className="hover:text-slate-600 transition">Productos</Link>
            <span>/</span>
            <Link href={`/productos?categoria=${product.category}`} className="hover:text-slate-600 transition capitalize">
              {categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <ProductDetailClient
            product={product}
            relatedProducts={relatedProducts}
            categoryLabel={categoryLabel}
            shippingFreeFrom={config.shipping_free_from}
            installments={config.installments}
          />
        </div>
      </main>
    </>
  )
}
