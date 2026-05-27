'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_CATEGORIES, normalizeVariant } from '@/lib/types'
import type { Product, ProductVariant, AttributeDefinition, ConfigCategory } from '@/lib/types'

interface Props {
  product?: Product
  attributes?: AttributeDefinition[]
  categories?: ConfigCategory[]
  onSubmit: (formData: FormData) => Promise<void>
}

export default function ProductForm({ product, attributes = [], categories = DEFAULT_CATEGORIES, onSubmit }: Props) {
  const router = useRouter()
  const [images, setImages] = useState<string[]>(() => {
    if (product?.image_urls && product.image_urls.length > 0) return product.image_urls
    if (product?.image_url) return [product.image_url]
    return []
  })
  const [urlInput, setUrlInput] = useState('')
  const [variantItems, setVariantItems] = useState<ProductVariant[]>(() => {
    if (!product?.variants) return []
    return product.variants.map((v: unknown) => normalizeVariant(v))
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (product?.categories && product.categories.length > 0) return product.categories
    if (product?.category) return [product.category]
    return []
  })
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const savedAttributes = product?.attributes ?? {}

  // Atributos visibles según las categorías seleccionadas
  const visibleAttributes = attributes.filter(
    (a) => a.active && (a.category === null || selectedCategories.includes(a.category))
  )

  // Slugs de campos multiselect para pasarlos como campo oculto al servidor
  const multiSlugs = visibleAttributes
    .filter((a) => a.field_type === 'multiselect')
    .map((a) => a.slug)
    .join(',')

  async function uploadImage(file: File) {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      setImages(prev => [...prev, publicUrl])
    } catch (err) {
      alert('Error subiendo la imagen. Intentá de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  function handleFile(file: File | null | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    uploadImage(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedCategories.length === 0) {
      setError('Seleccioná al menos una categoría.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      formData.set('image_url', images[0] ?? '')
      formData.set('image_urls', JSON.stringify(images))
      formData.set('categories_json', JSON.stringify(selectedCategories))
      formData.set('category', selectedCategories[0] ?? '')
      formData.set('variants_json', JSON.stringify(variantItems))
      if (variantItems.length > 0) {
        formData.set('stock', String(variantItems.reduce((s, v) => s + v.stock, 0)))
      }
      await onSubmit(formData)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando el producto.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Images */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Imágenes del producto</label>

          {/* Image grid */}
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group border border-slate-200">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1 leading-tight">
                    Principal
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white hidden group-hover:flex items-center justify-center text-xs font-bold leading-none"
                >×</button>
              </div>
            ))}

            {/* Add cell */}
            <div
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition text-slate-400"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            >
              {uploading ? (
                <p className="text-xs text-center px-1">Subiendo...</p>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <span className="text-xs mt-1">Agregar</span>
                </>
              )}
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])} />

          {/* URL input */}
          <div className="mt-2 flex gap-1.5">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const u = urlInput.trim()
                  if (u) { setImages(prev => [...prev, u]); setUrlInput('') }
                }
              }}
              placeholder="O pegá una URL..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400"
            />
            <button
              type="button"
              onClick={() => { const u = urlInput.trim(); if (u) { setImages(prev => [...prev, u]); setUrlInput('') } }}
              disabled={!urlInput.trim()}
              className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-medium transition"
            >
              Agregar
            </button>
          </div>

          {images.length > 0 && (
            <p className="text-xs text-slate-400 mt-1.5">La 1ª imagen es la principal (thumbnail en listados).</p>
          )}
        </div>

        {/* Right columns - Fields */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del producto <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              defaultValue={product?.name}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Ej: Pastillas de Freno Brembo P06016"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea
              name="description"
              defaultValue={product?.description ?? ''}
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
              placeholder="Descripción detallada del producto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categorías <span className="text-red-400">*</span>
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">{selectedCategories.length} seleccionada{selectedCategories.length > 1 ? 's' : ''}</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = selectedCategories.includes(c.slug)
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setSelectedCategories(prev =>
                      active ? prev.filter(s => s !== c.slug) : [...prev, c.slug]
                    )}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition"
                    style={active
                      ? { borderColor: 'var(--primary, #f97316)', backgroundColor: 'color-mix(in srgb, var(--primary, #f97316) 10%, white)', color: 'var(--primary, #f97316)' }
                      : { borderColor: '#e2e8f0', color: '#475569' }}
                  >
                    {c.emoji} {c.label}
                  </button>
                )
              })}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-xs text-red-400 mt-1.5">Seleccioná al menos una categoría</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Badge</label>
              <select
                name="badge"
                defaultValue={product?.badge ?? ''}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white"
              >
                <option value="">Sin badge</option>
                <option value="Oferta">🔴 Oferta</option>
                <option value="Nuevo">🟢 Nuevo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Precio <span className="text-red-400">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product?.price}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio original</label>
              <input
                name="original_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product?.original_price ?? ''}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                placeholder="Si hay descuento"
              />
            </div>
          </div>

          {/* Variantes + Stock unificado */}
          <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Variantes y stock</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {variantItems.length === 0
                    ? 'Sin variantes — ingresá el stock total.'
                    : 'Cada variante tiene su propio stock.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariantItems(prev => [...prev, { name: '', stock: 0 }])}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition"
              >
                + Variante
              </button>
            </div>

            {variantItems.length === 0 ? (
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600 shrink-0">Stock <span className="text-red-400">*</span></label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock ?? 0}
                  required
                  className="w-28 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_72px_28px] gap-2 px-1 text-xs text-slate-400 font-medium">
                  <span>Nombre</span><span>Stock</span><span/>
                </div>
                {variantItems.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr_72px_28px] gap-2 items-center">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => setVariantItems(prev => prev.map((vv, ii) => ii === i ? { ...vv, name: e.target.value } : vv))}
                      placeholder={`Variante ${i + 1}`}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => setVariantItems(prev => prev.map((vv, ii) => ii === i ? { ...vv, stock: parseInt(e.target.value) || 0 } : vv))}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => setVariantItems(prev => prev.filter((_, ii) => ii !== i))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition text-base leading-none"
                    >×</button>
                  </div>
                ))}
                <p className="text-xs text-slate-500 pt-1 pl-1">
                  Stock total: <span className="font-semibold">{variantItems.reduce((s, v) => s + v.stock, 0)}</span> unidades
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                defaultValue={product?.rating ?? 0}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Opiniones</label>
              <input
                name="reviews"
                type="number"
                min="0"
                defaultValue={product?.reviews ?? 0}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                name="featured"
                type="checkbox"
                value="true"
                defaultChecked={product?.featured}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-sm text-slate-700">Destacado en home</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                name="active"
                type="checkbox"
                value="true"
                defaultChecked={product?.active ?? true}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-sm text-slate-700">Activo (visible en tienda)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Atributos dinámicos */}
      {visibleAttributes.length > 0 && (
        <div className="border border-slate-100 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Características del producto
            {selectedCategories.length > 0 && (
              <span className="text-slate-400 font-normal ml-1">
                — {selectedCategories.map(s => categories.find(c => c.slug === s)?.label).filter(Boolean).join(', ')}
              </span>
            )}
          </h3>

          {/* Campo oculto para indicar al servidor qué campos son multiselect */}
          <input type="hidden" name="attr_multi_fields" value={multiSlugs} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleAttributes.map((attr) => {
              const current = savedAttributes[attr.slug]

              return (
                <div key={attr.id} className={attr.field_type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {attr.name}
                    {attr.is_required && <span className="text-red-400 ml-1">*</span>}
                  </label>

                  {attr.field_type === 'text' && (
                    <input
                      name={`attr_${attr.slug}`}
                      type="text"
                      defaultValue={(current as string) ?? ''}
                      required={attr.is_required}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                    />
                  )}

                  {attr.field_type === 'number' && (
                    <input
                      name={`attr_${attr.slug}`}
                      type="number"
                      defaultValue={(current as string) ?? ''}
                      required={attr.is_required}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                    />
                  )}

                  {attr.field_type === 'textarea' && (
                    <textarea
                      name={`attr_${attr.slug}`}
                      defaultValue={(current as string) ?? ''}
                      required={attr.is_required}
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
                    />
                  )}

                  {attr.field_type === 'select' && (
                    <select
                      name={`attr_${attr.slug}`}
                      defaultValue={(current as string) ?? ''}
                      required={attr.is_required}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      {attr.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}

                  {attr.field_type === 'multiselect' && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {attr.options.map((o) => {
                        const checked = Array.isArray(current)
                          ? current.includes(o)
                          : current === o
                        return (
                          <label key={o} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              name={`attr_${attr.slug}`}
                              value={o}
                              defaultChecked={checked}
                              className="accent-orange-500 w-4 h-4"
                            />
                            <span className="text-sm text-slate-700">{o}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <a href="/admin" className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
          Cancelar
        </a>
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition text-sm"
        >
          {saving ? 'Guardando...' : 'Guardar producto'}
        </button>
      </div>
    </form>
  )
}
