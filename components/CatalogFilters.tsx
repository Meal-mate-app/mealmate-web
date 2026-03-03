'use client'

import { useState, useRef, useEffect } from 'react'
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

interface DropdownProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  isDark: boolean
}

function Dropdown({ options, value, onChange, isDark }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const c = getThemeColors(isDark)
  const selected = options.find((o) => o.value === value) || options[0]

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl py-2 px-3 text-sm transition-all whitespace-nowrap"
        style={{
          background: c.cardBgSolid,
          border: `1px solid ${value ? c.gold + '40' : c.cardBorder}`,
          color: value ? c.gold : c.text,
        }}
      >
        <span>{selected.label}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: c.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 left-0 min-w-full w-max rounded-xl py-1 z-50 shadow-xl max-h-64 overflow-y-auto"
          style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}` }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm transition-colors"
              style={{
                color: opt.value === value ? c.gold : c.text,
                background: opt.value === value ? (isDark ? 'rgba(212,168,67,0.1)' : 'rgba(184,134,11,0.06)') : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) e.currentTarget.style.background = isDark ? '#1a1610' : '#fdf8f0'
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) e.currentTarget.style.background = 'transparent'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function CatalogFilters({
  search, onSearchChange,
  cuisine, onCuisineChange,
  difficulty, onDifficultyChange,
  sort, onSortChange,
}: CatalogFiltersProps) {
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

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

      <div className="flex gap-2 flex-wrap">
        <Dropdown options={cuisines} value={cuisine} onChange={onCuisineChange} isDark={isDark} />
        <Dropdown options={difficulties} value={difficulty} onChange={onDifficultyChange} isDark={isDark} />
        <Dropdown options={sortOptions} value={sort} onChange={onSortChange} isDark={isDark} />
      </div>
    </div>
  )
}
