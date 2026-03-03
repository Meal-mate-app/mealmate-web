'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'
import { Header } from '@/components/Header'
import { CatalogFilters } from '@/components/CatalogFilters'
import { CatalogRecipeCard } from '@/components/CatalogRecipeCard'
import { RecipeOfTheDayBanner } from '@/components/RecipeOfTheDayBanner'
import * as api from '@/lib/api'
import { Recipe } from '@/types'

type CatalogRecipe = Recipe & { avgRating?: number; ratingCount?: number }

export default function CatalogPage() {
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

  const [recipes, setRecipes] = useState<CatalogRecipe[]>([])
  const [recipeOfTheDay, setRecipeOfTheDay] = useState<CatalogRecipe | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [sort, setSort] = useState('newest')

  const limit = 12
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Debounce search
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const fetchRecipes = useCallback(async (pageNum: number, append: boolean) => {
    try {
      setError(null)
      if (append) setLoadingMore(true)
      else setLoading(true)

      const data = await api.getCatalog({
        search: debouncedSearch || undefined,
        cuisine: cuisine || undefined,
        difficulty: difficulty || undefined,
        sort,
        page: pageNum,
        limit,
      })

      if (append) {
        setRecipes((prev) => [...prev, ...data.items as CatalogRecipe[]])
      } else {
        setRecipes(data.items as CatalogRecipe[])
      }
      setTotal(data.total)
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to load catalog:', err)
      setError('Не вдалося завантажити рецепти. Спробуйте пізніше.')
      if (!append) setRecipes([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedSearch, cuisine, difficulty, sort])

  useEffect(() => {
    fetchRecipes(1, false)
  }, [fetchRecipes])

  useEffect(() => {
    api.getRecipeOfTheDay().then((r) => {
      if (r) setRecipeOfTheDay(r as CatalogRecipe)
    }).catch(() => {})
  }, [])

  const hasMore = recipes.length < total

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2" style={{ color: c.text }}>
          Каталог рецептів
        </h1>
        <p className="text-sm mb-6" style={{ color: c.muted }}>
          Готові рецепти від шеф-кухарів з усього світу
        </p>

        <RecipeOfTheDayBanner recipe={recipeOfTheDay} />

        <CatalogFilters
          search={search}
          onSearchChange={setSearch}
          cuisine={cuisine}
          onCuisineChange={setCuisine}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          sort={sort}
          onSortChange={setSort}
        />

        {error ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <div className="text-4xl mb-3">{'⚠️'}</div>
            <p className="text-sm font-medium" style={{ color: c.text }}>{error}</p>
            <button
              onClick={() => fetchRecipes(1, false)}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: c.btnBg, color: c.btnText }}
            >
              Спробувати знову
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${c.gold} transparent ${c.gold} transparent` }} />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <div className="text-5xl mb-3">{'\u{1F373}'}</div>
            <p className="text-lg font-medium" style={{ color: c.text }}>Рецептів не знайдено</p>
            <p className="text-sm mt-1" style={{ color: c.muted }}>
              {debouncedSearch ? `Нічого не знайдено за запитом "${debouncedSearch}"` : 'Спробуйте змінити фільтри'}
            </p>
            {(debouncedSearch || cuisine || difficulty) && (
              <button
                onClick={() => { setSearch(''); setCuisine(''); setDifficulty(''); setSort('newest') }}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: c.badgeBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}
              >
                Скинути фільтри
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: c.muted }}>
              Знайдено: {total} {total === 1 ? 'рецепт' : total < 5 ? 'рецепти' : 'рецептів'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipes.map((recipe) => (
                <CatalogRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchRecipes(page + 1, true)}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: c.btnBg,
                    color: c.btnText,
                    boxShadow: c.btnShadow,
                    opacity: loadingMore ? 0.7 : 1,
                  }}
                >
                  {loadingMore ? 'Завантаження...' : 'Завантажити ще'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
