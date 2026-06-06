import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
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

  // No agregar lógica entre createServerClient y getUser — necesario para refresco de tokens
  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage  = request.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = profile?.role ?? 'admin'

    if (isLoginPage) {
      const dest = role === 'vendedor' ? '/admin/ordenes' : '/admin'
      return NextResponse.redirect(new URL(dest, request.url))
    }

    if (role === 'vendedor') {
      const vendorPaths = ['/admin/ordenes', '/admin/analytics']
      const allowed = vendorPaths.some(p => request.nextUrl.pathname.startsWith(p))
      if (!allowed) {
        return NextResponse.redirect(new URL('/admin/ordenes', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
