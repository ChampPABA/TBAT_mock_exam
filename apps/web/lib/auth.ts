import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "./db"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = signInSchema.parse(credentials)
          
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          })

          if (!user || !user.password_hash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(password, user.password_hash)
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.thai_name || user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
        
        // Fetch additional user data for session
        const userData = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            package_type: true,
            is_upgraded: true,
            thai_name: true,
            pdpa_consent: true,
          },
        })
        
        if (userData) {
          session.user.package_type = userData.package_type
          session.user.is_upgraded = userData.is_upgraded
          session.user.thai_name = userData.thai_name
          session.user.pdpa_consent = userData.pdpa_consent
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      package_type: "FREE" | "ADVANCED"
      is_upgraded: boolean
      thai_name?: string | null
      pdpa_consent: boolean
    }
  }
}

