'use client'

export function CategoryIcon({ name, size = 18 }: { name: string; size?: number }) {
  const s = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case "М'ясо та птиця":
      return <svg {...s}><path d="M15 4c2.5 0 5 2 5 5 0 2.5-2 4.5-4.5 4.5-.8 0-1.5-.2-2-.6L10 16.5 7.5 14l3.5-3.5c-.4-.5-.6-1.2-.6-2C10.4 6 12.5 4 15 4z"/><path d="M9 15l-4.5 4.5M7 17l-2.5 2.5"/></svg>
    case 'Риба та морепродукти':
      return <svg {...s}><path d="M3 12c3.5-4.5 8-6 13-5.5.5 2-.5 4.5-1.5 6C14 14 13 15 12 15.5c-3 1.5-6 1-9-3.5z"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M19.5 7l3-2.5v7L19.5 9"/></svg>
    case 'Овочі':
      return <svg {...s}><path d="M17 8c0 5-4 9-9 9"/><path d="M8 17l-4 4"/><path d="M17 8c-1-3-4-5-6-5 0 3 1 5 6 5z"/><path d="M17 8c2-2 4-5 4-5s-3 .5-4 2"/></svg>
    case 'Молочні продукти':
      return <svg {...s}><path d="M9 3h6v3l2 2v11a2 2 0 01-2 2H9a2 2 0 01-2-2V8l2-2V3z"/><line x1="7" y1="13" x2="17" y2="13" strokeDasharray="2 2"/></svg>
    case 'Крупи та борошно':
      return <svg {...s}><path d="M12 4v17"/><path d="M8 8c2-2 4-4 4-4s2 2 4 4"/><path d="M7 13c2.5-2 5-4 5-4s2.5 2 5 4"/><path d="M9 18c1.5-1.5 3-3 3-3s1.5 1.5 3 3"/></svg>
    case 'Фрукти':
      return <svg {...s}><path d="M12 5c-5 0-8 4-8 8.5C4 18 7.5 21 12 21s8-3 8-7.5C20 9 17 5 12 5z"/><path d="M12 5c0-1.5 1.5-3 3-3"/></svg>
    case 'Консерви та соуси':
      return <svg {...s}><rect x="5" y="7" width="14" height="14" rx="2.5"/><path d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7"/><line x1="5" y1="11.5" x2="19" y2="11.5"/></svg>
    case 'Спеції та приправи':
      return <svg {...s}><path d="M5 18c0 1.5 3 3 7 3s7-1.5 7-3"/><path d="M5 18v-3c0-4 3-6.5 7-6.5s7 2.5 7 6.5v3"/><line x1="16" y1="4" x2="12" y2="12"/><circle cx="17" cy="3" r="1.5" fill="currentColor" stroke="none"/></svg>
    default:
      return null
  }
}
