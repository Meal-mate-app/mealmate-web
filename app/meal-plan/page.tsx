'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/Header'
import { getThemeColors } from '@/lib/theme'
import * as api from '@/lib/api'

type ViewMode = 'setup' | 'result' | 'loading'

export default function MealPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    isDark,
    isLoading,
    mealPlan, setMealPlan,
    planDays, setPlanDays,
    useFridgeForPlan, setUseFridgeForPlan,
    planCuisine, setPlanCuisine,
    planDifficulty, setPlanDifficulty,
    planCookingTime, setPlanCookingTime,
    planDescription, setPlanDescription,
    selectedDayIndex, setSelectedDayIndex,
    checkedItems,
    showShoppingList, setShowShoppingList,
    swappingMeal,
    zakazSearchIndex, setZakazSearchIndex,
    zakazResults, zakazLoading,
    myFridge,
    overlayRecipe, setOverlayRecipe,
    overlayMealContext, setOverlayMealContext,
    generateMealPlan,
    swapMeal,
    searchZakazProducts,
    toggleItem,
    startOrderPreparation,
    getDayMacros,
    difficultyLabel,
    toggleFavorite,
    isFavorite,
    showToast,
    setRecipe,
    startCooking,
  } = useApp()

  const planId = searchParams.get('planId')
  const [loadingPlan, setLoadingPlan] = useState(false)

  // Load plan by ID from API
  useEffect(() => {
    if (planId && (!mealPlan || mealPlan.id !== planId)) {
      setLoadingPlan(true)
      api.getMealPlan(planId)
        .then(plan => {
          setMealPlan(plan)
          setSelectedDayIndex(0)
        })
        .catch(() => {
          showToast('Не вдалось завантажити план', 'error')
        })
        .finally(() => setLoadingPlan(false))
    }
  }, [planId]) // eslint-disable-line react-hooks/exhaustive-deps

  const viewMode: ViewMode = loadingPlan ? 'loading' : mealPlan ? 'result' : 'setup'

  const handleGeneratePlan = async () => {
    const newPlanId = await generateMealPlan()
    if (newPlanId) {
      router.replace(`/meal-plan?planId=${newPlanId}`)
    }
  }

  const handleStartOrder = () => {
    startOrderPreparation()
    router.push('/?mode=order-prepare')
  }

  const goBack = () => {
    if (planId) {
      router.push('/')
    } else {
      router.push('/')
    }
  }

  const c = getThemeColors(isDark)

  // ─── LOADING STATE ───
  if (viewMode === 'loading') {
    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-3 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: c.cardBorder, borderTopColor: c.gold }} />
            <p className="text-sm" style={{ color: c.dimmed }}>Завантажуємо план...</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── PLAN RESULT VIEW ───
  if (viewMode === 'result' && mealPlan) {
    const selectedDay = mealPlan.days[selectedDayIndex]
    const macros = selectedDay ? getDayMacros(selectedDay) : { protein: 0, carbs: 0, fat: 0, proteinPct: 0, carbsPct: 0, fatPct: 0 }

    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-8 animate-in">
          <button
            onClick={goBack}
            className="flex items-center gap-2 mb-10 font-medium transition-colors group"
            style={{ color: c.goldMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
            onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Новий план
          </button>

          <h2 className="text-3xl font-serif font-bold mb-6" style={{ color: c.text }}>
            Меню на {mealPlan.days.length} днів
          </h2>

          {/* Day strip */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {mealPlan.days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => { setSelectedDayIndex(idx); setZakazSearchIndex(null) }}
                className="flex-shrink-0 px-5 py-3 rounded-2xl border-2 transition-all min-w-[90px] text-center relative"
                style={selectedDayIndex === idx
                  ? { borderColor: c.gold, background: c.btnBg, color: c.btnText, boxShadow: `0 4px 16px rgba(212,168,67,0.25)` }
                  : { borderColor: c.cardBorder, background: c.cardBgSolid, color: c.text }
                }
              >
                <div className="text-lg font-bold">День {idx + 1}</div>
                <div className="text-xs" style={{ color: selectedDayIndex === idx ? c.btnText : c.dimmed }}>
                  {day.totalNutrition.calories} ккал
                </div>
                {/* Bottom gold accent line for active */}
                {selectedDayIndex === idx && (
                  <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
                )}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Selected day detail */}
            <div className="lg:col-span-2">
              {selectedDay && (
                <div className="space-y-6">
                  {/* Day header */}
                  <div className="rounded-2xl p-5" style={{ background: isDark ? c.headerBg : 'linear-gradient(135deg, #fef9e7, #fdf8f0)', border: `1px solid ${c.cardBorder}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-serif font-bold text-xl" style={{ color: c.text }}>{selectedDay.date}</h3>
                        <p className="text-sm" style={{ color: c.dimmed }}>{selectedDay.totalNutrition.calories} ккал за день</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: c.macroProtein }}>{macros.protein}г</div>
                          <div className="text-[10px]" style={{ color: c.dimmed }}>Білки</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: c.macroCarbs }}>{macros.carbs}г</div>
                          <div className="text-[10px]" style={{ color: c.dimmed }}>Вуглеводи</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: c.macroFat }}>{macros.fat}г</div>
                          <div className="text-[10px]" style={{ color: c.dimmed }}>Жири</div>
                        </div>
                      </div>
                    </div>
                    {/* Macro ratio bar — thicker */}
                    <div className="h-2 rounded-full overflow-hidden flex mb-3" style={{ background: c.statBg }}>
                      <div className="transition-all rounded-l-full" style={{ width: `${macros.proteinPct}%`, background: c.macroProtein }} />
                      <div className="transition-all" style={{ width: `${macros.carbsPct}%`, background: c.macroCarbs }} />
                      <div className="transition-all rounded-r-full" style={{ width: `${macros.fatPct}%`, background: c.macroFat }} />
                    </div>
                    {/* Individual labeled progress bars */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Білки', value: macros.protein, pct: macros.proteinPct, color: c.macroProtein },
                        { label: 'Вуглеводи', value: macros.carbs, pct: macros.carbsPct, color: c.macroCarbs },
                        { label: 'Жири', value: macros.fat, pct: macros.fatPct, color: c.macroFat },
                      ].map((m, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px]" style={{ color: c.dimmed }}>{m.label}</span>
                            <span className="text-[10px] font-medium" style={{ color: m.color }}>{m.value}г</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: c.statBg }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, background: m.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meal cards */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedDay.meals.map((meal, mealIndex) => {
                      const diff = difficultyLabel(meal.recipe.difficulty)
                      const isSwapping = swappingMeal?.dayIndex === selectedDayIndex && swappingMeal?.mealIndex === mealIndex
                      return (
                        <div key={mealIndex} className="rounded-2xl overflow-hidden group relative card-gold-hover" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
                          {/* Calorie badge */}
                          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: c.badgeBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}>
                            {meal.recipe.nutrition.calories} ккал
                          </div>
                          {/* Swap button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); swapMeal(selectedDayIndex, mealIndex) }}
                            disabled={isSwapping || swappingMeal !== null}
                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50"
                            style={{ background: c.badgeBg, border: `1px solid ${c.cardBorder}`, color: c.muted }}
                            title="Замінити страву"
                          >
                            {isSwapping ? (
                              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: c.dimmed, borderTopColor: c.gold }} />
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                              </svg>
                            )}
                          </button>

                          <button
                            onClick={() => { setOverlayRecipe(meal.recipe); setOverlayMealContext({ dayIndex: selectedDayIndex, mealIndex }) }}
                            className="p-5 text-left w-full transition-all"
                            style={{ opacity: isSwapping ? 0.5 : 1 }}
                            disabled={isSwapping}
                          >
                            <div className="flex items-center gap-2 mb-3 mt-4">
                              <div className="w-2 h-2 rounded-full" style={{ background: c.gold }} />
                              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: c.dimmed }}>
                                {meal.type === 'breakfast' ? 'Сніданок' : meal.type === 'lunch' ? 'Обід' : meal.type === 'dinner' ? 'Вечеря' : 'Перекус'}
                              </span>
                            </div>
                            <h4 className="font-semibold mb-2 line-clamp-2" style={{ color: c.text }}>{meal.recipe.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${diff.classes}`}>{diff.text}</span>
                              <span className="px-2 py-0.5 rounded-md text-[10px]" style={{ background: c.badgeBg, color: c.muted }}>{meal.recipe.cuisine}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm" style={{ color: c.dimmed }}>
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {meal.recipe.prepTime + meal.recipe.cookTime}хв
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 6.51 6.51 0 009 11.5a3 3 0 105.998-1.354 6.476 6.476 0 00.364-4.932z" /></svg>
                                {meal.recipe.nutrition.calories}
                              </span>
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping List - Desktop sidebar */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="rounded-2xl p-6 sticky top-24" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: c.text }}>
                    <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                    Список покупок
                  </h3>
                  <span className="font-bold text-sm" style={{ color: c.gold }}>
                    {mealPlan.shoppingList.length > 0 ? Math.round((checkedItems.size / mealPlan.shoppingList.length) * 100) : 0}%
                  </span>
                </div>

                {/* Progress */}
                <div className="h-2 rounded-full mb-6 overflow-hidden" style={{ background: c.statBg }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${mealPlan.shoppingList.length > 0 ? (checkedItems.size / mealPlan.shoppingList.length) * 100 : 0}%`, background: c.btnBg }}
                  />
                </div>

                <div className="space-y-2 max-h-[45vh] overflow-y-auto mb-6 pr-1">
                  {mealPlan.shoppingList.map((item, i) => (
                    <div key={i}>
                      <div
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: checkedItems.has(i) ? (isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4') : c.cardBg,
                          border: `1px solid ${checkedItems.has(i) ? (isDark ? 'rgba(34,197,94,0.3)' : '#bbf7d0') : c.cardBorder}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checkedItems.has(i)}
                          onChange={() => toggleItem(i)}
                          className="flex-shrink-0"
                        />
                        <span className="flex-1 text-sm" style={{ color: checkedItems.has(i) ? c.dimmed : c.text, textDecoration: checkedItems.has(i) ? 'line-through' : 'none' }}>
                          {item.ingredient}
                        </span>
                        <span className="text-xs flex-shrink-0" style={{ color: c.dimmed }}>{item.amount} {item.unit}</span>
                        {!checkedItems.has(i) && (
                          <button
                            onClick={() => searchZakazProducts(item.ingredient, i)}
                            className="flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
                            style={{
                              background: zakazSearchIndex === i ? c.btnBg : c.badgeBg,
                              color: zakazSearchIndex === i ? c.btnText : c.gold,
                            }}
                          >
                            Знайти
                          </button>
                        )}
                      </div>

                      {/* Zakaz.ua inline results */}
                      {zakazSearchIndex === i && (
                        <div className="ml-8 mt-2 mb-2 space-y-2">
                          {zakazLoading ? (
                            <div className="flex items-center gap-2 p-3 text-sm" style={{ color: c.dimmed }}>
                              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: c.dimmed, borderTopColor: c.gold }} />
                              Шукаємо на Zakaz.ua...
                            </div>
                          ) : zakazResults.length > 0 ? (
                            zakazResults.map((product, pi) => (
                              <a
                                key={pi}
                                href={product.web_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                                style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}
                              >
                                {product.img && (
                                  <img src={product.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate" style={{ color: c.text }}>{product.title}</div>
                                  <div className="text-[10px]" style={{ color: c.dimmed }}>{product.unit}</div>
                                </div>
                                <div className="text-sm font-bold flex-shrink-0" style={{ color: c.gold }}>
                                  {product.price.toFixed(2)} ₴
                                </div>
                              </a>
                            ))
                          ) : (
                            <div className="p-3 text-xs text-center" style={{ color: c.dimmed }}>
                              Товарів не знайдено
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStartOrder}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
                  style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.149-.504 1.149-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-2.25m-7.5-1.5H5.625c-.621 0-1.125.504-1.125 1.125v4.5m8.25-4.5h4.5c.621 0 1.125.504 1.125 1.125v4.5m-12.75 0v-4.5m0 0h12.75" /></svg>
                  Підготувати замовлення
                </button>
                <p className="text-center text-xs mt-2" style={{ color: c.dimmed }}>
                  Zakaz.ua
                </p>
              </div>
            </div>
          </div>

          {/* Mobile floating cart button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowShoppingList(true)}
              className="w-16 h-16 rounded-full flex items-center justify-center relative"
              style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {mealPlan.shoppingList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: c.dangerColor, color: '#fff' }}>
                  {mealPlan.shoppingList.length - checkedItems.size}
                </span>
              )}
            </button>
          </div>

          {/* Mobile shopping list bottom sheet */}
          {showShoppingList && (
            <div className="lg:hidden fixed inset-0 z-[55]">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowShoppingList(false)} />
              <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-in" style={{ background: c.pageBg }}>
                <div className="p-6" style={{ borderBottom: `1px solid ${c.cardBorder}` }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: c.text }}>
                      <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                      Список покупок
                    </h3>
                    <button onClick={() => setShowShoppingList(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.badgeBg, color: c.muted }}>&times;</button>
                  </div>
                  <div className="h-2 rounded-full mt-4 overflow-hidden" style={{ background: c.statBg }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${mealPlan.shoppingList.length > 0 ? (checkedItems.size / mealPlan.shoppingList.length) * 100 : 0}%`, background: c.btnBg }}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {mealPlan.shoppingList.map((item, i) => (
                    <div key={i}>
                      <div
                        className="flex items-center gap-3 p-3 rounded-xl transition-all"
                        style={{
                          background: checkedItems.has(i) ? (isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4') : c.cardBg,
                          border: `1px solid ${checkedItems.has(i) ? (isDark ? 'rgba(34,197,94,0.3)' : '#bbf7d0') : c.cardBorder}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checkedItems.has(i)}
                          onChange={() => toggleItem(i)}
                          className="flex-shrink-0"
                        />
                        <span className="flex-1 text-sm" style={{ color: checkedItems.has(i) ? c.dimmed : c.text, textDecoration: checkedItems.has(i) ? 'line-through' : 'none' }}>
                          {item.ingredient}
                        </span>
                        <span className="text-xs" style={{ color: c.dimmed }}>{item.amount} {item.unit}</span>
                        {!checkedItems.has(i) && (
                          <button
                            onClick={() => searchZakazProducts(item.ingredient, i)}
                            className="flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
                            style={{
                              background: zakazSearchIndex === i ? c.btnBg : c.badgeBg,
                              color: zakazSearchIndex === i ? c.btnText : c.gold,
                            }}
                          >
                            Знайти
                          </button>
                        )}
                      </div>
                      {zakazSearchIndex === i && (
                        <div className="ml-8 mt-2 mb-2 space-y-2">
                          {zakazLoading ? (
                            <div className="flex items-center gap-2 p-3 text-sm" style={{ color: c.dimmed }}>
                              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: c.dimmed, borderTopColor: c.gold }} />
                              Шукаємо...
                            </div>
                          ) : zakazResults.length > 0 ? (
                            zakazResults.map((product, pi) => (
                              <a
                                key={pi}
                                href={product.web_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                                style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}
                              >
                                {product.img && (
                                  <img src={product.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate" style={{ color: c.text }}>{product.title}</div>
                                  <div className="text-[10px]" style={{ color: c.dimmed }}>{product.unit}</div>
                                </div>
                                <div className="text-sm font-bold flex-shrink-0" style={{ color: c.gold }}>{product.price.toFixed(2)} ₴</div>
                              </a>
                            ))
                          ) : (
                            <div className="p-3 text-xs text-center" style={{ color: c.dimmed }}>Не знайдено</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4" style={{ borderTop: `1px solid ${c.cardBorder}` }}>
                  <button
                    onClick={() => { setShowShoppingList(false); handleStartOrder() }}
                    className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
                    style={{ background: c.btnBg, color: c.btnText }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.149-.504 1.149-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-2.25m-7.5-1.5H5.625c-.621 0-1.125.504-1.125 1.125v4.5m8.25-4.5h4.5c.621 0 1.125.504 1.125 1.125v4.5m-12.75 0v-4.5m0 0h12.75" /></svg>
                    Підготувати замовлення
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recipe overlay */}
        {overlayRecipe && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setOverlayRecipe(null); setOverlayMealContext(null) }} />
            <div className="relative w-full max-w-2xl mx-4 my-8 rounded-3xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <button
                onClick={() => { setOverlayRecipe(null); setOverlayMealContext(null) }}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: c.badgeBg, color: c.muted }}
              >
                &times;
              </button>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>{overlayRecipe.cuisine}</span>
                  <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${difficultyLabel(overlayRecipe.difficulty).classes}`}>{difficultyLabel(overlayRecipe.difficulty).text}</span>
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2" style={{ color: c.text }}>{overlayRecipe.title}</h3>
                <p className="text-sm mb-6" style={{ color: c.muted }}>{overlayRecipe.description}</p>

                {/* Quick stats */}
                <div className="grid grid-cols-3 rounded-xl overflow-hidden mb-6" style={{ border: `1px solid ${c.statBorder}` }}>
                  {[
                    { value: `${overlayRecipe.prepTime + overlayRecipe.cookTime}`, label: 'хвилин' },
                    { value: overlayRecipe.servings, label: 'порцій' },
                    { value: overlayRecipe.nutrition.calories, label: 'ккал' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 text-center" style={{ background: c.statBg, borderRight: i < 2 ? `1px solid ${c.statBorder}` : undefined }}>
                      <div className="text-xl font-bold" style={{ color: c.gold }}>{stat.value}</div>
                      <div className="text-[10px]" style={{ color: c.dimmed }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Ingredients */}
                <h4 className="font-bold text-sm mb-3" style={{ color: c.text }}>Інгредієнти</h4>
                <div className="space-y-2 mb-6">
                  {overlayRecipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: c.ingBg, border: `1px solid ${c.ingBorder}` }}>
                      <span className="text-sm" style={{ color: c.text }}>{ing.name}</span>
                      <span className="text-xs" style={{ color: c.dimmed }}>{ing.amount} {ing.unit}</span>
                    </div>
                  ))}
                </div>

                {/* Steps */}
                <h4 className="font-bold text-sm mb-3" style={{ color: c.text }}>Як готувати</h4>
                <div className="space-y-4 mb-6">
                  {overlayRecipe.instructions.map((step, i) => {
                    const text = typeof step === 'string' ? step : (() => { const obj = step as unknown as Record<string, unknown>; const t = [obj.text, obj.description, obj.instruction, obj.content].find(v => typeof v === 'string'); return t as string || (typeof obj.step === 'string' ? obj.step : JSON.stringify(step)) })()
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: c.stepNumBg, color: c.btnText }}>
                          {i + 1}
                        </div>
                        <p className="text-sm pt-0.5 leading-relaxed" style={{ color: c.textSecondary }}>{text}</p>
                      </div>
                    )
                  })}
                </div>

                {overlayRecipe.tips && overlayRecipe.tips.length > 0 && (
                  <div className="p-5 rounded-2xl mb-6" style={{ background: c.tipsBg, border: `1px solid ${c.tipsBorder}` }}>
                    <h4 className="font-bold text-sm mb-2" style={{ color: c.gold }}>Поради</h4>
                    <ul className="space-y-1.5">
                      {overlayRecipe.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: c.textSecondary }}>
                          <span style={{ color: c.gold }}>•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      toggleFavorite(overlayRecipe)
                      showToast(
                        isFavorite(overlayRecipe.id) ? 'Видалено з улюблених' : 'Додано до улюблених',
                        'success'
                      )
                    }}
                    className="flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: isFavorite(overlayRecipe.id) ? c.dangerColor : c.badgeBg,
                      color: isFavorite(overlayRecipe.id) ? '#fff' : c.dangerColor,
                      border: isFavorite(overlayRecipe.id) ? 'none' : `2px solid ${c.dangerColor}`,
                    }}
                  >
                    {isFavorite(overlayRecipe.id) ? '❤️ В улюблених' : '🤍 Додати в улюблені'}
                  </button>
                  {overlayMealContext && (
                    <button
                      onClick={() => {
                        const ctx = overlayMealContext
                        setOverlayRecipe(null)
                        setOverlayMealContext(null)
                        swapMeal(ctx.dayIndex, ctx.mealIndex)
                      }}
                      className="flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                      style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                      Замінити страву
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setRecipe(overlayRecipe)
                      setOverlayRecipe(null)
                      setOverlayMealContext(null)
                      startCooking()
                      router.push('/')
                    }}
                    className="flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ background: c.successColor, color: '#fff' }}
                  >
                    👨‍🍳 Готувати!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── PLAN SETUP VIEW ───
  return (
    <div className="min-h-screen relative">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-6 animate-in">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 mb-4 text-sm font-medium transition-colors group"
          style={{ color: c.goldMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
          onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif font-bold mb-1" style={{ color: c.text }}>
            📅 Новий план харчування
          </h2>
          <p className="text-sm" style={{ color: c.dimmed }}>
            Налаштуйте параметри та створіть меню
          </p>
        </div>

        {/* Days selection — inline */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2" style={{ color: c.dimmed }}>Кількість днів</p>
          <div className="flex gap-3">
            {[
              { days: 3, desc: 'Короткий' },
              { days: 5, desc: 'Робочий' },
              { days: 7, desc: 'Тиждень' },
            ].map(opt => (
              <button
                key={opt.days}
                onClick={() => setPlanDays(opt.days)}
                className="flex-1 py-4 rounded-2xl border-2 transition-all text-center"
                style={planDays === opt.days
                  ? { borderColor: c.gold, background: c.headerBg, boxShadow: c.btnShadow }
                  : { borderColor: c.cardBorder, background: c.cardBg }
                }
              >
                <div className="text-3xl font-black" style={{ color: c.gold }}>{opt.days}</div>
                <div className="text-[11px]" style={{ color: c.dimmed }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Fridge toggle — compact */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2" style={{ color: c.dimmed }}>Джерело продуктів</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUseFridgeForPlan(false)}
              className="p-4 rounded-xl border-2 transition-all text-left"
              style={!useFridgeForPlan
                ? { borderColor: c.gold, background: c.headerBg, boxShadow: c.btnShadow }
                : { borderColor: c.cardBorder, background: c.cardBg }
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">✨</span>
                <span className="font-bold text-sm" style={{ color: c.text }}>Без обмежень</span>
              </div>
              <p className="text-xs" style={{ color: c.dimmed }}>AI обере рецепти вільно</p>
            </button>
            <button
              onClick={() => setUseFridgeForPlan(true)}
              className="p-4 rounded-xl border-2 transition-all text-left"
              style={useFridgeForPlan
                ? { borderColor: c.gold, background: c.headerBg, boxShadow: c.btnShadow }
                : { borderColor: c.cardBorder, background: c.cardBg }
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🧊</span>
                <span className="font-bold text-sm" style={{ color: c.text }}>З холодильника</span>
              </div>
              <p className="text-xs" style={{ color: c.dimmed }}>Що є + список докупити</p>
            </button>
          </div>

          {/* Fridge summary when active */}
          {useFridgeForPlan && (
            <div className="mt-3 p-3 rounded-xl" style={{ background: c.headerBg, border: `1px solid ${c.cardBorder}` }}>
              {myFridge.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {myFridge.slice(0, 6).map(item => (
                    <span key={item} className="px-2.5 py-0.5 rounded-lg text-[11px]" style={{ background: c.badgeBg, border: `1px solid ${c.badgeBorder}`, color: c.text }}>
                      {item}
                    </span>
                  ))}
                  {myFridge.length > 6 && (
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium" style={{ background: c.badgeBg, color: c.gold }}>
                      +{myFridge.length - 6}
                    </span>
                  )}
                  <button
                    onClick={() => router.push('/my-fridge')}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium" style={{ color: c.gold }}
                  >
                    Редагувати
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: c.dimmed }}>Холодильник порожній</p>
                  <button
                    onClick={() => router.push('/my-fridge')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg"
                    style={{ background: c.btnBg, color: c.btnText }}
                  >
                    Додати
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preferences — two columns */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2" style={{ color: c.dimmed }}>Побажання</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Difficulty */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: c.dimmed }}>Складність</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: '', label: 'Будь-яка', icon: '🎲' },
                  { value: 'easy', label: 'Просто', icon: '👌' },
                  { value: 'medium', label: 'Середня', icon: '👨‍🍳' },
                  { value: 'hard', label: 'Складна', icon: '🔥' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPlanDifficulty(opt.value)}
                    className="p-2 rounded-lg border transition-all text-center"
                    style={planDifficulty === opt.value
                      ? { borderColor: c.gold, background: c.headerBg }
                      : { borderColor: c.cardBorder, background: c.cardBg }
                    }
                  >
                    <span className="text-sm">{opt.icon}</span>
                    <div className="text-[10px] font-medium" style={{ color: planDifficulty === opt.value ? c.text : c.dimmed }}>{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking time */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: c.dimmed }}>Час</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: '', label: 'Будь-який', icon: '⏰' },
                  { value: 'quick', label: '< 30 хв', icon: '⚡' },
                  { value: 'medium', label: '30-60 хв', icon: '🕐' },
                  { value: 'long', label: '60+ хв', icon: '🍲' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPlanCookingTime(opt.value)}
                    className="p-2 rounded-lg border transition-all text-center"
                    style={planCookingTime === opt.value
                      ? { borderColor: c.gold, background: c.headerBg }
                      : { borderColor: c.cardBorder, background: c.cardBg }
                    }
                  >
                    <span className="text-sm">{opt.icon}</span>
                    <div className="text-[10px] font-medium" style={{ color: planCookingTime === opt.value ? c.text : c.dimmed }}>{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cuisine preferences — chips */}
          <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: c.dimmed }}>Кухня</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              { value: 'Українська', icon: '🇺🇦' },
              { value: 'Італійська', icon: '🇮🇹' },
              { value: 'Азійська', icon: '🥢' },
              { value: 'Середземноморська', icon: '🫒' },
              { value: 'Мексиканська', icon: '🌮' },
              { value: 'Французька', icon: '🥐' },
              { value: 'Грузинська', icon: '🇬🇪' },
              { value: 'Американська', icon: '🍔' },
            ].map(opt => {
              const isSelected = planCuisine.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  onClick={() => setPlanCuisine(
                    isSelected
                      ? planCuisine.filter(cv => cv !== opt.value)
                      : [...planCuisine, opt.value]
                  )}
                  className="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
                  style={isSelected
                    ? { borderColor: c.gold, background: c.headerBg, color: c.text }
                    : { borderColor: c.cardBorder, background: c.cardBg, color: c.dimmed }
                  }
                >
                  {opt.icon} {opt.value}
                </button>
              )
            })}
          </div>

          {/* Free text description */}
          <textarea
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            placeholder="Додаткові побажання: більше білка, без гострого, дитяче меню..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl text-sm resize-none transition-all"
            style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              color: c.text,
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = c.gold}
            onBlur={(e) => e.currentTarget.style.borderColor = c.cardBorder}
          />
        </div>

        {/* Summary line + CTA */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-xs" style={{ color: c.dimmed }}>
              <span>📖 {planDays * 3} рецептів</span>
              <span>🛒 Список покупок</span>
              <span>🚚 Доставка</span>
            </div>
          </div>
          <button
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="w-full py-4 font-bold text-base rounded-xl disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
            style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: c.btnText }} />
                Створюємо план...
              </>
            ) : (
              <>
                ✨ Створити план на {planDays} днів
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
