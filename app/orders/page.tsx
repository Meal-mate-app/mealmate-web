'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/Header'
import { PreparedOrder } from '@/types'
import { getThemeColors } from '@/lib/theme'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function OrdersPage() {
  const router = useRouter()
  const { isDark, orderHistory: orders, deleteOrderFromHistory, bulkDeleteOrders, markOrderDelivered, showToast } = useApp()

  const deleteOrder = useCallback((orderId: string) => {
    deleteOrderFromHistory(orderId)
  }, [deleteOrderFromHistory])

  const openAllLinks = useCallback((order: PreparedOrder) => {
    order.items.forEach(ci => {
      if (ci.selectedProduct?.web_url) window.open(ci.selectedProduct.web_url, '_blank')
    })
  }, [])

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmBulk, setConfirmBulk] = useState(false)

  // Bulk selection
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(orders.map(o => o.id)))
    }
  }

  const bulkDelete = () => {
    bulkDeleteOrders(Array.from(selected))
    showToast(`Видалено ${selected.size} замовлень`, 'success')
    setSelected(new Set())
    setSelectMode(false)
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  const c = getThemeColors(isDark)

  return (
    <div className="min-h-screen relative">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 animate-in">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 font-medium transition-colors group"
            style={{ color: c.goldMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
            onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Назад
          </button>

          {orders.length > 0 && (
            <div className="flex items-center gap-2">
              {selectMode && selected.size > 0 && (
                <button
                  onClick={() => setConfirmBulk(true)}
                  className="px-4 py-2 rounded-lg font-semibold text-xs transition-all hover:scale-105"
                  style={{ background: c.dangerBg, color: c.dangerColor, border: `1px solid ${c.dangerColor}30` }}
                >
                  Видалити ({selected.size})
                </button>
              )}
              {selectMode && (
                <button
                  onClick={selectAll}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}
                >
                  {selected.size === orders.length ? 'Зняти все' : 'Обрати все'}
                </button>
              )}
              <button
                onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={selectMode
                  ? { color: c.btnText, background: c.gold }
                  : { color: c.muted, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }
                }
              >
                {selectMode ? 'Скасувати' : 'Обрати'}
              </button>
            </div>
          )}
        </div>

        {orders.length > 0 ? (
          <div className="space-y-3" role="list">
            {orders.map(order => (
              <div
                key={order.id}
                className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  background: c.cardBg,
                  border: `1px solid ${selected.has(order.id) ? c.gold : c.cardBorder}`,
                  boxShadow: selected.has(order.id) ? `0 0 0 1px ${c.gold}40` : c.cardShadow,
                }}
                onClick={selectMode ? () => toggleSelect(order.id) : undefined}
              >
                <div className="flex items-center gap-4 p-4" style={{ cursor: selectMode ? 'pointer' : undefined }}>
                  {selectMode && (
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: selected.has(order.id) ? c.gold : 'transparent',
                        border: `2px solid ${selected.has(order.id) ? c.gold : c.dimmed}`,
                      }}
                    >
                      {selected.has(order.id) && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={c.btnText} strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold truncate" style={{ color: c.text }}>{order.storeName}</h3>
                      {order.status === 'in_progress' ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                          В процесі
                        </span>
                      ) : order.status === 'completed' ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                          Доставлено
                        </span>
                      ) : null}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                        {order.items.length} товарів
                      </span>
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: c.gold }}>
                        {order.totalEstimate.toFixed(0)} ₴
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: c.dimmed }}>
                        {new Date(order.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs truncate" style={{ color: c.dimmed }}>
                        {order.items.slice(0, 3).map(ci => ci.shoppingItem?.ingredient || ci.selectedProduct?.title || '—').join(', ')}
                        {order.items.length > 3 && ` +${order.items.length - 3}`}
                      </span>
                    </div>
                  </div>
                  {!selectMode && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {order.status === 'in_progress' && (
                        <button
                          onClick={() => markOrderDelivered(order.id)}
                          className="px-3 py-2 rounded-lg font-semibold text-xs transition-all hover:translate-y-[-1px]"
                          style={{ color: '#fff', background: 'linear-gradient(135deg, #27ae60, #2ecc71)' }}
                        >
                          Доставлено
                        </button>
                      )}
                      <button
                        onClick={() => openAllLinks(order)}
                        className="px-3 py-2 rounded-lg font-semibold text-xs transition-all hover:translate-y-[-1px]"
                        style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}
                      >
                        Zakaz.ua
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(order.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ color: c.dangerColor, background: c.dangerBg }}
                        title="Видалити"
                        aria-label="Видалити замовлення"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ border: `1px solid ${c.emptyBorder}`, background: c.emptyBg }}>
              <svg className="w-9 h-9" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <p className="text-xl font-serif mb-2" style={{ color: c.text }}>Ще немає замовлень</p>
            <p className="text-sm" style={{ color: c.dimmed }}>Створіть план харчування та підготуйте замовлення</p>
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Видалити замовлення?"
          message="Замовлення буде видалено з історії."
          onConfirm={() => {
            deleteOrder(confirmDeleteId)
            setConfirmDeleteId(null)
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {confirmBulk && (
        <ConfirmDialog
          title="Видалити обрані?"
          message={`${selected.size} замовлень буде видалено з історії.`}
          onConfirm={() => {
            bulkDelete()
            setConfirmBulk(false)
          }}
          onCancel={() => setConfirmBulk(false)}
        />
      )}
    </div>
  )
}
