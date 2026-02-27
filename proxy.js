
import {updateSession  } from '@/utils/supabase/middleware.js'

export async function proxy(request) {
  // update user's auth session
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}