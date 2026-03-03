'use client'

import { useState } from 'react'
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

  const handleCheckout = async (priceType: string) => {
    try {
      setLoadingPlan(priceType)
      const { url } = await api.createCheckoutSession(priceType as api.PriceType)
      if (url) window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoadingPlan(null)
    }
  }

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '',
      features: [
        '10 монет при реєстрації',
        '2 монети/день (щоденне нарахування)',
        'Реклама в додатку',
      ],
      isCurrent: true,
      isFeatured: false,
    },
    {
      id: 'pro_monthly',
      name: 'Pro',
      price: '$4.99',
      period: '/місяць',
      features: [
        '100 монет/місяць',
        'Без реклами',
        'Пріоритетна генерація',
        'Експорт у PDF',
      ],
      isCurrent: false,
      isFeatured: true,
    },
    {
      id: 'pro_yearly',
      name: 'Pro Yearly',
      price: '$39.99',
      period: '/рік',
      features: [
        '100 монет/місяць',
        'Без реклами',
        'Пріоритетна генерація',
        'Експорт у PDF',
        '~33% знижка',
      ],
      isCurrent: false,
      isFeatured: false,
    },
  ]

  const coinPackages = [
    { id: 'coins_15', coins: 15, price: '$0.99' },
    { id: 'coins_50', coins: 50, price: '$2.99' },
    { id: 'coins_150', coins: 150, price: '$7.99' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg }}>
      <Header />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
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
              Оплата пройшла успішно! Дякуємо за покупку.
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
            Тарифи та монети
          </h1>
          <p style={{ color: c.textSecondary, fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
            Оберіть план, що підходить вам. Монети використовуються для генерації рецептів та планів харчування.
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
                {coinBalance} монет
              </span>
            </div>
          )}
        </div>

        {/* Subscription plans */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
          }}
        >
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: c.cardBg,
                border: plan.isFeatured
                  ? `2px solid ${c.gold}`
                  : `1px solid ${c.cardBorder}`,
                borderRadius: '16px',
                padding: '32px 28px',
                boxShadow: plan.isFeatured
                  ? `${c.cardShadow}, 0 0 24px ${isDark ? 'rgba(212,168,67,0.15)' : 'rgba(184,134,11,0.1)'}`
                  : c.cardShadow,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Featured badge */}
              {plan.isFeatured && (
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
                  Популярний
                </div>
              )}

              {/* Current plan badge */}
              {plan.isCurrent && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: c.badgeBg,
                    color: c.gold,
                    padding: '4px 20px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: `1px solid ${c.badgeBorder}`,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Поточний план
                </div>
              )}

              {/* Plan name */}
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: plan.isFeatured ? c.gold : c.text,
                  marginBottom: '8px',
                  marginTop: plan.isFeatured || plan.isCurrent ? '8px' : '0',
                }}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div style={{ marginBottom: '24px' }}>
                <span
                  style={{
                    fontSize: '40px',
                    fontWeight: 800,
                    color: c.text,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ color: c.muted, fontSize: '16px', marginLeft: '4px' }}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 0',
                      color: c.textSecondary,
                      fontSize: '15px',
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={c.gold}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Button */}
              {plan.isCurrent ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: c.badgeBg,
                    color: c.muted,
                    fontSize: '15px',
                    fontWeight: 600,
                    border: `1px solid ${c.badgeBorder}`,
                  }}
                >
                  Ваш поточний план
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loadingPlan === plan.id}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    background: plan.isFeatured ? c.btnBg : 'transparent',
                    color: plan.isFeatured ? c.btnText : c.gold,
                    border: plan.isFeatured ? 'none' : `1.5px solid ${c.gold}`,
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: loadingPlan === plan.id ? 'wait' : 'pointer',
                    boxShadow: plan.isFeatured ? c.btnShadow : 'none',
                    transition: 'all 0.2s ease',
                    opacity: loadingPlan === plan.id ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (plan.isFeatured) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = `0 6px 24px ${isDark ? 'rgba(212,168,67,0.45)' : 'rgba(184,134,11,0.25)'}`
                    } else {
                      e.currentTarget.style.background = c.badgeBg
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.isFeatured) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = c.btnShadow
                    } else {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {loadingPlan === plan.id ? 'Завантаження...' : 'Купити'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${c.goldLine}, transparent)`,
            marginBottom: '48px',
          }}
        />

        {/* Coin packages section */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: c.text,
              marginBottom: '8px',
              fontFamily: 'serif',
              letterSpacing: '0.02em',
            }}
          >
            Пакети монет
          </h2>
          <p style={{ color: c.textSecondary, fontSize: '15px' }}>
            Придбайте додаткові монети окремо
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            maxWidth: '780px',
            margin: '0 auto 48px',
          }}
        >
          {coinPackages.map((pkg) => (
            <div
              key={pkg.id}
              style={{
                background: c.cardBg,
                border: `1px solid ${c.cardBorder}`,
                borderRadius: '16px',
                padding: '28px 24px',
                boxShadow: c.cardShadow,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
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
                  fontSize: '32px',
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
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}
              >
                монет
              </div>

              {/* Price */}
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: '20px',
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
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: c.gold,
                  border: `1.5px solid ${c.gold}`,
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: loadingPlan === pkg.id ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loadingPlan === pkg.id ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = c.badgeBg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {loadingPlan === pkg.id ? 'Завантаження...' : 'Купити'}
              </button>
            </div>
          ))}
        </div>

        {/* Manage subscription link */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: c.muted, fontSize: '14px', marginBottom: '8px' }}>
            Вже маєте Pro підписку?
          </p>
          <a
            href="/settings"
            style={{
              color: c.gold,
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: `1px solid ${isDark ? 'rgba(212,168,67,0.3)' : 'rgba(184,134,11,0.3)'}`,
              paddingBottom: '2px',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderBottomColor = c.gold
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderBottomColor = isDark ? 'rgba(212,168,67,0.3)' : 'rgba(184,134,11,0.3)'
            }}
          >
            Керувати підпискою
          </a>
        </div>
      </main>
    </div>
  )
}
