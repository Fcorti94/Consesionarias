import { getSiteConfig } from '@/lib/config-actions'
import { DEFAULT_CATEGORIES } from '@/lib/types'
import Header from './Header'

export default async function HeaderWrapper() {
  const config = await getSiteConfig()
  const categories = Array.isArray(config.categories) ? config.categories : DEFAULT_CATEGORIES
  return (
    <Header
      brandName={config.brand_name}
      brandTagline={config.brand_tagline}
      brandLogoUrl={config.brand_logo_url}
      phone={config.phone}
      whatsapp={config.whatsapp}
      instagram={config.instagram}
      shippingFreeFrom={config.shipping_free_from}
      categories={categories}
    />
  )
}
