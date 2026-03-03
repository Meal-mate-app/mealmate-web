'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/Header'
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

export default function MyFridgePage() {
  const router = useRouter()
  const { isDark, myFridge, myFridgeCustom, toggleMyFridgeItem, addMyFridgeCustom, removeMyFridgeCustom } = useApp()
  const [customIngredient, setCustomIngredient] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const toggleItem = toggleMyFridgeItem

  const addCustom = useCallback((name: string) => {
    const trimmed = name.trim()
    if (trimmed) {
      addMyFridgeCustom(trimmed)
    }
  }, [addMyFridgeCustom])

  const removeCustom = useCallback((name: string) => {
    removeMyFridgeCustom(name)
  }, [removeMyFridgeCustom])

  const clearAll = useCallback(() => {
    myFridge.forEach(item => toggleMyFridgeItem(item))
  }, [myFridge, toggleMyFridgeItem])

  const c = getThemeColors(isDark)

  const allItems = myFridge.map(name => {
    const found = INGREDIENT_CATEGORIES.flatMap(cat => cat.items).find(i => i.name === name)
    return { name, emoji: found?.emoji || '📦', isCustom: myFridgeCustom.includes(name) }
  })

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
                Всі
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

            {/* Custom ingredient input */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={customIngredient}
                onChange={e => setCustomIngredient(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customIngredient.trim()) {
                    addCustom(customIngredient)
                    setCustomIngredient('')
                  }
                }}
                placeholder="Додати свій продукт..."
                className="flex-1 px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                style={{
                  background: c.inputBg,
                  border: `1px solid ${c.inputBorder}`,
                  color: c.text,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
              />
              <button
                onClick={() => {
                  if (customIngredient.trim()) {
                    addCustom(customIngredient)
                    setCustomIngredient('')
                  }
                }}
                disabled={!customIngredient.trim()}
                className="px-5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                style={{ background: c.btnBg, color: c.btnText }}
              >
                + Додати
              </button>
            </div>

            {/* Ingredients grid */}
            {(activeCategory ? INGREDIENT_CATEGORIES.filter(cat => cat.name === activeCategory) : INGREDIENT_CATEGORIES).map(category => (
              <div key={category.name} className="mb-8">
                {!activeCategory && (
                  <h3 className="text-lg font-serif font-semibold mb-3" style={{ color: c.text }}>
                    {category.name}
                  </h3>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {category.items.map(ing => {
                    const isSelected = myFridge.includes(ing.name)
                    return (
                      <button
                        key={ing.name}
                        onClick={() => toggleItem(ing.name)}
                        className="relative p-3 rounded-2xl text-center transition-all hover:scale-[1.02]"
                        style={{
                          background: isSelected ? c.itemActiveBg : c.itemBg,
                          border: `2px solid ${isSelected ? c.itemActiveBorder : c.itemBorder}`,
                          boxShadow: isSelected ? c.btnShadow : 'none',
                        }}
                      >
                        <div className="text-2xl mb-1.5">{ing.emoji}</div>
                        <div className="text-xs font-medium" style={{ color: isSelected ? c.gold : c.muted }}>{ing.name}</div>
                        {isSelected && (
                          <div
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                            style={{ background: c.checkBg, color: c.btnText }}
                          >
                            &#10003;
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="rounded-2xl p-5 sticky top-24" style={{ background: c.sidebarBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-bold" style={{ color: c.text }}>В холодильнику</h3>
                {myFridge.length > 0 && (
                  <button onClick={clearAll} className="text-xs transition-colors" style={{ color: c.dangerColor }}>
                    Очистити
                  </button>
                )}
              </div>

              {allItems.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allItems.map(item => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2.5 rounded-xl"
                      style={{ background: item.isCustom ? c.fridgeCustomBg : c.fridgeItemBg }}
                    >
                      <span className="flex items-center gap-2 text-sm" style={{ color: c.text }}>
                        <span>{item.emoji}</span>
                        {item.name}
                      </span>
                      <button
                        onClick={() => item.isCustom ? removeCustom(item.name) : toggleItem(item.name)}
                        aria-label={`Видалити ${item.name}`}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110"
                        style={{ color: c.dangerColor, background: c.dangerBg }}
                      >
                        <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ border: `1px solid ${c.emptyBorder}`, background: c.emptyBg }}>
                    <svg className="w-7 h-7" aria-hidden="true" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: c.dimmed }}>Холодильник порожній</p>
                  <p className="text-xs mt-1" style={{ color: c.dimmed }}>Оберіть продукти зліва</p>
                </div>
              )}

              {myFridge.length > 0 && (
                <button
                  onClick={() => router.push('/generate')}
                  className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm transition-all hover:translate-y-[-1px]"
                  style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                >
                  Створити рецепт
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 z-40" style={{ background: c.pageBg, backdropFilter: 'blur(24px)', borderTop: `1px solid ${c.cardBorder}` }}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-sm font-medium" style={{ color: c.text }}>
                {myFridge.length} {myFridge.length === 1 ? 'продукт' : 'продуктів'}
              </span>
            </div>
            <button
              onClick={() => router.push('/generate')}
              disabled={myFridge.length === 0}
              className="px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition-all"
              style={{ background: c.btnBg, color: c.btnText }}
            >
              Створити рецепт
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
