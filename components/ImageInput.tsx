'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '@/lib/upload-actions'

interface Props {
  /** name para el hidden input en forms con server action */
  name?: string
  defaultValue?: string
  value?: string
  onChange?: (url: string) => void
  label?: string
  placeholder?: string
}

export default function ImageInput({ name, defaultValue, value, onChange, label, placeholder }: Props) {
  const [url, setUrl] = useState(value ?? defaultValue ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleUrlChange(newUrl: string) {
    setUrl(newUrl)
    onChange?.(newUrl)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadImage(fd)
      if (result.error) {
        setUploadError(result.error)
      } else {
        handleUrlChange(result.url!)
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}

      {/* Preview */}
      {url && (
        <div className="mb-2 relative group w-full h-24 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
          <img src={url} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => handleUrlChange('')}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* URL + botón subir */}
      <div className="flex gap-2">
        <input
          type="text"
          name={name}
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder ?? 'https://... o subir desde dispositivo'}
          className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus-primary"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Subir imagen desde dispositivo"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50 whitespace-nowrap"
        >
          {uploading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          )}
          <span className="hidden sm:inline text-xs">{uploading ? 'Subiendo...' : 'Subir'}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
    </div>
  )
}
