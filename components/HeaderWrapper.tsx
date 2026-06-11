import { getSiteConfig } from '@/lib/config-actions'
import { DEFAULT_CATEGORIES, DEFAULT_NAV_LINKS } from '@/lib/types'
import Header from './Header'

export default async function HeaderWrapper() {
  const config = await getSiteConfig()
  const categories = Array.isArray(config.categories) ? config.categories : DEFAULT_CATEGORIES
  const navLinks   = Array.isArray(config.nav_links)  ? config.nav_links  : DEFAULT_NAV_LINKS
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
      showCart={config.show_cart}
      navLinks={navLinks}
    />
  )
}
