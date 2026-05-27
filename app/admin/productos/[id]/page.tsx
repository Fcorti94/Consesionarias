import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import { updateProduct } from '@/lib/actions'
import { getAttributeDefinitions } from '@/lib/attribute-actions'
import { getSiteConfig } from '@/lib/config-actions'
import { DEFAULT_CATEGORIES } from '@/lib/types'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, attributes, config] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    getAttributeDefinitions(),
    getSiteConfig(),
  ])
  const categories = config.categories ?? DEFAULT_CATEGORIES

  if (!product) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateProduct(id, formData)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin" className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 mb-3">
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Editar producto</h1>
        <p className="text-slate-400 text-sm mt-0.5">{product.name}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <ProductForm product={product} attributes={attributes} categories={categories} onSubmit={handleUpdate} />
      </div>
    </div>
  )
}
