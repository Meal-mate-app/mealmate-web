'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/Header'
import { Recipe } from '@/types'
import { getThemeColors } from '@/lib/theme'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function FavoritesPage() {
  const router = useRouter()
  const { isDark, favorites, toggleFavorite } = useApp()
  const c = getThemeColors(isDark)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const removeFavorite = (recipe: Recipe) => {
    toggleFavorite(recipe)
  }

  return (
    <div className="min-h-screen relative">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 animate-in">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 mb-10 font-medium transition-colors group"
          style={{ color: c.goldMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
          onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </button>

        {favorites.length > 0 ? (
          <div className="space-y-3" role="list">
            {favorites.map((fav) => (
              <div key={fav.id} className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-1px]" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold truncate" style={{ color: c.text }}>{fav.title}</h3>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>{fav.cuisine}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: c.dimmed }}>
                        {fav.difficulty === 'easy' ? 'Легко' : fav.difficulty === 'medium' ? 'Середньо' : 'Складно'}
                      </span>
                      <span className="text-xs" style={{ color: c.dimmed }}>{fav.prepTime + fav.cookTime} хв</span>
                      <span className="text-xs" style={{ color: c.dimmed }}>{fav.nutrition.calories} ккал</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => router.push(`/recipe/${fav.id}`)}
                      className="px-4 py-2 rounded-lg font-semibold text-xs transition-all hover:translate-y-[-1px]"
                      style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                    >
                      Відкрити
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(fav.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ color: c.dangerColor, background: c.dangerBg }}
                      title="Видалити"
                      aria-label="Видалити з улюблених"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ border: `1px solid ${c.emptyBorder}`, background: c.emptyBg }}>
              <svg className="w-9 h-9" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <p className="text-xl font-serif mb-2" style={{ color: c.text }}>Ще немає улюблених</p>
            <p className="text-sm" style={{ color: c.dimmed }}>Натисніть на серце на рецепті, щоб зберегти</p>
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Видалити з улюблених?"
          message="Рецепт буде видалено з улюблених."
          onConfirm={() => {
            const recipe = favorites.find(r => r.id === confirmDeleteId)
            if (recipe) removeFavorite(recipe)
            setConfirmDeleteId(null)
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
