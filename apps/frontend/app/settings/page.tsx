'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Users, Calendar, Heart } from 'lucide-react'

export default function SettingsPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      return res.data
    },
  })

  const preferences = profile?.preferences || {
    ageRange: { min: 14, max: 99 },
    gender: 'both',
    interestsPriority: false,
    showMyAge: true,
    showMyDistance: true,
  }

  const [ageMin, setAgeMin] = useState(preferences.ageRange?.min || 14)
  const [ageMax, setAgeMax] = useState(preferences.ageRange?.max || 99)
  const [gender, setGender] = useState(preferences.gender || 'both')

  useEffect(() => {
    if (preferences) {
      setAgeMin(preferences.ageRange?.min || 14)
      setAgeMax(preferences.ageRange?.max || 99)
      setGender(preferences.gender || 'both')
    }
  }, [preferences])

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.put('/users/update', {
        preferences: {
          ageRange: { min: ageMin, max: ageMax },
          gender,
          interestsPriority: preferences.interestsPriority,
          showMyAge: preferences.showMyAge,
          showMyDistance: preferences.showMyDistance,
        },
      })
    },
    onSuccess: () => {
      alert('Settings saved successfully!')
    },
  })

  const handleSave = () => {
    updateMutation.mutate({})
  }

  return (
    <div className="min-h-screen bg-soft-love-gradient p-4 pt-20 md:pt-4 pb-20 md:pb-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-neutral-near-black mb-2 flex items-center gap-2 md:gap-3">
            <SettingsIcon className="w-6 h-6 md:w-10 md:h-10 text-primary-purple" />
            Settings
          </h1>
          <p className="text-neutral-dark-grey text-sm md:text-base">Customize your discovery preferences</p>
        </div>

        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 space-y-4 md:space-y-6 border border-neutral-light-grey">
          {/* Age Range */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark-grey mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-purple" />
              Age Range
            </label>
            <div className="flex gap-2 md:gap-4 items-center">
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(parseInt(e.target.value) || 14)}
                min="14"
                max="99"
                className="flex-1 md:w-32 px-3 md:px-4 py-2.5 md:py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all text-sm md:text-base"
              />
              <span className="text-neutral-dark-grey font-medium text-sm md:text-base">to</span>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(parseInt(e.target.value) || 99)}
                min="14"
                max="99"
                className="flex-1 md:w-32 px-3 md:px-4 py-2.5 md:py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all text-sm md:text-base"
              />
            </div>
            <p className="text-xs text-neutral-dark-grey mt-2">
              Show me people between {ageMin} and {ageMax} years old
            </p>
          </div>

          {/* Show Me */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark-grey mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-purple" />
              Show Me
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
            >
              <option value="both">Everyone</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
            </select>
            <p className="text-xs text-neutral-dark-grey mt-2">
              {gender === 'both' ? 'Show me everyone' : gender === 'male' ? 'Show me men' : 'Show me women'}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-flame-gradient text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
