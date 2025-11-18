'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { useState } from 'react'
import Image from 'next/image'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      return res.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.put('/users/update', data)
    },
    onSuccess: (response) => {
      updateUser(response.data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [height, setHeight] = useState(profile?.height || '')

  const handleSave = () => {
    updateMutation.mutate({
      name,
      bio,
      height: height ? parseInt(height) : undefined,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos
            </label>
            <div className="grid grid-cols-3 gap-4">
              {profile?.photos?.map((photo: any) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={photo.url} alt="Photo" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

