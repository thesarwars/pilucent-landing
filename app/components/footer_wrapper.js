'use client'

import { usePathname } from 'next/navigation'
import Footer from './footer'

export default function FooterWrapper() {
  const pathname = usePathname()
  const isDemoPage = pathname === '/demo' // adjust this path as needed

  if (isDemoPage) {
    return null
  }

  return <Footer />
}