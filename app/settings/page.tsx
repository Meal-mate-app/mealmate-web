'use client'

import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/Header'
import { getThemeColors } from '@/lib/theme'

const ALLERGY_OPTIONS = ['Глютен', 'Лактоза', 'Горіхи', 'Арахіс', 'Яйця', 'Соя', 'Риба', 'Молюски', 'Кунжут']
const DIET_OPTIONS = ['Вегетаріанство', 'Веганство', 'Кето', 'Без глютену', 'Без лактози', 'Низькокалорійна', 'Високобілкова']

export default function SettingsPage() {
  const router = useRouter()
  const { isDark, settings, toggleAllergy, toggleDiet, updateSettings } = useApp()
  const c = getThemeColors(isDark)

  return (
    <div className="min-h-screen relative">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 animate-in">
        <button
          onClick={() => router.push('/')}
          aria-label="Назад на головну"
          className="flex items-center gap-2 mb-10 font-medium transition-colors group"
          style={{ color: c.goldMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
          onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-px" style={{ background: `linear-gradient(90deg, ${isDark ? 'rgba(201,168,76,0.4)' : '#c9a84c'}, transparent)` }} />
              <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: c.gold }}>Профіль</span>
            </div>
            <h2 className="text-5xl font-serif font-bold mb-3" style={{ color: c.text }}>Налаштування</h2>
            <p style={{ color: c.dimmed }}>Персоналізуйте свій досвід</p>
          </div>

          <div className="space-y-12">
            {/* Allergies */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                  <svg className="w-4 h-4" aria-hidden="true" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: c.text }}>Алергії</h3>
                  <p className="text-xs" style={{ color: c.dimmed }}>Ці інгредієнти будуть виключені з рецептів</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {ALLERGY_OPTIONS.map(allergy => (
                  <button
                    key={allergy}
                    onClick={() => toggleAllergy(allergy)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={settings.allergies.includes(allergy)
                      ? { background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }
                      : { background: 'transparent', color: c.muted, border: `1px solid ${c.cardBorder}` }
                    }
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </div>

            {/* Thin separator */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent)' }} />

            {/* Dietary restrictions */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                  <svg className="w-4 h-4" aria-hidden="true" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: c.text }}>Дієтичні обмеження</h3>
                  <p className="text-xs" style={{ color: c.dimmed }}>Рецепти будуть адаптовані під ваші потреби</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {DIET_OPTIONS.map(diet => (
                  <button
                    key={diet}
                    onClick={() => toggleDiet(diet)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={settings.dietaryRestrictions.includes(diet)
                      ? { background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }
                      : { background: 'transparent', color: c.muted, border: `1px solid ${c.cardBorder}` }
                    }
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Thin separator */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent)' }} />

            {/* Daily goals */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                  <svg className="w-4 h-4" aria-hidden="true" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: c.text }}>Денні цілі</h3>
                  <p className="text-xs" style={{ color: c.dimmed }}>Ваші цілі харчування на день</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Калорії', unit: 'ккал', value: settings.dailyCalorieGoal, key: 'dailyCalorieGoal' as const },
                  { label: 'Білки', unit: 'г', value: settings.dailyProteinGoal, key: 'dailyProteinGoal' as const },
                  { label: 'Вуглеводи', unit: 'г', value: settings.dailyCarbsGoal, key: 'dailyCarbsGoal' as const },
                  { label: 'Жири', unit: 'г', value: settings.dailyFatGoal, key: 'dailyFatGoal' as const },
                ].map(({ label, unit, value, key }) => (
                  <div key={key}>
                    <label className="text-xs font-medium block mb-2" style={{ color: c.muted }}>{label} ({unit})</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => updateSettings({ [key]: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl px-4 py-3 text-lg font-semibold outline-none transition-colors"
                      style={{
                        background: c.inputBg,
                        color: c.text,
                        border: `1px solid ${c.cardBorder}`,
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = c.gold}
                      onBlur={(e) => e.currentTarget.style.borderColor = c.cardBorder}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
