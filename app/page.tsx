'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Recipe, WeekPlan, ShoppingItem, ZakazProduct, CartItem, DeliveryAddress, StoreOption, PreparedOrder } from '@/types'
import * as api from '@/lib/api'
import { getThemeColors } from '@/lib/theme'
import { Header } from '@/components/Header'

type Mode = 'home' | 'fridge' | 'my-fridge' | 'recipe-result' | 'favorites' | 'history' | 'settings' | 'cooking' | 'order-prepare' | 'orders' | 'auth'

// Налаштування користувача
interface UserSettings {
  allergies: string[]
  dietaryRestrictions: string[]
  dislikedIngredients: string[]
  dailyCalorieGoal: number
  dailyProteinGoal: number
  dailyCarbsGoal: number
  dailyFatGoal: number
}

const DEFAULT_SETTINGS: UserSettings = {
  allergies: [],
  dietaryRestrictions: [],
  dislikedIngredients: [],
  dailyCalorieGoal: 2000,
  dailyProteinGoal: 50,
  dailyCarbsGoal: 250,
  dailyFatGoal: 65,
}

// Опції для налаштувань
const ALLERGY_OPTIONS = ['Глютен', 'Лактоза', 'Горіхи', 'Арахіс', 'Яйця', 'Соя', 'Риба', 'Молюски', 'Кунжут']
const DIET_OPTIONS = ['Вегетаріанство', 'Веганство', 'Кето', 'Без глютену', 'Без лактози', 'Низькокалорійна', 'Високобілкова']

const INGREDIENT_CATEGORIES = [
  {
    name: "М'ясо та птиця",
    icon: '🥩',
    items: [
      { name: 'Курка', emoji: '🍗' },
      { name: 'Куряче філе', emoji: '🍗' },
      { name: 'Курячі стегна', emoji: '🍗' },
      { name: 'Свинина', emoji: '🥩' },
      { name: 'Яловичина', emoji: '🥩' },
      { name: 'Фарш', emoji: '🍖' },
      { name: 'Індичка', emoji: '🦃' },
      { name: 'Бекон', emoji: '🥓' },
      { name: 'Ковбаса', emoji: '🌭' },
      { name: 'Сосиски', emoji: '🌭' },
    ]
  },
  {
    name: 'Риба та морепродукти',
    icon: '🐟',
    items: [
      { name: 'Риба', emoji: '🐟' },
      { name: 'Лосось', emoji: '🐟' },
      { name: 'Тунець', emoji: '🐟' },
      { name: 'Креветки', emoji: '🦐' },
      { name: 'Кальмари', emoji: '🦑' },
      { name: 'Мідії', emoji: '🦪' },
      { name: 'Скумбрія', emoji: '🐟' },
      { name: 'Оселедець', emoji: '🐟' },
    ]
  },
  {
    name: 'Овочі',
    icon: '🥬',
    items: [
      { name: 'Картопля', emoji: '🥔' },
      { name: 'Цибуля', emoji: '🧅' },
      { name: 'Морква', emoji: '🥕' },
      { name: 'Помідори', emoji: '🍅' },
      { name: 'Огірки', emoji: '🥒' },
      { name: 'Капуста', emoji: '🥬' },
      { name: 'Перець', emoji: '🫑' },
      { name: 'Часник', emoji: '🧄' },
      { name: 'Буряк', emoji: '🟤' },
      { name: 'Кабачок', emoji: '🥒' },
      { name: 'Баклажан', emoji: '🍆' },
      { name: 'Броколі', emoji: '🥦' },
      { name: 'Цвітна капуста', emoji: '🥬' },
      { name: 'Шпинат', emoji: '🥬' },
      { name: 'Салат', emoji: '🥬' },
      { name: 'Гриби', emoji: '🍄' },
      { name: 'Зелена цибуля', emoji: '🧅' },
      { name: 'Кукурудза', emoji: '🌽' },
      { name: 'Горох', emoji: '🫛' },
      { name: 'Квасоля', emoji: '🫘' },
    ]
  },
  {
    name: 'Молочні продукти',
    icon: '🥛',
    items: [
      { name: 'Яйця', emoji: '🥚' },
      { name: 'Молоко', emoji: '🥛' },
      { name: 'Сир твердий', emoji: '🧀' },
      { name: 'Сир м\'який', emoji: '🧀' },
      { name: 'Сметана', emoji: '🫙' },
      { name: 'Масло', emoji: '🧈' },
      { name: 'Йогурт', emoji: '🥛' },
      { name: 'Кефір', emoji: '🥛' },
      { name: 'Вершки', emoji: '🥛' },
      { name: 'Творог', emoji: '🧀' },
      { name: 'Моцарела', emoji: '🧀' },
      { name: 'Пармезан', emoji: '🧀' },
    ]
  },
  {
    name: 'Крупи та борошно',
    icon: '🌾',
    items: [
      { name: 'Рис', emoji: '🍚' },
      { name: 'Макарони', emoji: '🍝' },
      { name: 'Гречка', emoji: '🌾' },
      { name: 'Пшоно', emoji: '🌾' },
      { name: 'Вівсянка', emoji: '🥣' },
      { name: 'Борошно', emoji: '🌾' },
      { name: 'Хліб', emoji: '🍞' },
      { name: 'Булгур', emoji: '🌾' },
      { name: 'Кускус', emoji: '🌾' },
      { name: 'Манка', emoji: '🌾' },
    ]
  },
  {
    name: 'Фрукти',
    icon: '🍎',
    items: [
      { name: 'Яблука', emoji: '🍎' },
      { name: 'Банани', emoji: '🍌' },
      { name: 'Лимон', emoji: '🍋' },
      { name: 'Апельсин', emoji: '🍊' },
      { name: 'Груша', emoji: '🍐' },
      { name: 'Виноград', emoji: '🍇' },
      { name: 'Полуниця', emoji: '🍓' },
      { name: 'Ківі', emoji: '🥝' },
      { name: 'Манго', emoji: '🥭' },
      { name: 'Ананас', emoji: '🍍' },
    ]
  },
  {
    name: 'Консерви та соуси',
    icon: '🥫',
    items: [
      { name: 'Томатна паста', emoji: '🥫' },
      { name: 'Консервовані томати', emoji: '🥫' },
      { name: 'Соєвий соус', emoji: '🫙' },
      { name: 'Майонез', emoji: '🫙' },
      { name: 'Кетчуп', emoji: '🥫' },
      { name: 'Гірчиця', emoji: '🫙' },
      { name: 'Оливки', emoji: '🫒' },
      { name: 'Консервована квасоля', emoji: '🥫' },
      { name: 'Консервований горох', emoji: '🥫' },
      { name: 'Оцет', emoji: '🫙' },
    ]
  },
  {
    name: 'Спеції та приправи',
    icon: '🧂',
    items: [
      { name: 'Сіль', emoji: '🧂' },
      { name: 'Перець чорний', emoji: '🌶️' },
      { name: 'Паприка', emoji: '🌶️' },
      { name: 'Куркума', emoji: '🟡' },
      { name: 'Базилік', emoji: '🌿' },
      { name: 'Орегано', emoji: '🌿' },
      { name: 'Кріп', emoji: '🌿' },
      { name: 'Петрушка', emoji: '🌿' },
      { name: 'Лавровий лист', emoji: '🍃' },
      { name: 'Імбир', emoji: '🫚' },
    ]
  },
]

// Базові продукти які зазвичай є на кухні (предефолтно включені)
const PANTRY_STAPLES = [
  { name: 'Сіль', emoji: '🧂' },
  { name: 'Перець чорний', emoji: '🌶️' },
  { name: 'Олія соняшникова', emoji: '🫒' },
  { name: 'Олія оливкова', emoji: '🫒' },
  { name: 'Цукор', emoji: '🍬' },
  { name: 'Борошно', emoji: '🌾' },
  { name: 'Оцет', emoji: '🫙' },
  { name: 'Часник', emoji: '🧄' },
  { name: 'Цибуля', emoji: '🧅' },
]

const DEFAULT_PANTRY = PANTRY_STAPLES.map(s => s.name)
const PANTRY_STAPLE_NAMES = new Set(DEFAULT_PANTRY)

// Category visual styles - gradient backgrounds for ingredient emoji circles
const CATEGORY_EMOJI_BG: Record<string, string> = {
  "М'ясо та птиця": 'from-rose-100 to-red-50 shadow-rose-200/50',
  'Риба та морепродукти': 'from-sky-100 to-cyan-50 shadow-sky-200/50',
  'Овочі': 'from-emerald-100 to-green-50 shadow-emerald-200/50',
  'Молочні продукти': 'from-amber-100 to-yellow-50 shadow-amber-200/50',
  'Крупи та борошно': 'from-orange-100 to-amber-50 shadow-orange-200/50',
  'Фрукти': 'from-pink-100 to-rose-50 shadow-pink-200/50',
  'Консерви та соуси': 'from-slate-100 to-gray-50 shadow-slate-200/50',
  'Спеції та приправи': 'from-yellow-100 to-orange-50 shadow-yellow-200/50',
}

