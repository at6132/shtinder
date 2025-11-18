'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import Image from 'next/image'

export default function OnboardingPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [step, setStep] = useState(1)
  const [bio, setBio] = useState('')
  const [height, setHeight] = useState<number | undefined>()
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await api.post('/users/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPhotos([...photos, response.data.url])
    } catch (error) {
      alert('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      // Update profile
      try {
        const response = await api.put('/users/update', {
          bio,
          height,
        })
        updateUser(response.data)
        router.push('/swipe')
      } catch (error) {
        alert('Failed to update profile')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>

        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Add Photos (at least 1)
            </label>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
              {photos.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  ) : (
                    <span className="text-4xl text-gray-400">+</span>
                  )}
                </label>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={photos.length === 0}
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={height || ''}
                onChange={(e) => setHeight(parseInt(e.target.value) || undefined)}
                min="100"
                max="250"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold"
            >
              Complete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

