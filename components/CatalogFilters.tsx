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

  const selectStyle: React.CSSProperties = {
    background: c.inputBg,
    border: `1px solid ${c.inputBorder}`,
    color: c.text,
    borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    outline: 'none',
  }

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
            background: c.inputBg,
            border: `1px solid ${c.inputBorder}`,
            color: c.text,
          }}
        />
      </div>

      <select value={cuisine} onChange={(e) => onCuisineChange(e.target.value)} style={selectStyle}>
        {cuisines.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)} style={selectStyle}>
        {difficulties.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select value={sort} onChange={(e) => onSortChange(e.target.value)} style={selectStyle}>
        {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