// Small SVG category icons for tabs and headers
function CategoryIcon({ name, size = 18 }: { name: string; size?: number }) {
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

const STORAGE_KEYS = {
  selectedIngredients: 'mealmate_fridge_ingredients',
  customIngredients: 'mealmate_fridge_custom',
  pantryStaples: 'mealmate_pantry_staples',
  myFridge: 'mealmate_my_fridge',
  myFridgeCustom: 'mealmate_my_fridge_custom',
  favorites: 'mealmate_favorites',
  history: 'mealmate_history',
  settings: 'mealmate_settings',
  planHistory: 'mealmate_plan_history',
  deliveryAddress: 'mealmate_delivery_address',
  orderHistory: 'mealmate_order_history',
}

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>('home')

  // Handle mode from query params (e.g. /?mode=history)
  useEffect(() => {
    const qMode = searchParams.get('mode')
    if (qMode && ['history', 'orders', 'favorites', 'settings', 'order-prepare'].includes(qMode)) {
      setMode(qMode as Mode)
    }
  }, [searchParams])

  const {
    isDark, toggleTheme, coinBalance,
    clearFridge: ctxClearFridge,
    deliveryAddress: ctxDeliveryAddress, setDeliveryAddress: ctxSetDeliveryAddress,
    selectedStoreId: ctxSelectedStoreId, setSelectedStoreId: ctxSetSelectedStoreId,
    cartItems: ctxCartItems, setCartItems: ctxSetCartItems,
    orderStep: ctxOrderStep, setOrderStep: ctxSetOrderStep,
    storesData: ctxStoresData, storesLoading: ctxStoresLoading,
    executeBatchSearch: ctxExecuteBatchSearch,
    updateCartItemQuantity, excludeCartItem, selectAlternative,
    searchAlternativeProduct, calculateCartTotal,
    finalizeOrder, completeOrder, loadOrderFromHistory, deleteOrderFromHistory,
    cartEstimate, cartEstimateLoading, estimateCartPrice,
    zakazCookies, zakazPhone, zakazAuthStep, isZakazConnected, setZakazAuthStep,
    connectZakaz, startZakazSignup, confirmZakazSignup,
    startZakazRecovery, confirmZakazRecovery, finishZakazRecovery,
    disconnectZakaz, zakazCartLoading, currentOrderId,
    orderHistory: ctxOrderHistory,
    altSearchIndex: ctxAltSearchIndex, setAltSearchIndex: ctxSetAltSearchIndex,
    altSearchQuery: ctxAltSearchQuery, setAltSearchQuery: ctxSetAltSearchQuery,
    altSearchResults: ctxAltSearchResults, setAltSearchResults: ctxSetAltSearchResults,
    altSearchLoading: ctxAltSearchLoading,
    expandedAlts: ctxExpandedAlts, setExpandedAlts: ctxSetExpandedAlts,
    fetchStores,
  } = useApp()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const c = getThemeColors(isDark)
  const [peopleCount] = useState(2)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [mealPlan, setMealPlan] = useState<WeekPlan | null>(null)
  const [planDays, setPlanDays] = useState(7)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [customIngredient, setCustomIngredient] = useState('')
  const [customIngredients, setCustomIngredients] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [pantryStaples, setPantryStaples] = useState<Set<string>>(new Set(DEFAULT_PANTRY))
  const [isHydrated, setIsHydrated] = useState(false)
  // Мій холодильник - постійний список продуктів які є вдома
  const [myFridge, setMyFridge] = useState<string[]>([])
  const [myFridgeCustom, setMyFridgeCustom] = useState<string[]>([])

  // Улюблені та історія рецептів
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [history, setHistory] = useState<Recipe[]>([])

  // Історія планів харчування
  const [planHistory, setPlanHistory] = useState<WeekPlan[]>([])

  // Налаштування користувача
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)

  // Режим готування
  const [cookingStep, setCookingStep] = useState(0)
  const [cookingTimer, setCookingTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Toast повідомлення
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Recipe overlay (for viewing recipe details from meal plan)
  const [overlayRecipe, setOverlayRecipe] = useState<Recipe | null>(null)
  // Overlay context: which meal in plan was opened
  const [overlayMealContext, setOverlayMealContext] = useState<{dayIndex: number; mealIndex: number} | null>(null)

  // Plan fridge mode & calendar
  const [useFridgeForPlan, setUseFridgeForPlan] = useState(false)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showCompleteOrderModal, setShowCompleteOrderModal] = useState(false)
  const [swappingMeal, setSwappingMeal] = useState<{dayIndex: number; mealIndex: number} | null>(null)
  const [zakazSearchIndex, setZakazSearchIndex] = useState<number | null>(null)
  const [zakazResults, setZakazResults] = useState<{title: string; ean: string; price: number; unit: string; in_stock: boolean; img: string | null; web_url: string}[]>([])
  const [zakazLoading, setZakazLoading] = useState(false)

  // Ordering state — from AppContext
  const deliveryAddress = ctxDeliveryAddress
  const setDeliveryAddress = ctxSetDeliveryAddress
  const selectedStoreId = ctxSelectedStoreId
  const setSelectedStoreId = ctxSetSelectedStoreId
  const cartItems = ctxCartItems
  const setCartItems = ctxSetCartItems
  const orderStep = ctxOrderStep
  const setOrderStep = ctxSetOrderStep
  const storesData = ctxStoresData
  const storesLoading = ctxStoresLoading
  const altSearchIndex = ctxAltSearchIndex
  const setAltSearchIndex = ctxSetAltSearchIndex
  const altSearchQuery = ctxAltSearchQuery
  const setAltSearchQuery = ctxSetAltSearchQuery
  const altSearchResults = ctxAltSearchResults
  const setAltSearchResults = ctxSetAltSearchResults
  const altSearchLoading = ctxAltSearchLoading
  const expandedAlts = ctxExpandedAlts
  const setExpandedAlts = ctxSetExpandedAlts
  const executeBatchSearch = ctxExecuteBatchSearch
  const orderHistory = ctxOrderHistory


  // Zakaz.ua login form local state
  const [zakazPhoneInput, setZakazPhoneInput] = useState('+380')
  const [zakazPasswordInput, setZakazPasswordInput] = useState('')
  const [zakazOtpInput, setZakazOtpInput] = useState('')
  const [zakazNewPasswordInput, setZakazNewPasswordInput] = useState('')
  const [zakazMode, setZakazMode] = useState<'login' | 'signup' | 'recovery'>('login')

  // Load reCAPTCHA Enterprise (invisible, for signup/recovery)
  useEffect(() => {
    if (document.querySelector('script[src*="recaptcha/enterprise.js"]')) return
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LfZHBArAAAAAFZNAbtSDZp5_MY52hGdftmkk92O'
    script.async = true
    document.head.appendChild(script)
  }, [])

  const handleZakazLogin = useCallback(async () => {
    if (zakazPhoneInput.length < 12 || !zakazPasswordInput) return
    connectZakaz(zakazPhoneInput, zakazPasswordInput)
    setZakazPasswordInput('')
  }, [zakazPhoneInput, zakazPasswordInput, connectZakaz])

  // Fetch stores when entering order-prepare mode (e.g. on page reload)
  useEffect(() => {
    if (mode === 'order-prepare') {
      fetchStores()
    }
  }, [mode, fetchStores])

  // Авторизація
  const [isAuth, setIsAuth] = useState(false)
  const [authUser, setAuthUser] = useState<{ uuid: string; email: string; name?: string } | null>(null)
  const [authForm, setAuthForm] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // No separate loadFromBackend — AppContext handles /init loading

  // Завантаження стану з localStorage + перевірка авторизації
  useEffect(() => {
    try {
      const savedIngredients = localStorage.getItem(STORAGE_KEYS.selectedIngredients)
      const savedCustom = localStorage.getItem(STORAGE_KEYS.customIngredients)
      const savedPantry = localStorage.getItem(STORAGE_KEYS.pantryStaples)
      const savedMyFridge = localStorage.getItem(STORAGE_KEYS.myFridge)
      const savedMyFridgeCustom = localStorage.getItem(STORAGE_KEYS.myFridgeCustom)
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.favorites)
      const savedHistory = localStorage.getItem(STORAGE_KEYS.history)
      const savedSettings = localStorage.getItem(STORAGE_KEYS.settings)
      const savedPlanHistory = localStorage.getItem(STORAGE_KEYS.planHistory)

      if (savedIngredients) setSelectedIngredients(JSON.parse(savedIngredients))
      if (savedCustom) setCustomIngredients(JSON.parse(savedCustom))
      if (savedPantry) setPantryStaples(new Set(JSON.parse(savedPantry)))
      if (savedMyFridge) setMyFridge(Array.from(new Set(JSON.parse(savedMyFridge) as string[])))
      if (savedMyFridgeCustom) setMyFridgeCustom(Array.from(new Set(JSON.parse(savedMyFridgeCustom) as string[])))
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
      if (savedHistory) setHistory(JSON.parse(savedHistory))
      if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
      if (savedPlanHistory) setPlanHistory(JSON.parse(savedPlanHistory))
      const savedDeliveryAddress = localStorage.getItem(STORAGE_KEYS.deliveryAddress)
      if (savedDeliveryAddress) setDeliveryAddress(JSON.parse(savedDeliveryAddress))
      // orderHistory loaded by AppContext
    } catch (e) {
      void e // state load failed silently
    }
    setIsHydrated(true)

    // Перевірка авторизації (backend data loaded by AppContext)
    if (api.isLoggedIn()) {
      const user = api.getUser()
      if (user) {
        setIsAuth(true)
        setAuthUser(user)
      }
    }
  }, [])

  // Авторизація: вхід
  const handleLogin = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const data = await api.login(authEmail, authPassword)
      setIsAuth(true)
      setAuthUser(data.user)
      setAuthEmail('')
      setAuthPassword('')
      setMode('home')
      showToast('Вхід успішний!', 'success')
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Помилка входу')
    } finally {
      setAuthLoading(false)
    }
  }

  // Авторизація: реєстрація
  const handleRegister = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const data = await api.register(authEmail, authPassword, authName || undefined)
      setIsAuth(true)
      setAuthUser(data.user)
      setAuthEmail('')
      setAuthPassword('')
      setAuthName('')
      setMode('home')
      // Синхронізуємо поточні дані на бекенд
      syncAllToBackend()
      showToast('Реєстрація успішна!', 'success')
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Помилка реєстрації')
    } finally {
      setAuthLoading(false)
    }
  }

  // Вихід
  const handleLogout = () => {
    api.logout()
    setIsAuth(false)
    setAuthUser(null)
    window.location.href = '/login'
  }

  // Синхронізація всіх даних на бекенд (після реєстрації)
  const syncAllToBackend = async () => {
    if (!api.isLoggedIn()) return
    try {
      // Синхронізуємо налаштування
      await api.updateSettings({
        allergies: settings.allergies,
        dietaryRestrictions: settings.dietaryRestrictions,
        dislikedIngredients: settings.dislikedIngredients,
        dailyCalorieGoal: settings.dailyCalorieGoal,
        dailyProteinGoal: settings.dailyProteinGoal,
        dailyCarbsGoal: settings.dailyCarbsGoal,
        dailyFatGoal: settings.dailyFatGoal,
        deliveryCity: deliveryAddress.city,
        deliveryAddress: deliveryAddress.address,
      }).catch(() => {})

      // Синхронізуємо холодильник
      const fridgeItems: api.FridgeItem[] = [
        ...myFridge.map(name => ({ name, isCustom: false })),
        ...myFridgeCustom.map(name => ({ name, isCustom: true })),
      ]
      if (fridgeItems.length > 0) {
        await api.syncFridge(fridgeItems).catch(() => {})
      }
    } catch (e) {
      void e // sync failed silently
    }
  }

  // Зберігання стану в localStorage
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEYS.selectedIngredients, JSON.stringify(selectedIngredients))
      localStorage.setItem(STORAGE_KEYS.customIngredients, JSON.stringify(customIngredients))
      localStorage.setItem(STORAGE_KEYS.pantryStaples, JSON.stringify(Array.from(pantryStaples)))
      localStorage.setItem(STORAGE_KEYS.myFridge, JSON.stringify(myFridge))
      localStorage.setItem(STORAGE_KEYS.myFridgeCustom, JSON.stringify(myFridgeCustom))
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites))
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history))
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
      localStorage.setItem(STORAGE_KEYS.planHistory, JSON.stringify(planHistory))
      localStorage.setItem(STORAGE_KEYS.deliveryAddress, JSON.stringify(deliveryAddress))
      localStorage.setItem(STORAGE_KEYS.orderHistory, JSON.stringify(orderHistory))
    } catch (e) {
      void e // save failed silently
    }
  }, [selectedIngredients, customIngredients, pantryStaples, myFridge, myFridgeCustom, favorites, history, settings, planHistory, deliveryAddress, orderHistory, isHydrated])

  // Синхронізація холодильника з бекендом відбувається через AppContext

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Close user menu on click outside
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

  // ESC key closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUserMenu) setShowUserMenu(false)
        else if (zakazSearchIndex !== null) setZakazSearchIndex(null)
        else if (showShoppingList) setShowShoppingList(false)
        else if (overlayRecipe) { setOverlayRecipe(null); setOverlayMealContext(null) }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [overlayRecipe, zakazSearchIndex, showShoppingList, showUserMenu])

  // Body scroll lock when modal is open
  useEffect(() => {
    if (overlayRecipe || showShoppingList) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [overlayRecipe, showShoppingList])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  // Таймер для режиму готування
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && cookingTimer > 0) {
      interval = setInterval(() => {
        setCookingTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            // Програти звук
            if (typeof window !== 'undefined') {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+fnpmTiHhiU0dBQUhTZXqLm6Wur6ynnpF+aVNAMiwuOExjeJCksbm7uLCjkXpfRTMoJS1AV26HnbC+xcTAt6aQd1w/KyElMkZgfJins8DF')
              audio.play().catch(() => {})
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, cookingTimer])

  const togglePantryStaple = (name: string) => {
    setPantryStaples(prev => {
      const newSet = new Set(prev)
      if (newSet.has(name)) {
        newSet.delete(name)
      } else {
        newSet.add(name)
      }
      return newSet
    })
  }

  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      const ingredient = customIngredient.trim()
      setCustomIngredients(prev => [...prev, ingredient])
      setSelectedIngredients(prev => [...prev, ingredient])
      setCustomIngredient('')
    }
  }

  const removeCustomIngredient = (name: string) => {
    setCustomIngredients(prev => prev.filter(i => i !== name))
    setSelectedIngredients(prev => prev.filter(i => i !== name))
  }

  const toggleIngredient = (name: string) => {
    setSelectedIngredients(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    )
  }

  // Функції для керування "Мій холодильник"
  const toggleMyFridgeItem = (name: string) => {
    setMyFridge(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    )
  }

  const addMyFridgeCustom = (name: string) => {
    if (name.trim() && !myFridge.includes(name.trim()) && !myFridgeCustom.includes(name.trim())) {
      setMyFridgeCustom(prev => [...prev, name.trim()])
      setMyFridge(prev => [...prev, name.trim()])
    }
  }

  const removeMyFridgeCustom = (name: string) => {
    setMyFridgeCustom(prev => prev.filter(i => i !== name))
    setMyFridge(prev => prev.filter(i => i !== name))
  }

  // Використати продукти з "Мій холодильник" для рецепту
  const useMyFridgeForRecipe = () => {
    setSelectedIngredients([...myFridge])
    setCustomIngredients([...myFridgeCustom])
    setMode('fridge')
  }

  // Улюблені рецепти
  const toggleFavorite = (recipe: Recipe) => {
    setFavorites(prev => {
      const exists = prev.some(r => r.id === recipe.id)
      if (exists) {
        return prev.filter(r => r.id !== recipe.id)
      }
      return [recipe, ...prev]
    })
    // Синхронізація з бекендом
    if (api.isLoggedIn()) {
      api.toggleFavoriteApi(recipe.id).catch(() => {})
    }
  }

  const isFavorite = (recipeId: string) => favorites.some(r => r.id === recipeId)

  // Додати до історії
  const addToHistory = (recipe: Recipe) => {
    setHistory(prev => {
      const filtered = prev.filter(r => r.id !== recipe.id)
      return [recipe, ...filtered].slice(0, 50) // Максимум 50 рецептів
    })
  }

  // Налаштування
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      // Синхронізація з бекендом
      if (api.isLoggedIn()) {
        api.updateSettings({
          allergies: next.allergies,
          dietaryRestrictions: next.dietaryRestrictions,
          dislikedIngredients: next.dislikedIngredients,
          dailyCalorieGoal: next.dailyCalorieGoal,
          dailyProteinGoal: next.dailyProteinGoal,
          dailyCarbsGoal: next.dailyCarbsGoal,
          dailyFatGoal: next.dailyFatGoal,
        }).catch(() => {})
      }
      return next
    })
  }

  const toggleAllergy = (allergy: string) => {
    updateSettings({
      allergies: settings.allergies.includes(allergy)
        ? settings.allergies.filter(a => a !== allergy)
        : [...settings.allergies, allergy]
    })
  }

  const toggleDiet = (diet: string) => {
    updateSettings({
      dietaryRestrictions: settings.dietaryRestrictions.includes(diet)
        ? settings.dietaryRestrictions.filter(d => d !== diet)
        : [...settings.dietaryRestrictions, diet]
    })
  }

  // Режим готування
  const startCooking = () => {
    setCookingStep(0)
    setCookingTimer(0)
    setIsTimerRunning(false)
    setMode('cooking')
  }

  const nextCookingStep = () => {
    if (recipe && cookingStep < recipe.instructions.length - 1) {
      setCookingStep(prev => prev + 1)
      setCookingTimer(0)
      setIsTimerRunning(false)
    }
  }

  const prevCookingStep = () => {
    if (cookingStep > 0) {
      setCookingStep(prev => prev - 1)
      setCookingTimer(0)
      setIsTimerRunning(false)
    }
  }

  const setTimer = (minutes: number) => {
    setCookingTimer(minutes * 60)
    setIsTimerRunning(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Поділитися рецептом
  const shareRecipe = async () => {
    if (!recipe) return
    const text = `${recipe.title}\n\n${recipe.description}\n\n${recipe.prepTime + recipe.cookTime} хв | ${recipe.servings} порцій | ${recipe.nutrition.calories} ккал\n\nІнгредієнти:\n${recipe.ingredients.map(i => `- ${i.name} — ${i.amount} ${i.unit}`).join('\n')}\n\nПриготування:\n${recipe.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n— MealMate AI`

    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text })
      } catch {
        copyToClipboard(text)
      }
    } else {
      copyToClipboard(text)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('Рецепт скопійовано!', 'success')
  }

  // Друк рецепту
  const printRecipe = () => {
    window.print()
  }

  // Recalculate shopping list from all recipes in plan
  const recalculateShoppingList = (plan: WeekPlan, fridgeIngredients?: string[]) => {
    const ingredientMap = new Map<string, { amount: number; unit: string; category: string; recipes: Set<string> }>()

    plan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.recipe.ingredients.forEach(ing => {
          const key = ing.name.toLowerCase()
          const existing = ingredientMap.get(key)
          const numAmount = parseFloat(ing.amount) || 0
          if (existing) {
            existing.amount += numAmount
            existing.recipes.add(meal.recipe.title)
          } else {
            ingredientMap.set(key, {
              amount: numAmount,
              unit: ing.unit,
              category: ing.category,
              recipes: new Set([meal.recipe.title]),
            })
          }
        })
      })
    })

    const fridgeSet = new Set((fridgeIngredients || []).map(i => i.toLowerCase()))

    const newList = Array.from(ingredientMap.entries())
      .filter(([name]) => !fridgeSet.has(name))
      .map(([, val]) => ({
        ingredient: val.recipes.values().next().value ? Array.from(val.recipes)[0].split(',')[0] : '',
        amount: String(Math.ceil(val.amount / 50) * 50 || val.amount),
        unit: val.unit,
        category: val.category as 'vegetables' | 'fruits' | 'meat' | 'fish' | 'dairy' | 'grains' | 'spices' | 'other',
        checked: false,
        recipes: Array.from(val.recipes),
        ingredient_name: '',
      }))
      .map(item => {
        // Fix: set ingredient to the actual ingredient name from the map
        const key = Array.from(ingredientMap.entries()).find(([, v]) =>
          JSON.stringify(Array.from(v.recipes)) === JSON.stringify(item.recipes) && String(Math.ceil(v.amount / 50) * 50 || v.amount) === item.amount
        )
        return { ...item, ingredient: key ? key[0].charAt(0).toUpperCase() + key[0].slice(1) : item.ingredient }
      })

    return newList
  }

  // Swap a meal in the plan
  const swapMeal = async (dayIndex: number, mealIndex: number) => {
    if (!mealPlan) return
    setSwappingMeal({ dayIndex, mealIndex })
    setZakazSearchIndex(null)

    try {
      const day = mealPlan.days[dayIndex]
      const oldMeal = day.meals[mealIndex]
      const mealTypeNames: Record<string, string> = { breakfast: 'сніданок', lunch: 'обід', dinner: 'вечеря', snack: 'перекус' }

      const newRecipe = await api.generateRecipe({
        ingredients: useFridgeForPlan && myFridge.length > 0 ? myFridge.slice(0, 20) : [],
        peopleCount,
        dietaryRestrictions: settings.dietaryRestrictions,
        allergies: settings.allergies,
        dislikedIngredients: settings.dislikedIngredients,
        mealType: oldMeal.type,
        specificRequest: `Заміни "${oldMeal.recipe.title}" на іншу страву для ${mealTypeNames[oldMeal.type]}. НЕ повторюй цю страву.`,
      })

      // Immutably update the meal plan
      const newDays = mealPlan.days.map((d, di) => {
        if (di !== dayIndex) return d
        const newMeals = d.meals.map((m, mi) => mi === mealIndex ? { ...m, recipe: newRecipe } : m)
        // Recalculate day's totalNutrition
        const totalNutrition = {
          calories: newMeals.reduce((sum, m) => sum + m.recipe.nutrition.calories, 0),
          protein: newMeals.reduce((sum, m) => sum + m.recipe.nutrition.protein, 0),
          carbs: newMeals.reduce((sum, m) => sum + m.recipe.nutrition.carbs, 0),
          fat: newMeals.reduce((sum, m) => sum + m.recipe.nutrition.fat, 0),
        }
        return { ...d, meals: newMeals, totalNutrition }
      })

      const updatedPlan = { ...mealPlan, days: newDays }

      // Recalculate shopping list
      const fridgeItems = useFridgeForPlan ? myFridge : undefined
      updatedPlan.shoppingList = recalculateShoppingList(updatedPlan, fridgeItems)

      setMealPlan(updatedPlan)
      addToPlanHistory(updatedPlan)
      setCheckedItems(new Set())
      showToast('Страву замінено!', 'success')
    } catch {
      showToast('Не вдалось замінити страву', 'error')
    } finally {
      setSwappingMeal(null)
    }
  }

  // Search Zakaz.ua products
  const searchZakazProducts = async (query: string, index: number) => {
    if (zakazSearchIndex === index) {
      setZakazSearchIndex(null)
      setZakazResults([])
      return
    }

    setZakazSearchIndex(index)
    setZakazLoading(true)
    setZakazResults([])

    try {
      const results = await api.searchProducts(query)
      setZakazResults(results)
    } catch {
      showToast('Не вдалось знайти товари', 'error')
      setZakazSearchIndex(null)
    } finally {
      setZakazLoading(false)
    }
  }

  // --- Ordering handlers (from AppContext) ---

  // Макроси для дня плану
  const getDayMacros = (day: { meals: { recipe: Recipe }[] }) => {
    let protein = 0, carbs = 0, fat = 0
    day.meals.forEach(meal => {
      protein += meal.recipe.nutrition.protein
      carbs += meal.recipe.nutrition.carbs
      fat += meal.recipe.nutrition.fat
    })
    const total = protein * 4 + carbs * 4 + fat * 9
    return {
      protein, carbs, fat,
      proteinPct: total > 0 ? Math.round((protein * 4 / total) * 100) : 0,
      carbsPct: total > 0 ? Math.round((carbs * 4 / total) * 100) : 0,
      fatPct: total > 0 ? Math.round((fat * 9 / total) * 100) : 0,
    }
  }

  // Рівень складності українською
  const difficultyLabel = (d: 'easy' | 'medium' | 'hard') => {
    switch (d) {
      case 'easy': return { text: 'Легко', classes: 'bg-emerald-100 text-emerald-700' }
      case 'medium': return { text: 'Середньо', classes: 'bg-amber-100 text-amber-700' }
      case 'hard': return { text: 'Складно', classes: 'bg-red-100 text-red-700' }
    }
  }

  const generateRecipe = async () => {
    setIsLoading(true)
    try {
      // Комбінуємо вибрані продукти + активні базові продукти
      const allIngredients = [...selectedIngredients, ...Array.from(pantryStaples)]
      // Базові продукти які вимкнені - їх НЕ використовувати в рецепті
      const excludedStaples = DEFAULT_PANTRY.filter(s => !pantryStaples.has(s))

      const newRecipe = await api.generateRecipe({
        ingredients: allIngredients,
        peopleCount,
        allergies: settings.allergies,
        dietaryRestrictions: settings.dietaryRestrictions,
        dislikedIngredients: [...excludedStaples, ...settings.dislikedIngredients],
        calorieGoal: settings.dailyCalorieGoal || undefined,
        proteinGoal: settings.dailyProteinGoal || undefined,
        carbsGoal: settings.dailyCarbsGoal || undefined,
        fatGoal: settings.dailyFatGoal || undefined,
      })
      setRecipe(newRecipe)
      addToHistory(newRecipe)
      setMode('recipe-result')
    } catch {
      showToast('Не вдалось згенерувати рецепт. Спробуйте ще раз.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const addToPlanHistory = (plan: WeekPlan) => {
    setPlanHistory(prev => {
      const filtered = prev.filter(p => p.id !== plan.id)
      return [plan, ...filtered].slice(0, 20)
    })
  }

  const loadPlanFromHistory = (plan: WeekPlan) => {
    setMealPlan(plan)
    setSelectedDayIndex(0)
    setCheckedItems(new Set())
    router.push('/meal-plan')
  }

  const deletePlanFromHistory = (planId: string) => {
    setPlanHistory(prev => prev.filter(p => p.id !== planId))
  }

  const generateMealPlan = async () => {
    setIsLoading(true)
    setCheckedItems(new Set())
    setSelectedDayIndex(0)
    setZakazSearchIndex(null)
    setZakazResults([])
    try {
      const plan = await api.generateMealPlan({
        days: planDays,
        mealsPerDay: ['breakfast', 'lunch', 'dinner'],
        ingredients: useFridgeForPlan && myFridge.length > 0 ? myFridge.slice(0, 20) : undefined,
        peopleCount,
        allergies: settings.allergies,
        dietaryRestrictions: settings.dietaryRestrictions,
        dislikedIngredients: settings.dislikedIngredients,
      })
      setMealPlan(plan)
      addToPlanHistory(plan)
      router.push('/meal-plan')
    } catch {
      showToast('Не вдалось згенерувати план. Спробуйте ще раз.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItem = (index: number) => {
    const newSet = new Set(checkedItems)
    if (newSet.has(index)) newSet.delete(index)
    else newSet.add(index)
    setCheckedItems(newSet)
  }

  const goHome = () => {
    setMode('home')
    setRecipe(null)
    setMealPlan(null)
    // Не очищуємо selectedIngredients - вони зберігаються в холодильнику
  }

  const clearFridge = () => {
    setSelectedIngredients([])
    setCustomIngredients([])
    setPantryStaples(new Set(DEFAULT_PANTRY))
  }

  return (
    <div className="min-h-screen relative" style={{ background: c.pageBg }}>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl" style={{
            background: isDark ? 'rgba(20, 18, 16, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${toast.type === 'error' ? (isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)') : toast.type === 'success' ? (isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)') : (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(184,134,11,0.15)')}`,
            color: toast.type === 'error' ? c.dangerColor : toast.type === 'success' ? c.successColor : c.gold,
          }}>
            <span className="text-lg">
              {toast.type === 'error' ? '!' : toast.type === 'success' ? '\u2713' : '\u2139'}
            </span>
            <span className="font-medium text-sm" style={{ color: c.text }}>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 text-lg" style={{ color: c.muted }}>&times;</button>
          </div>
        </div>
      )}

      <Header />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">

        {/* HOME */}
        {mode === 'home' && (
          <div className="animate-in">
            <div className="py-16">
            <div className="text-center mb-20 relative">
              {/* Radial gold glow behind hero (dark mode) */}
              {isDark && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(212,168,67,0.06) 0%, transparent 70%)' }} />
              )}
              {/* Greeting */}
              <div className="flex items-center justify-center gap-4 mb-10 relative">
                <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${c.gold})` }} />
                <span className="text-xs uppercase tracking-[0.4em] font-semibold" style={{ color: c.goldMuted }}>
                  AI Culinary Assistant
                </span>
                <div className="w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${c.gold})` }} />
              </div>

              {/* Diamond separator */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-8 h-px" style={{ background: c.goldLine }} />
                <div className="w-1.5 h-1.5 rotate-45" style={{ background: c.gold, opacity: 0.5 }} />
                <div className="w-8 h-px" style={{ background: c.goldLine }} />
              </div>

              <h1 className="text-5xl md:text-7xl font-serif mb-10 tracking-tight leading-[1.1] relative" style={{ color: c.text }}>
                Що готуємо <br/>
                <span className="italic relative" style={{ color: c.gold }}>
                  сьогодні? 🍳
                  {/* Decorative underline */}
                  <svg className="absolute -bottom-2 left-[30%] -translate-x-1/2 w-48 h-3" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="url(#gold-gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gold-gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop offset="0%" stopColor={c.gold} stopOpacity="0.3"/>
                        <stop offset="50%" stopColor={c.gold} stopOpacity={isDark ? '0.6' : '0.8'}/>
                        <stop offset="100%" stopColor={c.gold} stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-lg max-w-lg mx-auto leading-relaxed" style={{ color: c.muted }}>
                Скажи, що є в холодильнику — і AI створить рецепт 👨‍🍳
              </p>
            </div>


            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* My Fridge Option */}
              <button
                onClick={() => router.push('/my-fridge')}
                className="group text-left rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] card-gold-hover relative"
                style={{
                  border: `1px solid ${c.cardBorder}`,
                  background: isDark ? 'linear-gradient(165deg, rgba(22,19,14,0.95), rgba(12,10,8,0.98))' : '#ffffff',
                  boxShadow: isDark ? undefined : `0 4px 24px rgba(184,134,11,0.06)`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: `linear-gradient(165deg, ${c.badgeBg} 0%, transparent 60%)` }} />
                <div className="relative p-7">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
                      background: c.headerBg,
                      border: `1px solid rgba(212,168,67,0.15)`,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
                    }}>
                      <svg className="w-6 h-6" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    {myFridge.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                        background: c.badgeBg,
                        color: c.gold,
                        border: `1px solid ${c.inputBorder}`
                      }}>
                        {myFridge.length} продуктів
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-serif mb-2" style={{ color: c.text }}>Мої продукти</h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: c.muted }}>
                    {myFridge.length > 0 ? 'Перегляньте та керуйте списком' : 'Додайте продукти, які є вдома'}
                  </p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all group-hover:gap-3" style={{
                    background: c.badgeBg,
                    color: c.gold,
                    border: `1px solid ${c.inputBorder}`
                  }}>
                    Відкрити
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </button>

              {/* Quick Recipe Option */}
              <button
                onClick={() => router.push('/generate')}
                className="group text-left rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] card-gold-hover relative"
                style={{
                  border: `1px solid ${c.cardBorder}`,
                  background: isDark ? 'linear-gradient(165deg, rgba(22,19,14,0.95), rgba(12,10,8,0.98))' : '#ffffff',
                  boxShadow: isDark ? undefined : `0 4px 24px rgba(184,134,11,0.06)`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: `linear-gradient(165deg, ${c.badgeBg} 0%, transparent 60%)` }} />
                <div className="relative p-7">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
                      background: c.headerBg,
                      border: `1px solid rgba(212,168,67,0.15)`,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
                    }}>
                      <svg className="w-6 h-6" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase" style={{
                      background: isDark ? 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(212,168,67,0.08))' : 'linear-gradient(135deg, rgba(184,134,11,0.1), rgba(184,134,11,0.05))',
                      color: c.gold,
                      border: `1px solid ${c.inputBorder}`
                    }}>
                      AI
                    </span>
                  </div>
                  <h2 className="text-xl font-serif mb-2" style={{ color: c.text }}>Швидкий рецепт</h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: c.muted }}>
                    {myFridge.length > 0 ? 'AI створить страву з ваших продуктів' : 'Оберіть інгредієнти для страви'}
                  </p>
                  <span className="btn-gold-premium inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all group-hover:gap-3">
                    Створити рецепт
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </button>

              {/* Plan Option */}
              <button
                onClick={() => router.push('/meal-plan')}
                className="group text-left rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] card-gold-hover relative"
                style={{
                  border: `1px solid ${c.cardBorder}`,
                  background: isDark ? 'linear-gradient(165deg, rgba(22,19,14,0.95), rgba(12,10,8,0.98))' : '#ffffff',
                  boxShadow: isDark ? undefined : `0 4px 24px rgba(184,134,11,0.06)`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: `linear-gradient(165deg, ${c.badgeBg} 0%, transparent 60%)` }} />
                <div className="relative p-7">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
                      background: c.headerBg,
                      border: `1px solid rgba(212,168,67,0.15)`,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
                    }}>
                      <svg className="w-6 h-6" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase" style={{
                      background: c.badgeBg,
                      color: c.gold,
                      border: `1px solid ${c.inputBorder}`
                    }}>
                      7 днів
                    </span>
                  </div>
                  <h2 className="text-xl font-serif mb-2" style={{ color: c.text }}>План харчування</h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: c.muted }}>Меню на тиждень та автоматичний список покупок</p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all group-hover:gap-3" style={{
                    background: c.badgeBg,
                    color: c.gold,
                    border: `1px solid ${c.inputBorder}`
                  }}>
                    Створити план
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </button>
            </div>

            {/* Збережені плани */}
            {planHistory.length > 0 && (
              <div className="max-w-5xl mx-auto mt-16">
                {/* Gold divider */}
                <div className="h-px mb-10" style={{ background: `linear-gradient(90deg, transparent, ${c.goldLine}, transparent)` }} />
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-serif" style={{ color: c.text }}>Збережені плани</h3>
                    <p className="text-sm" style={{ color: c.muted }}>{planHistory.length} {planHistory.length === 1 ? 'план' : planHistory.length < 5 ? 'плани' : 'планів'}</p>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                  {planHistory.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => router.push(`/meal-plan?planId=${plan.id}`)}
                      className="rounded-2xl p-5 pl-7 min-w-[220px] max-w-[260px] flex-shrink-0 text-left relative group transition-all hover:shadow-lg hover:translate-y-[-2px] gold-accent-left card-gold-hover"
                      style={{
                        border: `1px solid ${c.cardBorder}`,
                        background: isDark ? 'rgba(212,168,67,0.03)' : '#ffffff',
                      }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePlanFromHistory(plan.id) }}
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                      >
                        &times;
                      </button>
                      <div className="text-xs mb-2" style={{ color: c.gold }}>
                        {new Date(plan.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-sm font-semibold mb-1" style={{ color: c.text }}>
                        {plan.days.length} {plan.days.length === 1 ? 'день' : plan.days.length < 5 ? 'дні' : 'днів'}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: c.muted }}>
                        {plan.days[0]?.meals.slice(0, 2).map(m => m.recipe.title).join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            </div>{/* close light/dark bg wrapper */}
          </div>
        )}

        {/* MY FRIDGE - Керування холодильником */}
        {mode === 'my-fridge' && (
          <div className="animate-in">
            <button onClick={goHome} className="flex items-center gap-2 mb-8 font-medium transition-colors group" style={{ color: c.dimmed }} onMouseEnter={e => (e.currentTarget.style.color = c.gold)} onMouseLeave={e => (e.currentTarget.style.color = c.dimmed)}>
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Назад
            </button>

            <div className="flex gap-8">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-px" style={{ background: `linear-gradient(90deg, ${isDark ? 'rgba(201,168,76,0.4)' : 'rgba(184,134,11,0.3)'}, transparent)` }} />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: c.gold }}>Холодильник</span>
                  </div>
                  <h2 className="text-4xl font-serif font-bold mb-2" style={{ color: c.text }}>Мої продукти</h2>
                  <p style={{ color: c.dimmed }}>Оберіть інгредієнти, які є вдома</p>
                </div>

                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="px-4 py-2 rounded-xl font-medium text-sm transition-all"
                    style={activeCategory === null ? { background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow } : { background: 'transparent', color: c.muted, border: `1px solid ${c.badgeBorder}` }}
                  >
                    Всі
                  </button>
                  {INGREDIENT_CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                      className="px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5"
                      style={activeCategory === cat.name ? { background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow } : { background: 'transparent', color: c.muted, border: `1px solid ${c.badgeBorder}` }}
                    >
                      <CategoryIcon name={cat.name} /> {cat.name}
                    </button>
                  ))}
                </div>

                {/* Custom ingredient input */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={customIngredient}
                    onChange={(e) => setCustomIngredient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customIngredient.trim()) {
                        addMyFridgeCustom(customIngredient)
                        setCustomIngredient('')
                      }
                    }}
                    placeholder="Додати свій продукт..."
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
                    onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                    onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
                  />
                  <button
                    onClick={() => {
                      if (customIngredient.trim()) {
                        addMyFridgeCustom(customIngredient)
                        setCustomIngredient('')
                      }
                    }}
                    disabled={!customIngredient.trim()}
                    className="px-5 py-3 font-semibold rounded-xl disabled:opacity-50 btn-glow text-sm"
                    style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                  >
                    + Додати
                  </button>
                </div>

                {/* Ingredients grid */}
                {(activeCategory ? INGREDIENT_CATEGORIES.filter(c => c.name === activeCategory) : INGREDIENT_CATEGORIES).map(category => (
                  <div key={category.name} className="mb-6">
                    {!activeCategory && (
                      <h3 className="text-lg font-serif font-semibold mb-3 flex items-center gap-2" style={{ color: c.text }}>
                        <CategoryIcon name={category.name} size={22} /> {category.name}
                      </h3>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {category.items.map(ing => (
                        <button
                          key={ing.name}
                          onClick={() => toggleMyFridgeItem(ing.name)}
                          className="ingredient-card relative p-3 rounded-2xl border-2 text-center transition-all hover:scale-[1.02]"
                          style={myFridge.includes(ing.name) ? { background: c.itemActiveBg, borderColor: c.gold, boxShadow: `0 4px 16px ${isDark ? 'rgba(201,168,76,0.15)' : 'rgba(184,134,11,0.12)'}` } : { background: c.itemBg, borderColor: c.itemBorder }}
                        >
                          <div className={`w-12 h-12 mx-auto mb-1.5 rounded-full bg-gradient-to-br ${CATEGORY_EMOJI_BG[category.name] || 'from-gray-100 to-gray-50'} flex items-center justify-center text-2xl shadow-sm`}>{ing.emoji}</div>
                          <div className="text-xs font-medium" style={{ color: c.muted }}>{ing.name}</div>
                          {myFridge.includes(ing.name) && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow" style={{ background: c.gold, color: isDark ? '#0a0908' : '#fff' }}>
                              &#10003;
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right sidebar - my fridge contents */}
              <div className="w-80 flex-shrink-0 hidden lg:block">
                <div className="glass-strong rounded-2xl p-5 sticky top-20" style={{ border: `1px solid ${c.badgeBorder}` }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-serif font-bold" style={{ color: c.text }}>В холодильнику</h3>
                    {myFridge.length > 0 && (
                      <button onClick={ctxClearFridge} className="text-xs transition-colors" style={{ color: c.dangerColor }}>
                        Очистити
                      </button>
                    )}
                  </div>

                  {myFridge.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {myFridge.map(item => {
                        const found = INGREDIENT_CATEGORIES.flatMap(c => c.items).find(i => i.name === item)
                        const isCustom = myFridgeCustom.includes(item)
                        return (
                          <div key={item} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: isCustom ? c.fridgeCustomBg : c.fridgeItemBg }}>
                            <span className="flex items-center gap-2 text-sm" style={{ color: c.text }}>
                              <span>{found?.emoji || '📦'}</span>
                              {item}
                            </span>
                            <button onClick={() => isCustom ? removeMyFridgeCustom(item) : toggleMyFridgeItem(item)} className="text-lg transition-colors" style={{ color: c.dimmed }} onMouseEnter={e => (e.currentTarget.style.color = c.dangerColor)} onMouseLeave={e => (e.currentTarget.style.color = c.dimmed)}>
                              &times;
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ border: `1px solid ${c.badgeBorder}`, background: c.emptyBg }}>
                        <svg className="w-6 h-6" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium" style={{ color: c.muted }}>Холодильник порожній</p>
                      <p className="text-xs mt-1" style={{ color: c.dimmed }}>Оберіть продукти зліва</p>
                    </div>
                  )}

                  {myFridge.length > 0 && (
                    <button onClick={useMyFridgeForRecipe} className="btn-glow w-full mt-4 py-3.5 font-bold rounded-xl text-sm" style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}>
                      Створити рецепт
                    </button>
                  )}

                  {/* Delivery links */}
                  <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${c.itemBorder}` }}>
                    <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: c.dimmed }}>Замовити доставку</p>
                    <div className="space-y-2">
                      <a href="https://zakaz.ua/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl transition-colors group" onMouseEnter={e => (e.currentTarget.style.background = c.badgeBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">Z</div>
                        <span className="text-sm font-medium" style={{ color: c.muted }}>Zakaz.ua</span>
                        <svg className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-all" style={{ color: c.dimmed }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </a>
                      <a href="https://silpo.ua/delivery" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl transition-colors group" onMouseEnter={e => (e.currentTarget.style.background = c.badgeBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">S</div>
                        <span className="text-sm font-medium" style={{ color: c.muted }}>Silpo</span>
                        <svg className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-all" style={{ color: c.dimmed }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </a>
                      <a href="https://glovoapp.com/ua/uk/kyiv/restaurants_groceries/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl transition-colors group" onMouseEnter={e => (e.currentTarget.style.background = c.badgeBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">G</div>
                        <span className="text-sm font-medium" style={{ color: c.muted }}>Glovo</span>
                        <svg className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-all" style={{ color: c.dimmed }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 glass-strong z-40" style={{ borderTop: `1px solid ${c.badgeBorder}` }}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: c.text }}>
                    {myFridge.length} {myFridge.length === 1 ? 'продукт' : 'продуктів'}
                  </span>
                </div>
                <button onClick={useMyFridgeForRecipe} disabled={myFridge.length === 0} className="px-6 py-3 font-bold rounded-xl disabled:opacity-50 btn-glow text-sm" style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}>
                  Створити рецепт
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FRIDGE */}
        {mode === 'fridge' && (
          <div className="animate-in">
            <button onClick={goHome} className="flex items-center gap-2 mb-8 font-medium transition-colors group" style={{ color: c.dimmed }} onMouseEnter={e => (e.currentTarget.style.color = c.gold)} onMouseLeave={e => (e.currentTarget.style.color = c.dimmed)}>
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Назад
            </button>

            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-px" style={{ background: `linear-gradient(90deg, ${isDark ? 'rgba(201,168,76,0.4)' : 'rgba(184,134,11,0.3)'}, transparent)` }} />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: c.gold }}>Рецепт</span>
                  </div>
                  <h2 className="text-4xl font-serif font-bold mb-2" style={{ color: c.text }}>Що є в холодильнику?</h2>
                  <p style={{ color: c.dimmed }}>Оберіть продукти — AI підбере рецепт</p>
                </div>

                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="px-4 py-2 rounded-xl font-medium text-sm transition-all"
                    style={activeCategory === null ? { background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow } : { background: 'transparent', color: c.muted, border: `1px solid ${c.badgeBorder}` }}
                  >
                    Все
                  </button>
                  {INGREDIENT_CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                      className="px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5"
                      style={activeCategory === cat.name ? { background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow } : { background: 'transparent', color: c.muted, border: `1px solid ${c.badgeBorder}` }}
                    >
                      <CategoryIcon name={cat.name} /> {cat.name}
                    </button>
                  ))}
                </div>

                {/* Custom ingredient input */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={customIngredient}
                    onChange={(e) => setCustomIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomIngredient()}
                    placeholder="Додати свій продукт..."
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
                    onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                    onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
                  />
                  <button
                    onClick={addCustomIngredient}
                    disabled={!customIngredient.trim()}
                    className="px-5 py-3 font-semibold rounded-xl disabled:opacity-50 btn-glow text-sm"
                    style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                  >
                    + Додати
                  </button>
                </div>

                {/* Ingredients grid */}
                {(activeCategory ? INGREDIENT_CATEGORIES.filter(c => c.name === activeCategory) : INGREDIENT_CATEGORIES).map(category => {
                  const filteredItems = category.items.filter(ing => !PANTRY_STAPLE_NAMES.has(ing.name))
                  if (filteredItems.length === 0) return null
                  return (
                    <div key={category.name} className="mb-6">
                      {!activeCategory && (
                        <h3 className="text-lg font-serif font-semibold mb-3 flex items-center gap-2" style={{ color: c.text }}>
                          <CategoryIcon name={category.name} size={22} /> {category.name}
                        </h3>
                      )}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {filteredItems.map(ing => (
                          <button
                            key={ing.name}
                            onClick={() => toggleIngredient(ing.name)}
                            className="ingredient-card relative p-3 rounded-2xl border-2 text-center transition-all hover:scale-[1.02]"
                            style={selectedIngredients.includes(ing.name) ? { background: c.itemActiveBg, borderColor: c.gold, boxShadow: `0 4px 16px ${isDark ? 'rgba(201,168,76,0.15)' : 'rgba(184,134,11,0.12)'}` } : { background: c.itemBg, borderColor: c.itemBorder }}
                          >
                            <div className={`w-12 h-12 mx-auto mb-1.5 rounded-full bg-gradient-to-br ${CATEGORY_EMOJI_BG[category.name] || 'from-gray-100 to-gray-50'} flex items-center justify-center text-2xl shadow-sm`}>{ing.emoji}</div>
                            <div className="text-xs font-medium" style={{ color: c.muted }}>{ing.name}</div>
                            {selectedIngredients.includes(ing.name) && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow" style={{ background: c.successColor, color: '#fff' }}>
                                ✓
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right sidebar */}
              <div className="w-80 flex-shrink-0 hidden lg:block">
                <div className="glass-strong rounded-2xl p-5 sticky top-20" style={{ border: `1px solid ${c.badgeBorder}` }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-serif font-bold" style={{ color: c.text }}>Мій кошик</h3>
                    {selectedIngredients.length > 0 && (
                      <button onClick={clearFridge} className="text-xs transition-colors" style={{ color: c.dangerColor }}>Очистити</button>
                    )}
                  </div>

                  {selectedIngredients.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-xs mb-2" style={{ color: c.dimmed }}>{selectedIngredients.length} продуктів обрано:</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedIngredients.map(ing => {
                          const found = INGREDIENT_CATEGORIES.flatMap(c => c.items).find(i => i.name === ing)
                          const isCustom = customIngredients.includes(ing)
                          return (
                            <div key={ing} className="flex items-center justify-between p-2 rounded-lg" style={{ background: isCustom ? c.fridgeCustomBg : c.fridgeItemBg }}>
                              <span className="flex items-center gap-2 text-sm" style={{ color: c.text }}>
                                <span>{found?.emoji || '📦'}</span>
                                {ing}
                              </span>
                              <button onClick={() => isCustom ? removeCustomIngredient(ing) : toggleIngredient(ing)} className="text-lg transition-colors" style={{ color: c.dimmed }} onMouseEnter={e => (e.currentTarget.style.color = c.dangerColor)} onMouseLeave={e => (e.currentTarget.style.color = c.dimmed)}>
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ border: `1px solid ${c.badgeBorder}`, background: c.emptyBg }}>
                        <svg className="w-6 h-6" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      </div>
                      <p className="text-sm font-medium" style={{ color: c.muted }}>Обери продукти зліва</p>
                    </div>
                  )}

                  {/* Pantry staples */}
                  <div className="pt-4 mb-4" style={{ borderTop: `1px solid ${c.itemBorder}` }}>
                    <p className="text-xs mb-2" style={{ color: c.dimmed }}>Базові продукти (завжди є):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PANTRY_STAPLES.map(staple => (
                        <button
                          key={staple.name}
                          onClick={() => togglePantryStaple(staple.name)}
                          className="text-xs px-2 py-1 rounded-md transition-all"
                          style={pantryStaples.has(staple.name) ? { background: c.pantryActiveBg, color: c.pantryActiveText } : { background: c.pantryInactiveBg, color: c.pantryInactiveText, textDecoration: 'line-through' }}
                        >
                          {staple.emoji} {staple.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={generateRecipe}
                    disabled={isLoading || selectedIngredients.length === 0}
                    className="w-full py-4 font-bold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-glow"
                    style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" style={{ borderTopColor: c.btnText }} />
                        Шукаємо...
                      </>
                    ) : 'Знайти рецепт'}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 glass-strong z-40" style={{ borderTop: `1px solid ${c.badgeBorder}` }}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: c.text }}>{selectedIngredients.length} продуктів</span>
                </div>
                <button
                  onClick={generateRecipe}
                  disabled={isLoading || selectedIngredients.length === 0}
                  className="px-6 py-3 font-bold rounded-xl disabled:opacity-50 btn-glow text-sm"
                  style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                >
                  Готувати
                </button>
              </div>
            </div>
          </div>
        )}


        {/* RECIPE RESULT */}
        {mode === 'recipe-result' && recipe && (
          <div className="animate-in">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={goHome}
                className="flex items-center gap-2 text-amber-700/60 hover:text-amber-900 font-medium transition-colors"
              >
                <span className="text-xl">&larr;</span> Новий рецепт
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(recipe)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                  style={{
                    background: isFavorite(recipe.id) ? c.btnBg : c.badgeBg,
                    color: isFavorite(recipe.id) ? c.btnText : c.gold,
                    border: `1px solid ${isFavorite(recipe.id) ? 'transparent' : c.badgeBorder}`,
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">
                    {isFavorite(recipe.id) ? 'В улюблених' : 'Додати'}
                  </span>
                </button>
                <button
                  onClick={shareRecipe}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                  style={{
                    background: c.emptyBg,
                    color: c.muted,
                    border: `1px solid ${c.badgeBorder}`,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">Поділитись</span>
                </button>
                <button
                  onClick={printRecipe}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all print:hidden"
                  style={{
                    background: c.emptyBg,
                    color: c.muted,
                    border: `1px solid ${c.badgeBorder}`,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">Друк</span>
                </button>
                <button
                  onClick={startCooking}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all hover:shadow-xl font-semibold text-sm"
                  style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  </svg>
                  <span className="hidden sm:inline">Готувати</span>
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl print:shadow-none" style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              boxShadow: c.cardShadow,
            }}>
              {/* Header */}
              <div className="relative p-10 print:bg-orange-50" style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(212,168,67,0.08), rgba(212,168,67,0.02))'
                  : 'linear-gradient(135deg, #fef9e7, #fdf5db)',
              }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.goldMuted}, transparent)` }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide" style={{
                      background: c.emptyBg,
                      color: c.gold,
                      border: `1px solid ${c.inputBorder}`,
                    }}>
                      {recipe.cuisine}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5" style={{
                      background: c.emptyBg,
                      color: c.muted,
                      border: `1px solid ${c.badgeBorder}`,
                    }}>
                      <span className={`w-2 h-2 rounded-full ${recipe.difficulty === 'easy' ? 'bg-emerald-400' : recipe.difficulty === 'medium' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                      {recipe.difficulty === 'easy' ? 'Легко' : recipe.difficulty === 'medium' ? 'Середньо' : 'Складно'}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" style={{ color: c.text }}>{recipe.title}</h2>
                  <p className="text-lg" style={{ color: c.muted }}>{recipe.description}</p>
                </div>
              </div>

              {/* Quick Stats — 3 rounded boxes */}
              <div className="grid grid-cols-3 gap-4 p-6" style={{ borderBottom: `1px solid ${c.statBorder}` }}>
                {[
                  { icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ), value: `${recipe.prepTime + recipe.cookTime}`, label: 'хвилин' },
                  { icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  ), value: recipe.servings, label: 'порцій' },
                  { icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    </svg>
                  ), value: recipe.nutrition.calories, label: 'ккал/порція' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl p-5 text-center" style={{
                    background: isDark ? 'rgba(212,168,67,0.04)' : 'rgba(184,134,11,0.03)',
                    border: `1px solid ${c.statBorder}`,
                  }}>
                    <div className="flex justify-center mb-2" style={{ color: c.gold }}>{stat.icon}</div>
                    <div className="text-3xl font-bold" style={{ color: c.text }}>{stat.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: c.dimmed }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Nutrition Dashboard — Horizontal Progress Bars */}
              <div className="p-6" style={{
                background: isDark ? 'rgba(212,168,67,0.03)' : '#fef9e7',
                borderBottom: `1px solid ${c.itemBorder}`,
              }}>
                {/* Prominent calorie display */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold" style={{ color: c.gold }}>{recipe.nutrition.calories}</div>
                  <div className="text-xs font-medium mt-1" style={{ color: c.dimmed }}>ккал на порцію</div>
                </div>

                <div className="flex items-center gap-2.5 mb-5">
                  <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <h3 className="font-bold" style={{ color: c.text }}>Харчова цінність на порцію</h3>
                </div>

                {/* Horizontal progress bars */}
                {(() => {
                  const totalCal = recipe.nutrition.protein * 4 + recipe.nutrition.carbs * 4 + recipe.nutrition.fat * 9
                  const maxGrams = Math.max(recipe.nutrition.protein, recipe.nutrition.carbs, recipe.nutrition.fat, recipe.nutrition.fiber || 0)
                  const macros = [
                    { label: 'Білки', value: recipe.nutrition.protein, unit: 'г', pct: Math.round((recipe.nutrition.protein * 4 / totalCal) * 100), color: c.nutritionProteinBar },
                    { label: 'Вуглеводи', value: recipe.nutrition.carbs, unit: 'г', pct: Math.round((recipe.nutrition.carbs * 4 / totalCal) * 100), color: c.nutritionCarbsBar },
                    { label: 'Жири', value: recipe.nutrition.fat, unit: 'г', pct: Math.round((recipe.nutrition.fat * 9 / totalCal) * 100), color: c.nutritionFatBar },
                    { label: 'Клітковина', value: recipe.nutrition.fiber ?? 0, unit: 'г', pct: 0, color: c.nutritionFiberBar },
                  ]
                  return (
                    <div className="space-y-4">
                      {macros.map((m, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium" style={{ color: c.textSecondary }}>{m.label}</div>
                          <div className="flex items-center gap-2 w-20">
                            <span className="text-sm font-bold" style={{ color: m.color }}>{m.value}{m.unit}</span>
                            {m.pct > 0 && <span className="text-[10px]" style={{ color: c.dimmed }}>{m.pct}%</span>}
                          </div>
                          <div className="flex-1 progress-nutrition">
                            <div className="progress-nutrition-fill" style={{ width: `${maxGrams > 0 ? (m.value / maxGrams) * 100 : 0}%`, background: m.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              <div className="p-10">
                <div className="grid md:grid-cols-5 gap-10">
                  {/* Ingredients */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2.5 mb-6">
                      <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      </svg>
                      <h3 className="text-xl font-bold" style={{ color: c.text }}>Інгредієнти</h3>
                    </div>
                    <div className="space-y-2">
                      {recipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl" style={{
                          background: isDark ? (i % 2 === 0 ? 'rgba(212,168,67,0.03)' : 'transparent') : c.emptyBg,
                          border: `1px solid ${c.itemBorder}`,
                        }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.gold }} />
                          <span className="flex-1" style={{ color: c.text }}>{ing.name}</span>
                          <span className="text-sm font-medium" style={{ color: c.gold }}>{ing.amount} {ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2.5 mb-6">
                      <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                      <h3 className="text-xl font-bold" style={{ color: c.text }}>Як готувати</h3>
                    </div>
                    <div className="space-y-6">
                      {recipe.instructions.map((step, i) => {
                        let text: string
                        if (typeof step === 'string') { text = step }
                        else if (step && typeof step === 'object') {
                          const obj = step as unknown as Record<string, unknown>
                          const candidates = [obj.text, obj.description, obj.instruction, obj.content]
                          if (typeof obj.step === 'string' && (obj.step as string).length > 3) candidates.unshift(obj.step)
                          text = (candidates.find(v => typeof v === 'string' && (v as string).length > 0) as string)
                            || (Object.values(obj).find(v => typeof v === 'string' && (v as string).length > 3) as string)
                            || String(step)
                        } else { text = String(step) }
                        return (
                        <div key={i} className={`flex gap-5 ${i < recipe.instructions.length - 1 ? 'step-timeline' : ''}`}>
                          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold relative z-10" style={{
                            background: c.stepNumBg,
                            color: c.btnText,
                            boxShadow: c.btnShadow,
                          }}>
                            {i + 1}
                          </div>
                          <p className="pt-1.5 leading-relaxed" style={{ color: c.muted }}>{text}</p>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {recipe.tips && recipe.tips.length > 0 && (
                  <div className="mt-10 p-7 rounded-2xl" style={{
                    background: c.tipsBg,
                    border: `1px solid ${c.badgeBorder}`,
                  }}>
                    <div className="flex items-center gap-2.5 mb-4">
                      <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      <h4 className="font-bold text-lg" style={{ color: c.gold }}>Поради від шефа</h4>
                    </div>
                    <ul className="space-y-3">
                      {recipe.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: c.muted }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.gold }} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* FAVORITES */}
        {mode === 'favorites' && (
          <div className="animate-in">
            <button onClick={goHome} className="flex items-center gap-2 mb-10 font-medium transition-colors group" style={{ color: 'rgba(201,168,76,0.5)' }} onMouseEnter={e => (e.currentTarget.style.color = '#dfc06a')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.5)')}>
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Назад
            </button>

            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
                <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: c.gold }}>Збережене</span>
              </div>
              <h2 className="text-5xl font-serif font-bold mb-3" style={{ color: c.text }}>Улюблені рецепти</h2>
              <p style={{ color: c.dimmed }}>Ваші збережені рецепти в одному місці</p>
            </div>

            {favorites.length > 0 ? (
              <div className="space-y-6">
                {favorites.map((fav, i) => (
                  <div key={fav.id} className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]" style={{ background: 'linear-gradient(145deg, rgba(20,18,16,0.95), rgba(26,23,20,0.9))', border: '1px solid rgba(201,168,76,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)' }} />
                    <div className="flex flex-col md:flex-row">
                      {/* Left: number accent */}
                      <div className="hidden md:flex w-24 items-center justify-center flex-shrink-0" style={{ borderRight: '1px solid rgba(201,168,76,0.06)' }}>
                        <span className="font-body text-4xl font-bold italic" style={{ color: 'rgba(201,168,76,0.15)' }}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      {/* Center: content */}
                      <div className="flex-1 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ color: c.gold, background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>{fav.cuisine}</span>
                          <span className="text-xs font-medium" style={{ color: c.dimmed }}>
                            {fav.difficulty === 'easy' ? 'Легко' : fav.difficulty === 'medium' ? 'Середньо' : 'Складно'}
                          </span>
                          <span className="text-xs" style={{ color: c.dimmed }}>{fav.prepTime + fav.cookTime} хв</span>
                          <span className="text-xs" style={{ color: c.dimmed }}>{fav.nutrition.calories} ккал</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2" style={{ color: c.text }}>{fav.title}</h3>
                        <p className="text-sm line-clamp-2 max-w-xl" style={{ color: '#9e9283' }}>{fav.description}</p>
                      </div>
                      {/* Right: actions */}
                      <div className="flex md:flex-col items-center justify-end gap-3 p-6 md:p-8 pt-0 md:pt-8">
                        <button
                          onClick={() => toggleFavorite(fav)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: c.badgeBg, color: c.gold }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setRecipe(fav); setMode('recipe-result') }}
                          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:translate-y-[-1px]"
                          style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                        >
                          Відкрити
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ border: `1px solid ${c.badgeBorder}`, background: 'rgba(201,168,76,0.03)' }}>
                  <svg className="w-9 h-9" style={{ color: 'rgba(201,168,76,0.25)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <p className="text-xl font-serif mb-2" style={{ color: c.text }}>Ще немає улюблених</p>
                <p className="text-sm" style={{ color: c.dimmed }}>Натисніть на серце на рецепті, щоб зберегти</p>
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        {mode === 'history' && (
          <div className="animate-in">
            <button onClick={goHome} className="flex items-center gap-2 mb-10 font-medium transition-colors group" style={{ color: 'rgba(201,168,76,0.5)' }} onMouseEnter={e => (e.currentTarget.style.color = '#dfc06a')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.5)')}>
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Назад
            </button>

            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
                <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: c.gold }}>Архів</span>
              </div>
              <h2 className="text-5xl font-serif font-bold mb-3" style={{ color: c.text }}>Історія</h2>
              <p style={{ color: c.dimmed }}>Ваші збережені плани та рецепти</p>
            </div>

            {/* План харчування history */}
            {planHistory.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <h3 className="text-lg font-semibold" style={{ color: c.text }}>Плани харчування</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {planHistory.map(plan => (
                    <div key={plan.id} className="group relative rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]" style={{ background: 'linear-gradient(145deg, rgba(20,18,16,0.95), rgba(26,23,20,0.9))', border: '1px solid rgba(201,168,76,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent)' }} />
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="font-body text-3xl font-bold italic" style={{ color: 'rgba(201,168,76,0.2)' }}>{plan.days.length}д</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/meal-plan?planId=${plan.id}`)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                            style={{ background: c.btnBg, color: c.btnText }}
                          >
                            Відкрити
                          </button>
                          <button
                            onClick={() => deletePlanFromHistory(plan.id)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-lg hover:text-red-400"
                            style={{ color: c.dimmed }}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                      <h4 className="text-base font-bold mb-1" style={{ color: c.text }}>
                        План на {plan.days.length} {plan.days.length === 1 ? 'день' : plan.days.length < 5 ? 'дні' : 'днів'}
                      </h4>
                      <div className="flex gap-3 text-sm mt-1" style={{ color: c.dimmed }}>
                        <span>{new Date(plan.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}</span>
                        <span className="truncate" style={{ color: '#9e9283' }}>{plan.days[0]?.meals.slice(0, 2).map(m => m.recipe.title).join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="mb-10 flex items-center gap-3">
              <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <h3 className="text-lg font-semibold" style={{ color: c.text }}>Рецепти</h3>
            </div>

            {history.length > 0 ? (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.08)' }}>
                {history.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-6 px-6 py-5 transition-all duration-200 hover:bg-white/[0.02]" style={{ borderBottom: index < history.length - 1 ? '1px solid rgba(201,168,76,0.06)' : 'none' }}>
                    <span className="font-body text-2xl font-bold italic w-8 text-center flex-shrink-0" style={{ color: 'rgba(201,168,76,0.2)' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold truncate" style={{ color: c.text }}>{item.title}</h3>
                      <div className="flex gap-4 text-xs mt-1" style={{ color: c.dimmed }}>
                        <span>{item.cuisine}</span>
                        <span>{item.prepTime + item.cookTime} хв</span>
                        <span>{item.nutrition.calories} ккал</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleFavorite(item)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ color: isFavorite(item.id) ? c.gold : c.dimmed }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isFavorite(item.id) ? 0 : 1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setRecipe(item); setMode('recipe-result') }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{ color: c.gold, border: `1px solid ${c.badgeBorder}` }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)' }}
                      >
                        Відкрити
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ border: `1px solid ${c.badgeBorder}`, background: 'rgba(201,168,76,0.03)' }}>
                  <svg className="w-9 h-9" style={{ color: 'rgba(201,168,76,0.25)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl font-serif mb-2" style={{ color: c.text }}>Історія порожня</p>
                <p className="text-sm" style={{ color: c.dimmed }}>Згенеруйте перший рецепт!</p>
              </div>
            )}
          </div>
        )}

        {/* AUTH */}
        {mode === 'auth' && (
          <div className="animate-in max-w-md mx-auto">
            <button onClick={goHome} className="flex items-center gap-2 mb-10 font-medium transition-colors group" style={{ color: c.dimmed }} onMouseEnter={e => (e.currentTarget.style.color = c.gold)} onMouseLeave={e => (e.currentTarget.style.color = c.dimmed)}>
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Назад
            </button>

            <div className="glass rounded-3xl p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: c.btnBg }}>
                  <svg className="w-7 h-7" style={{ color: c.btnText }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-serif font-bold mb-2" style={{ color: c.text }}>
                  {authForm === 'login' ? 'Вхід' : 'Реєстрація'}
                </h2>
                <p className="text-sm" style={{ color: c.dimmed }}>
                  {authForm === 'login'
                    ? 'Увійдіть, щоб зберегти рецепти та плани'
                    : 'Створіть акаунт для синхронізації даних'}
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: c.dangerBg, border: `1px solid ${isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.2)'}`, color: c.dangerColor }}>
                  {authError}
                </div>
              )}

              <div className="space-y-4">
                {authForm === 'register' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: c.text }}>Ім&apos;я</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="Ваше ім'я"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
                      onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                      onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: c.text }}>Email</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
                    onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                    onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
                    onKeyDown={e => e.key === 'Enter' && (authForm === 'login' ? handleLogin() : handleRegister())}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: c.text }}>Пароль</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
                    onFocus={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                    onBlur={e => (e.currentTarget.style.borderColor = c.inputBorder)}
                    onKeyDown={e => e.key === 'Enter' && (authForm === 'login' ? handleLogin() : handleRegister())}
                  />
                </div>

                <button
                  onClick={authForm === 'login' ? handleLogin : handleRegister}
                  disabled={authLoading || !authEmail || !authPassword}
                  className="w-full py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-glow"
                  style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                >
                  {authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current/30 rounded-full animate-spin" style={{ borderTopColor: c.btnText }} />
                      Завантаження...
                    </span>
                  ) : authForm === 'login' ? 'Увійти' : 'Зареєструватися'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setAuthForm(authForm === 'login' ? 'register' : 'login'); setAuthError('') }}
                  className="text-sm transition-colors"
                  style={{ color: c.gold }}
                  onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
                  onMouseLeave={e => (e.currentTarget.style.color = c.gold)}
                >
                  {authForm === 'login'
                    ? 'Немає акаунту? Зареєструватися'
                    : 'Вже є акаунт? Увійти'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {mode === 'settings' && (
          <div className="animate-in max-w-2xl mx-auto">
            <button onClick={goHome} className="flex items-center gap-2 mb-10 font-medium transition-colors group" style={{ color: 'rgba(201,168,76,0.5)' }} onMouseEnter={e => (e.currentTarget.style.color = '#dfc06a')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.5)')}>
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Назад
            </button>

            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
                <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: c.gold }}>Профіль</span>
              </div>
              <h2 className="text-5xl font-serif font-bold mb-3" style={{ color: c.text }}>Налаштування</h2>
              <p style={{ color: c.dimmed }}>Персоналізуйте свій досвід</p>
            </div>

            <div className="space-y-12">
              {/* Allergies */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.badgeBg, border: '1px solid rgba(201,168,76,0.12)' }}>
                    <svg className="w-4 h-4" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                        : { background: 'transparent', color: '#9e9283', border: `1px solid ${c.badgeBorder}` }
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
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.badgeBg, border: '1px solid rgba(201,168,76,0.12)' }}>
                    <svg className="w-4 h-4" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                        : { background: 'transparent', color: '#9e9283', border: `1px solid ${c.badgeBorder}` }
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
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.badgeBg, border: '1px solid rgba(201,168,76,0.12)' }}>
                    <svg className="w-4 h-4" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                    <div key={key} className="rounded-xl p-4" style={{ background: 'rgba(20,18,16,0.8)', border: '1px solid rgba(201,168,76,0.06)' }}>
                      <label className="text-xs font-medium block mb-3" style={{ color: '#9e9283' }}>{label} ({unit})</label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => updateSettings({ [key]: parseInt(e.target.value) || 0 })}
                        className="w-full bg-transparent text-2xl font-bold outline-none"
                        style={{ color: c.text, borderBottom: `1px solid ${c.badgeBorder}`, paddingBottom: '4px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER PREPARATION */}
        {mode === 'order-prepare' && (
          <div className="animate-in">
            {/* Elegant back navigation */}
            <button
              onClick={() => { if (mealPlan) { router.push('/meal-plan') } else { setMode('home') }; setAltSearchIndex(null); setExpandedAlts(new Set()) }}
              className="group inline-flex items-center gap-2 transition-all text-sm mb-6"
              style={{ color: c.goldMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = c.goldHover)}
              onMouseLeave={e => (e.currentTarget.style.color = c.goldMuted)}
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              <span className="font-medium">До меню</span>
            </button>

            {/* Hero header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-px" style={{ background: `linear-gradient(to right, ${c.goldMuted}, transparent)` }} />
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium" style={{ color: c.dimmed }}>Замовлення</span>
              </div>
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-serif font-bold tracking-tight" style={{ color: c.text }}>Ваш кошик</h2>
                <span className="text-sm font-medium tabular-nums" style={{ color: c.dimmed }}>{cartItems.length} позицій</span>
              </div>
            </div>

            {/* Step 1: Address & Store */}
            {orderStep === 'address' && (
              <div className="space-y-8 max-w-2xl">
                {/* Service selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: c.dimmed }}>Сервіс</span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${c.sectionDivider}, transparent)` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass p-4 !border-amber-300 relative overflow-visible">
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm" style={{ borderColor: 'var(--color-cream)' }} />
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mb-2.5" style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))' }}>Z</div>
                      <div className="font-bold text-gray-800 text-sm">Zakaz.ua</div>
                    </div>
                    <div className="glass p-4 opacity-40 relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold mb-2.5">S</div>
                      <div className="font-bold text-gray-500 text-sm">Silpo</div>
                      <span className="absolute top-2.5 right-2.5 text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">скоро</span>
                    </div>
                    <div className="glass p-4 opacity-40 relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold mb-2.5">G</div>
                      <div className="font-bold text-gray-500 text-sm">Glovo</div>
                      <span className="absolute top-2.5 right-2.5 text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">скоро</span>
                    </div>
                  </div>
                </div>

                {/* City selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: c.dimmed }}>Місто</span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${c.sectionDivider}, transparent)` }} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(storesData).length > 0
                      ? (() => {
                          const priority = ['kiev', 'lviv', 'kharkiv', 'odesa', 'dnipro', 'zaporizhzhia', 'vinnytsia', 'poltava']
                          return Object.entries(storesData)
                            .sort(([a], [b]) => {
                              const ai = priority.indexOf(a), bi = priority.indexOf(b)
                              if (ai >= 0 && bi >= 0) return ai - bi
                              if (ai >= 0) return -1
                              if (bi >= 0) return 1
                              return a.localeCompare(b)
                            })
                        })()
                      : [['kiev', { name: 'Київ' }], ['lviv', { name: 'Львів' }], ['kharkiv', { name: 'Харків' }], ['odesa', { name: 'Одеса' }], ['dnipro', { name: 'Дніпро' }]] as [string, { name: string }][]
                    ).map(([key, city]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setDeliveryAddress(prev => ({ ...prev, city: key }))
                          const cityStores = storesData[key]?.stores
                          if (cityStores?.[0]) setSelectedStoreId(cityStores[0].id)
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={deliveryAddress.city === key
                          ? { background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }
                          : { background: c.tabBg, color: c.tabText, border: `1px solid ${c.tabBorder}` }
                        }
                      >
                        {city.name}
                      </button>
                    ))}
                    {storesLoading && (
                      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
                        <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Store selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: c.dimmed }}>Магазин</span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${c.sectionDivider}, transparent)` }} />
                  </div>
                  {storesData[deliveryAddress.city]?.stores?.length ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {storesData[deliveryAddress.city].stores.map(store => (
                        <button
                          key={store.id}
                          onClick={() => setSelectedStoreId(store.id)}
                          className={`glass p-4 text-left transition-all ${
                            selectedStoreId === store.id
                              ? '!border-amber-400 glow-orange'
                              : 'hover:!border-amber-200'
                          }`}
                        >
                          <div className="font-bold text-gray-800 text-sm">{store.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{store.chain}</div>
                          {selectedStoreId === store.id && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-[10px] text-green-600 font-medium">Обрано</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="glass p-8 text-center text-gray-400">
                      {storesLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />
                          <span>Завантажуємо...</span>
                        </div>
                      ) : 'Немає магазинів у цьому місті'}
                    </div>
                  )}
                </div>

                <button
                  onClick={executeBatchSearch}
                  disabled={!selectedStoreId}
                  className="w-full py-4 text-white font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 btn-glow text-base"
                  style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))', boxShadow: '0 8px 32px rgba(184, 134, 11, 0.3)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Знайти товари
                </button>
              </div>
            )}

            {/* Step 2: Searching */}
            {orderStep === 'searching' && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-2 border-amber-200 rounded-full animate-spin" style={{ borderTopColor: 'var(--color-gold)' }} />
                  <div className="absolute inset-3 border-2 border-amber-100 rounded-full animate-spin" style={{ borderBottomColor: 'var(--color-gold-light)', animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-lg font-serif font-bold" style={{ color: c.text }}>Шукаємо товари</p>
                <p className="text-sm mt-2" style={{ color: c.dimmed }}>{cartItems.length} інгредієнтів</p>
              </div>
            )}

            {/* Step 3: Cart review */}
            {orderStep === 'cart' && (
              <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 220px)' }}>
                {/* Sticky cart summary */}
                <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4" style={{ background: c.pageBg, backdropFilter: 'blur(16px)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.successColor }} />
                        <span className="text-xs font-medium tabular-nums" style={{ color: c.muted }}>
                          {cartItems.filter(ci => ci.selectedProduct && !ci.excluded).length} з {cartItems.length}
                        </span>
                      </div>
                      {cartEstimate && cartEstimate.total > 0 && (
                        <>
                          <div className="w-px h-3" style={{ background: c.sectionDivider }} />
                          <span className="text-xs tabular-nums" style={{ color: c.dimmed }}>
                            Zakaz {(cartEstimate.total / 100).toFixed(0)}&#8372;
                          </span>
                        </>
                      )}
                    </div>
                    <div className="font-serif font-bold text-xl tabular-nums" style={{ color: c.text }}>{calculateCartTotal().toFixed(0)}<span className="text-sm ml-0.5">₴</span></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.goldLine}, transparent)` }} />
                </div>

                {/* Cart items — 2 column grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2.5 stagger-children pb-2 items-start">
                  {cartItems.map((ci, idx) => (
                    <div key={idx} className={`glass rounded-2xl overflow-hidden transition-all ${
                      ci.excluded ? 'opacity-40' : !ci.selectedProduct ? '' : ''
                    } ${(expandedAlts.has(idx) || altSearchIndex === idx) ? 'md:col-span-2' : ''}`}
                    style={{ borderColor: !ci.excluded && !ci.selectedProduct ? c.gold : undefined }}
                    >
                      {/* Gold accent line */}
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: c.goldLine }} />
                      <div className="px-3 py-2.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          {/* Product image */}
                          {ci.selectedProduct?.img ? (
                            <div className="relative flex-shrink-0">
                              <img src={ci.selectedProduct.img} alt="" className="w-10 h-10 rounded-xl object-cover" style={{ border: `1px solid ${c.cardBorder}` }} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.badgeBg, border: `1px solid ${c.badgeBorder}` }}>
                              <span className="text-base">{ci.selectedProduct ? '📦' : '❓'}</span>
                            </div>
                          )}

                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-amber-700/35 leading-tight font-medium tracking-wide truncate">
                              {ci.shoppingItem.ingredient} · {ci.shoppingItem.amount}{ci.shoppingItem.unit}
                            </div>
                            {ci.selectedProduct ? (
                              <div className={`font-medium text-xs leading-snug mt-0.5 line-clamp-1 ${ci.excluded ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {ci.selectedProduct.title}
                              </div>
                            ) : (
                              <div className="text-xs text-amber-600 font-medium mt-0.5">Не знайдено</div>
                            )}
                          </div>

                          {/* Price + quantity */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {ci.selectedProduct && !ci.excluded && (
                              <>
                                <div className="text-right">
                                  <div className="font-bold text-amber-900 text-xs tabular-nums">{(ci.selectedProduct.price * ci.quantity).toFixed(0)}<span className="text-[9px] ml-0.5">₴</span></div>
                                  {ci.quantity > 1 && (
                                    <div className="text-[8px] text-amber-700/30 tabular-nums">{ci.selectedProduct.price.toFixed(0)} &times; {ci.quantity}</div>
                                  )}
                                </div>
                                <div className="flex items-center rounded-md overflow-hidden" style={{ border: '1px solid rgba(184, 134, 11, 0.12)' }}>
                                  <button onClick={() => updateCartItemQuantity(idx, -1)} className="w-6 h-6 flex items-center justify-center text-amber-700/50 hover:bg-amber-50 text-[10px] font-bold transition-colors">−</button>
                                  <span className="w-4 text-center text-[10px] font-bold text-amber-950 tabular-nums">{ci.quantity}</span>
                                  <button onClick={() => updateCartItemQuantity(idx, 1)} className="w-6 h-6 flex items-center justify-center text-amber-700/50 hover:bg-amber-50 text-[10px] font-bold transition-colors">+</button>
                                </div>
                              </>
                            )}
                            {ci.excluded ? (
                              <button onClick={() => excludeCartItem(idx, false)} className="px-2 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors">
                                Повернути
                              </button>
                            ) : (
                              <button onClick={() => excludeCartItem(idx, true)} className="w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all text-sm">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {!ci.excluded && (ci.alternatives.length > 0 || !ci.selectedProduct) && (
                          <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(184, 134, 11, 0.06)' }}>
                            {ci.alternatives.length > 0 && (
                              <button
                                onClick={() => setExpandedAlts(prev => { const n = new Set(prev); if (n.has(idx)) { n.delete(idx) } else { n.add(idx) }; return n })}
                                className="text-[10px] text-amber-700/50 hover:text-amber-700 font-medium transition-colors"
                              >
                                {expandedAlts.has(idx) ? 'Сховати' : `${ci.alternatives.length} варіантів`}
                              </button>
                            )}
                            {!ci.selectedProduct && (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input type="text" placeholder="Шукати..." value={altSearchIndex === idx ? altSearchQuery : ''} onChange={e => { setAltSearchIndex(idx); setAltSearchQuery(e.target.value) }} onKeyDown={e => { if (e.key === 'Enter' && altSearchQuery.trim()) searchAlternativeProduct(idx, altSearchQuery.trim()) }} className="flex-1 px-2 py-0.5 rounded-md border border-gray-200 text-[11px] focus:border-amber-400 focus:ring-1 focus:ring-amber-200 outline-none transition-all" />
                                <button onClick={() => altSearchQuery.trim() && searchAlternativeProduct(idx, altSearchQuery.trim())} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-md hover:bg-amber-200 transition-colors">Знайти</button>
                              </div>
                            )}
                            {ci.selectedProduct && (
                              <div className="flex items-center gap-2.5 ml-auto">
                                {ci.selectedProduct.web_url && (
                                  <a href={ci.selectedProduct.web_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-700/40 hover:text-amber-700 font-medium transition-colors flex items-center gap-0.5">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    Zakaz
                                  </a>
                                )}
                                <button onClick={() => { setAltSearchIndex(idx); setAltSearchQuery(''); setAltSearchResults([]) }} className="text-[10px] text-amber-700/35 hover:text-amber-700 font-medium transition-colors">Замінити</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Alternatives */}
                      {expandedAlts.has(idx) && ci.alternatives.length > 0 && !ci.excluded && (
                        <div className="px-3 py-2.5 space-y-1.5" style={{ borderTop: '1px solid rgba(184, 134, 11, 0.06)', background: 'rgba(184, 134, 11, 0.02)' }}>
                          {ci.alternatives.map((alt, ai) => (
                            <button key={ai} onClick={() => selectAlternative(idx, alt)} className="w-full flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all text-left">
                              {alt.img ? <img src={alt.img} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm">📦</div>}
                              <div className="flex-1 min-w-0"><div className="text-xs font-medium text-gray-800 truncate">{alt.title}</div><div className="text-[10px] text-gray-400">{alt.unit}</div></div>
                              <div className="text-xs font-bold text-amber-800 flex-shrink-0 tabular-nums">{alt.price.toFixed(0)} ₴</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Manual search */}
                      {altSearchIndex === idx && !ci.excluded && (
                        <div className="px-3 py-2.5" style={{ borderTop: '1px solid rgba(184, 134, 11, 0.06)', background: 'rgba(184, 134, 11, 0.02)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <input type="text" placeholder="Назва товару..." value={altSearchQuery} onChange={e => setAltSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && altSearchQuery.trim()) searchAlternativeProduct(idx, altSearchQuery.trim()) }} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-200 outline-none transition-all" />
                            <button onClick={() => altSearchQuery.trim() && searchAlternativeProduct(idx, altSearchQuery.trim())} className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg hover:bg-amber-200 transition-colors">Знайти</button>
                            <button onClick={() => { setAltSearchIndex(null); setAltSearchResults([]) }} className="px-1.5 py-1.5 text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
                          </div>
                          {altSearchLoading ? (
                            <div className="flex items-center gap-2 py-3 text-sm text-gray-500"><div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />Шукаємо...</div>
                          ) : altSearchResults.length > 0 ? (
                            <div className="space-y-1.5">
                              {altSearchResults.map((product, pi) => (
                                <button key={pi} onClick={() => { setCartItems(prev => prev.map((c, i) => i === idx ? { ...c, selectedProduct: product, alternatives: altSearchResults.filter(p => p.ean !== product.ean) } : c)); setAltSearchIndex(null); setAltSearchResults([]) }} className="w-full flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all text-left">
                                  {product.img ? <img src={product.img} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm">📦</div>}
                                  <div className="flex-1 min-w-0"><div className="text-xs font-medium text-gray-800 truncate">{product.title}</div><div className="text-[10px] text-gray-400">{product.unit}</div></div>
                                  <div className="text-xs font-bold text-amber-800 flex-shrink-0 tabular-nums">{product.price.toFixed(0)} ₴</div>
                                </button>
                              ))}
                            </div>
                          ) : altSearchQuery ? <div className="py-3 text-xs text-gray-400 text-center">Нічого не знайдено</div> : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Zakaz.ua connection */}
                {isZakazConnected ? (
                  <div className="mt-4 glass rounded-2xl overflow-hidden px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                      <span className="font-medium text-green-600 text-sm">Zakaz.ua: {zakazPhone}</span>
                    </div>
                    <button onClick={disconnectZakaz} className="text-xs text-red-400 hover:text-red-500 transition-colors">Від&apos;єднати</button>
                  </div>
                ) : (
                  <details className="mt-4 glass rounded-2xl overflow-hidden">
                    <summary className="px-4 py-3 cursor-pointer select-none flex items-center justify-between text-sm list-none [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400/40" />
                        <span className="font-medium text-amber-700/50">Підключити Zakaz.ua</span>
                      </div>
                      <svg className="w-3.5 h-3.5 text-amber-700/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid rgba(184, 134, 11, 0.06)' }}>
                      {zakazAuthStep === 'loading' ? (
                        <div className="flex items-center justify-center gap-2 py-4"><div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" /><span className="text-sm text-gray-500">Підключення...</span></div>
                      ) : zakazAuthStep === 'signup-otp' ? (
                        <div><div className="text-xs text-gray-500 mb-2">SMS код надіслано на {zakazPhone}</div><div className="flex gap-2"><input type="text" value={zakazOtpInput} onChange={e => setZakazOtpInput(e.target.value)} placeholder="Код" maxLength={6} onKeyDown={e => e.key === 'Enter' && zakazOtpInput.length >= 4 && confirmZakazSignup(zakazOtpInput)} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 text-center tracking-widest font-mono" /><button onClick={() => { confirmZakazSignup(zakazOtpInput); setZakazOtpInput('') }} disabled={zakazOtpInput.length < 4} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">OK</button></div><button onClick={() => setZakazAuthStep('idle')} className="text-xs text-amber-700/40 hover:text-amber-700 mt-2 transition-colors">Назад</button></div>
                      ) : zakazAuthStep === 'recovery-otp' ? (
                        <div><div className="text-xs text-gray-500 mb-2">Код відновлення на {zakazPhone}</div><div className="flex gap-2"><input type="text" value={zakazOtpInput} onChange={e => setZakazOtpInput(e.target.value)} placeholder="Код" maxLength={6} onKeyDown={e => e.key === 'Enter' && zakazOtpInput.length >= 4 && confirmZakazRecovery(zakazOtpInput)} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 text-center tracking-widest font-mono" /><button onClick={() => { confirmZakazRecovery(zakazOtpInput); setZakazOtpInput('') }} disabled={zakazOtpInput.length < 4} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">OK</button></div><button onClick={() => setZakazAuthStep('idle')} className="text-xs text-amber-700/40 hover:text-amber-700 mt-2 transition-colors">Назад</button></div>
                      ) : zakazAuthStep === 'recovery-password' ? (
                        <div><div className="text-xs text-gray-500 mb-2">Новий пароль для Zakaz.ua</div><div className="flex gap-2"><input type="password" value={zakazNewPasswordInput} onChange={e => setZakazNewPasswordInput(e.target.value)} placeholder="Пароль" onKeyDown={e => e.key === 'Enter' && zakazNewPasswordInput.length >= 6 && finishZakazRecovery(zakazNewPasswordInput)} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400" /><button onClick={() => { finishZakazRecovery(zakazNewPasswordInput); setZakazNewPasswordInput('') }} disabled={zakazNewPasswordInput.length < 6} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">OK</button></div></div>
                      ) : (
                        <div>
                          <div className="text-xs text-gray-500 mb-3">Для автоматичного кошика</div>
                          {zakazMode === 'login' ? (
                            <div className="flex flex-col gap-2.5">
                              <input type="tel" value={zakazPhoneInput} onChange={e => setZakazPhoneInput(e.target.value)} placeholder="+380XXXXXXXXX" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all" />
                              <input type="password" value={zakazPasswordInput} onChange={e => setZakazPasswordInput(e.target.value)} placeholder="Пароль" onKeyDown={e => e.key === 'Enter' && handleZakazLogin()} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all" />
                              <button onClick={handleZakazLogin} disabled={zakazPhoneInput.length < 12 || !zakazPasswordInput} className="w-full py-2.5 btn-glow text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all" style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))', color: '#fff' }}>Увійти</button>
                              <div className="flex justify-between"><button onClick={() => setZakazMode('signup')} className="text-xs text-amber-700/40 hover:text-amber-700 transition-colors">Реєстрація</button><button onClick={() => setZakazMode('recovery')} className="text-xs text-amber-700/40 hover:text-amber-700 transition-colors">Забули пароль?</button></div>
                            </div>
                          ) : zakazMode === 'signup' ? (
                            <div className="flex flex-col gap-2.5">
                              <input type="tel" value={zakazPhoneInput} onChange={e => setZakazPhoneInput(e.target.value)} placeholder="+380XXXXXXXXX" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all" />
                              <button onClick={() => startZakazSignup(zakazPhoneInput)} disabled={zakazPhoneInput.length < 12} className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Зареєструватись</button>
                              <button onClick={() => setZakazMode('login')} className="text-xs text-amber-700/40 hover:text-amber-700 transition-colors">Вже є акаунт? Увійти</button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2.5">
                              <input type="tel" value={zakazPhoneInput} onChange={e => setZakazPhoneInput(e.target.value)} placeholder="+380XXXXXXXXX" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all" />
                              <button onClick={() => startZakazRecovery(zakazPhoneInput)} disabled={zakazPhoneInput.length < 12} className="w-full py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Відновити пароль</button>
                              <button onClick={() => setZakazMode('login')} className="text-xs text-amber-700/40 hover:text-amber-700 transition-colors">Назад до входу</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {/* Sticky action bar */}
                <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-4 mt-4" style={{ background: 'var(--color-cream)' }}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184, 134, 11, 0.15), transparent)' }} />
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={estimateCartPrice}
                      disabled={cartEstimateLoading}
                      className="py-3 px-5 bg-amber-50 text-amber-800 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-100 transition-all text-sm border border-amber-200 disabled:opacity-50"
                    >
                      {cartEstimateLoading ? <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-600 rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                      {cartEstimateLoading ? '...' : 'Ціна'}
                    </button>
                    <button
                      onClick={finalizeOrder}
                      disabled={zakazCartLoading}
                      className="flex-1 py-3 font-bold rounded-2xl flex items-center justify-center gap-2.5 btn-glow text-sm disabled:opacity-50 transition-all"
                      style={{
                        background: isZakazConnected ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))',
                        color: '#fff',
                        boxShadow: isZakazConnected ? '0 6px 24px rgba(39, 174, 96, 0.3)' : '0 6px 24px rgba(184, 134, 11, 0.3)',
                      }}
                    >
                      {zakazCartLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>}
                      {zakazCartLoading ? 'Додаємо...' : isZakazConnected ? (currentOrderId ? 'Додати знову' : 'Додати в кошик') : 'Відкрити Zakaz.ua'}
                    </button>
                    <button
                      onClick={() => setShowCompleteOrderModal(true)}
                      className="py-3 px-5 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all text-sm border"
                      style={{ borderColor: 'rgba(184, 134, 11, 0.3)', color: 'var(--color-gold)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      Замовити
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS HISTORY */}
        {mode === 'orders' && (
          <div className="animate-in">
            <button onClick={() => setMode('home')} className="flex items-center gap-2 mb-10 font-medium transition-colors group" style={{ color: c.dimmed }} onMouseEnter={e => (e.currentTarget.style.color = c.gold)} onMouseLeave={e => (e.currentTarget.style.color = c.dimmed)}>
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Назад
            </button>

            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-px" style={{ background: `linear-gradient(90deg, ${isDark ? 'rgba(201,168,76,0.4)' : 'rgba(184,134,11,0.3)'}, transparent)` }} />
                <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: c.gold }}>Доставка</span>
              </div>
              <h2 className="text-5xl font-serif font-bold mb-3" style={{ color: c.text }}>Замовлення</h2>
              <p style={{ color: c.dimmed }}>Історія ваших замовлень</p>
            </div>

            {orderHistory.length > 0 ? (
              <div className="space-y-4 max-w-2xl mx-auto">
                {orderHistory.map(order => (
                  <div key={order.id} className="group relative rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${isDark ? 'rgba(201,168,76,0.12)' : 'rgba(184,134,11,0.08)'}, transparent)` }} />
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-bold" style={{ color: c.text }}>{order.storeName}</div>
                        <div className="text-xs" style={{ color: c.dimmed }}>
                          {new Date(order.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: c.gold }}>{order.totalEstimate.toFixed(0)} ₴</div>
                        <div className="text-xs" style={{ color: c.dimmed }}>{order.items.length} товарів</div>
                      </div>
                    </div>
                    <div className="text-xs mb-4 line-clamp-2" style={{ color: c.dimmed }}>
                      {order.items.slice(0, 5).map(ci => ci.shoppingItem.ingredient).join(', ')}
                      {order.items.length > 5 && ` та ще ${order.items.length - 5}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { loadOrderFromHistory(order); setMode('order-prepare') }}
                        className="flex-1 py-2.5 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 btn-glow"
                        style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                      >
                        Відкрити
                      </button>
                      <button
                        onClick={() => { order.items.forEach(ci => { if (ci.selectedProduct?.web_url) window.open(ci.selectedProduct.web_url, '_blank') }) }}
                        className="py-2.5 px-4 font-medium rounded-xl text-sm transition-colors"
                        style={{ background: c.badgeBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}
                      >
                        Zakaz.ua
                      </button>
                      <button
                        onClick={() => deleteOrderFromHistory(order.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-lg"
                        style={{ color: c.dimmed }}
                        onMouseEnter={e => { e.currentTarget.style.color = c.dangerColor; e.currentTarget.style.background = c.dangerBg }}
                        onMouseLeave={e => { e.currentTarget.style.color = c.dimmed; e.currentTarget.style.background = 'transparent' }}
                      >&times;</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ border: `1px solid ${c.badgeBorder}`, background: c.emptyBg }}>
                  <svg className="w-9 h-9" style={{ color: c.emptyIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-xl font-serif mb-2" style={{ color: c.text }}>Ще немає замовлень</p>
                <p className="text-sm" style={{ color: c.dimmed }}>Створіть план харчування та підготуйте замовлення</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* COOKING MODE — rendered outside <main> to escape its z-10 stacking context */}
      {mode === 'cooking' && recipe && (
        <div className="fixed inset-0 z-[70] flex flex-col" style={{ background: isDark ? 'linear-gradient(180deg, #0a0908, #100e0b)' : 'linear-gradient(180deg, #fdfbf7, #f8f4ed)' }}>
          {/* Top bar */}
          <div className="flex-shrink-0 backdrop-blur-md px-4 sm:px-6 py-3" style={{ background: isDark ? 'rgba(10,9,8,0.85)' : 'rgba(253,251,247,0.85)', borderBottom: `1px solid ${c.itemBorder}` }}>
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setMode('recipe-result')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm font-medium"
                style={{ color: c.muted }}
                onMouseEnter={e => { e.currentTarget.style.color = c.gold; e.currentTarget.style.background = c.badgeBg }}
                onMouseLeave={e => { e.currentTarget.style.color = c.muted; e.currentTarget.style.background = 'transparent' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Вийти</span>
              </button>
              <div className="text-center flex-1 min-w-0 px-4">
                <h2 className="text-sm sm:text-base font-serif font-bold truncate" style={{ color: c.text }}>{recipe.title}</h2>
                <p className="text-xs" style={{ color: c.dimmed }}>Крок {cookingStep + 1} з {recipe.instructions.length}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: c.badgeBg, color: c.gold }}>
                  {Math.round(((cookingStep + 1) / recipe.instructions.length) * 100)}%
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="max-w-3xl mx-auto mt-2">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: c.emptyBg }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${((cookingStep + 1) / recipe.instructions.length) * 100}%`, background: c.btnBg }}
                />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
              {/* Step number */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-xl mb-6 sm:mb-8" style={{ background: c.btnBg, color: c.btnText, boxShadow: `0 8px 32px ${isDark ? 'rgba(201,168,76,0.3)' : 'rgba(184,134,11,0.2)'}` }}>
                {cookingStep + 1}
              </div>

              {/* Step text */}
              <div className="w-full glass rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center mb-6 sm:mb-8">
                <p className="text-lg sm:text-2xl md:text-3xl leading-relaxed font-serif" style={{ color: c.text }}>
                  {recipe.instructions[cookingStep]}
                </p>
              </div>

              {/* Timer */}
              <div className="w-full rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8" style={{ background: c.emptyBg, border: `1px solid ${c.itemBorder}` }}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" style={{ color: c.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div className="text-3xl sm:text-4xl font-mono font-bold tabular-nums" style={{ color: isTimerRunning ? c.gold : c.text }}>
                      {formatTime(cookingTimer)}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[1, 3, 5, 10, 15].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setTimer(mins)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                        style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.muted }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = c.inputFocusBorder)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = c.inputBorder)}
                      >
                        {mins}хв
                      </button>
                    ))}
                    {isTimerRunning ? (
                      <button onClick={() => setIsTimerRunning(false)} className="px-4 py-1.5 rounded-lg font-medium text-sm shadow-sm" style={{ background: c.dangerColor, color: '#fff' }}>
                        Стоп
                      </button>
                    ) : cookingTimer > 0 ? (
                      <button onClick={() => setIsTimerRunning(true)} className="px-4 py-1.5 rounded-lg font-medium text-sm shadow-sm" style={{ background: c.successColor, color: '#fff' }}>
                        Старт
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Step dots */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-2">
                {recipe.instructions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCookingStep(i)}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all"
                    style={i === cookingStep ? { background: c.gold, transform: 'scale(1.25)', boxShadow: `0 0 8px ${isDark ? 'rgba(201,168,76,0.4)' : 'rgba(184,134,11,0.3)'}` } : i < cookingStep ? { background: c.successColor } : { background: isDark ? 'rgba(201,168,76,0.15)' : 'rgba(184,134,11,0.12)' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="flex-shrink-0 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4" style={{ background: isDark ? 'rgba(10,9,8,0.85)' : 'rgba(253,251,247,0.85)', borderTop: `1px solid ${c.itemBorder}` }}>
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              <button
                onClick={prevCookingStep}
                disabled={cookingStep === 0}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ background: c.emptyBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="font-medium text-sm hidden sm:inline">Попередній</span>
              </button>

              {cookingStep < recipe.instructions.length - 1 ? (
                <button
                  onClick={nextCookingStep}
                  className="flex items-center gap-1.5 sm:gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg font-bold transition-all hover:shadow-xl btn-glow"
                  style={{ background: c.btnBg, color: c.btnText, boxShadow: c.btnShadow }}
                >
                  <span className="text-sm sm:text-base">Далі</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  onClick={() => { setMode('recipe-result'); showToast('Вітаємо! Страва готова!', 'success') }}
                  className="flex items-center gap-1.5 sm:gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg font-bold transition-all hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #81b29a, #6b9f87)', color: '#fff' }}
                >
                  <span className="text-sm sm:text-base">Готово!</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Overlay */}
      {overlayRecipe && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setOverlayRecipe(null); setOverlayMealContext(null) }} />
          <div className="relative rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in" style={{
            background: c.cardBgSolid,
            border: `1px solid ${c.cardBorder}`,
          }}>
            {/* Close button */}
            <button
              onClick={() => { setOverlayRecipe(null); setOverlayMealContext(null) }}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center transition-colors text-xl shadow-md"
              style={{
                background: c.emptyBg,
                color: c.muted,
              }}
            >
              &times;
            </button>

            {/* Header */}
            <div className="relative p-8 pb-6" style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))'
                : 'linear-gradient(135deg, #fef9e7, #fdf5db)',
            }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{
                  background: c.emptyBg,
                  color: c.gold,
                  border: `1px solid ${c.inputBorder}`,
                }}>
                  {overlayRecipe.cuisine}
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5" style={{
                  background: c.emptyBg,
                  color: c.muted,
                  border: `1px solid ${c.badgeBorder}`,
                }}>
                  <span className={`w-2 h-2 rounded-full ${overlayRecipe.difficulty === 'easy' ? 'bg-emerald-400' : overlayRecipe.difficulty === 'medium' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  {overlayRecipe.difficulty === 'easy' ? 'Легко' : overlayRecipe.difficulty === 'medium' ? 'Середньо' : 'Складно'}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3" style={{ color: c.text }}>{overlayRecipe.title}</h2>
              <p className="text-base" style={{ color: c.muted }}>{overlayRecipe.description}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3" style={{ borderBottom: `1px solid ${c.statBorder}` }}>
              {[
                { label: 'хвилин', value: `${overlayRecipe.prepTime + overlayRecipe.cookTime}` },
                { label: 'порцій', value: overlayRecipe.servings },
                { label: 'ккал', value: overlayRecipe.nutrition.calories },
              ].map((stat, i) => (
                <div key={i} className="p-4 text-center" style={{
                  borderRight: i < 2 ? `1px solid ${c.itemBorder}` : 'none',
                }}>
                  <div className="text-xl font-bold" style={{ color: c.text }}>{stat.value}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: c.dimmed }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Nutrition */}
            <div className="p-5" style={{
              background: c.emptyBg,
              borderBottom: `1px solid ${c.itemBorder}`,
            }}>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { value: overlayRecipe.nutrition.protein, label: 'Білки (г)', color: '#e07a5f' },
                  { value: overlayRecipe.nutrition.carbs, label: 'Вуглеводи (г)', color: c.goldHover },
                  { value: overlayRecipe.nutrition.fat, label: 'Жири (г)', color: '#f2cc8f' },
                  { value: overlayRecipe.nutrition.fiber ?? 0, label: 'Клітковина (г)', color: '#81b29a' },
                ].map((n, i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{
                    background: c.emptyBg,
                    border: `1px solid ${c.statBorder}`,
                  }}>
                    <div className="text-xl font-bold" style={{ color: n.color }}>{n.value}</div>
                    <div className="text-[10px]" style={{ color: c.dimmed }}>{n.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-5 gap-8">
                {/* Ingredients */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold mb-4" style={{ color: c.text }}>Інгредієнти</h3>
                  <div className="space-y-2">
                    {overlayRecipe.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{
                        background: c.emptyBg,
                        border: `1px solid ${c.itemBorder}`,
                      }}>
                        <span className="text-sm" style={{ color: c.text }}>{ing.name}</span>
                        <span className="text-xs font-medium" style={{ color: c.gold }}>{ing.amount} {ing.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="md:col-span-3">
                  <h3 className="text-lg font-bold mb-4" style={{ color: c.text }}>Як готувати</h3>
                  <div className="space-y-4">
                    {overlayRecipe.instructions.map((step, i) => {
                      const text = typeof step === 'string' ? step : (() => { const obj = step as unknown as Record<string, unknown>; const t = [obj.text, obj.description, obj.instruction, obj.content].find(v => typeof v === 'string'); return t as string || (typeof obj.step === 'string' ? obj.step : JSON.stringify(step)) })()
                      return (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{
                          background: 'linear-gradient(135deg, #c9a84c, #a68932)',
                          color: c.btnText,
                        }}>
                          {i + 1}
                        </div>
                        <p className="text-sm pt-0.5 leading-relaxed" style={{ color: c.muted }}>{text}</p>
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {overlayRecipe.tips && overlayRecipe.tips.length > 0 && (
                <div className="mt-8 p-6 rounded-2xl" style={{
                  background: c.tipsBg,
                  border: `1px solid ${c.badgeBorder}`,
                }}>
                  <h4 className="font-bold mb-3" style={{ color: c.gold }}>Поради</h4>
                  <ul className="space-y-2 text-sm">
                    {overlayRecipe.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2" style={{ color: c.muted }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.gold }} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    toggleFavorite(overlayRecipe)
                    showToast(
                      isFavorite(overlayRecipe.id) ? 'Видалено з улюблених' : 'Додано до улюблених',
                      'success'
                    )
                  }}
                  className="flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: isFavorite(overlayRecipe.id) ? c.btnBg : c.badgeBg,
                    color: isFavorite(overlayRecipe.id) ? c.btnText : c.gold,
                    border: `1px solid ${isFavorite(overlayRecipe.id) ? 'transparent' : c.badgeBorder}`,
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite(overlayRecipe.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {isFavorite(overlayRecipe.id) ? 'В улюблених' : 'В улюблені'}
                </button>
                <button
                  onClick={() => {
                    setRecipe(overlayRecipe)
                    setOverlayRecipe(null)
                    setOverlayMealContext(null)
                    startCooking()
                  }}
                  className="flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #a68932)', color: c.btnText }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                  Готувати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {mode === 'home' && (
        <footer className="relative z-10 text-center py-16 px-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-10 h-px" style={{ background: `linear-gradient(to right, transparent, ${isDark ? 'rgba(201,168,76,0.2)' : 'rgba(184,134,11,0.15)'})` }} />
            <span className="text-[10px] uppercase tracking-[0.35em] font-medium" style={{ color: c.dimmed }}>MealMate</span>
            <div className="w-10 h-px" style={{ background: `linear-gradient(to left, transparent, ${isDark ? 'rgba(201,168,76,0.2)' : 'rgba(184,134,11,0.15)'})` }} />
          </div>
          <p className="text-xs" style={{ color: c.dimmed }}>
            AI-powered culinary assistant
          </p>
        </footer>
      )}

      {/* Complete Order Modal */}
      {showCompleteOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowCompleteOrderModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in"
            style={{ background: c.cardBgSolid, border: `1px solid ${c.cardBorder}` }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-serif mb-2" style={{ color: c.text }}>Завершити замовлення</h3>
            <p className="text-sm mb-6" style={{ color: c.dimmed }}>
              Оберіть статус замовлення. Якщо доставка ще в дорозі — позначте як "В процесі" і додайте продукти пізніше зі сторінки замовлень.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowCompleteOrderModal(false)
                  completeOrder('completed')
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all hover:translate-y-[-1px]"
                style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', color: '#fff', boxShadow: '0 4px 16px rgba(39, 174, 96, 0.3)' }}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <div className="text-left">
                  <div>Завершити</div>
                  <div className="text-xs font-normal opacity-80">Додати продукти в холодильник зараз</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowCompleteOrderModal(false)
                  completeOrder('in_progress')
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all hover:translate-y-[-1px]"
                style={{ background: c.badgeBg, color: c.gold, border: `1px solid ${c.badgeBorder}` }}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-left">
                  <div>В процесі</div>
                  <div className="text-xs font-normal" style={{ color: c.dimmed }}>Додати в холодильник після доставки</div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowCompleteOrderModal(false)}
              className="mt-4 w-full py-2 text-sm font-medium transition-colors"
              style={{ color: c.dimmed }}
            >
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
