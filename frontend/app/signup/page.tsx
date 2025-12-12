"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SignupCard } from "@/components/auth/signup-card"
import { useAuthStore } from "@/stores/auth-store"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuthStore()

  const handleCreateOrg = async (data: { name: string; email: string; password: string; orgName: string }) => {
    setIsLoading(true)
    try {
      await signup({ name: data.name, email: data.email, password: data.password })
      router.push("/login")
    } catch (error) {
      console.error("Signup failed:", error)
      setIsLoading(false)
    }
  }

  const handleJoinOrg = async (data: { name: string; email: string; password: string; orgId: string }) => {
    setIsLoading(true)
    try {
      await signup({ name: data.name, email: data.email, password: data.password })
      router.push("/login")
    } catch (error) {
      console.error("Signup failed:", error)
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const { authApi } = await import("@/lib/api/auth")
    authApi.googleAuth()
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 gradient-subtle" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="relative z-10 w-full max-w-md px-4">
        <SignupCard
          onCreateOrg={handleCreateOrg}
          onJoinOrg={handleJoinOrg}
          onGoogleSignUp={handleGoogleSignUp}
          isLoading={isLoading}
        />
      </div>
    </main>
  )
}
