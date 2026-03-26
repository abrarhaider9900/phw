import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return supabaseResponse;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet: any[]) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({ request });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const pathname = request.nextUrl.pathname;

        // Admin routes
        if (pathname.startsWith("/admin")) {
            if (!user) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }

        // User routes
        const userOnlyPaths = ["/dashboard", "/profile", "/following", "/discover"];
        if (userOnlyPaths.some((p) => pathname.startsWith(p))) {
            if (!user) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }

        // Auth pages
        if (pathname === "/login" || pathname === "/register") {
            if (user) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        }
    } catch (error) {
        console.error("Middleware error:", error);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
