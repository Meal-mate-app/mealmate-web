'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

export function RecipeOverlay() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    overlayRecipe, setOverlayRecipe,
    overlayMealContext, setOverlayMealContext,
    toggleFavorite, isFavorite, difficultyLabel,
    setRecipe, startCooking, swapMeal, showToast,
  } = useApp()

  if (!overlayRecipe) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setOverlayRecipe(null); setOverlayMealContext(null) }} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in">
        {/* Close button */}
        <button
          onClick={() => { setOverlayRecipe(null); setOverlayMealContext(null) }}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-xl shadow-md"
        >
          &times;
        </button>

        {/* Header */}
        <div className="relative p-8 pb-6 bg-gradient-to-br from-orange-100 to-amber-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/80 rounded-full text-sm text-gray-700 border border-gray-200">
              {overlayRecipe.cuisine}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyLabel(overlayRecipe.difficulty).classes}`}>
              {difficultyLabel(overlayRecipe.difficulty).text}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-950 mb-3">{overlayRecipe.title}</h2>
          <p className="text-lg text-amber-800/60">{overlayRecipe.description}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200">
          {[
            { icon: '⏱️', value: `${overlayRecipe.prepTime + overlayRecipe.cookTime}`, label: 'хвилин' },
            { icon: '👥', value: overlayRecipe.servings, label: 'порцій' },
            { icon: '🔥', value: overlayRecipe.nutrition.calories, label: 'ккал/порція' },
          ].map((stat, i) => (
            <div key={i} className="p-4 text-center">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Nutrition */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-red-200">
              <div className="text-2xl font-black text-red-500">{overlayRecipe.nutrition.protein}</div>
              <div className="text-[10px] text-gray-500">Білки (г)</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-amber-200">
              <div className="text-2xl font-black text-amber-500">{overlayRecipe.nutrition.carbs}</div>
              <div className="text-[10px] text-gray-500">Вуглеводи (г)</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-yellow-200">
              <div className="text-2xl font-black text-yellow-500">{overlayRecipe.nutrition.fat}</div>
              <div className="text-[10px] text-gray-500">Жири (г)</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-green-200">
              <div className="text-2xl font-black text-green-500">{overlayRecipe.nutrition.fiber ?? 0}</div>
              <div className="text-[10px] text-gray-500">Клітковина (г)</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Ingredients */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Інгредієнти</h3>
              <div className="space-y-2">
                {overlayRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 text-sm">{ing.name}</span>
                    <span className="text-gray-400 text-xs">{ing.amount} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="md:col-span-3">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Як готувати</h3>
              <div className="space-y-4">
                {overlayRecipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {i + 1}
                    </div>
                    <p className="text-gray-600 text-sm pt-1 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {overlayRecipe.tips && overlayRecipe.tips.length > 0 && (
            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200">
              <h4 className="font-bold text-amber-600 mb-3">Поради</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                {overlayRecipe.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => {
                toggleFavorite(overlayRecipe)
                showToast(
                  isFavorite(overlayRecipe.id) ? 'Видалено з улюблених' : 'Додано до улюблених',
                  'success'
                )
              }}
              className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isFavorite(overlayRecipe.id)
                  ? 'bg-pink-500 text-white'
                  : 'bg-white border-2 border-pink-200 text-pink-600 hover:bg-pink-50'
              }`}
            >
              {isFavorite(overlayRecipe.id) ? '❤️ В улюблених' : '🤍 Додати в улюблені'}
            </button>
            {pathname === '/plan-result' && overlayMealContext && (
              <button
                onClick={() => {
                  const ctx = overlayMealContext
                  setOverlayRecipe(null)
                  setOverlayMealContext(null)
                  swapMeal(ctx.dayIndex, ctx.mealIndex)
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
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
                router.push('/cooking')
              }}
              className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              👨‍🍳 Готувати!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
