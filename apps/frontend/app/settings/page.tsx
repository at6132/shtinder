'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'

export default function SettingsPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      return res.data
    },
  })

  const preferences = profile?.preferences || {
    ageRange: { min: 18, max: 99 },
    gender: 'both',
    maxDistanceKm: 100,
    interestsPriority: false,
    showMyAge: true,
    showMyDistance: true,
  }

  const [ageMin, setAgeMin] = useState(preferences.ageRange?.min || 18)
  const [ageMax, setAgeMax] = useState(preferences.ageRange?.max || 99)
  const [gender, setGender] = useState(preferences.gender || 'both')
  const [maxDistance, setMaxDistance] = useState(preferences.maxDistanceKm || 100)

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.put('/users/update', {
        preferences: {
          ageRange: { min: ageMin, max: ageMax },
          gender,
          maxDistanceKm: maxDistance,
          interestsPriority: preferences.interestsPriority,
          showMyAge: preferences.showMyAge,
          showMyDistance: preferences.showMyDistance,
        },
      })
    },
  })

  const handleSave = () => {
    updateMutation.mutate({})
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Range
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(parseInt(e.target.value))}
                min="18"
                max="99"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <span>to</span>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(parseInt(e.target.value))}
                min="18"
                max="99"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show Me
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="both">Everyone</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Distance (km)
            </label>
            <input
              type="number"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              min="1"
              max="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

