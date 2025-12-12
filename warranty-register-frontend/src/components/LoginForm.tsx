import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { loginUser, saveToken } from "../lib/api"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess(data) {
      if (data?.access_token) {
        saveToken(data.access_token)
        onSuccess?.()
        router.push('/warranties')
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      return
    }
    mutation.mutate({ username, password })
  }

  return (
    <div className="login-form-container">
      <div className="form-card">
        <h1>Warranty Register Login</h1>
        <p className="subtitle">Access registered warranties</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={mutation.isPending}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={mutation.isPending}
              required
            />
          </div>

          <button type="submit" disabled={mutation.isPending} className="submit-btn">
            {mutation.isPending ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {mutation.isError && (
          <div className="error-message">
            {mutation.error instanceof Error ? mutation.error.message : 'Login failed'}
          </div>
        )}

        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up here</a>
        </p>
      </div>

      <style jsx>{`
        .login-form-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 16px;
        }

        .form-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          padding: 40px;
          width: 100%;
          max-width: 420px;
        }

        h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
        }

        .subtitle {
          margin: 0 0 32px 0;
          color: #718096;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #2d3748;
          font-size: 14px;
        }

        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        input:disabled {
          background-color: #f7fafc;
          cursor: not-allowed;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: opacity 0.2s;
          margin-top: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 16px;
          padding: 12px;
          background-color: #fed7d7;
          color: #c53030;
          border-radius: 6px;
          font-size: 14px;
          border-left: 4px solid #c53030;
        }

        .signup-link {
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
          color: #718096;
        }

        .signup-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
