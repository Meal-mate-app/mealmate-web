'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/Header'
import { Recipe } from '@/types'
import { getThemeColors } from '@/lib/theme'
import * as api from '@/lib/api'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const STORAGE_KEY = 'mealmate_history'

type Tab = 'recipes' | 'plans'

export default function HistoryPage() {
  const router = useRouter()
  const {
    isDark,
    history: contextHistory,
    isFavorite,
    toggleFavorite,
    planHistory,
    loadPlanFromHistory,
    deletePlanFromHistory,
    bulkDeleteFromHistory,
    bulkDeletePlans: bulkDeletePlansCtx,
    showToast,
  } = useApp()
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<Tab>('recipes')
  const [confirmDelete, setConfirmDelete] = useState<{type: 'recipe' | 'plan' | 'bulk-recipes' | 'bulk-plans', id: string} | null>(null)

  // Bulk selection
  const [selectMode, setSelectMode] = useState(false)
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set())
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set())

  const history = contextHistory.filter(r => !deletedIds.has(r.id))

  const removeFromHistory = useCallback((recipe: Recipe) => {
    setDeletedIds(prev => new Set(prev).add(recipe.id))
    const saved = localStorage.getItem(STORAGE_KEY)
    let hist: Recipe[] = []
    if (saved) try { hist = JSON.parse(saved) } catch {}
    const next = hist.filter(r => r.id !== recipe.id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    if (api.isLoggedIn()) {
      api.deleteRecipe(recipe.id).catch(() => showToast('Помилка видалення', 'error'))
    }
  }, [showToast])

  const handleOpenPlan = useCallback((plan: typeof planHistory[0]) => {
    loadPlanFromHistory(plan)
    router.push('/meal-plan')
  }, [loadPlanFromHistory, router])

  const toggleSelectRecipe = (id: string) => {
    setSelectedRecipes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectPlan = (id: string) => {
    setSelectedPlans(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAllRecipes = () => {
    if (selectedRecipes.size === history.length) {
      setSelectedRecipes(new Set())
    } else {
      setSelectedRecipes(new Set(history.map(r => r.id)))
    }
  }

  const selectAllPlans = () => {
    if (selectedPlans.size === planHistory.length) {
      setSelectedPlans(new Set())
    } else {
      setSelectedPlans(new Set(planHistory.map(p => p.id)))
    }
  }

  const bulkDeleteRecipes = () => {
    bulkDeleteFromHistory(Array.from(selectedRecipes))
    const count = selectedRecipes.size
    setSelectedRecipes(new Set())
    setSelectMode(false)
    showToast(`Видалено ${count} рецептів`, 'success')
  }

  const handleBulkDeletePlans = () => {
    bulkDeletePlansCtx(Array.from(selectedPlans))
    const count = selectedPlans.size
    setSelectedPlans(new Set())
    setSelectMode(false)
    showToast(`Видалено ${count} планів`, 'success')
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedRecipes(new Set())
    setSelectedPlans(new Set())
  }

  const c = getThemeColors(isDark)

  const currentSelected = activeTab === 'recipes' ? selectedRecipes : selectedPlans
  const currentList = activeTab === 'recipes' ? history : planHistory

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

        {/* Tabs + Select mode toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {([
              { key: 'recipes' as Tab, label: 'Рецепти', count: history.length },
              { key: 'plans' as Tab, label: 'Плани меню', count: planHistory.length },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); exitSelectMode() }}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={activeTab === tab.key
                  ? { background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }
                  : { background: c.cardBg, color: c.muted, border: `1px solid ${c.cardBorder}` }
                }
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px]" style={{
                    background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : c.badgeBg,
                    color: activeTab === tab.key ? c.btnText : c.dimmed,
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {currentList.length > 0 && (
            <div className="flex items-center gap-2">
              {selectMode && currentSelected.size > 0 && (
                <button
                  onClick={() => setConfirmDelete({ type: activeTab === 'recipes' ? 'bulk-recipes' : 'bulk-plans', id: 'bulk' })}
                  className="px-4 py-2 rounded-lg font-semibold text-xs transition-all hover:scale-105"
                  style={{ background: c.dangerBg, color: c.dangerColor, border: `1px solid ${c.dangerColor}30` }}
                >
                  Видалити ({currentSelected.size})
                </button>
              )}
              {selectMode && (
                <button
                  onClick={activeTab === 'recipes' ? selectAllRecipes : selectAllPlans}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}
                >
                  {currentSelected.size === currentList.length ? 'Зняти все' : 'Обрати все'}
                </button>
              )}
              <button
                onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={selectMode
                  ? { color: c.btnText, background: c.gold }
                  : { color: c.muted, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }
                }
              >
                {selectMode ? 'Скасувати' : 'Обрати'}
              </button>
            </div>
          )}
        </div>

        {/* Recipes tab */}
        {activeTab === 'recipes' && (
          <>
            {history.length > 0 ? (
              <div className="space-y-3" role="list">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                    style={{
                      background: c.cardBg,
                      border: `1px solid ${selectedRecipes.has(item.id) ? c.gold : c.cardBorder}`,
                      boxShadow: selectedRecipes.has(item.id) ? `0 0 0 1px ${c.gold}40` : c.cardShadow,
                    }}
                    onClick={selectMode ? () => toggleSelectRecipe(item.id) : undefined}
                  >
                    <div className="flex items-center gap-4 p-4" style={{ cursor: selectMode ? 'pointer' : undefined }}>
                      {selectMode && (
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: selectedRecipes.has(item.id) ? c.gold : 'transparent',
                            border: `2px solid ${selectedRecipes.has(item.id) ? c.gold : c.dimmed}`,
                          }}
                        >
                          {selectedRecipes.has(item.id) && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={c.btnText} strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold truncate" style={{ color: c.text }}>{item.title}</h3>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>{item.cuisine}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: c.dimmed }}>
                            {item.difficulty === 'easy' ? 'Легко' : item.difficulty === 'medium' ? 'Середньо' : 'Складно'}
                          </span>
                          <span className="text-xs" style={{ color: c.dimmed }}>{item.prepTime + item.cookTime} хв</span>
                          <span className="text-xs" style={{ color: c.dimmed }}>{item.nutrition.calories} ккал</span>
                        </div>
                      </div>
                      {!selectMode && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleFavorite(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ color: isFavorite(item.id) ? c.dangerColor : c.muted, background: isFavorite(item.id) ? c.dangerBg : c.badgeBg }}
                            title={isFavorite(item.id) ? 'Прибрати з улюблених' : 'Додати до улюблених'}
                            aria-label={isFavorite(item.id) ? 'Прибрати з улюблених' : 'Додати до улюблених'}
                          >
                            <svg className="w-4 h-4" fill={isFavorite(item.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => router.push(`/recipe/${item.id}`)}
                            className="px-4 py-2 rounded-lg font-semibold text-xs transition-all hover:translate-y-[-1px]"
                            style={{ background: c.btnBg, color: c.btnText, boxShadow: '0 2px 8px rgba(201,168,76,0.15)' }}
                          >
                            Відкрити
                          </button>
                          <button
                            onClick={() => setConfirmDelete({type: 'recipe', id: item.id})}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ color: c.dangerColor, background: c.dangerBg }}
                            title="Видалити"
                            aria-label="Видалити рецепт"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ border: `1px solid ${c.emptyBorder}`, background: c.emptyBg }}>
                  <svg className="w-9 h-9" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl font-serif mb-2" style={{ color: c.text }}>Історія порожня</p>
                <p className="text-sm" style={{ color: c.dimmed }}>Тут з&#39;являться рецепти, які ви переглядали</p>
              </div>
            )}
          </>
        )}

        {/* Meal Plans tab */}
        {activeTab === 'plans' && (
          <>
            {planHistory.length > 0 ? (
              <div className="space-y-3">
                {planHistory.map((plan) => {
                  const totalRecipes = plan.days.reduce((sum, d) => sum + d.meals.length, 0)
                  const firstMeals = plan.days.slice(0, 2).flatMap(d => d.meals.map(m => m.recipe.title))
                  const dateStr = new Date(plan.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })

                  return (
                    <div
                      key={plan.id}
                      className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                      style={{
                        background: c.cardBg,
                        border: `1px solid ${selectedPlans.has(plan.id) ? c.gold : c.cardBorder}`,
                        boxShadow: selectedPlans.has(plan.id) ? `0 0 0 1px ${c.gold}40` : c.cardShadow,
                      }}
                      onClick={selectMode ? () => toggleSelectPlan(plan.id) : undefined}
                    >
                      <div className="flex items-start gap-4 p-4" style={{ cursor: selectMode ? 'pointer' : undefined }}>
                        {selectMode && (
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-3 transition-all"
                            style={{
                              background: selectedPlans.has(plan.id) ? c.gold : 'transparent',
                              border: `2px solid ${selectedPlans.has(plan.id) ? c.gold : c.dimmed}`,
                            }}
                          >
                            {selectedPlans.has(plan.id) && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={c.btnText} strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                        {!selectMode && (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                            <svg className="w-6 h-6" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold" style={{ color: c.text }}>
                              План на {plan.days.length} днів
                            </h3>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                              {totalRecipes} страв
                            </span>
                          </div>
                          <div className="text-xs mb-2" style={{ color: c.dimmed }}>{dateStr}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {firstMeals.slice(0, 4).map((title, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md text-[10px]" style={{ background: c.badgeBg, color: c.muted }}>
                                {title}
                              </span>
                            ))}
                            {firstMeals.length > 4 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: c.badgeBg, color: c.gold }}>
                                +{totalRecipes - 4}
                              </span>
                            )}
                          </div>
                        </div>
                        {!selectMode && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleOpenPlan(plan)}
                              className="px-4 py-2 rounded-lg font-semibold text-xs transition-all hover:translate-y-[-1px]"
                              style={{ background: c.btnBg, color: c.btnText, boxShadow: '0 2px 8px rgba(201,168,76,0.15)' }}
                            >
                              Відкрити
                            </button>
                            <button
                              onClick={() => setConfirmDelete({type: 'plan', id: plan.id})}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{ color: c.dangerColor, background: c.dangerBg }}
                              title="Видалити"
                              aria-label="Видалити план"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ border: `1px solid ${c.emptyBorder}`, background: c.emptyBg }}>
                  <svg className="w-9 h-9" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="text-xl font-serif mb-2" style={{ color: c.text }}>Немає збережених планів</p>
                <p className="text-sm mb-6" style={{ color: c.dimmed }}>Створіть план меню і він з&#39;явиться тут</p>
                <button
                  onClick={() => router.push('/meal-plan')}
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                >
                  Створити план
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.type.startsWith('bulk') ? 'Видалити обрані?' : 'Видалити запис?'}
          message={
            confirmDelete.type === 'bulk-recipes' ? `${selectedRecipes.size} рецептів буде видалено з історії.`
            : confirmDelete.type === 'bulk-plans' ? `${selectedPlans.size} планів буде видалено.`
            : confirmDelete.type === 'recipe' ? 'Рецепт буде видалено з історії.'
            : 'План харчування буде видалено.'
          }
          onConfirm={() => {
            if (confirmDelete.type === 'bulk-recipes') {
              bulkDeleteRecipes()
            } else if (confirmDelete.type === 'bulk-plans') {
              handleBulkDeletePlans()
            } else if (confirmDelete.type === 'recipe') {
              const recipe = history.find(r => r.id === confirmDelete.id)
              if (recipe) removeFromHistory(recipe)
            } else {
              deletePlanFromHistory(confirmDelete.id)
            }
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
