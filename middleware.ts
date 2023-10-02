
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth/middleware"

export function middleware(request: NextRequest) {
  const { cookies } = request;

  // Check if both cookies are not present
  if (!cookies.has('token') && !cookies.has('next-auth.session-token')) {
    // Redirect the user to landing page
    return NextResponse.redirect('https://bestdb.vercel.app');
  }

  const res = NextResponse.next()

    // add the CORS headers to the response
    res.headers.append('Access-Control-Allow-Credentials', "true")
    res.headers.append('Access-Control-Allow-Origin', '*') // replace this your actual origin
    res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
    res.headers.append(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    return res
}
 

export const config = {
  matcher: '/dashboard',
}