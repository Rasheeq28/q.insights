import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/datasets';

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data?.session?.user) {
            const { user } = data.session;

            // Sync user to public.users table
            // We ignore errors here in case user already exists or if there's a trigger handling it
            await supabase.from('users').upsert({
                id: user.id,
                email: user.email,
                created_at: new Date().toISOString(),
            }, { onConflict: 'id', ignoreDuplicates: true });

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/signin?error=auth-code-error`);
}
