'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import * as api from '@/lib/api'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'

function LoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/'
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await api.login(email, password)
      window.location.href = from
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка входу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Decorative gold ring */}
      <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.04]" style={{ border: '1px solid #c9a84c', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      <div className="w-full max-w-md relative z-10 animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center relative animate-gentle-float" style={{ border: '1.5px solid #c9a84c' }}>
              <div className="absolute inset-[3px] rounded-full" style={{ border: '1px solid rgba(201, 168, 76, 0.3)' }} />
              <svg className="w-[18px] h-[18px]" style={{ color: '#c9a84c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
              </svg>
            </div>
            <span className="text-3xl font-serif tracking-[0.02em]" style={{ color: c.text }}>
              MealMate
            </span>
          </Link>
        </div>

        <div className="rounded-3xl p-8" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #c9a84c, #a68a3a)', boxShadow: '0 8px 24px rgba(201, 168, 76, 0.2)' }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif font-bold mb-2" style={{ color: c.text }}>
              Вхід
            </h2>
            <p className="text-sm" style={{ color: c.dimmed }}>
              Увійдіть, щоб зберегти рецепти та плани
            </p>
          </div>

          <div aria-live="polite">
            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: isDark ? 'rgba(127,29,29,0.2)' : '#fef2f2', border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}`, color: isDark ? '#f87171' : '#dc2626' }}>
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4 stagger-children">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-1.5" style={{ color: c.gold }}>Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: c.gold }}
                onFocus={e => { e.currentTarget.style.borderColor = c.inputFocusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 168, 76, 0.08)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-1.5" style={{ color: c.gold }}>Пароль</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: c.gold }}
                onFocus={e => { e.currentTarget.style.borderColor = c.inputFocusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 168, 76, 0.08)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110 relative overflow-hidden"
              style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Завантаження...
                </span>
              ) : 'Увійти'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="text-sm transition-colors hover:brightness-125"
              style={{ color: c.gold }}
            >
              Немає акаунту? Зареєструватися
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/landing"
            aria-label="Повернутися на головну сторінку"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:brightness-125"
            style={{ color: c.goldMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
            onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            На головну
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
