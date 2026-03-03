'use client'

import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'

interface OutOfCoinsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OutOfCoinsModal({ isOpen, onClose }: OutOfCoinsModalProps) {
  const router = useRouter()
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: c.muted }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: c.badgeBg }}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: c.gold }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">$</text>
            </svg>
          </div>
        </div>

        {/* Text */}
        <h3 className="text-lg font-serif text-center mb-2" style={{ color: c.text }}>
          Монети закінчились
        </h3>
        <p className="text-sm text-center mb-6" style={{ color: c.muted }}>
          Поповніть баланс або оформіть Pro підписку, щоб продовжити генерацію рецептів.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onClose(); router.push('/pricing') }}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
          >
            Купити монети
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ color: c.muted, border: `1px solid ${c.cardBorder}` }}
          >
            Пізніше
          </button>
        </div>
      </div>
    </div>
  )
}
