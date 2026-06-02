import { Suspense } from "react"
import SocialPageClient from "./SocialPageClient"

export default function MidiasSociaisPage() {
  const metaConfigured = !!(process.env.META_APP_ID && process.env.META_APP_SECRET)
  return (
    <Suspense fallback={null}>
      <SocialPageClient metaConfigured={metaConfigured} />
    </Suspense>
  )
}
