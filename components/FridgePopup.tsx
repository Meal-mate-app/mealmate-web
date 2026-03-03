'use client'

import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'

export function FridgePopup() {
  const {
    isDark,
    showFridgePopup,
    fridgePopupItems,
    fridgePopupChecked,
    toggleFridgePopupItem,
    confirmFridgePopup,
    dismissFridgePopup,
  } = useApp()

  const c = getThemeColors(isDark)

  if (!showFridgePopup || fridgePopupItems.length === 0) return null

  const checkedCount = fridgePopupChecked.size

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismissFridgePopup} aria-label="Закрити" />
      <div
        className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden animate-fade-in-scale glass-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fridge-popup-title"
      >
        <div className="p-6 pb-4" style={{ borderBottom: `1px solid ${c.cardBorder}` }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
              <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h3 id="fridge-popup-title" className="text-lg font-serif font-bold" style={{ color: c.text }}>
                Додати в холодильник?
              </h3>
              <p className="text-xs" style={{ color: c.dimmed }}>
                Оберіть продукти з замовлення
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-1.5 stagger-children">
          {fridgePopupItems.map(item => {
            const isChecked = fridgePopupChecked.has(item)
            return (
              <button
                key={item}
                onClick={() => toggleFridgePopupItem(item)}
                role="checkbox"
                aria-checked={isChecked}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{
                  background: isChecked ? c.itemActiveBg : c.itemBg,
                  border: `1px solid ${isChecked ? c.itemActiveBorder : c.itemBorder}`,
                }}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${isChecked ? 'animate-fade-in-scale' : ''}`}
                  style={isChecked
                    ? { background: c.checkBg, color: c.btnText }
                    : { border: `2px solid ${c.inputBorder}` }
                  }
                >
                  {isChecked && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium" style={{ color: isChecked ? c.text : c.muted }}>
                  {item}
                </span>
              </button>
            )
          })}
        </div>

        <div className="p-4 flex gap-3" style={{ borderTop: `1px solid ${c.cardBorder}` }}>
          <button
            onClick={dismissFridgePopup}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'transparent', color: c.muted, border: `1px solid ${c.cardBorder}` }}
            aria-label="Пропустити"
          >
            Пропустити
          </button>
          <button
            onClick={confirmFridgePopup}
            disabled={checkedCount === 0}
            aria-disabled={checkedCount === 0}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
            style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
          >
            Додати {checkedCount > 0 ? `(${checkedCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
