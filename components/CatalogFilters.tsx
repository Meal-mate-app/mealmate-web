'use client'

import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'

interface CatalogFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  cuisine: string
  onCuisineChange: (v: string) => void
  difficulty: string
  onDifficultyChange: (v: string) => void
  sort: string
  onSortChange: (v: string) => void
}

const cuisines = [
  { value: '', label: 'Всі кухні' },
  { value: 'Українська', label: '\u{1F1FA}\u{1F1E6} Українська' },
  { value: 'Італійська', label: '\u{1F35D} Італійська' },
  { value: 'Японська', label: '\u{1F363} Японська' },
  { value: 'Мексиканська', label: '\u{1F32E} Мексиканська' },
  { value: 'Грузинська', label: '\u{1FAD3} Грузинська' },
  { value: 'Індійська', label: '\u{1F35B} Індійська' },
  { value: 'Французька', label: '\u{1F950} Французька' },
  { value: 'Тайська', label: '\u{1F35C} Тайська' },
  { value: 'Американська', label: '\u{1F354} Американська' },
  { value: 'Грецька', label: '\u{1F957} Грецька' },
  { value: 'Близькосхідна', label: '\u{1F9C6} Близькосхідна' },
]

const difficulties = [
  { value: '', label: 'Будь-яка складність' },
  { value: 'easy', label: 'Легко' },
  { value: 'medium', label: 'Середньо' },
  { value: 'hard', label: 'Складно' },
]

const sortOptions = [
  { value: 'newest', label: 'Найновіші' },
  { value: 'rating', label: 'За рейтингом' },
  { value: 'fastest', label: 'Найшвидші' },
]

export function CatalogFilters({
  search, onSearchChange,
  cuisine, onCuisineChange,
  difficulty, onDifficultyChange,
  sort, onSortChange,
}: CatalogFiltersProps) {
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

  const selectClass = `appearance-none cursor-pointer rounded-xl py-2 pl-3 pr-8 text-sm outline-none transition-colors`

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="flex-1 relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Пошук рецептів..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-colors"
          style={{
            background: c.cardBgSolid,
            border: `1px solid ${c.cardBorder}`,
            color: c.text,
          }}
        />
      </div>

      {/* Cuisine */}
      <div className="relative">
        <select
          value={cuisine}
          onChange={(e) => onCuisineChange(e.target.value)}
          className={selectClass}
          style={{
            background: c.cardBgSolid,
            border: `1px solid ${c.cardBorder}`,
            color: c.text,
          }}
        >
          {cuisines.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </div>

      {/* Difficulty */}
      <div className="relative">
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className={selectClass}
          style={{
            background: c.cardBgSolid,
            border: `1px solid ${c.cardBorder}`,
            color: c.text,
          }}
        >
          {difficulties.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className={selectClass}
          style={{
            background: c.cardBgSolid,
            border: `1px solid ${c.cardBorder}`,
            color: c.text,
          }}
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </div>
    </div>
  )
}
