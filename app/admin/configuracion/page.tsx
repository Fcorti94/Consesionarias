import { getSiteConfig } from '@/lib/config-actions'
import ConfigFormWrapper from './ConfigFormWrapper'
import ConfigSubmitButton from './ConfigSubmitButton'
import CategoriesEditor from './CategoriesEditor'
import SectionOrderEditor from './SectionOrderEditor'
import ImageInput from '@/components/ImageInput'
import {
  DEFAULT_TRUST_ITEMS,
  DEFAULT_HERO_STATS,
  DEFAULT_BRANDS,
  DEFAULT_CATEGORIES,
  DEFAULT_SECTION_ORDER,
} from '@/lib/types'

export default async function ConfiguracionPage() {
  const config = await getSiteConfig()

  const trustItems    = config.trust_items   ?? DEFAULT_TRUST_ITEMS
  const heroStats     = config.hero_stats    ?? DEFAULT_HERO_STATS
  const brands        = config.brands        ?? DEFAULT_BRANDS
  const categories    = config.categories    ?? DEFAULT_CATEGORIES
  const sectionOrder  = config.section_order ?? DEFAULT_SECTION_ORDER
  const sectionVisibility = {
    brands:      config.show_brands,
    promo:       config.show_promo,
    hero:        config.show_hero,
    trust_bar:   config.show_trust_bar,
    categories:  config.show_categories,
    featured:    config.show_featured,
  }

  const brandSlots = [
    ...brands,
    ...Array.from({ length: Math.max(0, 12 - brands.length) }, () => ({ name: '', logo_url: '' })),
  ]

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Configuración del sitio</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Todos los cambios se reflejan en la tienda de forma inmediata al guardar.
        </p>
      </div>

      <ConfigFormWrapper>

        {/* ── Orden y visibilidad de secciones ── */}
        <SectionOrderEditor
          initialOrder={sectionOrder}
          initialVisibility={sectionVisibility}
        />

        {/* ── Marca ── */}
        <Section title="Marca">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre de la marca *" name="brand_name" defaultValue={config.brand_name} required />
            <Field label="Tagline" name="brand_tagline" defaultValue={config.brand_tagline} placeholder="Tu tienda de confianza" />
          </div>
          <ImageInput
            name="brand_logo_url"
            defaultValue={config.brand_logo_url}
            label="Logo de la marca"
            placeholder="https://... (.png, .svg, .webp)"
          />
          <Field label="Texto del footer" name="footer_text" defaultValue={config.footer_text} placeholder="Repuestos y accesorios de calidad." />
        </Section>

        {/* ── Colores ── */}
        <Section title="Colores" hint="El color primario se aplica a botones, links y elementos destacados.">
          <div className="grid grid-cols-2 gap-6">
            <ColorField label="Color primario"            name="primary_color"       defaultValue={config.primary_color} />
            <ColorField label="Color hover (más oscuro)"  name="primary_hover_color" defaultValue={config.primary_hover_color} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <label htmlFor="dark_mode" className="block text-sm font-medium text-slate-700 cursor-pointer">
                Modo oscuro
              </label>
              <p className="text-xs text-slate-400 mt-0.5">Activa el tema oscuro en la tienda pública</p>
            </div>
            <Toggle id="dark_mode" name="dark_mode" defaultChecked={config.dark_mode} />
          </div>
        </Section>

        {/* ── Contacto ── */}
        <Section title="Contacto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Teléfono"                            name="phone"     defaultValue={config.phone}     placeholder="+54 9 351 000-0000" />
            <Field label="WhatsApp (número sin + ni espacios)" name="whatsapp"  defaultValue={config.whatsapp}  placeholder="5493510000000" />
            <Field label="Instagram (usuario o URL completa)"  name="instagram" defaultValue={config.instagram} placeholder="@mitienda o https://instagram.com/mitienda" />
            <Field label="Email"    type="email"               name="email"     defaultValue={config.email}     placeholder="contacto@mitienda.com" />
            <Field label="Dirección"                           name="address"   defaultValue={config.address}   placeholder="Av. Siempre Viva 742, Ciudad" />
          </div>
        </Section>

        {/* ── Comercio ── */}
        <Section title="Comercio">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Envío gratis desde ($)" name="shipping_free_from" type="number" defaultValue={String(config.shipping_free_from)} placeholder="50000" />
            <Field label="Cuotas sin interés"      name="installments"       type="number" defaultValue={String(config.installments)} placeholder="12" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <label htmlFor="show_low_stock_badge" className="block text-sm font-medium text-slate-700 cursor-pointer">
                Badge "¡Últimas unidades!"
              </label>
              <p className="text-xs text-slate-400 mt-0.5">
                Mostrá un badge en productos con 1–2 unidades en stock. Desactivar para concesionarias o productos únicos.
              </p>
            </div>
            <Toggle id="show_low_stock_badge" name="show_low_stock_badge" defaultChecked={config.show_low_stock_badge} />
          </div>
        </Section>

        {/* ── Marcas ── */}
        <Section
          title="Marcas"
          hint="Hasta 12 marcas. Podés ingresar solo el nombre (se muestra como texto) o también la URL de su logo."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {brandSlots.map((brand, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end">
                <div className="col-span-2">
                  <Field label={i === 0 ? 'Nombre' : ''} name={`brand_${i}_name`} defaultValue={brand.name} placeholder={`Marca ${i + 1}`} />
                </div>
                <div className="col-span-3">
                  <ImageInput name={`brand_${i}_logo_url`} defaultValue={brand.logo_url} label={i === 0 ? 'Logo (URL o subir)' : ''} placeholder="https://..." />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Promo banner ── */}
        <Section
          title="Banner promocional"
          hint="Sección con fondo oscuro e imagen. Aparece entre los productos destacados y las marcas."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Texto del badge (ej: Oferta especial, Novedad)" name="promo_badge_text" defaultValue={config.promo_badge_text} placeholder="Oferta especial" />
            <div />
            <Field label="Título"          name="promo_title"     defaultValue={config.promo_title}     placeholder="Hasta 30% OFF en frenos" />
            <Field label="Subtítulo"       name="promo_subtitle"  defaultValue={config.promo_subtitle}  placeholder="Por tiempo limitado." />
            <ImageInput name="promo_image_url" defaultValue={config.promo_image_url} label="Imagen de fondo" placeholder="https://..." />
            <Field label="Texto del botón" name="promo_cta_text"  defaultValue={config.promo_cta_text}  placeholder="Aprovechar oferta" />
            <Field
              label="Link del botón"
              name="promo_cta_link"
              defaultValue={config.promo_cta_link}
              placeholder="/productos?categoria=frenos"
              className="col-span-full"
            />
          </div>
        </Section>

        {/* ── Hero ── */}
        <Section
          title="Hero principal"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Título principal" name="hero_title"      defaultValue={config.hero_title}      placeholder="Todo lo que necesitás" />
            <Field label="Texto del badge"  name="hero_badge_text" defaultValue={config.hero_badge_text} placeholder="⚡ Envíos en 24–48 hs" />
          </div>
          <Field label="Subtítulo"          name="hero_subtitle"   defaultValue={config.hero_subtitle}   placeholder="Los mejores productos al mejor precio." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Texto botón CTA"  name="hero_cta_text"   defaultValue={config.hero_cta_text}   placeholder="Ver todos los productos" />
          </div>
          <ImageInput name="hero_image_url" defaultValue={config.hero_image_url} label="Imagen de fondo" placeholder="https://..." />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Estadísticas (3 cifras bajo el CTA)</p>
            <div className="space-y-2">
              {heroStats.map((stat, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <Field label={`Valor ${i + 1}`}    name={`stat_${i}_value`} defaultValue={stat.value} placeholder="5.000+" />
                  <Field label={`Etiqueta ${i + 1}`} name={`stat_${i}_label`} defaultValue={stat.label} placeholder="Productos" />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Trust bar ── */}
        <Section
          title="Barra de confianza"
          hint="Los íconos que aparecen debajo del hero. Usá un emoji como ícono."
        >
          <div className="space-y-3">
            {trustItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-2">
                  <Field label={i === 0 ? 'Emoji' : ''} name={`trust_${i}_emoji`} defaultValue={item.emoji} placeholder="🚚" />
                </div>
                <div className="col-span-5">
                  <Field label={i === 0 ? 'Título' : ''} name={`trust_${i}_title`} defaultValue={item.title} placeholder="Envío express" />
                </div>
                <div className="col-span-5">
                  <Field label={i === 0 ? 'Subtítulo' : ''} name={`trust_${i}_sub`} defaultValue={item.sub} placeholder="24 a 48 horas" />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Categorías ── */}
        <Section
          title="Categorías"
          hint="Creá, editá o eliminá las categorías. El slug se genera automáticamente del nombre y se usa en la URL."
        >
          <CategoriesEditor initialCategories={categories} />
        </Section>

        <ConfigSubmitButton />
      </ConfigFormWrapper>
    </div>
  )
}

/* ── Helpers ── */

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">{title}</h2>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function Toggle({ id, name, defaultChecked }: { id?: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        className="sr-only peer"
      />
      <div className="w-9 h-5 bg-slate-200 rounded-full peer
        peer-checked:after:translate-x-4 peer-checked:after:border-white
        after:content-[''] after:absolute after:top-0.5 after:left-0.5
        after:bg-white after:border-slate-300 after:border after:rounded-full
        after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]"
      />
    </label>
  )
}

function ColorField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" name={name} defaultValue={defaultValue}
          className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
        <span className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-500 bg-slate-50 font-mono">
          {defaultValue}
        </span>
      </div>
    </div>
  )
}

function Field({
  label, name, defaultValue, placeholder, type = 'text', required, className,
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus-primary"
      />
    </div>
  )
}
