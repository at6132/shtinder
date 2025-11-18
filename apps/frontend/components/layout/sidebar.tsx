'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
  Heart, 
  Users, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Swipe', href: '/swipe', icon: Heart },
  { name: 'Matches', href: '/matches', icon: Users },
  { name: 'DMs', href: '/dms', icon: MessageCircle },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Don't show sidebar on auth pages
  const shouldShowSidebar = !(
    pathname?.startsWith('/auth') || 
    pathname === '/onboarding' || 
    pathname?.startsWith('/admin')
  )

  useEffect(() => {
    const main = document.querySelector('main.sidebar-layout')
    if (main) {
      if (shouldShowSidebar) {
        // Desktop: left margin, Mobile: no margin (handled by pb-20 for bottom nav)
        // The md:ml-20 class in layout.tsx handles desktop
      } else {
        main.classList.remove('ml-20', 'md:ml-20')
      }
    }
  }, [shouldShowSidebar])

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (!shouldShowSidebar) {
    return null
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-neutral-white shadow-xl z-50 flex-col items-center py-4 border-r border-neutral-light-grey">
        <Link href="/swipe" className="mb-6 hover:opacity-80 transition-opacity">
          <div className="relative w-12 h-12">
            <Image
              src="/logos/transdarkmode.png"
              alt="SHTINDER"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        <nav className="flex-1 flex flex-col gap-1 w-full px-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = 
              pathname === item.href || 
              (item.href === '/matches' && pathname?.startsWith('/chat')) ||
              (item.href === '/dms' && pathname?.startsWith('/chat'))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-flame-gradient text-white shadow-lg scale-105'
                    : 'text-neutral-dark-grey hover:bg-neutral-light-grey hover:text-primary-purple'
                )}
                title={item.name}
              >
                <Icon className={cn(
                  'w-5 h-5 mb-1 transition-transform',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )} />
                <span className={cn(
                  'text-xs font-semibold',
                  isActive ? 'text-white' : ''
                )}>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => {
            logout()
            window.location.href = '/auth/login'
          }}
          className="mt-auto text-neutral-medium-grey hover:text-error p-3 rounded-lg hover:bg-neutral-light-grey transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-white border-t border-neutral-light-grey z-50 safe-area-inset-bottom">
        <nav className="flex items-center justify-around px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = 
              pathname === item.href || 
              (item.href === '/matches' && pathname?.startsWith('/chat')) ||
              (item.href === '/dms' && pathname?.startsWith('/chat'))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[60px]',
                  isActive
                    ? 'text-primary-purple'
                    : 'text-neutral-medium-grey'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 mb-1',
                  isActive && 'scale-110'
                )} />
                <span className="text-xs font-semibold">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Top Bar with Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-neutral-white border-b border-neutral-light-grey z-40 safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/swipe" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logos/transdarkmode.png"
                alt="SHTINDER"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold text-neutral-near-black">SHTINDER</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-neutral-near-black"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-neutral-white border-t border-neutral-light-grey shadow-xl">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = 
                  pathname === item.href || 
                  (item.href === '/matches' && pathname?.startsWith('/chat')) ||
                  (item.href === '/dms' && pathname?.startsWith('/chat'))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-all',
                      isActive
                        ? 'bg-flame-gradient text-white'
                        : 'text-neutral-near-black hover:bg-neutral-light-grey'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{item.name}</span>
                  </Link>
                )
              })}
              <button
                onClick={() => {
                  logout()
                  window.location.href = '/auth/login'
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-error hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
