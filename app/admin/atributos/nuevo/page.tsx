import Link from 'next/link'
import AttributeForm from '@/components/admin/AttributeForm'
import { createAttribute } from '@/lib/attribute-actions'

export default function NuevoAtributoPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/atributos" className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 mb-3">
          ← Volver a atributos
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Nuevo atributo</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <AttributeForm onSubmit={createAttribute} />
      </div>
    </div>
  )
}
