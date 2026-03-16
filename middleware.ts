import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            // Enforce 1 hour max cookie lifetime
                            maxAge: 3600,
                        })
                    );
                },
            },
        }
    );

    // Try getUser() first — it validates the JWT with Supabase Auth server.
    // If it fails (e.g. network timeout), fall back to getSession() so
    // we don't block the request with a false 401.
    let user = null;
    try {
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
            user = data.user;
        } else if (error) {
            // getUser() failed (timeout, network error, etc.)
            // Fall back to getSession() which reads the local JWT cookie
            console.warn('Middleware getUser() failed, falling back to getSession():', error.message);
            const { data: sessionData } = await supabase.auth.getSession();
            user = sessionData?.session?.user ?? null;
        }
    } catch (err) {
        // Unexpected fetch error (ConnectTimeoutError, etc.)
        console.warn('Middleware auth check failed, falling back to getSession():', err);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            user = sessionData?.session?.user ?? null;
        } catch {
            // Complete failure — proceed without user
        }
    }

    // If the user is not signed in and trying to access protected routes,
    // redirect to login
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
