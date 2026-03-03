'use client'

import { useMemo, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/Header'
import { getThemeColors } from '@/lib/theme'

export default function RecipePage() {
  const router = useRouter()
  const params = useParams()
  const { isDark, favorites, history, isFavorite, toggleFavorite } = useApp()

  const recipe = useMemo(() => {
    const id = params.id as string
    if (!id) return null
    return [...favorites, ...history].find(r => r.id === id) || null
  }, [params.id, favorites, history])

  useEffect(() => {
    if (recipe) {
      document.title = `${recipe.title} — MealMate`
    }
    return () => { document.title = 'MealMate - AI Kitchen Assistant' }
  }, [recipe])

  const notFound = !recipe

  const c = getThemeColors(isDark)

  // Not found state
  if (notFound) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-8 animate-in">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-10 font-medium transition-colors group"
            style={{ color: c.goldMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
            onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Назад
          </button>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ border: `1px solid ${c.emptyBorder}`, background: c.emptyBg }}>
              <svg className="w-9 h-9" aria-hidden="true" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-xl font-serif mb-2" style={{ color: c.text }}>Рецепт не знайдено</p>
            <p className="text-sm mb-8" style={{ color: c.dimmed }}>Можливо, його було видалено з історії</p>
            <button
              onClick={() => router.push('/generate')}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:translate-y-[-1px]"
              style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
            >
              Створити новий рецепт
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) return null // unreachable after notFound early return, but satisfies TS

  const totalCal = recipe.nutrition.protein * 4 + recipe.nutrition.carbs * 4 + recipe.nutrition.fat * 9
  const proteinPct = totalCal > 0 ? Math.round((recipe.nutrition.protein * 4 / totalCal) * 100) : 0
  const carbsPct = totalCal > 0 ? Math.round((recipe.nutrition.carbs * 4 / totalCal) * 100) : 0
  const fatPct = totalCal > 0 ? Math.round((recipe.nutrition.fat * 9 / totalCal) * 100) : 0

  return (
    <div className="min-h-screen relative">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8 animate-in">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            aria-label="Назад"
            className="flex items-center gap-2 font-medium transition-colors group"
            style={{ color: c.goldMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
            onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Назад
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(recipe)}
              aria-label={isFavorite(recipe.id) ? 'Видалити з обраного' : 'Додати до обраного'}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{
                color: isFavorite(recipe.id) ? c.dangerColor : c.muted,
                background: isFavorite(recipe.id) ? c.dangerBg : c.badgeBg
              }}
            >
              <svg className="w-5 h-5" aria-hidden="true" fill={isFavorite(recipe.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/generate')}
              aria-label="Новий рецепт"
              className="px-4 py-2 rounded-lg font-semibold text-xs transition-all hover:translate-y-[-1px]"
              style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
            >
              Новий рецепт
            </button>
          </div>
        </div>

        {/* Recipe card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
          {/* Header */}
          <div className="p-8 pb-6" style={{ background: c.headerBg }}>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>{recipe.cuisine}</span>
              <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                {recipe.difficulty === 'easy' ? 'Легко' : recipe.difficulty === 'medium' ? 'Середньо' : 'Складно'}
              </span>
              {recipe.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ color: c.muted, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3" style={{ color: c.text }}>{recipe.title}</h2>
            <p className="text-base leading-relaxed" style={{ color: c.muted }}>{recipe.description}</p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3" style={{ borderTop: `1px solid ${c.statBorder}`, borderBottom: `1px solid ${c.statBorder}` }}>
            {[
              { value: `${recipe.prepTime + recipe.cookTime}`, label: 'хвилин', sub: `${recipe.prepTime} підг. + ${recipe.cookTime} гот.` },
              { value: recipe.servings, label: 'порцій' },
              { value: recipe.nutrition.calories, label: 'ккал/порція' },
            ].map((stat, i) => (
              <div key={i} className="p-5 text-center" style={{ background: c.statBg, borderRight: i < 2 ? `1px solid ${c.statBorder}` : undefined }}>
                <div className="text-2xl font-bold" style={{ color: c.gold }}>{stat.value}</div>
                <div className="text-xs" style={{ color: c.dimmed }}>{stat.label}</div>
                {stat.sub && <div className="text-[10px] mt-0.5" style={{ color: c.dimmed }}>{stat.sub}</div>}
              </div>
            ))}
          </div>

          {/* Nutrition */}
          <div className="p-6" style={{ background: c.nutritionBg, borderBottom: `1px solid ${c.nutritionBorder}` }}>
            <h3 className="font-bold text-sm mb-4" style={{ color: c.text }}>Харчова цінність на порцію</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { value: recipe.nutrition.calories, unit: 'ккал', label: 'Калорії', color: c.gold },
                { value: recipe.nutrition.protein, unit: 'г', label: 'Білки', color: c.dangerColor },
                { value: recipe.nutrition.carbs, unit: 'г', label: 'Вуглеводи', color: c.macroCarbs },
                { value: recipe.nutrition.fat, unit: 'г', label: 'Жири', color: c.macroFat },
                { value: recipe.nutrition.fiber || 0, unit: 'г', label: 'Клітковина', color: c.macroFiber },
              ].map((n, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: c.nutritionCardBg, border: `1px solid ${c.statBorder}` }}>
                  <div className="text-2xl font-black" style={{ color: n.color }}>{n.value}</div>
                  <div className="text-[10px]" style={{ color: c.dimmed }}>{n.unit}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: c.dimmed }}>{n.label}</div>
                </div>
              ))}
            </div>
            {/* Macro bar */}
            <div className="mt-4">
              <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: c.statBg }}>
                <div className="transition-all rounded-l-full" style={{ width: `${proteinPct}%`, background: c.macroProtein }} />
                <div className="transition-all" style={{ width: `${carbsPct}%`, background: c.macroCarbs }} />
                <div className="transition-all rounded-r-full" style={{ width: `${fatPct}%`, background: c.macroFat }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: c.dimmed }}>
                <span>Білки {proteinPct}%</span>
                <span>Вуглеводи {carbsPct}%</span>
                <span>Жири {fatPct}%</span>
              </div>
            </div>
          </div>

          {/* Ingredients & Steps */}
          <div className="p-8">
            <div className="grid md:grid-cols-5 gap-10">
              {/* Ingredients */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold mb-5" style={{ color: c.text }}>Інгредієнти</h3>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: c.ingBg, border: `1px solid ${c.ingBorder}` }}>
                      <span className="text-sm" style={{ color: c.text }}>{ing.name}</span>
                      <span className="text-xs flex-shrink-0 ml-3" style={{ color: c.dimmed }}>{ing.amount} {ing.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="md:col-span-3">
                <h3 className="text-lg font-bold mb-5" style={{ color: c.text }}>Як готувати</h3>
                <div className="space-y-5">
                  {recipe.instructions.map((step, i) => {
                    let text: string
                    if (typeof step === 'string') { text = step }
                    else if (step && typeof step === 'object') {
                      const obj = step as unknown as Record<string, unknown>
                      const candidates = [obj.text, obj.description, obj.instruction, obj.content]
                      if (typeof obj.step === 'string' && (obj.step as string).length > 3) candidates.unshift(obj.step)
                      text = (candidates.find(v => typeof v === 'string' && (v as string).length > 0) as string)
                        || (Object.values(obj).find(v => typeof v === 'string' && (v as string).length > 3) as string)
                        || String(step)
                    } else { text = String(step) }
                    return (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: c.stepNumBg, color: c.btnText }}>
                        {i + 1}
                      </div>
                      <p className="text-sm pt-2 leading-relaxed" style={{ color: c.textSecondary }}>{text}</p>
                    </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {recipe.tips && recipe.tips.length > 0 && (
              <div className="mt-10 p-6 rounded-2xl" style={{ background: c.tipsBg, border: `1px solid ${c.tipsBorder}` }}>
                <h4 className="font-bold text-sm mb-3" style={{ color: c.gold }}>Поради</h4>
                <ul className="space-y-2">
                  {recipe.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: c.textSecondary }}>
                      <span style={{ color: c.gold }}>&#8226;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
