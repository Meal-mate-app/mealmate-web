'use client'

import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'
import { StarRating } from './StarRating'
import { Recipe } from '@/types'

const CUISINE_EMOJI: Record<string, string> = {
  'Українська': '\u{1F1FA}\u{1F1E6}',
  'Італійська': '\u{1F35D}',
  'Японська': '\u{1F363}',
  'Мексиканська': '\u{1F32E}',
  'Грузинська': '\u{1FAD3}',
  'Індійська': '\u{1F35B}',
  'Французька': '\u{1F950}',
  'Тайська': '\u{1F35C}',
  'Американська': '\u{1F354}',
  'Грецька': '\u{1F957}',
  'Близькосхідна': '\u{1F9C6}',
}

function getCuisineEmoji(cuisine: string): string {
  return CUISINE_EMOJI[cuisine] || '\u{1F37D}\u{FE0F}'
}

const difficultyLabels: Record<string, { text: string; color: string }> = {
  easy: { text: 'Легко', color: '#22c55e' },
  medium: { text: 'Середньо', color: '#d4a843' },
  hard: { text: 'Складно', color: '#ef4444' },
}

interface CatalogRecipeCardProps {
  recipe: Recipe & { avgRating?: number; ratingCount?: number }
}

export function CatalogRecipeCard({ recipe }: CatalogRecipeCardProps) {
  const router = useRouter()
  const { isDark } = useApp()
  const c = getThemeColors(isDark)
  const diff = difficultyLabels[recipe.difficulty] || difficultyLabels.medium

  return (
    <button
      onClick={() => router.push(`/catalog/${recipe.id}`)}
      className="text-left w-full rounded-2xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: c.cardBg,
        border: `1px solid ${c.cardBorder}`,
        boxShadow: c.cardShadow,
      }}
    >
      {/* Cuisine emoji */}
      <div className="text-4xl mb-3">{getCuisineEmoji(recipe.cuisine)}</div>

      {/* Title */}
      <h3 className="font-semibold text-base mb-1 line-clamp-2" style={{ color: c.text }}>
        {recipe.title}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-2">
        <StarRating value={Math.round(recipe.avgRating || 0)} size="sm" />
        <span className="text-xs" style={{ color: c.muted }}>
          {recipe.avgRating ? Number(recipe.avgRating).toFixed(1) : '0.0'}
          {' '}({recipe.ratingCount || 0})
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs" style={{ color: c.muted }}>
        {recipe.cookTime > 0 && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {recipe.cookTime} хв
          </span>
        )}
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{ background: `${diff.color}20`, color: diff.color }}
        >
          {diff.text}
        </span>
        {recipe.cuisine && (
          <span className="truncate">{recipe.cuisine}</span>
        )}
      </div>
    </button>
  )
}
