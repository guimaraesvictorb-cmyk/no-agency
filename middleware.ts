import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { rateLimit, getIp } from "@/lib/security/rate-limit"

// ─── Route classification ────────────────────────────────────────────────────
const PUBLIC_PATHS = ["/", "/login", "/aprovacao"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

// ─── Rate limit configs ──────────────────────────────────────────────────────
// Login: 30 tentativas/min por IP (inclui redirects automáticos do browser)
// API:   120 req/min por IP
// Global: 300 req/min por IP (guarda contra bots/DDoS)
const LIMITS = {
  login:  { limit: 30,  windowMs: 60_000 },
  api:    { limit: 120, windowMs: 60_000 },
  global: { limit: 300, windowMs: 60_000 },
}

function tooManyRequests(retryAfter: number) {
  return new NextResponse(
    JSON.stringify({ error: "Muitas requisições. Tente novamente em breve." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  )
}

// ─── Main middleware ─────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getIp(request)

  // 1. Global bot/DDoS guard — every route
  const globalRl = rateLimit(`g:${ip}`, LIMITS.global.limit, LIMITS.global.windowMs)
  if (!globalRl.allowed) return tooManyRequests(globalRl.retryAfter)

  // 2. Stricter limit on login page (anti brute-force)
  if (pathname === "/login") {
    const rl = rateLimit(`login:${ip}`, LIMITS.login.limit, LIMITS.login.windowMs)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)
  }

  // 3. API-specific limit
  if (pathname.startsWith("/api/")) {
    const rl = rateLimit(`api:${ip}`, LIMITS.api.limit, LIMITS.api.windowMs)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)
  }

  // 4. Supabase session validation
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 5. Protect authenticated routes
  if (!user && !isPublicPath(pathname) && !pathname.startsWith("/api/")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // 6. Redirect logged-in users away from login
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // 7. Expose rate-limit state in response headers
  supabaseResponse.headers.set("X-RateLimit-Remaining", String(globalRl.remaining))
  supabaseResponse.headers.set("X-RateLimit-Reset", String(Math.ceil(globalRl.resetAt / 1000)))

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
