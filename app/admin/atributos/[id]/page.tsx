import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AttributeForm from '@/components/admin/AttributeForm'
import { updateAttribute } from '@/lib/attribute-actions'

export default async function EditAtributoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: attribute } = await supabase
    .from('attribute_definitions')
    .select('*')
    .eq('id', id)
    .single()

  if (!attribute) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateAttribute(id, formData)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/atributos" className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 mb-3">
          ← Volver a atributos
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Editar atributo</h1>
        <p className="text-slate-400 text-sm mt-0.5">{attribute.name}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <AttributeForm attribute={attribute} onSubmit={handleUpdate} />
      </div>
    </div>
  )
}
