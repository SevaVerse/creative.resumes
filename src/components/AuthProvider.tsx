'use client'

import { createContext, useContext, useMemo } from 'react'
import { SessionProvider, signIn, signOut as authSignOut, useSession } from 'next-auth/react'

export interface AuthUser {
  id: string
  email: string | null
  name: string | null
  image: string | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const value = useMemo<AuthContextType>(() => {
    const u = session?.user
    const user: AuthUser | null = u?.id
      ? { id: u.id, email: u.email ?? null, name: u.name ?? null, image: u.image ?? null }
      : null
    const callbackUrl = typeof window !== 'undefined' ? window.location.href : '/'
    return {
      user,
      loading: status === 'loading',
      signInWithGoogle: async () => { await signIn('google', { callbackUrl }) },
      signInWithGithub: async () => { await signIn('github', { callbackUrl }) },
      signOut: async () => { await authSignOut({ callbackUrl: '/' }) },
    }
  }, [session, status])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AuthBridge>{children}</AuthBridge>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
