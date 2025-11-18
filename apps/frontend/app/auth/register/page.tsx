'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, User, Calendar, Users } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await api.post('/auth/register', data)
      // Store registration data temporarily - account not created yet
      localStorage.setItem('tempRegistration', JSON.stringify(response.data.registrationData))
      localStorage.setItem('tempToken', response.data.tempToken)
      router.push('/onboarding')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-love-gradient p-4 py-8 md:py-12">
      <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-neutral-light-grey">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <Image
              src="/logos/transdarkmode.png"
              alt="SHTINDER"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-neutral-near-black">
          Create Account
        </h1>
        <p className="text-center text-neutral-dark-grey mb-6 md:mb-8 text-sm md:text-base">
          Start your journey to find your match
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-dark-grey mb-2">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-medium-grey" />
              <input
                {...register('name')}
                type="text"
                className="w-full pl-11 pr-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
                placeholder="Your name"
              />
            </div>
            {errors.name && (
              <p className="text-error text-sm mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-dark-grey mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-medium-grey" />
              <input
                {...register('email')}
                type="email"
                className="w-full pl-11 pr-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-error text-sm mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-dark-grey mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-medium-grey" />
              <input
                {...register('password')}
                type="password"
                className="w-full pl-11 pr-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
                placeholder="Create a password"
              />
            </div>
            {errors.password && (
              <p className="text-error text-sm mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-dark-grey mb-2">
                Age
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-medium-grey" />
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  min="14"
                  max="100"
                  className="w-full pl-11 pr-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
                />
              </div>
              {errors.age && (
                <p className="text-error text-sm mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.age.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-dark-grey mb-2">
                Gender
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-medium-grey z-10" />
                <select
                  {...register('gender')}
                  className="w-full pl-11 pr-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-off-white transition-all appearance-none"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {errors.gender && (
                <p className="text-error text-sm mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-flame-gradient text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-neutral-dark-grey">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-purple font-bold hover:text-primary-pink transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
