"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchWarranties, loadToken, clearToken } from "../../lib/api"
import { useRouter } from "next/navigation"

export default function WarrantiesPage() {
  const router = useRouter()
  const token = loadToken()

  const { data, isLoading, isError, error, refetch } = useQuery(
    ["warranties"],
    () => fetchWarranties(token),
    {
      enabled: !!token,
      retry: false,
    }
  )

  if (!token) {
    return (
      <div className="container">
        <p>You are not logged in.</p>
        <button onClick={() => router.push('/login')}>Go to login</button>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Warranties</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { clearToken(); router.push('/login') }}>Logout</button>
        <button onClick={() => refetch()} style={{ marginLeft: 8 }}>Refresh</button>
      </div>

      {isLoading && <div>Loading warranties...</div>}
      {isError && <div style={{ color: 'crimson' }}>Error: {error instanceof Error ? error.message : String(error)}</div>}

      {data && data.data && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Asset ID</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Asset Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>User ID</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Registered At</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((w: any) => (
              <tr key={w.id}>
                <td style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f0' }}>{w.id}</td>
                <td style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f0' }}>{w.asset_id}</td>
                <td style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f0' }}>{w.asset_name}</td>
                <td style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f0' }}>{w.user_id}</td>
                <td style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f0' }}>{w.registered_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .container { max-width:900px; margin:32px auto; padding:12px }
        button { padding:8px 10px }
      `}</style>
    </div>
  )
}
