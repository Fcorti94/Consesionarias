export const dynamic = 'force-dynamic'

import HeaderWrapper from '@/components/HeaderWrapper'
import { getSiteConfig } from '@/lib/config-actions'
import { DEFAULT_FAQ_ITEMS } from '@/lib/types'
import FaqClient from './FaqClient'

export const metadata = { title: 'Preguntas frecuentes' }

export default async function FaqPage() {
  const config = await getSiteConfig()
  const items = config.faq_items ?? DEFAULT_FAQ_ITEMS

  return (
    <>
      <HeaderWrapper />
      <FaqClient items={items} />
    </>
  )
}
