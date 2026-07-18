import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db/prisma"

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

export async function requireSession() {
  const user = await getSession()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

export async function getOrCreateDbUser(supabaseUser: { id: string; email?: string | null }) {
  const existing = await prisma.user.findUnique({ where: { id: supabaseUser.id } })
  if (existing) return existing

  return prisma.user.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
    },
  })
}
