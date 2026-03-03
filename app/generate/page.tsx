'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/Header'
import { Recipe } from '@/types'
import * as api from '@/lib/api'
import { getThemeColors } from '@/lib/theme'

const INGREDIENT_CATEGORIES = [
  {
    name: "М'ясо та птиця",
    items: [
      { name: 'Курка', emoji: '🍗' }, { name: 'Куряче філе', emoji: '🍗' }, { name: 'Курячі стегна', emoji: '🍗' },
      { name: 'Свинина', emoji: '🥩' }, { name: 'Яловичина', emoji: '🥩' }, { name: 'Фарш', emoji: '🍖' },
      { name: 'Індичка', emoji: '🦃' }, { name: 'Бекон', emoji: '🥓' }, { name: 'Ковбаса', emoji: '🌭' }, { name: 'Сосиски', emoji: '🌭' },
    ]
  },
  {
    name: 'Риба та морепродукти',
    items: [
      { name: 'Риба', emoji: '🐟' }, { name: 'Лосось', emoji: '🐟' }, { name: 'Тунець', emoji: '🐟' },
      { name: 'Креветки', emoji: '🦐' }, { name: 'Кальмари', emoji: '🦑' }, { name: 'Мідії', emoji: '🦪' },
      { name: 'Скумбрія', emoji: '🐟' }, { name: 'Оселедець', emoji: '🐟' },
    ]
  },
  {
    name: 'Овочі',
    items: [
      { name: 'Картопля', emoji: '🥔' }, { name: 'Цибуля', emoji: '🧅' }, { name: 'Морква', emoji: '🥕' },
      { name: 'Помідори', emoji: '🍅' }, { name: 'Огірки', emoji: '🥒' }, { name: 'Капуста', emoji: '🥬' },
      { name: 'Перець', emoji: '🫑' }, { name: 'Часник', emoji: '🧄' }, { name: 'Буряк', emoji: '🟤' },
      { name: 'Кабачок', emoji: '🥒' }, { name: 'Баклажан', emoji: '🍆' }, { name: 'Броколі', emoji: '🥦' },
      { name: 'Цвітна капуста', emoji: '🥬' }, { name: 'Шпинат', emoji: '🥬' }, { name: 'Салат', emoji: '🥬' },
      { name: 'Гриби', emoji: '🍄' }, { name: 'Зелена цибуля', emoji: '🧅' }, { name: 'Кукурудза', emoji: '🌽' },
      { name: 'Горох', emoji: '🫛' }, { name: 'Квасоля', emoji: '🫘' },
    ]
  },
  {
    name: 'Молочні продукти',
    items: [
      { name: 'Яйця', emoji: '🥚' }, { name: 'Молоко', emoji: '🥛' }, { name: 'Сир твердий', emoji: '🧀' },
      { name: "Сир м'який", emoji: '🧀' }, { name: 'Сметана', emoji: '🫙' }, { name: 'Масло', emoji: '🧈' },
      { name: 'Йогурт', emoji: '🥛' }, { name: 'Кефір', emoji: '🥛' }, { name: 'Вершки', emoji: '🥛' },
      { name: 'Творог', emoji: '🧀' }, { name: 'Моцарела', emoji: '🧀' }, { name: 'Пармезан', emoji: '🧀' },
    ]
  },
  {
    name: 'Крупи та борошно',
    items: [
      { name: 'Рис', emoji: '🍚' }, { name: 'Макарони', emoji: '🍝' }, { name: 'Гречка', emoji: '🌾' },
      { name: 'Пшоно', emoji: '🌾' }, { name: 'Вівсянка', emoji: '🥣' }, { name: 'Борошно', emoji: '🌾' },
      { name: 'Хліб', emoji: '🍞' }, { name: 'Булгур', emoji: '🌾' }, { name: 'Кускус', emoji: '🌾' }, { name: 'Манка', emoji: '🌾' },
    ]
  },
  {
    name: 'Фрукти',
    items: [
      { name: 'Яблука', emoji: '🍎' }, { name: 'Банани', emoji: '🍌' }, { name: 'Лимон', emoji: '🍋' },
      { name: 'Апельсин', emoji: '🍊' }, { name: 'Груша', emoji: '🍐' }, { name: 'Виноград', emoji: '🍇' },
      { name: 'Полуниця', emoji: '🍓' }, { name: 'Ківі', emoji: '🥝' }, { name: 'Манго', emoji: '🥭' }, { name: 'Ананас', emoji: '🍍' },
    ]
  },
  {
    name: 'Консерви та соуси',
    items: [
      { name: 'Томатна паста', emoji: '🥫' }, { name: 'Консервовані томати', emoji: '🥫' },
      { name: 'Соєвий соус', emoji: '🫙' }, { name: 'Майонез', emoji: '🫙' }, { name: 'Кетчуп', emoji: '🥫' },
      { name: 'Гірчиця', emoji: '🫙' }, { name: 'Оливки', emoji: '🫒' }, { name: 'Консервована квасоля', emoji: '🥫' },
      { name: 'Консервований горох', emoji: '🥫' }, { name: 'Оцет', emoji: '🫙' },
    ]
  },
  {
    name: 'Спеції та приправи',
    items: [
      { name: 'Сіль', emoji: '🧂' }, { name: 'Перець чорний', emoji: '🌶️' }, { name: 'Паприка', emoji: '🌶️' },
      { name: 'Куркума', emoji: '🟡' }, { name: 'Базилік', emoji: '🌿' }, { name: 'Орегано', emoji: '🌿' },
      { name: 'Кріп', emoji: '🌿' }, { name: 'Петрушка', emoji: '🌿' }, { name: 'Лавровий лист', emoji: '🍃' }, { name: 'Імбир', emoji: '🫚' },
    ]
  },
]

