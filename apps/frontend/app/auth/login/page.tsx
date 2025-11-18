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

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    window.location.href = `${apiUrl}/auth/google`
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

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-light-grey"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-white text-neutral-dark-grey">Or continue with</span>
            </div>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full mt-4 bg-neutral-light-grey border-2 border-neutral-light-grey text-neutral-near-black py-3 rounded-xl font-semibold hover:bg-neutral-white hover:border-primary-purple transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

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
