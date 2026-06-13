'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import { importProducts, type ProductImportRow } from '@/lib/import-actions'

/* ── CSV template ── */

const TEMPLATE_HEADER = 'name,category,categories,price,original_price,description,stock,badge,featured,active'
const TEMPLATE_EXAMPLE = [
  'Pastillas de freno Brembo,frenos,frenos,15000,20000,Pastillas de alta performance para uso deportivo,10,Oferta,true,true',
  'Filtro de aceite NGK,filtros,filtros,3500,,Filtro original para motores nafteros,50,,false,true',
  'Amortiguador Monroe Trasero,suspension,"suspension,motor",28000,35000,,8,,,true',
].join('\n')

function downloadTemplate() {
  const csv = `${TEMPLATE_HEADER}\n${TEMPLATE_EXAMPLE}`
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_productos.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* ── CSV parser ── */

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function parseBool(v: string, def: boolean): boolean {
  if (!v) return def
  return ['true', 'si', 'sí', '1', 'yes'].includes(v.toLowerCase())
}

interface ParseError { row: number; message: string }

interface ParseResult {
  rows: ProductImportRow[]
  errors: ParseError[]
  total: number
}

const REQUIRED_COLS = ['name', 'category', 'price']
const KNOWN_COLS = ['name', 'category', 'categories', 'price', 'original_price', 'description', 'stock', 'badge', 'featured', 'active']

function parseCSV(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return { rows: [], errors: [{ row: 1, message: 'El archivo está vacío o solo tiene encabezados.' }], total: 0 }

  const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())

  const missing = REQUIRED_COLS.filter(c => !header.includes(c))
  if (missing.length) {
    return { rows: [], errors: [{ row: 1, message: `Columnas requeridas faltantes: ${missing.join(', ')}` }], total: 0 }
  }

  const idx = (col: string) => header.indexOf(col)
  const get = (row: string[], col: string) => row[idx(col)]?.trim() ?? ''

  const rows: ProductImportRow[] = []
  const errors: ParseError[] = []

  lines.slice(1).forEach((line, i) => {
    const rowNum = i + 2
    if (!line.trim()) return

    const r = parseCSVLine(line)

    const name = get(r, 'name')
    const category = get(r, 'category')
    const priceStr = get(r, 'price')

    if (!name)     { errors.push({ row: rowNum, message: 'Nombre requerido' }); return }
    if (!category) { errors.push({ row: rowNum, message: 'Categoría requerida' }); return }
    if (!priceStr || isNaN(Number(priceStr))) {
      errors.push({ row: rowNum, message: `Precio inválido: "${priceStr}"` }); return
    }

    const origPriceStr = get(r, 'original_price')
    if (origPriceStr && isNaN(Number(origPriceStr))) {
      errors.push({ row: rowNum, message: `Precio original inválido: "${origPriceStr}"` }); return
    }

    const badgeRaw = get(r, 'badge')
    const badge: ProductImportRow['badge'] =
      badgeRaw === 'Oferta' ? 'Oferta' : badgeRaw === 'Nuevo' ? 'Nuevo' : null

    const categoriesRaw = get(r, 'categories')
    const categories = categoriesRaw
      ? categoriesRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [category]

    const stockStr = get(r, 'stock')

    rows.push({
      name,
      category,
      categories,
      price:          Number(priceStr),
      original_price: origPriceStr ? Number(origPriceStr) : null,
      description:    get(r, 'description') || null,
      stock:          stockStr ? parseInt(stockStr) : 0,
      badge,
      featured:       parseBool(get(r, 'featured'), false),
      active:         parseBool(get(r, 'active'), true),
    })
  })

  return { rows, errors, total: lines.length - 1 }
}

/* ── Component ── */

type Status = { type: 'success'; inserted: number } | { type: 'error'; message: string } | null

