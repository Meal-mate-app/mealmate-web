'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'
import { Header } from '@/components/Header'
import { StarRating } from '@/components/StarRating'
import * as api from '@/lib/api'
import { Recipe } from '@/types'

type CatalogRecipe = Recipe & { avgRating?: number; ratingCount?: number; isPublic?: boolean }

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

const difficultyLabels: Record<string, { text: string; color: string }> = {
  easy: { text: 'Легко', color: '#22c55e' },
  medium: { text: 'Середньо', color: '#d4a843' },
  hard: { text: 'Складно', color: '#ef4444' },
}

export default function CatalogRecipePage() {
  const params = useParams()
  const router = useRouter()
  const { isDark, isAuth } = useApp()
  const c = getThemeColors(isDark)

  const [recipe, setRecipe] = useState<CatalogRecipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState<number>(0)
  const [avgRating, setAvgRating] = useState<number>(0)
  const [ratingCount, setRatingCount] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const uuid = params.id as string

  useEffect(() => {
    setLoading(true)
    api.getCatalogRecipe(uuid)
      .then((r) => {
        const cr = r as CatalogRecipe
        setRecipe(cr)
        setAvgRating(cr.avgRating || 0)
        setRatingCount(cr.ratingCount || 0)
      })
      .catch(() => router.push('/catalog'))
      .finally(() => setLoading(false))
  }, [uuid, router])

  useEffect(() => {
    if (!isAuth) return
    api.getMyRating(uuid)
      .then((r) => { if (r) setUserRating(r.value) })
      .catch(() => {})
  }, [uuid, isAuth])

  const handleRate = async (value: number) => {
    if (!isAuth) {
      router.push('/login')
      return
    }
    try {
      const result = await api.rateRecipe(uuid, value)
      setUserRating(result.userRating)
      setAvgRating(result.avgRating)
      setRatingCount(result.ratingCount)
    } catch (err) {
      console.error('Failed to rate:', err)
    }
  }

  const handleSaveToCollection = async () => {
    if (!isAuth) {
      router.push('/login')
      return
    }
    if (!recipe) return
    setSaving(true)
    try {
      await api.saveRecipe(recipe)
      setSaved(true)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: c.pageBg }}>
        <Header />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${c.gold} transparent ${c.gold} transparent` }} />
        </div>
      </div>
    )
  }

  if (!recipe) return null

  const diff = difficultyLabels[recipe.difficulty] || difficultyLabels.medium
  const emoji = CUISINE_EMOJI[recipe.cuisine] || '\u{1F37D}\u{FE0F}'

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/catalog')}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: c.muted }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Назад до каталогу
        </button>

        {/* Header */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: c.headerBg, border: `1px solid ${c.cardBorder}` }}>
          <div className="flex items-start gap-4">
            <span className="text-5xl">{emoji}</span>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1" style={{ color: c.text }}>
                {recipe.title}
              </h1>
              <p className="text-sm mb-3" style={{ color: c.muted }}>{recipe.description}</p>

              {/* Rating row */}
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <StarRating value={Math.round(avgRating)} size="md" />
                <span className="text-sm font-medium" style={{ color: c.text }}>
                  {avgRating ? Number(avgRating).toFixed(1) : '0.0'}
                </span>
                <span className="text-xs" style={{ color: c.muted }}>
                  ({ratingCount} {ratingCount === 1 ? 'оцінка' : ratingCount < 5 ? 'оцінки' : 'оцінок'})
                </span>
              </div>

              {/* Meta badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {recipe.cookTime > 0 && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg" style={{ background: c.badgeBg, color: c.muted }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {recipe.cookTime} хв
                  </span>
                )}
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: `${diff.color}15`, color: diff.color }}>
                  {diff.text}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: c.badgeBg, color: c.muted }}>
                  {recipe.servings} порцій
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Your rating */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: c.text }}>Ваша оцінка</h3>
          {isAuth ? (
            <div className="flex items-center gap-3">
              <StarRating value={userRating} onChange={handleRate} size="lg" />
              {userRating > 0 && (
                <span className="text-sm" style={{ color: c.muted }}>Ви оцінили на {userRating}</span>
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: c.muted }}>
              <button onClick={() => router.push('/login')} className="underline" style={{ color: c.gold }}>Увійдіть</button>
              {' '}щоб оцінити рецепт
            </p>
          )}
        </div>

        {/* Nutrition */}
        {recipe.nutrition && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: c.nutritionBg, border: `1px solid ${c.nutritionBorder}` }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: c.text }}>Поживна цінність (на порцію)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Калорії', value: `${recipe.nutrition.calories}`, unit: 'ккал', color: c.gold },
                { label: 'Білки', value: `${recipe.nutrition.protein}`, unit: 'г', color: c.macroProtein },
                { label: 'Вуглеводи', value: `${recipe.nutrition.carbs}`, unit: 'г', color: c.macroCarbs },
                { label: 'Жири', value: `${recipe.nutrition.fat}`, unit: 'г', color: c.macroFat },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: c.nutritionCardBg, border: `1px solid ${c.cardBorder}` }}>
                  <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: c.muted }}>{m.label} ({m.unit})</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: c.text }}>Інгредієнти</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-3 text-sm py-1.5 px-3 rounded-lg" style={{ background: c.ingBg }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.gold }} />
                <span style={{ color: c.text }}>{ing.name}</span>
                <span className="ml-auto text-xs" style={{ color: c.muted }}>{ing.amount} {ing.unit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: c.text }}>Приготування</h3>
          <ol className="space-y-4">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: c.stepNumBg, color: c.btnText }}
                >
                  {i + 1}
                </span>
                <span className="text-sm pt-1" style={{ color: c.text }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: c.tipsBg, border: `1px solid ${c.tipsBorder}` }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: c.gold }}>Поради</h3>
            <ul className="space-y-2">
              {recipe.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: c.text }}>
                  <span style={{ color: c.gold }}>{'*'}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Save to collection button */}
        <button
          onClick={handleSaveToCollection}
          disabled={saving || saved}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{
            background: saved ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(22,163,74,0.1)') : c.btnBg,
            color: saved ? c.successColor : c.btnText,
            boxShadow: saved ? 'none' : c.btnShadow,
            border: saved ? `1px solid ${c.successColor}` : 'none',
          }}
        >
          {saved ? 'Збережено до колекції!' : saving ? 'Зберігаю...' : 'Зберегти до себе'}
        </button>
      </main>
    </div>
  )
}
