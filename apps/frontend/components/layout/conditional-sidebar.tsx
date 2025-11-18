'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './sidebar'

export default function ConditionalSidebar() {
  const pathname = usePathname()
  
  // Hide sidebar on home page, auth pages, onboarding, and admin pages
  const hideSidebar = 
    pathname === '/' || 
    pathname?.startsWith('/auth') ||
    pathname === '/onboarding' ||
    pathname?.startsWith('/admin')
  
  if (hideSidebar) {
    return null
  }
  
  return <Sidebar />
}

