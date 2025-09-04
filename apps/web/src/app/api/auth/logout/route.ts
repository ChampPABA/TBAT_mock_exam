import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    const cookieStore = cookies()
    
    cookieStore.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/"
    })

    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url))

  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}