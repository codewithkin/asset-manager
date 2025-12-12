"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchWarranties, loadToken, clearToken } from "../../lib/api"
import { useRouter } from "next/navigation"

interface Warranty {
  id: number
  asset_id: string
  asset_name: string
  user_id: string
  registered_at: string
}

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

  const handleLogout = () => {
    clearToken()
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="warranties-container">
      <header className="header">
        <div className="header-content">
          <h1>Warranty Register</h1>
          <p className="subtitle">View all registered asset warranties</p>
        </div>
        <div className="header-actions">
          <button onClick={() => refetch()} className="refresh-btn">
            Refresh
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="content">
        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading warranties...</p>
          </div>
        )}

        {isError && (
          <div className="error-box">
            <p>Error: {error instanceof Error ? error.message : 'Failed to load warranties'}</p>
          </div>
        )}

        {data && data.data && data.data.length > 0 ? (
          <div className="table-wrapper">
            <table className="warranties-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asset ID</th>
                  <th>Asset Name</th>
                  <th>User ID</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((warranty: Warranty) => (
                  <tr key={warranty.id}>
                    <td>{warranty.id}</td>
                    <td className="asset-id">{warranty.asset_id}</td>
                    <td className="asset-name">{warranty.asset_name}</td>
                    <td className="user-id">{warranty.user_id}</td>
                    <td className="timestamp">{formatDate(warranty.registered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <p>Total warranties: {data.data.length}</p>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No warranties registered yet</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .warranties-container {
          min-height: 100vh;
          background-color: #f7fafc;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 32px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
        }

        .subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .refresh-btn,
        .logout-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .refresh-btn:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .logout-btn {
          background-color: #ef5350;
          color: white;
        }

        .logout-btn:hover {
          background-color: #e53935;
        }

        .content {
          padding: 32px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading,
        .error-box,
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-box {
          background-color: #fed7d7;
          color: #c53030;
          border-left: 4px solid #c53030;
        }

        .table-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .warranties-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .warranties-table thead {
          background-color: #f7fafc;
          border-bottom: 2px solid #e2e8f0;
        }

        .warranties-table th {
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #2d3748;
        }

        .warranties-table td {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          color: #4a5568;
        }

        .warranties-table tbody tr:hover {
          background-color: #f7fafc;
        }

        .asset-id,
        .user-id {
          font-family: monospace;
          color: #667eea;
          font-weight: 500;
        }

        .asset-name {
          font-weight: 500;
          color: #2d3748;
        }

        .timestamp {
          color: #718096;
          font-size: 13px;
        }

        .table-footer {
          padding: 16px;
          background-color: #f7fafc;
          border-top: 1px solid #e2e8f0;
          text-align: right;
          color: #718096;
          font-size: 14px;
        }

        .table-footer p {
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-content h1 {
            font-size: 24px;
          }

          .content {
            padding: 16px 12px;
          }

          .warranties-table {
            font-size: 12px;
          }

          .warranties-table th,
          .warranties-table td {
            padding: 12px 8px;
          }
        }
      `}</style>
    </div>
  )
}
