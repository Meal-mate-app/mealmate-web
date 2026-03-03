'use client'

import { useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'

export function Toast() {
  const { toast, setToast } = useApp()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast, setToast])

  if (!toast) return null

  const progressColor = toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#c9a84c'

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-toast-in" role="alert" aria-live="assertive">
      <div className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border overflow-hidden ${
        toast.type === 'error'
          ? 'bg-red-50/95 border-red-200 text-red-800'
          : toast.type === 'success'
          ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
          : 'bg-amber-50/95 border-amber-200 text-amber-800'
      }`}>
        <span className="text-xl">
          {toast.type === 'error' ? '!' : toast.type === 'success' ? '\u2713' : '\u2139'}
        </span>
        <span className="font-medium text-sm">{toast.message}</span>
        <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 text-lg" aria-label="Закрити">&times;</button>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]">
          <div
            className="h-full rounded-full"
            style={{
              background: progressColor,
              opacity: 0.5,
              animation: 'toastProgress 4s linear forwards',
            }}
          />
        </div>
      </div>
    </div>
  )
}
