'use client'

import { getThemeColors } from '@/lib/theme'
import { useApp } from '@/contexts/AppContext'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Видалити',
  cancelLabel = 'Скасувати',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} aria-label="Закрити" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden animate-fade-in-scale"
        style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}
      >
        <div className="p-6">
          <h3 id="confirm-dialog-title" className="text-lg font-serif font-bold mb-2" style={{ color: c.text }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: c.muted }}>
            {message}
          </p>
        </div>
        <div className="p-4 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'transparent', color: c.muted, border: `1px solid ${c.cardBorder}` }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
            style={{ background: c.dangerColor, color: '#fff', boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
