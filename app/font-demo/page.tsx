'use client'

import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'

const FONTS = [
  { name: 'Playfair Display', css: "'Playfair Display', Georgia, serif", style: 'Класичний елегантний serif', italic: true },
  { name: 'Cormorant Garamond', css: "'Cormorant Garamond', Georgia, serif", style: 'Тонкий, люксовий serif', italic: true },
  { name: 'Lora', css: "'Lora', Georgia, serif", style: 'Сучасний м\'який serif', italic: true },
  { name: 'DM Serif Display', css: "'DM Serif Display', Georgia, serif", style: 'Жирний контрастний serif', italic: true },
  { name: 'Spectral', css: "'Spectral', Georgia, serif", style: 'Стильний editorial serif', italic: true },
  { name: 'Fraunces', css: "'Fraunces', Georgia, serif", style: 'М\'який, грайливий, foodie-vibe', italic: true },
  { name: 'Libre Baskerville', css: "'Libre Baskerville', serif", style: 'Класичний книжковий serif', italic: true },
  { name: 'Josefin Sans', css: "'Josefin Sans', sans-serif", style: 'Геометричний мінімалізм', italic: false },
  { name: 'Raleway', css: "'Raleway', sans-serif", style: 'Тонкий елегантний sans', italic: true },
  { name: 'Jost', css: "'Jost', sans-serif", style: 'Bauhaus, преміальний sans', italic: true },
  { name: 'Montserrat', css: "'Montserrat', sans-serif", style: 'Чистий сучасний sans', italic: true },
  { name: 'Philosopher', css: "'Philosopher', serif", style: 'Інтелектуальний, незвичний', italic: true },
  { name: 'Cinzel', css: "'Cinzel', serif", style: 'Римський, монументальний', italic: false },
  // Курсивні / script шрифти
  { name: 'Dancing Script', css: "'Dancing Script', cursive", style: 'Класичний курсив, friendly', italic: false },
  { name: 'Pacifico', css: "'Pacifico', cursive", style: 'Розслаблений, теплий cursive', italic: false },
  { name: 'Great Vibes', css: "'Great Vibes', cursive", style: 'Елегантний каліграфічний', italic: false },
  { name: 'Caveat', css: "'Caveat', cursive", style: 'Рукописний, невимушений', italic: false },
  { name: 'Sacramento', css: "'Sacramento', cursive", style: 'Тонкий підпис-стиль', italic: false },
  { name: 'Satisfy', css: "'Satisfy', cursive", style: 'Ретро елегантний cursive', italic: false },
  { name: 'Lobster', css: "'Lobster', cursive", style: 'Жирний скрипт, bold', italic: false },
  { name: 'Kaushan Script', css: "'Kaushan Script', cursive", style: 'Динамічний, handwritten', italic: false },
  { name: 'Allura', css: "'Allura', cursive", style: 'Витончений, весільний стиль', italic: false },
  { name: 'Alex Brush', css: "'Alex Brush', cursive", style: 'Тонкий каліграфічний brush', italic: false },
]

export default function FontDemoPage() {
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

  return (
    <div className="min-h-screen relative">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-2" style={{ color: c.text }}>Вибір шрифту для MealMate</h1>
        <p className="text-sm mb-10" style={{ color: c.dimmed }}>Скажи мені номер який подобається</p>

        <div className="space-y-4">
          {FONTS.map((font, i) => (
            <div
              key={font.name}
              className="rounded-2xl p-6 transition-all hover:scale-[1.01]"
              style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: c.badgeBg, color: c.gold }}>
                  #{i + 1}
                </span>
                <span className="text-[10px]" style={{ color: c.dimmed }}>{font.style}</span>
              </div>

              {/* eslint-disable-next-line @next/next/no-page-custom-font */}
              <link
                href={`https://fonts.googleapis.com/css2?family=${font.name.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap`}
                rel="stylesheet"
              />

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center relative" style={{ border: `1.5px solid ${c.gold}` }}>
                    <div className="absolute inset-[3px] rounded-full" style={{ border: `1px solid ${isDark ? 'rgba(201,168,76,0.3)' : 'rgba(166,137,50,0.2)'}` }} />
                    <svg className="w-[15px] h-[15px]" style={{ color: c.gold }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                    </svg>
                  </div>
                  {/* Варіант 1: MealMate (camelCase) */}
                  <span
                    className="text-3xl tracking-[0.02em]"
                    style={{ fontFamily: font.css, color: c.text, fontWeight: 300 }}
                  >
                    Meal<span style={{ fontWeight: 700 }}>Mate</span>
                  </span>
                </div>
              </div>

              {/* Варіант 2: MealMate курсивом (якщо шрифт підтримує) */}
              {font.italic && (
                <div className="flex items-center gap-3 mt-2 ml-[48px]">
                  <span
                    className="text-3xl tracking-[0.02em] italic"
                    style={{ fontFamily: font.css, color: c.text, fontWeight: 300 }}
                  >
                    Meal<span style={{ fontWeight: 700 }}>Mate</span>
                  </span>
                  <span className="text-[10px]" style={{ color: c.dimmed }}>italic</span>
                </div>
              )}

              <div className="mt-3 text-lg" style={{ fontFamily: font.css, color: c.muted }}>
                Меню на 7 днів — Що є в холодильнику?
              </div>

              <div className="mt-1 text-[11px] font-mono" style={{ color: c.dimmed }}>
                {font.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
