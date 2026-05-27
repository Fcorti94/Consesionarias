import Link from 'next/link'
import { getAllAttributeDefinitions, deleteAttribute, toggleAttributeActive } from '@/lib/attribute-actions'
import { CATEGORIES } from '@/lib/types'

const FIELD_TYPE_LABELS: Record<string, string> = {
  text:        'Texto',
  number:      'Número',
  textarea:    'Área de texto',
  select:      'Selección única',
  multiselect: 'Selección múltiple',
}

export default async function AtributosPage() {
  const attributes = await getAllAttributeDefinitions()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Atributos de productos</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Definí las características que pueden tener los productos (marca, compatibilidad, material, etc.)
          </p>
        </div>
        <Link
          href="/admin/atributos/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          <span>+</span> Nuevo atributo
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Opciones</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Requerido</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Estado</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attributes.map((attr) => (
                <tr key={attr.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{attr.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{attr.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {FIELD_TYPE_LABELS[attr.field_type] ?? attr.field_type}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {attr.category
                      ? (CATEGORIES.find((c) => c.slug === attr.category)?.label ?? attr.category)
                      : <span className="text-slate-400 italic">Todas</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-xs">
                    {attr.options?.length > 0
                      ? attr.options.join(', ')
                      : <span className="text-slate-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    {attr.is_required
                      ? <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">Sí</span>
                      : <span className="text-slate-300 text-xs">No</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    <form action={async () => {
                      'use server'
                      await toggleAttributeActive(attr.id, !attr.active)
                    }}>
                      <button
                        type="submit"
                        className={`w-10 h-5 rounded-full transition relative ${attr.active ? 'bg-green-400' : 'bg-slate-200'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${attr.active ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/atributos/${attr.id}`}
                        className="text-slate-400 hover:text-orange-500 transition p-1"
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Link>
                      <form action={async () => {
                        'use server'
                        await deleteAttribute(attr.id)
                      }}>
                        <button type="submit" className="text-slate-400 hover:text-red-500 transition p-1" title="Eliminar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attributes.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="font-medium mb-2">No hay atributos definidos</p>
            <Link href="/admin/atributos/nuevo" className="text-orange-500 hover:text-orange-600 text-sm">
              Crear el primer atributo →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
