'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users')

  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get('/admin/users')
      return res.data
    },
    enabled: activeTab === 'users',
  })

  const { data: matches } = useQuery({
    queryKey: ['admin', 'matches'],
    queryFn: async () => {
      const res = await api.get('/admin/matches')
      return res.data
    },
    enabled: activeTab === 'matches',
  })

  const { data: reports } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const res = await api.get('/admin/reports')
      return res.data
    },
    enabled: activeTab === 'reports',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'users' ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'matches' ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            Matches
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'reports' ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            Reports
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Age</th>
                  <th className="px-4 py-2 text-left">Admin</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.age}</td>
                    <td className="px-4 py-2">{user.isAdmin ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="bg-white rounded-lg shadow p-4">
            {matches?.map((match: any) => (
              <div key={match.id} className="border-b py-4">
                <p>
                  {match.user1.name} ↔ {match.user2.name}
                </p>
                <Link
                  href={`/admin/chats/${match.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  View Chat
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-4">
            {reports?.map((report: any) => (
              <div key={report.id} className="border-b py-4">
                <p>
                  <strong>Reporter:</strong> {report.reporter.name}
                </p>
                <p>
                  <strong>Target:</strong> {report.target.name}
                </p>
                <p>
                  <strong>Reason:</strong> {report.reason}
                </p>
                {!report.resolved && (
                  <button className="mt-2 text-primary hover:underline">
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

