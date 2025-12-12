"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { registerUser } from "../../lib/api"

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => router.push('/login')
  })

  return (
    <div className="container">
      <h1>Sign Up</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate({ username, password })
        }}
      >
        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Sign Up'}
        </button>
      </form>

      {mutation.isError && <div className="error">Error: {mutation.error instanceof Error ? mutation.error.message : String(mutation.error)}</div>}

      <style jsx>{`
        .container { max-width:420px; margin:48px auto; padding:16px }
        label { display:block; margin-top:12px }
        input { width:100%; padding:8px; margin-top:6px }
        button { margin-top:16px; padding:8px 12px }
        .error { color:crimson; margin-top:12px }
      `}</style>
    </div>
  )
}
