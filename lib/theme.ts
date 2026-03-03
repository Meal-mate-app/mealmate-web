// Shared theme colors for all pages
// Usage: const c = getThemeColors(isDark)

export function getThemeColors(isDark: boolean) {
  return {
    // Text
    text: isDark ? '#f2ece0' : '#1a1714',
    textSecondary: isDark ? '#c4b99a' : '#4a4237',
    muted: isDark ? '#9e9283' : '#8a7e6b',
    dimmed: isDark ? '#6b5f50' : '#a09585',

    // Brand
    gold: isDark ? '#d4a843' : '#b8860b',
    goldMuted: isDark ? 'rgba(212,168,67,0.5)' : '#b8860b',
    goldHover: isDark ? '#e8c85c' : '#8a7216',

    // Cards
    cardBg: isDark
      ? 'linear-gradient(145deg, #161310, #0f0d0a)'
      : 'linear-gradient(145deg, #ffffff, #fdf8f0)',
    cardBgSolid: isDark ? '#161310' : '#ffffff',
    cardBorder: isDark ? '#2a2218' : 'rgba(184,134,11,0.12)',
    cardShadow: isDark ? '0 2px 12px rgba(0,0,0,0.5)' : '0 4px 24px rgba(184,134,11,0.06)',

    // Badges
    badgeBg: isDark ? 'rgba(212,168,67,0.12)' : 'rgba(184,134,11,0.08)',
    badgeBorder: isDark ? '#4a3d28' : 'rgba(184,134,11,0.15)',

    // Buttons
    btnBg: isDark
      ? 'linear-gradient(135deg, #b8922e, #d4a843, #e0be5a)'
      : 'linear-gradient(135deg, #d4a843, #b8860b)',
    btnText: isDark ? '#0a0908' : '#fff',
    btnShadow: isDark ? '0 4px 20px rgba(212,168,67,0.35)' : '0 2px 8px rgba(184,134,11,0.15)',

    // Empty state
    emptyBg: isDark ? 'rgba(212,168,67,0.05)' : 'rgba(184,134,11,0.04)',
    emptyBorder: isDark ? '#2a2218' : 'rgba(184,134,11,0.12)',
    emptyIcon: isDark ? 'rgba(212,168,67,0.35)' : 'rgba(184,134,11,0.3)',

    // Inputs
    inputBg: isDark ? '#110f0c' : '#ffffff',
    inputBorder: isDark ? '#2a2218' : 'rgba(184,134,11,0.2)',
    inputFocusBorder: isDark ? '#6b5a32' : 'rgba(184,134,11,0.5)',

    // Tabs
    tabActiveBg: isDark
      ? 'linear-gradient(135deg, #b8922e, #d4a843)'
      : 'linear-gradient(135deg, #d4a843, #b8860b)',
    tabActiveShadow: isDark ? '0 4px 16px rgba(212,168,67,0.25)' : '0 4px 12px rgba(184,134,11,0.15)',
    tabBg: isDark ? '#110f0c' : '#ffffff',
    tabBorder: isDark ? '#2a2218' : 'rgba(184,134,11,0.15)',
    tabText: isDark ? '#9e9283' : '#8a7e6b',

    // Ingredient items
    itemBg: isDark ? '#0e0c0a' : '#ffffff',
    itemBorder: isDark ? '#2a2218' : 'rgba(184,134,11,0.1)',
    itemActiveBg: isDark ? '#1a1610' : 'rgba(212,168,67,0.06)',
    itemActiveBorder: isDark ? '#6b5a32' : 'rgba(184,134,11,0.35)',
    checkBg: isDark ? '#d4a843' : '#b8860b',

    // Sidebar
    sidebarBg: isDark
      ? 'linear-gradient(145deg, #161310, #0f0d0a)'
      : 'linear-gradient(145deg, #ffffff, #fdf8f0)',

    // Pantry
    pantryActiveBg: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(16,185,129,0.08)',
    pantryActiveText: isDark ? '#6ee7b7' : '#059669',
    pantryInactiveBg: isDark ? '#0e0c0a' : 'rgba(0,0,0,0.03)',
    pantryInactiveText: isDark ? '#5c5347' : '#a09585',

    // Recipe detail
    headerBg: isDark
      ? 'linear-gradient(135deg, rgba(212,168,67,0.1), rgba(212,168,67,0.04))'
      : 'linear-gradient(135deg, rgba(184,134,11,0.1), rgba(184,134,11,0.04))',
    statBg: isDark ? '#0e0c0a' : 'rgba(184,134,11,0.03)',
    statBorder: isDark ? '#2a2218' : 'rgba(184,134,11,0.1)',
    nutritionBg: isDark ? 'rgba(212,168,67,0.06)' : '#fef9e7',
    nutritionBorder: isDark ? 'rgba(212,168,67,0.12)' : 'rgba(184,134,11,0.15)',
    nutritionCardBg: isDark ? '#110f0c' : '#ffffff',
    stepNumBg: isDark
      ? 'linear-gradient(135deg, #b8922e, #d4a843)'
      : 'linear-gradient(135deg, #d4a843, #b8860b)',
    tipsBg: isDark ? 'rgba(212,168,67,0.06)' : 'rgba(184,134,11,0.05)',
    tipsBorder: isDark ? '#2a2218' : 'rgba(184,134,11,0.15)',
    ingBg: isDark ? '#0e0c0a' : 'rgba(184,134,11,0.04)',
    ingBorder: isDark ? '#2a2218' : 'rgba(184,134,11,0.15)',

    // Fridge specific
    fridgeItemBg: isDark ? '#110f0c' : 'rgba(184,134,11,0.05)',
    fridgeCustomBg: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)',

    // Danger
    dangerColor: isDark ? '#ef4444' : '#dc2626',
    dangerBg: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',

    // Macros
    macroProtein: isDark ? '#e07a5f' : '#c45a3c',
    macroCarbs: isDark ? '#d4a843' : '#b8860b',
    macroFat: isDark ? '#f2cc8f' : '#d4a843',
    macroFiber: isDark ? '#81b29a' : '#5a9e7c',

    // Success
    successColor: isDark ? '#22c55e' : '#16a34a',

    // Page bg
    pageBg: isDark ? '#080706' : '#f8f3eb',

    // New tokens
    goldLine: isDark ? 'rgba(212,168,67,0.2)' : 'rgba(184,134,11,0.15)',
    sectionDivider: isDark ? 'rgba(212,168,67,0.1)' : 'rgba(184,134,11,0.08)',
    nutritionProteinBar: isDark ? '#e07a5f' : '#c45a3c',
    nutritionCarbsBar: isDark ? '#d4a843' : '#b8860b',
    nutritionFatBar: isDark ? '#f2cc8f' : '#d4a843',
    nutritionFiberBar: isDark ? '#81b29a' : '#5a9e7c',
  }
}