const PANTRY_STAPLES = [
  { name: 'Сіль', emoji: '🧂' }, { name: 'Перець чорний', emoji: '🌶️' },
  { name: 'Олія соняшникова', emoji: '🫒' }, { name: 'Олія оливкова', emoji: '🫒' },
  { name: 'Цукор', emoji: '🍬' }, { name: 'Борошно', emoji: '🌾' },
  { name: 'Оцет', emoji: '🫙' }, { name: 'Часник', emoji: '🧄' }, { name: 'Цибуля', emoji: '🧅' },
]
const DEFAULT_PANTRY = PANTRY_STAPLES.map(s => s.name)

type ViewMode = 'select' | 'result'

export default function GeneratePage() {
  const router = useRouter()
  const { isDark, isFavorite, toggleFavorite, addToHistory, myFridge, myFridgeCustom, settings } = useApp()

  const [viewMode, setViewMode] = useState<ViewMode>('select')
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [customIngredients, setCustomIngredients] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [pantryStaples, setPantryStaples] = useState<Set<string>>(new Set(DEFAULT_PANTRY))
  const [peopleCount, setPeopleCount] = useState(2)
  const [dishDescription, setDishDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [initDone, setInitDone] = useState(false)

  // Pre-fill with fridge items from context
  useEffect(() => {
    if (initDone) return
    if (myFridge.length > 0) {
      setSelectedIngredients(myFridge)
    }
    if (myFridgeCustom.length > 0) {
      setCustomIngredients(myFridgeCustom)
    }
    setInitDone(true)
  }, [myFridge, myFridgeCustom, initDone])

  const toggleIngredient = useCallback((name: string) => {
    setSelectedIngredients(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name])
  }, [])

  const addCustomIngredient = useCallback(() => {
    const trimmed = customInput.trim()
    if (trimmed && !selectedIngredients.includes(trimmed) && !customIngredients.includes(trimmed)) {
      setCustomIngredients(prev => [...prev, trimmed])
      setSelectedIngredients(prev => [...prev, trimmed])
      setCustomInput('')
    }
  }, [customInput, selectedIngredients, customIngredients])

  const removeCustomIngredient = useCallback((name: string) => {
    setCustomIngredients(prev => prev.filter(i => i !== name))
    setSelectedIngredients(prev => prev.filter(i => i !== name))
  }, [])

  const togglePantryStaple = useCallback((name: string) => {
    setPantryStaples(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setSelectedIngredients([])
    setCustomIngredients([])
  }, [])

  const generateRecipe = async () => {
    setIsLoading(true)
    try {
      const allIngredients = [...selectedIngredients, ...Array.from(pantryStaples)]
      const excludedStaples = DEFAULT_PANTRY.filter(s => !pantryStaples.has(s))

      const newRecipe = await api.generateRecipe({
        ingredients: allIngredients,
        peopleCount,
        specificRequest: dishDescription.trim() || undefined,
        allergies: settings.allergies,
        dietaryRestrictions: settings.dietaryRestrictions,
        dislikedIngredients: [...excludedStaples, ...settings.dislikedIngredients],
        calorieGoal: settings.dailyCalorieGoal || undefined,
        proteinGoal: settings.dailyProteinGoal || undefined,
        carbsGoal: settings.dailyCarbsGoal || undefined,
        fatGoal: settings.dailyFatGoal || undefined,
      })
      // Ensure instructions are strings (API may return objects)
      newRecipe.instructions = newRecipe.instructions.map(s =>
        typeof s === 'string' ? s : (s && typeof s === 'object'
          ? (Object.values(s as Record<string, unknown>).find(v => typeof v === 'string' && (v as string).length > 3) as string || JSON.stringify(s))
          : String(s))
      )
      setRecipe(newRecipe)
      addToHistory(newRecipe)
      setViewMode('result')
    } catch {
      // toast would go here
    } finally {
      setIsLoading(false)
    }
  }

  const c = getThemeColors(isDark)

  // ─── RECIPE RESULT VIEW ───
  if (viewMode === 'result' && recipe) {
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
              onClick={() => setViewMode('select')}
              aria-label="Повернутися до вибору інгредієнтів"
              className="flex items-center gap-2 font-medium transition-colors group"
              style={{ color: c.goldMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
              onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Новий рецепт
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
            </div>
          </div>

          {/* Recipe card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
            {/* Header */}
            <div className="p-8 pb-6" style={{ background: c.headerBg }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>{recipe.cuisine}</span>
                <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                  {recipe.difficulty === 'easy' ? 'Легко' : recipe.difficulty === 'medium' ? 'Середньо' : 'Складно'}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3" style={{ color: c.text }}>{recipe.title}</h2>
              <p className="text-base" style={{ color: c.muted }}>{recipe.description}</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3" style={{ borderTop: `1px solid ${c.statBorder}`, borderBottom: `1px solid ${c.statBorder}` }}>
              {[
                { value: `${recipe.prepTime + recipe.cookTime}`, label: 'хвилин' },
                { value: recipe.servings, label: 'порцій' },
                { value: recipe.nutrition.calories, label: 'ккал/порція' },
              ].map((stat, i) => (
                <div key={i} className="p-5 text-center" style={{ background: c.statBg, borderRight: i < 2 ? `1px solid ${c.statBorder}` : undefined }}>
                  <div className="text-2xl font-bold" style={{ color: c.gold }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: c.dimmed }}>{stat.label}</div>
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
                        <span className="text-xs" style={{ color: c.dimmed }}>{ing.amount} {ing.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div className="md:col-span-3">
                  <h3 className="text-lg font-bold mb-5" style={{ color: c.text }}>Як готувати</h3>
                  <div className="space-y-5">
                    {recipe.instructions.map((step, i) => {
                      const text = typeof step === 'string' ? step : (step as unknown as Record<string, string>).step || (step as unknown as Record<string, string>).text || (step as unknown as Record<string, string>).description || JSON.stringify(step)
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

  // ─── INGREDIENT SELECTION VIEW ───
  return (
    <div className="min-h-screen relative">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 animate-in">
        <button
          onClick={() => router.push('/')}
          aria-label="Назад на головну"
          className="flex items-center gap-2 mb-8 font-medium transition-colors group"
          style={{ color: c.goldMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
          onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </button>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-3xl font-serif font-bold mb-2" style={{ color: c.text }}>Що є в холодильнику?</h2>
              <p className="text-sm" style={{ color: c.dimmed }}>Оберіть продукти — AI підбере рецепт</p>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveCategory(null)}
                className="px-4 py-2 rounded-xl font-medium text-sm transition-all"
                style={activeCategory === null
                  ? { background: c.tabActiveBg, color: c.btnText, boxShadow: c.tabActiveShadow }
                  : { background: c.tabBg, border: `1px solid ${c.tabBorder}`, color: c.tabText }
                }
              >
                Все
              </button>
              {INGREDIENT_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                  className="px-4 py-2 rounded-xl font-medium text-sm transition-all"
                  style={activeCategory === cat.name
                    ? { background: c.tabActiveBg, color: c.btnText, boxShadow: c.tabActiveShadow }
                    : { background: c.tabBg, border: `1px solid ${c.tabBorder}`, color: c.tabText }
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Dish description — mobile only */}
            <div className="lg:hidden mb-4">
              <p className="text-xs font-medium mb-1.5" style={{ color: c.dimmed }}>Опишіть страву (необов'язково)</p>
              <textarea
                value={dishDescription}
                onChange={e => setDishDescription(e.target.value)}
                placeholder="Наприклад: щось легке на вечерю, або паста з кремовим соусом..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors resize-none"
                style={{
                  background: c.inputBg,
                  border: `1px solid ${c.inputBorder}`,
                  color: c.text,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
              />
            </div>

            {/* Custom input */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
                placeholder="Додати свій продукт..."
                className="flex-1 px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
                onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
              />
              <button
                onClick={addCustomIngredient}
                disabled={!customInput.trim()}
                className="px-5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                style={{ background: c.btnBg, color: c.btnText }}
              >
                + Додати
              </button>
            </div>

            {/* Ingredients grid */}
            {(activeCategory ? INGREDIENT_CATEGORIES.filter(cat => cat.name === activeCategory) : INGREDIENT_CATEGORIES).map(category => {
              const filteredItems = category.items.filter(ing => !new Set(DEFAULT_PANTRY).has(ing.name))
              if (filteredItems.length === 0) return null
              return (
                <div key={category.name} className="mb-8">
                  {!activeCategory && (
                    <h3 className="text-lg font-serif font-semibold mb-3" style={{ color: c.text }}>{category.name}</h3>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {filteredItems.map(ing => {
                      const isSelected = selectedIngredients.includes(ing.name)
                      return (
                        <button
                          key={ing.name}
                          onClick={() => toggleIngredient(ing.name)}
                          className="relative p-3 rounded-2xl text-center transition-all hover:scale-[1.02]"
                          style={{
                            background: isSelected
                              ? (isDark ? 'linear-gradient(135deg, rgba(212,168,67,0.08), rgba(212,168,67,0.03))' : c.itemActiveBg)
                              : c.itemBg,
                            border: `2px solid ${isSelected ? c.itemActiveBorder : c.itemBorder}`,
                            boxShadow: isSelected ? (isDark ? '0 0 12px rgba(212,168,67,0.15)' : c.btnShadow) : 'none',
                          }}
                        >
                          <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl flex items-center justify-center text-2xl" style={{
                            background: isSelected ? c.badgeBg : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                          }}>
                            {ing.emoji}
                          </div>
                          <div className="text-xs font-medium" style={{ color: isSelected ? c.gold : c.muted }}>{ing.name}</div>
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow" style={{ background: c.checkBg, color: c.btnText }}>
                              &#10003;
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="rounded-2xl p-5 sticky top-24" style={{ background: c.sidebarBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-bold" style={{ color: c.text }}>Мій кошик</h3>
                {selectedIngredients.length > 0 && (
                  <button onClick={clearAll} className="text-xs transition-colors" style={{ color: c.dangerColor }}>
                    Очистити
                  </button>
                )}
              </div>

              {selectedIngredients.length > 0 ? (
                <div className="mb-4">
                  <p className="text-xs mb-2" style={{ color: c.dimmed }}>{selectedIngredients.length} продуктів обрано:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedIngredients.map(ing => {
                      const found = INGREDIENT_CATEGORIES.flatMap(cat => cat.items).find(i => i.name === ing)
                      const isCustom = customIngredients.includes(ing)
                      return (
                        <div key={ing} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: isCustom ? c.fridgeCustomBg : c.fridgeItemBg }}>
                          <span className="flex items-center gap-2 text-sm" style={{ color: c.text }}>
                            <span>{found?.emoji || '📦'}</span>
                            {ing}
                          </span>
                          <button
                            onClick={() => isCustom ? removeCustomIngredient(ing) : toggleIngredient(ing)}
                            aria-label={`Видалити ${ing}`}
                            className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110"
                            style={{ color: c.dangerColor, background: c.dangerBg }}
                          >
                            <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ border: `1px solid ${c.cardBorder}`, background: c.badgeBg }}>
                    <svg className="w-7 h-7" aria-hidden="true" style={{ color: c.dimmed }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: c.dimmed }}>Обери продукти зліва</p>
                </div>
              )}

              {/* Dish description */}
              <div className="pt-4 mb-4" style={{ borderTop: `1px solid ${c.cardBorder}` }}>
                <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: c.dimmed }}>Опишіть страву</p>
                <textarea
                  value={dishDescription}
                  onChange={e => setDishDescription(e.target.value)}
                  placeholder="Наприклад: щось легке на вечерю, або паста з кремовим соусом..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors resize-none"
                  style={{
                    background: c.inputBg,
                    border: `1px solid ${c.inputBorder}`,
                    color: c.text,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                  onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
                />
              </div>

              {/* Pantry staples */}
              <div className="pt-4 mb-4" style={{ borderTop: `1px solid ${c.cardBorder}` }}>
                <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: c.dimmed }}>Базові продукти</p>
                <div className="flex flex-wrap gap-1.5">
                  {PANTRY_STAPLES.map(staple => (
                    <button
                      key={staple.name}
                      onClick={() => togglePantryStaple(staple.name)}
                      className="text-xs px-2 py-1 rounded-md transition-all"
                      style={{
                        background: pantryStaples.has(staple.name) ? c.pantryActiveBg : c.pantryInactiveBg,
                        color: pantryStaples.has(staple.name) ? c.pantryActiveText : c.pantryInactiveText,
                        textDecoration: pantryStaples.has(staple.name) ? 'none' : 'line-through',
                      }}
                    >
                      {staple.emoji} {staple.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* People count */}
              <div className="pt-4 mb-4" style={{ borderTop: `1px solid ${c.cardBorder}` }}>
                <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: c.dimmed }}>Кількість порцій</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                    aria-label="Зменшити кількість порцій"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm font-bold"
                    style={{ background: c.badgeBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}
                  >
                    -
                  </button>
                  <span className="text-lg font-bold" style={{ color: c.text }}>{peopleCount}</span>
                  <button
                    onClick={() => setPeopleCount(Math.min(12, peopleCount + 1))}
                    aria-label="Збільшити кількість порцій"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm font-bold"
                    style={{ background: c.badgeBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Animated count indicator */}
              {selectedIngredients.length > 0 && (
                <div className="text-center mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: c.badgeBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: c.gold }} />
                    {selectedIngredients.length} обрано
                  </span>
                </div>
              )}

              {/* Generate button — premium */}
              <button
                onClick={generateRecipe}
                disabled={isLoading || selectedIngredients.length === 0}
                className="btn-gold-premium w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 rounded-full animate-spin" aria-hidden="true" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'currentColor' }} />
                    Шукаємо...
                  </>
                ) : (
                  'Знайти рецепт'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 z-40" style={{ background: c.pageBg, backdropFilter: 'blur(24px)', borderTop: `1px solid ${c.cardBorder}` }}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-sm font-medium" style={{ color: c.text }}>
                {selectedIngredients.length} продуктів
              </span>
            </div>
            <button
              onClick={generateRecipe}
              disabled={isLoading || selectedIngredients.length === 0}
              className="px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition-all flex items-center gap-2"
              style={{ background: c.btnBg, color: c.btnText }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" aria-hidden="true" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: c.btnText }} />
                  Шукаємо...
                </>
              ) : (
                'Знайти рецепт'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
