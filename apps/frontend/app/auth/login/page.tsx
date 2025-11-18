'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await api.post('/auth/login', data)
      const { user, accessToken, refreshToken } = response.data
      setAuth(user, accessToken, refreshToken)

      if (user.isAdmin) {
        router.push('/admin')
      } else if (!user.onboardingComplete) {
        // Redirect to onboarding if not completed
        router.push('/onboarding')
      } else {
        router.push('/swipe')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed')
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-love-gradient p-4 py-8">
      <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-neutral-light-grey">
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <Image
              src="/logos/transdarkmode.png"
              alt="SHTINDER"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-neutral-near-black">
          Welcome Back
        </h1>
        <p className="text-center text-neutral-dark-grey mb-6 md:mb-8 text-sm md:text-base">
          Sign in to continue your journey
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
              />
            </div>
            {errors.password && (
              <p className="text-error text-sm mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-flame-gradient text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-neutral-dark-grey">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary-purple font-bold hover:text-primary-pink transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
