'use client'

import { useState } from 'react'
import { Recipe } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'

function DifficultyDot({ difficulty, c }: { difficulty: string; c: ReturnType<typeof getThemeColors> }) {
  const color = difficulty === 'easy' ? c.successColor : difficulty === 'medium' ? c.macroCarbs : c.dangerColor
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r="5" fill={color} />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 22c-4.97 0-9-2.69-9-6 0-4 5-11 9-14 4 3 9 10 9 14 0 3.31-4.03 6-9 6z" />
    </svg>
  )
}

export function RecipeCard({ recipe, index, variant, onOpen }: {
  recipe: Recipe
  index?: number
  variant: 'favorite' | 'history'
  onOpen: () => void
}) {
  const { toggleFavorite, isFavorite, isDark } = useApp()
  const c = getThemeColors(isDark)
  const fav = isFavorite(recipe.id)
  const [heartAnim, setHeartAnim] = useState(false)

  const handleToggleFav = () => {
    setHeartAnim(true)
    toggleFavorite(recipe)
    setTimeout(() => setHeartAnim(false), 400)
  }

  if (variant === 'favorite') {
    return (
      <div className="group rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] relative" style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.04) 0%, transparent 50%)' }} />
        <div className="p-6 relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: c.badgeBg, color: c.muted }}>{recipe.cuisine}</span>
              <span className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1" style={{ background: c.badgeBg, color: c.muted }}>
                <DifficultyDot difficulty={recipe.difficulty} c={c} />
              </span>
            </div>
            <button
              onClick={handleToggleFav}
              className={`hover:scale-110 transition-transform ${heartAnim ? 'animate-heart-pop' : ''}`}
              style={{ color: c.dangerColor }}
              aria-label="Видалити з обраного"
            >
              <HeartIcon filled />
            </button>
          </div>
          <h3 className="text-xl font-bold font-serif mb-2" style={{ color: c.text }}>{recipe.title}</h3>
          <p className="text-sm line-clamp-2" style={{ color: c.muted }}>{recipe.description}</p>
        </div>
        <div className="p-4 flex items-center justify-between" style={{ borderTop: `1px solid ${c.cardBorder}` }}>
          <div className="flex gap-4 text-sm" style={{ color: c.muted }}>
            <span className="flex items-center gap-1"><ClockIcon /> {recipe.prepTime + recipe.cookTime}хв</span>
            <span className="flex items-center gap-1"><FlameIcon /> {recipe.nutrition.calories}ккал</span>
          </div>
          <button onClick={onOpen} className="px-4 py-2 font-medium rounded-lg text-sm transition-colors" style={{ background: c.gold, color: c.btnText }}>
            Відкрити
          </button>
        </div>
      </div>
    )
  }

  // history variant
  return (
    <div className="rounded-2xl p-5 flex items-center gap-6 transition-transform hover:scale-[1.01]" style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0" style={{ background: c.badgeBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}>
        {(index ?? 0) + 1}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold font-serif truncate" style={{ color: c.text }}>{recipe.title}</h3>
        <div className="flex gap-4 text-sm mt-1" style={{ color: c.muted }}>
          <span>{recipe.cuisine}</span>
          <span className="flex items-center gap-1"><ClockIcon /> {recipe.prepTime + recipe.cookTime}хв</span>
          <span className="flex items-center gap-1"><FlameIcon /> {recipe.nutrition.calories}ккал</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleFav}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${heartAnim ? 'animate-heart-pop' : ''}`}
          style={{
            background: fav ? c.badgeBg : c.inputBg,
            color: fav ? c.dangerColor : c.dimmed,
            border: `1px solid ${c.cardBorder}`,
          }}
          aria-label={fav ? 'Видалити з обраного' : 'Додати до обраного'}
        >
          <HeartIcon filled={fav} />
        </button>
        <button onClick={onOpen} className="px-5 py-2.5 font-medium rounded-xl transition-colors" style={{ background: c.gold, color: c.btnText }}>
          Відкрити
        </button>
      </div>
    </div>
  )
}
