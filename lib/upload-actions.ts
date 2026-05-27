'use server'

import { createClient } from '@/lib/supabase/server'

type UploadResult = { url: string; error?: never } | { url?: never; error: string }

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const file = formData.get('file') as File
    if (!file || file.size === 0) return { error: 'No se recibió archivo' }
    if (file.size > 5 * 1024 * 1024) return { error: 'El archivo supera los 5 MB' }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowed.includes(file.type)) return { error: 'Formato no soportado (JPG, PNG, WEBP, SVG)' }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('uploads')
      .upload(filename, file, { contentType: file.type, upsert: false })

    if (error) return { error: error.message }

    const { data } = supabase.storage.from('uploads').getPublicUrl(filename)
    return { url: data.publicUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido al subir imagen' }
  }
}
