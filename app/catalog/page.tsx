'use client'

import { useState, useEffect, useCallback } from 'react'
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

  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [sort, setSort] = useState('newest')

  const limit = 12

  const fetchRecipes = useCallback(async (pageNum: number, append: boolean) => {
    try {
      if (append) setLoadingMore(true)
      else setLoading(true)

      const data = await api.getCatalog({
        search: search || undefined,
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
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [search, cuisine, difficulty, sort])

  useEffect(() => {
    fetchRecipes(1, false)
  }, [fetchRecipes])

  useEffect(() => {
    api.getRecipeOfTheDay().then((r) => {
      if (r) setRecipeOfTheDay(r as CatalogRecipe)
    }).catch(console.error)
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${c.gold} transparent ${c.gold} transparent` }} />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{'\u{1F373}'}</div>
            <p className="text-lg font-medium" style={{ color: c.text }}>Рецептів не знайдено</p>
            <p className="text-sm mt-1" style={{ color: c.muted }}>Спробуйте змінити фільтри</p>
          </div>
        ) : (
          <>
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
