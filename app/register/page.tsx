'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as api from '@/lib/api'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'

export default function RegisterPage() {
  const { isDark } = useApp()
  const c = getThemeColors(isDark)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError('')
    setLoading(true)
    try {
      await api.register(email, password, name || undefined)
      window.location.href = '/'
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка реєстрації')
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif font-bold mb-2" style={{ color: c.text }}>
              Реєстрація
            </h2>
            <p className="text-sm" style={{ color: c.dimmed }}>
              Створіть акаунт для синхронізації даних
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
              <label htmlFor="register-name" className="block text-sm font-medium mb-1.5" style={{ color: c.gold }}>Ім&apos;я</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше ім'я"
                aria-label="Ваше ім'я"
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: c.gold }}
                onFocus={e => { e.currentTarget.style.borderColor = c.inputFocusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 168, 76, 0.08)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium mb-1.5" style={{ color: c.gold }}>Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: c.gold }}
                onFocus={e => { e.currentTarget.style.borderColor = c.inputFocusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 168, 76, 0.08)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium mb-1.5" style={{ color: c.gold }}>Пароль</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: c.gold }}
                onFocus={e => { e.currentTarget.style.borderColor = c.inputFocusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 168, 76, 0.08)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>

            <button
              onClick={handleRegister}
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
              ) : 'Зареєструватися'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm transition-colors hover:brightness-125"
              style={{ color: c.gold }}
            >
              Вже є акаунт? Увійти
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
