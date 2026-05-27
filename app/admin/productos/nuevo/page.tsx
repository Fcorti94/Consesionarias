import Link from 'next/link'
import ProductForm from '@/components/admin/ProductForm'
import { createProduct } from '@/lib/actions'
import { getAttributeDefinitions } from '@/lib/attribute-actions'
import { getSiteConfig } from '@/lib/config-actions'
import { DEFAULT_CATEGORIES } from '@/lib/types'

export default async function NewProductPage() {
  const [attributes, config] = await Promise.all([
    getAttributeDefinitions(),
    getSiteConfig(),
  ])
  const categories = config.categories ?? DEFAULT_CATEGORIES

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin" className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 mb-3">
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Nuevo producto</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <ProductForm attributes={attributes} categories={categories} onSubmit={createProduct} />
      </div>
    </div>
  )
}
