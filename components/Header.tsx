'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/theme'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showUserMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  useEffect(() => {
    if (!showMobileMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMobileMenu])

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false)
  }, [pathname])

  const {
    isAuth, authUser, handleLogout,
    favorites, history, orderHistory,
    myFridge, isDark, toggleTheme,
    coinBalance, subscriptionStatus,
  } = useApp()
  const c = getThemeColors(isDark)

  const goHome = () => router.push('/')

  const navItems = [
    { label: 'Каталог', path: '/catalog', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>, badge: null, badgeColor: '' },
    { label: 'Улюблені', path: '/favorites', icon: <svg className="w-5 h-5" fill={favorites.length > 0 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, badge: favorites.length || null, badgeColor: 'bg-rose-500' },
    { label: 'Історія', path: '/history', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, badge: history.length > 9 ? '9+' : history.length || null, badgeColor: 'bg-violet-500' },
    { label: 'Замовлення', path: '/orders', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>, badge: orderHistory.length > 9 ? '9+' : orderHistory.length || null, badgeColor: 'bg-green-500' },
    { label: 'Продукти', path: '/my-fridge', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, badge: myFridge.length || null, badgeColor: 'bg-[#c9a84c]' },
  ]

  return (
    <header className="sticky top-0 z-50" role="navigation" style={{ background: isDark ? 'rgba(10, 9, 8, 0.85)' : 'rgba(253, 251, 247, 0.85)', backdropFilter: 'blur(24px) saturate(1.2)', WebkitBackdropFilter: 'blur(24px) saturate(1.2)', borderBottom: 'none' }}>
      {/* Gold gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.3), transparent)' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={goHome} className="flex items-center gap-2 sm:gap-3 group" aria-label="На головну">
          <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] rounded-full flex items-center justify-center relative transition-transform duration-300 group-hover:[&>div]:rotate-[15deg]" style={{ border: '1.5px solid #c9a84c' }}>
            <div className="absolute inset-[3px] rounded-full transition-transform duration-300" style={{ border: '1px solid rgba(201, 168, 76, 0.3)' }} />
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" style={{ color: '#c9a84c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-[0.02em]" style={{ color: isDark ? '#f2ece0' : '#2c2418' }}>
            MealMate
          </h1>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                pathname === item.path
                  ? 'text-[#c9a84c] bg-[#c9a84c]/10'
                  : `${isDark ? 'text-[#9e9283] hover:text-[#f2ece0]' : 'text-[#8a7e6e] hover:text-[#2c2418]'}`
              }`}
              title={item.label}
            >
              {item.icon}
              {item.badge && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 ${item.badgeColor} rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'text-[#9e9283] hover:text-[#f2ece0]' : 'text-[#8a7e6e] hover:text-[#2c2418]'}`}
            title={isDark ? 'Світла тема' : 'Темна тема'}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
            )}
          </button>

          {/* Pro badge */}
          {isAuth && subscriptionStatus === 'active' && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase" style={{ background: 'linear-gradient(135deg, #b8922e, #d4a843, #e0be5a)', color: '#0a0908' }}>PRO</div>
          )}

          {/* Coin balance */}
          {isAuth && coinBalance !== null && (
            <button onClick={() => router.push('/pricing')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: c.badgeBg, color: c.gold }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" /><text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">$</text></svg>
              <span>{coinBalance}</span>
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-8 mx-1" style={{ background: 'rgba(201, 168, 76, 0.15)' }} />

          {/* User menu (desktop) */}
          {isAuth ? (
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md hover:shadow-lg">
                <span className="text-sm font-bold">{(authUser?.name || authUser?.email || 'U')[0].toUpperCase()}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 rounded-xl shadow-xl py-1 z-50 animate-menu-slide-down" style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}` }}>
                  <div className="px-4 py-2" style={{ borderBottom: `1px solid ${c.cardBorder}` }}>
                    <p className="text-sm font-medium truncate" style={{ color: c.text }}>{authUser?.name || authUser?.email}</p>
                  </div>
                  <button onClick={() => { setShowUserMenu(false); router.push('/settings') }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style={{ color: c.muted }} onMouseEnter={e => (e.currentTarget.style.background = c.inputBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Налаштування
                  </button>
                  <button onClick={() => { setShowUserMenu(false); handleLogout() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors" onMouseEnter={e => (e.currentTarget.style.background = isDark ? '#252017' : 'rgba(239,68,68,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    Вийти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => router.push('/login')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'text-[#9e9283] hover:text-[#f2ece0]' : 'text-[#8a7e6e] hover:text-[#2c2418]'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </button>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-2" ref={mobileMenuRef}>
          {/* Coin balance (mobile) */}
          {isAuth && coinBalance !== null && (
            <button onClick={() => router.push('/pricing')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold" style={{ background: c.badgeBg, color: c.gold }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" /><text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">$</text></svg>
              <span>{coinBalance}</span>
            </button>
          )}

          {/* User avatar (mobile) */}
          {isAuth && (
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
              <span className="text-xs font-bold">{(authUser?.name || authUser?.email || 'U')[0].toUpperCase()}</span>
            </button>
          )}

          {/* Fridge badge (mobile) */}
          <button onClick={() => router.push('/my-fridge')} className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${pathname === '/my-fridge' ? 'text-[#c9a84c] bg-[#c9a84c]/10' : isDark ? 'text-[#9e9283]' : 'text-[#8a7e6e]'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            {myFridge.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c9a84c] text-[#0a0908] rounded-full text-[9px] font-bold flex items-center justify-center">{myFridge.length}</span>
            )}
          </button>

          {/* Burger menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? 'text-[#9e9283]' : 'text-[#8a7e6e]'}`}
            aria-label="Меню"
          >
            {showMobileMenu ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            )}
          </button>

          {/* Mobile dropdown menu */}
          {showMobileMenu && (
            <div className="absolute right-4 top-full mt-2 w-56 rounded-2xl shadow-2xl py-2 z-50" style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}` }}>
              {navItems.map(item => {
                const isActive = pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                    style={{
                      color: isActive ? c.gold : c.text,
                      background: isActive ? (isDark ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.08)') : 'transparent',
                    }}
                  >
                    <span style={{ color: isActive ? '#c9a84c' : isDark ? '#9e9283' : '#8a7e6e' }}>{item.icon}</span>
                    <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto w-5 h-5 ${item.badgeColor} rounded-full text-[10px] font-bold text-white flex items-center justify-center`}>{item.badge}</span>
                    )}
                  </button>
                )
              })}

              <div className="h-px mx-3 my-1" style={{ background: c.cardBorder }} />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{ color: c.text }}
              >
                <span style={{ color: isDark ? '#9e9283' : '#8a7e6e' }}>
                  {isDark ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                  )}
                </span>
                {isDark ? 'Світла тема' : 'Темна тема'}
              </button>

              {/* Settings */}
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{
                  color: pathname === '/settings' ? c.gold : c.text,
                  background: pathname === '/settings' ? (isDark ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.08)') : 'transparent',
                }}
              >
                <span style={{ color: pathname === '/settings' ? '#c9a84c' : isDark ? '#9e9283' : '#8a7e6e' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
                Налаштування
              </button>

              {isAuth && (
                <>
                  <div className="h-px mx-3 my-1" style={{ background: c.cardBorder }} />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    Вийти
                  </button>
                </>
              )}

              {!isAuth && (
                <>
                  <div className="h-px mx-3 my-1" style={{ background: c.cardBorder }} />
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                    style={{ color: c.gold }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    Увійти
                  </button>
                </>
              )}
            </div>
          )}

          {/* Mobile user menu (separate from burger) */}
          {showUserMenu && isAuth && (
            <div className="absolute right-4 top-full mt-2 w-48 rounded-xl shadow-xl py-1 z-50" style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}` }}>
              <div className="px-4 py-2" style={{ borderBottom: `1px solid ${c.cardBorder}` }}>
                <p className="text-sm font-medium truncate" style={{ color: c.text }}>{authUser?.name || authUser?.email}</p>
              </div>
              <button onClick={() => { setShowUserMenu(false); router.push('/settings') }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style={{ color: c.muted }}>
                Налаштування
              </button>
              <button onClick={() => { setShowUserMenu(false); handleLogout() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors">
                Вийти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
