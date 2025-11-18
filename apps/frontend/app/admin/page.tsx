'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users,
  Heart,
  Flag,
  FileText,
  Shield,
  Trash2,
  Eye,
  Ban,
  MessageSquare,
  X,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Search,
  Filter,
  Download,
  LogOut,
  Lock,
  Sparkles,
} from 'lucide-react'

const ADMIN_PASSWORD = 'Taub6132'

export default function AdminDashboard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Check if already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
      setPasswordError('')
    } else {
      setPasswordError('Incorrect password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    router.push('/')
  }

  // Fetch all data with admin password header
  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get('/admin/users', {
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      })
      return res.data
    },
    enabled: isAuthenticated,
  })

  const { data: matches } = useQuery({
    queryKey: ['admin', 'matches'],
    queryFn: async () => {
      const res = await api.get('/admin/matches', {
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      })
      return res.data
    },
    enabled: isAuthenticated,
  })

  const { data: reports } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const res = await api.get('/admin/reports', {
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      })
      return res.data
    },
    enabled: isAuthenticated,
  })

  const { data: logs } = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: async () => {
      const res = await api.get('/admin/logs', {
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      })
      return res.data
    },
    enabled: isAuthenticated && activeTab === 'logs',
  })

  // Mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.delete(`/admin/users/${userId}`, {
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const resolveReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      return api.post(
        '/admin/reports/resolve',
        { reportId },
        {
          headers: {
            'x-admin-password': ADMIN_PASSWORD,
          },
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    },
  })

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-soft-love-gradient flex items-center justify-center p-4">
        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md border border-neutral-light-grey">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-premium-gradient rounded-full mb-4">
              <Shield className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-near-black mb-2">
              Admin Access
            </h1>
            <p className="text-neutral-dark-grey text-sm md:text-base">
              Enter password to access admin dashboard
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-dark-grey mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary-purple" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                className="w-full px-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
                placeholder="Enter admin password"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-premium-gradient text-white py-3 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Calculate stats
  const stats = {
    totalUsers: users?.length || 0,
    totalMatches: matches?.length || 0,
    activeReports: reports?.filter((r: any) => !r.resolved).length || 0,
    completedOnboarding: users?.filter((u: any) => u.onboardingComplete).length || 0,
  }

  // Filter users by search
  const filteredUsers = users?.filter((user: any) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-soft-love-gradient p-4 pt-20 md:pt-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 mb-6 border border-neutral-light-grey">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-premium-gradient rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-near-black">
                  Admin Dashboard
                </h1>
                <p className="text-neutral-dark-grey text-sm md:text-base">
                  Manage users, matches, and reports
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-xl font-semibold hover:bg-red-600 active:bg-red-700 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg p-4 border border-neutral-light-grey">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-primary-purple" />
              <span className="text-xs md:text-sm text-neutral-dark-grey">Users</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-near-black">{stats.totalUsers}</p>
            <p className="text-xs text-neutral-medium-grey mt-1">
              {stats.completedOnboarding} completed onboarding
            </p>
          </div>

          <div className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg p-4 border border-neutral-light-grey">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary-pink" />
              <span className="text-xs md:text-sm text-neutral-dark-grey">Matches</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-near-black">{stats.totalMatches}</p>
          </div>

          <div className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg p-4 border border-neutral-light-grey">
            <div className="flex items-center justify-between mb-2">
              <Flag className="w-5 h-5 md:w-6 md:h-6 text-error" />
              <span className="text-xs md:text-sm text-neutral-dark-grey">Reports</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-near-black">
              {stats.activeReports}
            </p>
            <p className="text-xs text-neutral-medium-grey mt-1">Active</p>
          </div>

          <div className="bg-neutral-white rounded-xl md:rounded-2xl shadow-lg p-4 border border-neutral-light-grey">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary-flame" />
              <span className="text-xs md:text-sm text-neutral-dark-grey">Activity</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-near-black">
              {logs?.length || 0}
            </p>
            <p className="text-xs text-neutral-medium-grey mt-1">Log entries</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 mb-6 border border-neutral-light-grey">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'matches', label: 'Matches', icon: Heart },
              { id: 'reports', label: 'Reports', icon: Flag },
              { id: 'logs', label: 'Logs', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-premium-gradient text-white shadow-lg'
                      : 'bg-neutral-light-grey text-neutral-dark-grey hover:bg-neutral-medium-grey'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search Bar (for users tab) */}
          {activeTab === 'users' && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-medium-grey" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-near-black mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-purple" />
                    Recent Users
                  </h2>
                  <div className="space-y-2">
                    {users?.slice(0, 5).map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-3 bg-neutral-light-grey rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary-purple/20 flex items-center justify-center">
                          <span className="text-primary-purple font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-near-black">{user.name}</p>
                          <p className="text-sm text-neutral-dark-grey">{user.email}</p>
                        </div>
                        {user.isAdmin && (
                          <span className="px-2 py-1 bg-premium-gradient text-white text-xs font-bold rounded-lg">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-light-grey">
                      <th className="text-left p-3 text-sm font-semibold text-neutral-dark-grey">User</th>
                      <th className="text-left p-3 text-sm font-semibold text-neutral-dark-grey">Email</th>
                      <th className="text-left p-3 text-sm font-semibold text-neutral-dark-grey">Age</th>
                      <th className="text-left p-3 text-sm font-semibold text-neutral-dark-grey">Status</th>
                      <th className="text-left p-3 text-sm font-semibold text-neutral-dark-grey">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers?.map((user: any) => (
                      <tr key={user.id} className="border-b border-neutral-light-grey hover:bg-neutral-light-grey/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-purple/20 flex items-center justify-center">
                              <span className="text-primary-purple font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-semibold text-neutral-near-black">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-neutral-dark-grey">{user.email}</td>
                        <td className="p-3 text-sm text-neutral-dark-grey">{user.age}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-premium-gradient text-white text-xs font-bold rounded">
                                Admin
                              </span>
                            )}
                            {user.onboardingComplete ? (
                              <span className="px-2 py-1 bg-success text-white text-xs font-bold rounded">
                                Complete
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-warning text-white text-xs font-bold rounded">
                                Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                              className="p-2 bg-primary-purple text-white rounded-lg hover:bg-primary-pink transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete user ${user.name}?`)) {
                                  deleteUserMutation.mutate(user.id)
                                }
                              }}
                              className="p-2 bg-error text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'matches' && (
              <div className="space-y-3">
                {matches?.map((match: any) => (
                  <div
                    key={match.id}
                    className="p-4 bg-neutral-light-grey rounded-xl border border-neutral-light-grey hover:border-primary-purple transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Heart className="w-5 h-5 text-primary-pink" />
                        <div>
                          <p className="font-semibold text-neutral-near-black">
                            {match.user1?.name} ↔ {match.user2?.name}
                          </p>
                          <p className="text-sm text-neutral-dark-grey">
                            Matched {new Date(match.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/chats/${match.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-pink transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        View Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-3">
                {reports?.map((report: any) => (
                  <div
                    key={report.id}
                    className={`p-4 rounded-xl border ${
                      report.resolved
                        ? 'bg-neutral-light-grey border-neutral-light-grey'
                        : 'bg-error/10 border-error/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Flag className={`w-5 h-5 ${report.resolved ? 'text-neutral-medium-grey' : 'text-error'}`} />
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          report.resolved
                            ? 'bg-neutral-medium-grey text-white'
                            : 'bg-error text-white'
                        }`}>
                          {report.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </div>
                      {!report.resolved && (
                        <button
                          onClick={() => {
                            if (confirm('Resolve this report?')) {
                              resolveReportMutation.mutate(report.id)
                            }
                          }}
                          className="px-3 py-1 bg-success text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold text-neutral-near-black">Reporter:</span>{' '}
                        <span className="text-neutral-dark-grey">{report.reporter?.name}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-neutral-near-black">Target:</span>{' '}
                        <span className="text-neutral-dark-grey">{report.target?.name}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-neutral-near-black">Reason:</span>{' '}
                        <span className="text-neutral-dark-grey">{report.reason}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-2">
                {logs?.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-4 bg-neutral-light-grey rounded-xl border border-neutral-light-grey"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-neutral-near-black">{log.action}</span>
                      <span className="text-xs text-neutral-dark-grey">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-dark-grey">
                      Admin: {log.admin?.name || 'System'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
