import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookies: any[]) {
                        cookies.forEach(({ name, value, options }) => {
                            response.cookies.set(name, value, options);
                        });
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const pathname = request.nextUrl.pathname;

        // Protected routes
        const protectedPaths = ["/admin", "/dashboard", "/profile", "/following", "/discover"];

        if (protectedPaths.some((p) => pathname.startsWith(p))) {
            if (!user) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }

        // Auth routes
        if (pathname === "/login" || pathname === "/register") {
            if (user) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        }

        return response;
    } catch (error) {
        console.error("Middleware crash:", error);

        // 🔥 IMPORTANT: fail gracefully
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};