'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'
import { Header } from '@/components/Header'
import * as api from '@/lib/api'

export default function PricingPage() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  const { isDark, coinBalance } = useApp()
  const c = getThemeColors(isDark)

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleCheckout = async (packageId: string) => {
    try {
      setLoadingPlan(packageId)
      const formData = await api.createPayment(packageId)

      // Create and submit WayForPay form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://secure.wayforpay.com/pay'
      form.acceptCharset = 'utf-8'

      for (const [key, value] of Object.entries(formData)) {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = `${key}[]`
            input.value = String(v)
            form.appendChild(input)
          })
        } else {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = String(value)
          form.appendChild(input)
        }
      }

      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      console.error('Checkout error:', err)
      setLoadingPlan(null)
    }
  }

  const coinPackages = [
    { id: 'coins_15', coins: 15, price: '29 ₴', perCoin: '~1.9 ₴' },
    { id: 'coins_50', coins: 50, price: '79 ₴', perCoin: '~1.6 ₴', popular: true },
    { id: 'coins_150', coins: 150, price: '199 ₴', perCoin: '~1.3 ₴' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg }}>
      <Header />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Success message */}
        {success && (
          <div
            style={{
              background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(22,163,74,0.08)',
              border: `1px solid ${isDark ? 'rgba(34,197,94,0.3)' : 'rgba(22,163,74,0.2)'}`,
              borderRadius: '12px',
              padding: '16px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.successColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ color: c.successColor, fontWeight: 600, fontSize: '15px' }}>
              Оплата пройшла успішно! Монети додано на ваш рахунок.
            </span>
          </div>
        )}

        {/* Canceled message */}
        {canceled && (
          <div
            style={{
              background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.15)'}`,
              borderRadius: '12px',
              padding: '16px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.dangerColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span style={{ color: c.dangerColor, fontWeight: 600, fontSize: '15px' }}>
              Оплату скасовано. Спробуйте ще раз.
            </span>
          </div>
        )}

        {/* Page title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: c.text,
              marginBottom: '12px',
              fontFamily: 'serif',
              letterSpacing: '0.02em',
            }}
          >
            Поповнити монети
          </h1>
          <p style={{ color: c.textSecondary, fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
            Монети використовуються для генерації рецептів (2 монети) та планів харчування (10 монет)
          </p>
          {coinBalance !== null && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '20px',
                padding: '8px 20px',
                borderRadius: '12px',
                background: c.badgeBg,
                border: `1px solid ${c.badgeBorder}`,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={c.gold}>
                <circle cx="12" cy="12" r="10" fill="none" stroke={c.gold} strokeWidth="1.5" />
                <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill={c.gold}>$</text>
              </svg>
              <span style={{ color: c.gold, fontWeight: 700, fontSize: '16px' }}>
                Ваш баланс: {coinBalance} монет
              </span>
            </div>
          )}
        </div>

        {/* Coin packages */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            maxWidth: '820px',
            margin: '0 auto 48px',
          }}
        >
          {coinPackages.map((pkg) => (
            <div
              key={pkg.id}
              style={{
                background: c.cardBg,
                border: pkg.popular
                  ? `2px solid ${c.gold}`
                  : `1px solid ${c.cardBorder}`,
                borderRadius: '16px',
                padding: '32px 28px',
                boxShadow: pkg.popular
                  ? `${c.cardShadow}, 0 0 24px ${isDark ? 'rgba(212,168,67,0.15)' : 'rgba(184,134,11,0.1)'}`
                  : c.cardShadow,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Popular badge */}
              {pkg.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: c.btnBg,
                    color: c.btnText,
                    padding: '4px 20px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Вигідно
                </div>
              )}

              {/* Coin icon */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: c.badgeBg,
                  border: `1.5px solid ${c.badgeBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  marginTop: pkg.popular ? '8px' : '0',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill={c.gold}>
                  <circle cx="12" cy="12" r="10" fill="none" stroke={c.gold} strokeWidth="1.5" />
                  <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill={c.gold}>$</text>
                </svg>
              </div>

              {/* Coins count */}
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  color: c.gold,
                  marginBottom: '4px',
                  letterSpacing: '-0.02em',
                }}
              >
                {pkg.coins}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: c.muted,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}
              >
                монет
              </div>

              {/* Per coin price */}
              <div
                style={{
                  fontSize: '13px',
                  color: c.textSecondary,
                  marginBottom: '20px',
                }}
              >
                {pkg.perCoin} за монету
              </div>

              {/* Price */}
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: '24px',
                }}
              >
                {pkg.price}
              </div>

              {/* Buy button */}
              <button
                onClick={() => handleCheckout(pkg.id)}
                disabled={loadingPlan === pkg.id}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  background: pkg.popular ? c.btnBg : 'transparent',
                  color: pkg.popular ? c.btnText : c.gold,
                  border: pkg.popular ? 'none' : `1.5px solid ${c.gold}`,
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loadingPlan === pkg.id ? 'wait' : 'pointer',
                  boxShadow: pkg.popular ? c.btnShadow : 'none',
                  transition: 'all 0.2s ease',
                  opacity: loadingPlan === pkg.id ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (pkg.popular) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = `0 6px 24px ${isDark ? 'rgba(212,168,67,0.45)' : 'rgba(184,134,11,0.25)'}`
                  } else {
                    e.currentTarget.style.background = c.badgeBg
                  }
                }}
                onMouseLeave={(e) => {
                  if (pkg.popular) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = c.btnShadow
                  } else {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {loadingPlan === pkg.id ? 'Завантаження...' : 'Купити'}
              </button>
            </div>
          ))}
        </div>

        {/* Payment info */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: c.muted, fontSize: '13px', lineHeight: '1.6' }}>
            Оплата через WayForPay. Приймаємо Visa, Mastercard, Apple Pay, Google Pay.
            <br />
            Монети нараховуються автоматично після оплати.
          </p>
        </div>
      </main>
    </div>
  )
}
