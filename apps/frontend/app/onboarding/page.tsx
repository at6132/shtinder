'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import Image from 'next/image'
import { Camera, ChevronRight, Sparkles, User, Ruler } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [step, setStep] = useState(1)
  const [bio, setBio] = useState('')
  const [height, setHeight] = useState<number | undefined>()
  const [photos, setPhotos] = useState<string[]>([])
  const [boyType, setBoyType] = useState<string>('')
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [isExistingUser, setIsExistingUser] = useState(false)

  // Check if user is logged in (existing user completing onboarding) or has temp registration data
  useEffect(() => {
    if (user && !user.onboardingComplete) {
      // Existing user who needs to complete onboarding
      setIsExistingUser(true)
      setBio(user.bio || '')
      setHeight(user.height)
    } else {
      // New registration flow
      const tempReg = localStorage.getItem('tempRegistration')
      if (tempReg) {
        setRegistrationData(JSON.parse(tempReg))
      } else if (!user) {
        // No user and no registration data - redirect to register
        router.push('/auth/register')
      }
    }
  }, [router, user])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Store file temporarily - will upload after account creation
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotos([...photos, reader.result as string])
    }
    reader.readAsDataURL(file)
  }

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      // Complete onboarding - create account in database
      if (!registrationData) {
        alert('Registration data missing. Please register again.')
        router.push('/auth/register')
        return
      }

      try {
        // Create the account with all onboarding data
        const response = await api.post('/auth/complete-onboarding', {
          ...registrationData,
          bio,
          height,
          preferences: {
            ageRange: { min: 14, max: 99 },
            gender: 'both',
            interestsPriority: false,
            showMyAge: true,
            showMyDistance: true,
            lookingFor: boyType,
          },
        })

        const { user, accessToken, refreshToken } = response.data
        setAuth(user, accessToken, refreshToken)

        // Upload photos after account creation
        // Photos are stored as data URLs, need to convert and upload
        for (const photoDataUrl of photos) {
          try {
            // Convert data URL to blob
            const response = await fetch(photoDataUrl)
            const blob = await response.blob()
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
            
            const formData = new FormData()
            formData.append('photo', file)
            
            await api.post('/users/upload-photo', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
          } catch (error) {
            console.error('Failed to upload photo:', error)
          }
        }

        // Clear temp data
        localStorage.removeItem('tempRegistration')
        localStorage.removeItem('tempToken')

        router.push('/swipe')
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to complete onboarding')
      }
    }
  }

  const getLookingForLabel = () => {
    if (registrationData?.gender === 'female') {
      return 'What boy do you want?'
    } else if (registrationData?.gender === 'male') {
      return 'What girl do you want?'
    } else {
      return 'What are you looking for?'
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-soft-love-gradient flex items-center justify-center p-4 py-8">
      <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 w-full max-w-2xl border border-neutral-light-grey">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s
                      ? 'bg-flame-gradient text-white shadow-lg'
                      : 'bg-neutral-light-grey text-neutral-medium-grey'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all ${
                      step > s ? 'bg-flame-gradient' : 'bg-neutral-light-grey'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-neutral-near-black">
          Complete Your Profile
        </h1>
        <p className="text-center text-neutral-medium-grey mb-6 md:mb-8 text-sm md:text-base">
          Step {step} of 3
        </p>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-dark-grey mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-purple" />
                Add Photos (optional)
              </label>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden group">
                    <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 md:top-2 md:right-2 bg-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 group-active:opacity-100 transition-opacity touch-manipulation"
                      aria-label="Remove photo"
                    >
                      <span className="text-xs md:text-sm">×</span>
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <label className="aspect-square border-2 border-dashed border-neutral-light-grey rounded-lg md:rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-purple hover:bg-neutral-light-grey active:bg-neutral-light-grey transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Camera className="w-6 h-6 md:w-8 md:h-8 text-neutral-medium-grey group-hover:text-primary-purple mb-1 md:mb-2" />
                    <span className="text-xs text-neutral-medium-grey">Add Photo</span>
                  </label>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-flame-gradient text-white py-3 md:py-3.5 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 touch-manipulation"
            >
              Next <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-dark-grey mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-purple" />
                {getLookingForLabel()}
              </label>
              <select
                value={boyType}
                onChange={(e) => setBoyType(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
              >
                <option value="">Select an option</option>
                <option value="shtark">SHtark</option>
                <option value="yshivish">Yshivish</option>
                <option value="modern">Modern</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-neutral-light-grey text-neutral-dark-grey py-3 rounded-xl font-semibold hover:bg-neutral-medium-grey active:bg-neutral-medium-grey transition-all touch-manipulation"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!boyType}
                className="flex-1 bg-flame-gradient text-white py-3 md:py-3.5 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
              >
                Next <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-dark-grey mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-purple" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-off-white transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-dark-grey mb-2 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary-purple" />
                Height (cm)
              </label>
              <input
                type="number"
                value={height || ''}
                onChange={(e) => setHeight(parseInt(e.target.value) || undefined)}
                min="100"
                max="250"
                className="w-full px-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
                placeholder="e.g. 175"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-neutral-light-grey text-neutral-dark-grey py-3 rounded-xl font-semibold hover:bg-neutral-medium-grey active:bg-neutral-medium-grey transition-all touch-manipulation"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-flame-gradient text-white py-3 md:py-3.5 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 touch-manipulation"
              >
                Complete <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
