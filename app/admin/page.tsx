import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import DeleteButton from './DeleteButton'
import ToggleButton from './ToggleButton'

async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default async function AdminPage() {
  const products = await getAllProducts()
  const active = products.filter((p) => p.active).length
  const outOfStock = products.filter((p) => p.stock === 0).length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {products.length} total · {active} activos · {outOfStock} sin stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/productos/importar"
            className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-sm"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Importar CSV
          </Link>
          <Link
            href="/admin/productos/nuevo"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <span>+</span> Nuevo producto
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Producto</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Categoría</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Precio</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Stock</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Estado</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate max-w-xs">{p.name}</p>
                        {p.badge && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            p.badge === 'Oferta' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{p.category}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-slate-800">{fmt(p.price)}</span>
                    {p.original_price && (
                      <p className="text-slate-400 line-through text-xs">{fmt(p.original_price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ToggleButton id={p.id} active={p.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition p-1.5 rounded-lg"
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Link>
                      <DeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="font-medium mb-2">No hay productos aún</p>
            <Link href="/admin/productos/nuevo" className="text-orange-500 hover:text-orange-600 text-sm">
              Crear el primer producto →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
