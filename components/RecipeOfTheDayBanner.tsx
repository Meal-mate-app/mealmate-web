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

interface RecipeOfTheDayBannerProps {
  recipe: (Recipe & { avgRating?: number; ratingCount?: number }) | null
}

export function RecipeOfTheDayBanner({ recipe }: RecipeOfTheDayBannerProps) {
  const router = useRouter()
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

  if (!recipe) return null

  const emoji = CUISINE_EMOJI[recipe.cuisine] || '\u{1F37D}\u{FE0F}'

  return (
    <button
      onClick={() => router.push(`/catalog/${recipe.id}`)}
      className="w-full text-left rounded-2xl p-5 sm:p-6 mb-8 transition-all hover:scale-[1.01]"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.04))'
          : 'linear-gradient(135deg, rgba(184,134,11,0.1), rgba(184,134,11,0.04))',
        border: `1.5px solid ${isDark ? 'rgba(212,168,67,0.25)' : 'rgba(184,134,11,0.2)'}`,
        boxShadow: isDark ? '0 4px 24px rgba(212,168,67,0.08)' : '0 4px 24px rgba(184,134,11,0.06)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5" style={{ color: c.gold }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: c.gold }}>
          Рецепт дня
        </span>
      </div>

      <div className="flex items-start gap-4">
        <span className="text-5xl sm:text-6xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-serif font-bold mb-1" style={{ color: c.text }}>
            {recipe.title}
          </h2>
          <p className="text-sm mb-2 line-clamp-2" style={{ color: c.muted }}>
            {recipe.description}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating value={Math.round(recipe.avgRating || 0)} size="sm" />
            <span className="text-xs" style={{ color: c.muted }}>
              {recipe.avgRating ? Number(recipe.avgRating).toFixed(1) : '0.0'}
            </span>
            {recipe.cookTime > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: c.muted }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {recipe.cookTime} хв
              </span>
            )}
            <span className="text-xs" style={{ color: c.muted }}>{recipe.cuisine}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