export default function ImportarProductosPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [filename, setFilename] = useState('')
  const [status, setStatus] = useState<Status>(null)
  const [isPending, startTransition] = useTransition()

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setParsed({ rows: [], errors: [{ row: 0, message: 'El archivo debe ser .csv' }], total: 0 })
      return
    }
    setFilename(file.name)
    setStatus(null)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      setParsed(parseCSV(text))
    }
    reader.readAsText(file, 'utf-8')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleSubmit() {
    if (!parsed || parsed.rows.length === 0) return
    startTransition(async () => {
      const result = await importProducts(parsed.rows)
      if (result.error) {
        setStatus({ type: 'error', message: result.error })
      } else {
        setStatus({ type: 'success', inserted: result.inserted })
        setParsed(null)
        setFilename('')
      }
    })
  }

  const hasErrors = parsed && parsed.errors.length > 0
  const hasRows   = parsed && parsed.rows.length > 0

  return (
    <div className="p-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Importar productos</h1>
          <p className="text-slate-400 text-sm mt-0.5">Cargá un CSV con tus productos y se agregarán al catálogo.</p>
        </div>
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700 transition">
          ← Volver a productos
        </Link>
      </div>

      {/* Step 1 — Template */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-700 mb-1">1. Descargá la plantilla</h2>
            <p className="text-sm text-slate-400">
              Completá la planilla con tus productos. Las columnas requeridas son{' '}
              <code className="bg-slate-100 px-1 rounded text-xs">name</code>,{' '}
              <code className="bg-slate-100 px-1 rounded text-xs">category</code> y{' '}
              <code className="bg-slate-100 px-1 rounded text-xs">price</code>.
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar plantilla .csv
          </button>
        </div>

        {/* Column reference */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {KNOWN_COLS.map(col => (
                  <th key={col} className="px-3 py-2 text-left font-semibold text-slate-500 border border-slate-100 whitespace-nowrap">
                    {col}
                    {REQUIRED_COLS.includes(col) && <span className="text-red-400 ml-0.5">*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">Pastillas Brembo</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">frenos</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">frenos</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">15000</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">20000</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">Descripción...</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">10</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">Oferta / Nuevo</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">true / false</td>
                <td className="px-3 py-2 border border-slate-100 text-slate-400">true / false</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 2 — Upload */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-slate-700 mb-4">2. Subí el archivo completado</h2>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
            dragging ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <svg className="mx-auto mb-3 text-slate-300" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          {filename ? (
            <p className="text-sm font-medium text-slate-700">{filename}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-600">Arrastrá el archivo aquí o hacé click para seleccionarlo</p>
              <p className="text-xs text-slate-400 mt-1">Solo archivos .csv</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
        </div>
      </div>

      {/* Parse errors */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
          <p className="text-sm font-semibold text-red-700 mb-2">
            {parsed.errors.length} error{parsed.errors.length > 1 ? 'es' : ''} encontrado{parsed.errors.length > 1 ? 's' : ''}
          </p>
          <ul className="space-y-1">
            {parsed.errors.map((e, i) => (
              <li key={i} className="text-xs text-red-600">
                {e.row > 1 ? `Fila ${e.row}: ` : ''}{e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 3 — Preview & import */}
      {hasRows && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">
              3. Revisá y confirmá la importación
              <span className="ml-2 text-slate-400 font-normal text-sm">
                {parsed.rows.length} producto{parsed.rows.length > 1 ? 's' : ''} listos
                {parsed.errors.length > 0 && ` · ${parsed.errors.length} con errores (se omiten)`}
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto mb-5">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left font-semibold text-slate-500 border border-slate-100">Nombre</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500 border border-slate-100">Categoría</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500 border border-slate-100">Precio</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500 border border-slate-100">Stock</th>
                  <th className="px-3 py-2 text-center font-semibold text-slate-500 border border-slate-100">Badge</th>
                  <th className="px-3 py-2 text-center font-semibold text-slate-500 border border-slate-100">Activo</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 8).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border border-slate-100 text-slate-700 max-w-[200px] truncate">{row.name}</td>
                    <td className="px-3 py-2 border border-slate-100 text-slate-500">{row.category}</td>
                    <td className="px-3 py-2 border border-slate-100 text-slate-700 text-right font-medium">
                      ${row.price.toLocaleString('es-AR')}
                    </td>
                    <td className="px-3 py-2 border border-slate-100 text-slate-500 text-right">{row.stock}</td>
                    <td className="px-3 py-2 border border-slate-100 text-center">
                      {row.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          row.badge === 'Oferta' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>{row.badge}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 border border-slate-100 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${row.active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.rows.length > 8 && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                y {parsed.rows.length - 8} producto{parsed.rows.length - 8 > 1 ? 's' : ''} más...
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isPending ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Importando...
              </>
            ) : (
              `Importar ${parsed.rows.length} producto${parsed.rows.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {status?.type === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <svg className="text-emerald-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              {status.inserted} producto{status.inserted > 1 ? 's' : ''} importado{status.inserted > 1 ? 's' : ''} correctamente
            </p>
            <Link href="/admin" className="text-xs text-emerald-600 hover:underline">
              Ver catálogo →
            </Link>
          </div>
        </div>
      )}

      {status?.type === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <p className="text-sm font-semibold text-red-700">Error al importar</p>
          <p className="text-xs text-red-600 mt-0.5">{status.message}</p>
        </div>
      )}
    </div>
  )
}
