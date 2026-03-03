'use client'

import { useRouter } from 'next/navigation'

export function BackButton({ href, label = 'Назад' }: { href: string; label?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-2 text-amber-700/60 hover:text-amber-900 mb-6 font-medium transition-colors"
    >
      <span className="text-xl">&larr;</span> {label}
    </button>
  )
}
