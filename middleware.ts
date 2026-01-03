import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. If not logged in, kick to login
  if (!user && request.nextUrl.pathname.startsWith('/affiliate')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If logged in, CHECK ROLE
  if (user) {
    // Fetch user role from your 'users' table
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const role = dbUser?.role

    // PREVENT AFFILIATES FROM SEEING ADMIN PAGES
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin' && role !== 'sales_manager') {
      return NextResponse.redirect(new URL('/affiliate/dashboard', request.url))
    }

    // PREVENT ADMINS FROM ACCIDENTALLY USING THE AFFILIATE VIEW (Optional)
    // if (request.nextUrl.pathname.startsWith('/affiliate') && role === 'admin') {
    //   return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    // }
  }

  return response
}

export const config = {
  matcher: ['/affiliate/:path*', '/admin/:path*'],
}