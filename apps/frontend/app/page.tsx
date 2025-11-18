'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useEffect } from 'react'
import { Heart, MapPin, Sparkles, Users } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  // Redirect authenticated users to swipe page
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        router.push('/admin')
      } else if (!user.onboardingComplete) {
        router.push('/onboarding')
      } else {
        router.push('/swipe')
      }
    }
  }, [user, router])

  const popularLocations = [
    {
      name: 'Slev',
      address: '7-Eleven, 16A Main Ave, Clifton, NJ 07014',
      icon: MapPin,
    },
    {
      name: 'The Pit',
      address: 'Big bubble thing off alwood',
      icon: MapPin,
    },
    {
      name: 'Aisle one.',
      address: '',
      icon: MapPin,
    },
  ]

  return (
    <div className="min-h-screen bg-soft-love-gradient">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/20 via-primary-pink/10 to-primary-flame/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-flame-gradient rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-flame-gradient p-4 md:p-6 rounded-full">
                  <Heart className="w-12 h-12 md:w-16 md:h-16 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-primary-purple via-primary-pink to-primary-flame bg-clip-text text-transparent">
                Shtinder!
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-neutral-dark-grey mb-8 md:mb-12 font-medium">
              Making shidduchim in Passaic easier.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-12 md:mb-16">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-flame-gradient text-white rounded-xl md:rounded-2xl font-bold text-lg md:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 touch-manipulation"
              >
                <Users className="w-5 h-5 md:w-6 md:h-6" />
                Sign Up
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-neutral-white text-neutral-near-black rounded-xl md:rounded-2xl font-bold text-lg md:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-primary-purple/20 hover:border-primary-purple/40 flex items-center justify-center gap-2 touch-manipulation"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary-purple" />
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Meeting Locations Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-neutral-near-black mb-2 md:mb-4 flex items-center justify-center gap-3">
            <MapPin className="w-6 h-6 md:w-8 md:h-8 text-primary-purple" />
            Popular Meeting Locations
          </h2>
          <p className="text-neutral-medium-grey text-sm md:text-base">
            Where connections happen in Passaic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {popularLocations.map((location, index) => {
            const Icon = location.icon
            return (
              <div
                key={index}
                className="bg-neutral-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-neutral-light-grey/50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-primary-purple/10 p-3 rounded-lg">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary-purple" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-neutral-near-black mb-2">
                      {location.name}
                    </h3>
                    {location.address && (
                      <p className="text-sm md:text-base text-neutral-dark-grey leading-relaxed">
                        {location.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-light-grey/30 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-neutral-medium-grey text-sm md:text-base">
            © {new Date().getFullYear()} Shtinder. Making shidduchim easier, one swipe at a time.
          </p>
        </div>
      </div>
    </div>
  )
}
