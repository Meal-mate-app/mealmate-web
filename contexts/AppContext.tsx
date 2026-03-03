'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { Recipe, WeekPlan, ShoppingItem, ZakazProduct, CartItem, DeliveryAddress, PreparedOrder, UserSettings } from '@/types'
import * as api from '@/lib/api'
import { DEFAULT_SETTINGS, DEFAULT_PANTRY, STORAGE_KEYS } from '@/lib/constants'

function normalizeInstruction(s: unknown): string {
  if (typeof s === 'string') return s
  if (s && typeof s === 'object') {
    const obj = s as Record<string, unknown>
    // Try known text fields first
    const candidates = [obj.text, obj.description, obj.instruction, obj.content]
    // Only use obj.step if it's a long string (not a step number)
    if (typeof obj.step === 'string' && obj.step.length > 3) candidates.unshift(obj.step)
    const found = candidates.find(v => typeof v === 'string' && (v as string).length > 0)
    if (typeof found === 'string') return found
    // Fallback: find any long string value
    const strVal = Object.values(obj).find(v => typeof v === 'string' && (v as string).length > 3)
    if (typeof strVal === 'string') return strVal
    return JSON.stringify(s)
  }
  return String(s)
}

function normalizeRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.map(r => ({
    ...r,
    instructions: r.instructions.map(normalizeInstruction),
  }))
}

interface ToastData {
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppContextType {
  // Coins
  coinBalance: number | null

  // Subscription
  subscriptionStatus: string | null

  // Out of coins modal
  showOutOfCoinsModal: boolean
  setShowOutOfCoinsModal: (v: boolean) => void

  // Auth
  isAuth: boolean
  authUser: { uuid: string; email: string; name?: string } | null
  authForm: 'login' | 'register'
  authEmail: string
  authPassword: string
  authName: string
  authError: string
  authLoading: boolean
  setAuthForm: (v: 'login' | 'register') => void
  setAuthEmail: (v: string) => void
  setAuthPassword: (v: string) => void
  setAuthName: (v: string) => void
  setAuthError: (v: string) => void
  handleLogin: () => Promise<void>
  handleRegister: () => Promise<void>
  handleLogout: () => void

  // Core
  peopleCount: number
  setPeopleCount: (v: number) => void
  selectedIngredients: string[]
  setSelectedIngredients: (v: string[] | ((prev: string[]) => string[])) => void
  isLoading: boolean
  setIsLoading: (v: boolean) => void
  recipe: Recipe | null
  setRecipe: (v: Recipe | null) => void
  mealPlan: WeekPlan | null
  setMealPlan: (v: WeekPlan | null) => void
  planDays: number
  setPlanDays: (v: number) => void
  checkedItems: Set<number>
  setCheckedItems: (v: Set<number>) => void
  customIngredient: string
  setCustomIngredient: (v: string) => void
  customIngredients: string[]
  setCustomIngredients: (v: string[] | ((prev: string[]) => string[])) => void
  activeCategory: string | null
  setActiveCategory: (v: string | null) => void
  pantryStaples: Set<string>
  isHydrated: boolean

  // My fridge
  myFridge: string[]
  myFridgeCustom: string[]

  // Favorites & History
  favorites: Recipe[]
  history: Recipe[]
  planHistory: WeekPlan[]

  // Settings
  settings: UserSettings
  isDark: boolean

  // Cooking
  cookingStep: number
  setCookingStep: (v: number) => void
  cookingTimer: number
  isTimerRunning: boolean
  setIsTimerRunning: (v: boolean) => void

  // Toast
  toast: ToastData | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  setToast: (v: ToastData | null) => void

  // Recipe overlay
  overlayRecipe: Recipe | null
  setOverlayRecipe: (v: Recipe | null) => void
  overlayMealContext: { dayIndex: number; mealIndex: number } | null
  setOverlayMealContext: (v: { dayIndex: number; mealIndex: number } | null) => void

  // Plan
  useFridgeForPlan: boolean
  setUseFridgeForPlan: (v: boolean) => void
  planCuisine: string[]
  setPlanCuisine: (v: string[]) => void
  planDifficulty: string
  setPlanDifficulty: (v: string) => void
  planCookingTime: string
  setPlanCookingTime: (v: string) => void
  planDescription: string
  setPlanDescription: (v: string) => void
  selectedDayIndex: number
  setSelectedDayIndex: (v: number) => void
  showShoppingList: boolean
  setShowShoppingList: (v: boolean) => void
  swappingMeal: { dayIndex: number; mealIndex: number } | null
  zakazSearchIndex: number | null
  setZakazSearchIndex: (v: number | null) => void
  zakazResults: { title: string; ean: string; price: number; unit: string; in_stock: boolean; img: string | null; web_url: string }[]
  zakazLoading: boolean

  // Ordering
  deliveryAddress: DeliveryAddress
  setDeliveryAddress: (v: DeliveryAddress | ((prev: DeliveryAddress) => DeliveryAddress)) => void
  selectedStoreId: string
  setSelectedStoreId: (v: string) => void
  cartItems: CartItem[]
  setCartItems: (v: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void
  orderHistory: PreparedOrder[]
  orderStep: 'address' | 'searching' | 'cart'
  setOrderStep: (v: 'address' | 'searching' | 'cart') => void
  storesData: Record<string, { name: string; stores: { id: string; name: string; chain: string }[] }>
  storesLoading: boolean
  altSearchIndex: number | null
  setAltSearchIndex: (v: number | null) => void
  altSearchQuery: string
  setAltSearchQuery: (v: string) => void
  altSearchResults: ZakazProduct[]
  setAltSearchResults: (v: ZakazProduct[]) => void
  altSearchLoading: boolean
  expandedAlts: Set<number>
  setExpandedAlts: (v: Set<number> | ((prev: Set<number>) => Set<number>)) => void

  // Functions
  toggleTheme: () => void
  togglePantryStaple: (name: string) => void
  addCustomIngredient: () => void
  removeCustomIngredient: (name: string) => void
  toggleIngredient: (name: string) => void
  toggleMyFridgeItem: (name: string) => void
  addMyFridgeCustom: (name: string) => void
  removeMyFridgeCustom: (name: string) => void
  useMyFridgeForRecipe: () => void
  toggleFavorite: (recipe: Recipe) => void
  isFavorite: (recipeId: string) => boolean
  addToHistory: (recipe: Recipe) => void
  updateSettings: (updates: Partial<UserSettings>) => void
  toggleAllergy: (allergy: string) => void
  toggleDiet: (diet: string) => void
  startCooking: () => void
  nextCookingStep: () => void
  prevCookingStep: () => void
  setTimer: (minutes: number) => void
  formatTime: (seconds: number) => string
  shareRecipe: () => Promise<void>
  printRecipe: () => void
  recalculateShoppingList: (plan: WeekPlan, fridgeIngredients?: string[]) => ShoppingItem[]
  swapMeal: (dayIndex: number, mealIndex: number) => Promise<void>
  searchZakazProducts: (query: string, index: number) => Promise<void>
  fetchStores: () => Promise<void>
  startOrderPreparation: () => void
  executeBatchSearch: () => Promise<void>
  updateCartItemQuantity: (index: number, delta: number) => void
  excludeCartItem: (index: number, excluded: boolean) => void
  selectAlternative: (itemIndex: number, product: ZakazProduct) => void
  searchAlternativeProduct: (index: number, query: string) => Promise<void>
  calculateCartTotal: () => number
  finalizeOrder: () => void
  completeOrder: (status: 'in_progress' | 'completed') => void
  markOrderDelivered: (orderId: string) => void
  loadOrderFromHistory: (order: PreparedOrder) => void
  deleteOrderFromHistory: (orderId: string) => void
  bulkDeleteOrders: (orderIds: string[]) => void
  bulkDeleteFromHistory: (recipeIds: string[]) => void
  bulkDeletePlans: (planIds: string[]) => void

  // Zakaz.ua auth + cart
  zakazCookies: string | null
  zakazPhone: string | null
  zakazAuthStep: 'idle' | 'login' | 'signup-otp' | 'recovery-otp' | 'recovery-password' | 'loading'
  zakazOtp: string
  isZakazConnected: boolean
  zakazCartLoading: boolean
  currentOrderId: string | null
  setZakazAuthStep: (v: 'idle' | 'login' | 'signup-otp' | 'recovery-otp' | 'recovery-password' | 'loading') => void
  connectZakaz: (phone: string, password: string) => Promise<void>
  startZakazSignup: (phone: string) => Promise<void>
  confirmZakazSignup: (otp: string) => Promise<void>
  startZakazRecovery: (phone: string) => Promise<void>
  confirmZakazRecovery: (otp: string) => Promise<void>
  finishZakazRecovery: (password: string) => Promise<void>
  disconnectZakaz: () => void

  // Cart estimate
  cartEstimate: { subtotal: number; total: number; totalWeight: number } | null
  cartEstimateLoading: boolean
  estimateCartPrice: () => Promise<void>
  getDayMacros: (day: { meals: { recipe: Recipe }[] }) => { protein: number; carbs: number; fat: number; proteinPct: number; carbsPct: number; fatPct: number }
  difficultyLabel: (d: 'easy' | 'medium' | 'hard') => { text: string; classes: string }
  generateRecipe: () => Promise<void>
  generateMealPlan: () => Promise<string | null>
  toggleItem: (index: number) => void
  clearFridge: () => void
  addToPlanHistory: (plan: WeekPlan) => void
  loadPlanFromHistory: (plan: WeekPlan) => void
  deletePlanFromHistory: (planId: string) => void

  // Fridge popup after order
  fridgePopupItems: string[]
  fridgePopupChecked: Set<string>
  showFridgePopup: boolean
  setShowFridgePopup: (v: boolean) => void
  toggleFridgePopupItem: (name: string) => void
  confirmFridgePopup: () => void
  dismissFridgePopup: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [peopleCount, setPeopleCount] = useState(2)
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
  const [myFridge, setMyFridge] = useState<string[]>([])
  const [myFridgeCustom, setMyFridgeCustom] = useState<string[]>([])
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [history, setHistory] = useState<Recipe[]>([])
  const [planHistory, setPlanHistory] = useState<WeekPlan[]>([])
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const [cookingStep, setCookingStep] = useState(0)
  const [cookingTimer, setCookingTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [overlayRecipe, setOverlayRecipe] = useState<Recipe | null>(null)
  const [overlayMealContext, setOverlayMealContext] = useState<{ dayIndex: number; mealIndex: number } | null>(null)
  const [useFridgeForPlan, setUseFridgeForPlan] = useState(false)
  const [planCuisine, setPlanCuisine] = useState<string[]>([])
  const [planDifficulty, setPlanDifficulty] = useState('')
  const [planCookingTime, setPlanCookingTime] = useState('')
  const [planDescription, setPlanDescription] = useState('')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [swappingMeal, setSwappingMeal] = useState<{ dayIndex: number; mealIndex: number } | null>(null)
  const [zakazSearchIndex, setZakazSearchIndex] = useState<number | null>(null)
  const [zakazResults, setZakazResults] = useState<{ title: string; ean: string; price: number; unit: string; in_stock: boolean; img: string | null; web_url: string }[]>([])
  const [zakazLoading, setZakazLoading] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({ city: 'kiev', address: '' })
  const [selectedStoreId, setSelectedStoreId] = useState<string>('48201070')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderHistory, setOrderHistory] = useState<PreparedOrder[]>([])
  const [orderStep, setOrderStep] = useState<'address' | 'searching' | 'cart'>('address')

  // Cart estimate
  const [cartEstimate, setCartEstimate] = useState<{ subtotal: number; total: number; totalWeight: number } | null>(null)
  const [cartEstimateLoading, setCartEstimateLoading] = useState(false)

  // Zakaz.ua auth + cart
  const [zakazCookies, setZakazCookies] = useState<string | null>(null)
  const [zakazPhone, setZakazPhone] = useState<string | null>(null)
  const [zakazAuthStep, setZakazAuthStep] = useState<'idle' | 'login' | 'signup-otp' | 'recovery-otp' | 'recovery-password' | 'loading'>('idle')
  const [zakazOtp, setZakazOtp] = useState('')
  const [zakazCartLoading, setZakazCartLoading] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const isZakazConnected = !!zakazCookies
  const [storesData, setStoresData] = useState<Record<string, { name: string; stores: { id: string; name: string; chain: string }[] }>>({})
  const [storesLoading, setStoresLoading] = useState(false)
  const [altSearchIndex, setAltSearchIndex] = useState<number | null>(null)
  const [altSearchQuery, setAltSearchQuery] = useState('')
  const [altSearchResults, setAltSearchResults] = useState<ZakazProduct[]>([])
  const [altSearchLoading, setAltSearchLoading] = useState(false)
  const [expandedAlts, setExpandedAlts] = useState<Set<number>>(new Set())

  // Fridge popup after order
  const [fridgePopupItems, setFridgePopupItems] = useState<string[]>([])
  const [fridgePopupChecked, setFridgePopupChecked] = useState<Set<string>>(new Set())
  const [showFridgePopup, setShowFridgePopup] = useState(false)

  // Coins
  const [coinBalance, setCoinBalance] = useState<number | null>(null)

  // Subscription
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)

  // Out of coins modal
  const [showOutOfCoinsModal, setShowOutOfCoinsModal] = useState(false)

  // Auth
  const [isAuth, setIsAuth] = useState(false)
  const [authUser, setAuthUser] = useState<{ uuid: string; email: string; name?: string } | null>(null)
  const [authForm, setAuthForm] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }, [])

  // Load from backend
  const loadingRef = useRef(false)
  const loadFromBackend = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      // Single API request for all data
      const data = await api.getInit()
      setFavorites(data.favorites)
      setHistory(data.history)
      setCoinBalance(data.coins)
      setPlanHistory(data.plans)
      setOrderHistory(data.orders)
      // Claim daily free coins
      api.claimDailyCoins().then(result => {
        if (result.claimed) setCoinBalance(result.coins)
      }).catch(() => {})
      if (data.settings) {
        const settingsData = data.settings
        setSettings(prev => ({
          ...prev,
          allergies: settingsData.allergies || [],
          dietaryRestrictions: settingsData.dietaryRestrictions || [],
          dislikedIngredients: settingsData.dislikedIngredients || [],
          dailyCalorieGoal: settingsData.dailyCalorieGoal || prev.dailyCalorieGoal,
          dailyProteinGoal: settingsData.dailyProteinGoal || prev.dailyProteinGoal,
          dailyCarbsGoal: settingsData.dailyCarbsGoal || prev.dailyCarbsGoal,
          dailyFatGoal: settingsData.dailyFatGoal || prev.dailyFatGoal,
        }))
        if (settingsData.deliveryCity || settingsData.deliveryAddress) {
          setDeliveryAddress({ city: settingsData.deliveryCity || 'kiev', address: settingsData.deliveryAddress || '' })
        }
        if (settingsData.zakazCookies) {
          setZakazCookies(settingsData.zakazCookies)
          localStorage.setItem('mealmate-zakaz-cookies', settingsData.zakazCookies)
          if (settingsData.zakazPhone) {
            setZakazPhone(settingsData.zakazPhone)
            localStorage.setItem('mealmate-zakaz-phone', settingsData.zakazPhone)
          }
        }
      }
      if (data.fridge.length > 0) {
        const fridgeNames = data.fridge.filter((f: api.FridgeItem) => !f.isCustom).map((f: api.FridgeItem) => f.name)
        const fridgeCustom = data.fridge.filter((f: api.FridgeItem) => f.isCustom).map((f: api.FridgeItem) => f.name)
        const allNames = Array.from(new Set([...fridgeNames, ...fridgeCustom]))
        setMyFridge(allNames)
        setMyFridgeCustom(fridgeCustom)
      }
    } catch (e) {
      void e
    } finally {
      loadingRef.current = false
    }
  }, [])

  // Sync all to backend (after registration)
  const syncAllToBackend = useCallback(async () => {
    if (!api.isLoggedIn()) return
    try {
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

      const fridgeItems: api.FridgeItem[] = [
        ...myFridge.map(name => ({ name, isCustom: false })),
        ...myFridgeCustom.map(name => ({ name, isCustom: true })),
      ]
      if (fridgeItems.length > 0) {
        await api.syncFridge(fridgeItems).catch(() => {})
      }
    } catch (e) {
      void e
    }
  }, [settings, deliveryAddress, myFridge, myFridgeCustom])

  // Init: load from localStorage + check auth
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
      if (savedFavorites) setFavorites(normalizeRecipes(JSON.parse(savedFavorites)))
      if (savedHistory) setHistory(normalizeRecipes(JSON.parse(savedHistory)))
      if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
      if (savedPlanHistory) setPlanHistory(JSON.parse(savedPlanHistory))
      const savedDeliveryAddress = localStorage.getItem(STORAGE_KEYS.deliveryAddress)
      if (savedDeliveryAddress) setDeliveryAddress(JSON.parse(savedDeliveryAddress))
      const savedOrderHistory = localStorage.getItem(STORAGE_KEYS.orderHistory)
      if (savedOrderHistory) setOrderHistory(JSON.parse(savedOrderHistory))

      // Zakaz.ua cookies
      const savedZakazCookies = localStorage.getItem('mealmate-zakaz-cookies')
      const savedZakazPhone = localStorage.getItem('mealmate-zakaz-phone')
      if (savedZakazCookies) setZakazCookies(savedZakazCookies)
      if (savedZakazPhone) setZakazPhone(savedZakazPhone)

      // Theme
      const savedTheme = localStorage.getItem('mealmate-theme')
      if (savedTheme) {
        setIsDark(savedTheme === 'dark')
      }
    } catch (e) {
      void e
    }
    setIsHydrated(true)

    // Validate token & load backend data
    ;(async () => {
      const user = await api.validateToken()
      if (user) {
        setIsAuth(true)
        setAuthUser(user)
        loadFromBackend()
      } else {
        setIsAuth(false)
        setAuthUser(null)
        // No valid token — clear cookie and redirect to login
        const isPublicPage = ['/login', '/register', '/landing'].some(p => window.location.pathname.startsWith(p))
        if (!isPublicPage) {
          api.setToken(null) // clears cookie so middleware won't loop
          window.location.href = '/login'
        }
      }
    })()
  }, [loadFromBackend])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('mealmate-theme', next ? 'dark' : 'light')
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }, [])

  // Auth handlers
  const handleLogin = useCallback(async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const data = await api.login(authEmail, authPassword)
      setIsAuth(true)
      setAuthUser(data.user)
      setAuthEmail('')
      setAuthPassword('')
      await loadFromBackend()
      showToast('Вхід успішний!', 'success')
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Помилка входу')
      throw e
    } finally {
      setAuthLoading(false)
    }
  }, [authEmail, authPassword, loadFromBackend, showToast])

  const handleRegister = useCallback(async () => {
    setAuthError('')
    if (authPassword.length < 8) {
      setAuthError('Пароль має містити мінімум 8 символів')
      return
    }
    setAuthLoading(true)
    try {
      const data = await api.register(authEmail, authPassword, authName || undefined)
      setIsAuth(true)
      setAuthUser(data.user)
      setCoinBalance(10)
      setAuthEmail('')
      setAuthPassword('')
      setAuthName('')
      syncAllToBackend()
      showToast('Реєстрація успішна!', 'success')
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Помилка реєстрації')
      throw e
    } finally {
      setAuthLoading(false)
    }
  }, [authEmail, authPassword, authName, syncAllToBackend, showToast])

  const handleLogout = useCallback(() => {
    api.logout()
    setIsAuth(false)
    setAuthUser(null)
    window.location.href = '/login'
  }, [])

  // Save to localStorage
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
      void e
    }
  }, [selectedIngredients, customIngredients, pantryStaples, myFridge, myFridgeCustom, favorites, history, settings, planHistory, deliveryAddress, orderHistory, isHydrated])

  // Sync fridge to backend (debounced)
  useEffect(() => {
    if (!isHydrated || !api.isLoggedIn()) return
    const timer = setTimeout(() => {
      const items: api.FridgeItem[] = [
        ...myFridge.filter(name => !myFridgeCustom.includes(name)).map(name => ({ name, isCustom: false })),
        ...myFridgeCustom.map(name => ({ name, isCustom: true })),
      ]
      api.syncFridge(items).catch(() => {})
    }, 2000)
    return () => clearTimeout(timer)
  }, [myFridge, myFridgeCustom, isHydrated])

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // ESC key closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zakazSearchIndex !== null) setZakazSearchIndex(null)
        else if (showShoppingList) setShowShoppingList(false)
        else if (overlayRecipe) { setOverlayRecipe(null); setOverlayMealContext(null) }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [overlayRecipe, zakazSearchIndex, showShoppingList])

  // Body scroll lock when modal is open
  useEffect(() => {
    if (overlayRecipe || showShoppingList) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [overlayRecipe, showShoppingList])

  // Cooking timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && cookingTimer > 0) {
      interval = setInterval(() => {
        setCookingTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
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

  // --- Functions ---

  const togglePantryStaple = useCallback((name: string) => {
    setPantryStaples(prev => {
      const newSet = new Set(prev)
      if (newSet.has(name)) newSet.delete(name)
      else newSet.add(name)
      return newSet
    })
  }, [])

  const addCustomIngredient = useCallback(() => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      const ingredient = customIngredient.trim()
      setCustomIngredients(prev => [...prev, ingredient])
      setSelectedIngredients(prev => [...prev, ingredient])
      setCustomIngredient('')
    }
  }, [customIngredient, selectedIngredients])

  const removeCustomIngredient = useCallback((name: string) => {
    setCustomIngredients(prev => prev.filter(i => i !== name))
    setSelectedIngredients(prev => prev.filter(i => i !== name))
  }, [])

  const toggleIngredient = useCallback((name: string) => {
    setSelectedIngredients(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    )
  }, [])

  const toggleMyFridgeItem = useCallback((name: string) => {
    setMyFridge(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    )
  }, [])

  const addMyFridgeCustom = useCallback((name: string) => {
    if (name.trim() && !myFridge.includes(name.trim()) && !myFridgeCustom.includes(name.trim())) {
      setMyFridgeCustom(prev => [...prev, name.trim()])
      setMyFridge(prev => [...prev, name.trim()])
    }
  }, [myFridge, myFridgeCustom])

  const removeMyFridgeCustom = useCallback((name: string) => {
    setMyFridgeCustom(prev => prev.filter(i => i !== name))
    setMyFridge(prev => prev.filter(i => i !== name))
  }, [])

  const useMyFridgeForRecipe = useCallback(() => {
    setSelectedIngredients([...myFridge])
    setCustomIngredients([...myFridgeCustom])
  }, [myFridge, myFridgeCustom])

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prev => {
      const exists = prev.some(r => r.id === recipe.id)
      if (exists) return prev.filter(r => r.id !== recipe.id)
      return [recipe, ...prev]
    })
    if (api.isLoggedIn()) {
      api.toggleFavoriteApi(recipe.id).catch(() => {})
    }
  }, [])

  const isFavorite = useCallback((recipeId: string) => favorites.some(r => r.id === recipeId), [favorites])

  const addToHistory = useCallback((recipe: Recipe) => {
    const normalized = { ...recipe, instructions: recipe.instructions.map(normalizeInstruction) }
    setHistory(prev => {
      const filtered = prev.filter(r => r.id !== normalized.id)
      return [normalized, ...filtered].slice(0, 50)
    })
  }, [])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
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
  }, [])

  const toggleAllergy = useCallback((allergy: string) => {
    updateSettings({
      allergies: settings.allergies.includes(allergy)
        ? settings.allergies.filter(a => a !== allergy)
        : [...settings.allergies, allergy]
    })
  }, [settings.allergies, updateSettings])

  const toggleDiet = useCallback((diet: string) => {
    updateSettings({
      dietaryRestrictions: settings.dietaryRestrictions.includes(diet)
        ? settings.dietaryRestrictions.filter(d => d !== diet)
        : [...settings.dietaryRestrictions, diet]
    })
  }, [settings.dietaryRestrictions, updateSettings])

  const startCooking = useCallback(() => {
    setCookingStep(0)
    setCookingTimer(0)
    setIsTimerRunning(false)
  }, [])

  const nextCookingStep = useCallback(() => {
    if (recipe && cookingStep < recipe.instructions.length - 1) {
      setCookingStep(prev => prev + 1)
      setCookingTimer(0)
      setIsTimerRunning(false)
    }
  }, [recipe, cookingStep])

  const prevCookingStep = useCallback(() => {
    if (cookingStep > 0) {
      setCookingStep(prev => prev - 1)
      setCookingTimer(0)
      setIsTimerRunning(false)
    }
  }, [cookingStep])

  const setTimer = useCallback((minutes: number) => {
    setCookingTimer(minutes * 60)
    setIsTimerRunning(true)
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const shareRecipe = useCallback(async () => {
    if (!recipe) return
    const text = `🍳 ${recipe.title}\n\n${recipe.description}\n\n⏱️ ${recipe.prepTime + recipe.cookTime} хв | 👥 ${recipe.servings} порцій | 🔥 ${recipe.nutrition.calories} ккал\n\nІнгредієнти:\n${recipe.ingredients.map(i => `• ${i.name} - ${i.amount} ${i.unit}`).join('\n')}\n\nПриготування:\n${recipe.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n— Згенеровано MealMate AI`

    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text })
      } catch {
        navigator.clipboard.writeText(text)
        showToast('Рецепт скопійовано!', 'success')
      }
    } else {
      navigator.clipboard.writeText(text)
      showToast('Рецепт скопійовано!', 'success')
    }
  }, [recipe, showToast])

  const printRecipe = useCallback(() => { window.print() }, [])

  const recalculateShoppingList = useCallback((plan: WeekPlan, fridgeIngredients?: string[]) => {
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

    return Array.from(ingredientMap.entries())
      .filter(([name]) => !fridgeSet.has(name))
      .map(([key, val]) => ({
        ingredient: key.charAt(0).toUpperCase() + key.slice(1),
        amount: String(Math.ceil(val.amount / 50) * 50 || val.amount),
        unit: val.unit,
        category: val.category as ShoppingItem['category'],
        checked: false,
        recipes: Array.from(val.recipes),
      }))
  }, [])

  const addToPlanHistory = useCallback((plan: WeekPlan) => {
    setPlanHistory(prev => {
      const filtered = prev.filter(p => p.id !== plan.id)
      return [plan, ...filtered].slice(0, 20)
    })
  }, [])

  const loadPlanFromHistory = useCallback((plan: WeekPlan) => {
    setMealPlan(plan)
    setSelectedDayIndex(0)
    setCheckedItems(new Set())
  }, [])

  const deletePlanFromHistory = useCallback((planId: string) => {
    setPlanHistory(prev => prev.filter(p => p.id !== planId))
    setMealPlan(prev => prev?.id === planId ? null : prev)
    if (api.isLoggedIn()) {
      api.deleteMealPlan(planId).catch(() => {})
    }
  }, [])

  const swapMeal = useCallback(async (dayIndex: number, mealIndex: number) => {
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

      const newDays = mealPlan.days.map((d, di) => {
        if (di !== dayIndex) return d
        const newMeals = d.meals.map((m, mi) => mi === mealIndex ? { ...m, recipe: newRecipe } : m)
        const totalNutrition = {
          calories: newMeals.reduce((sum, m) => sum + m.recipe.nutrition.calories, 0),
          protein: newMeals.reduce((sum, m) => sum + m.recipe.nutrition.protein, 0),
          carbs: newMeals.reduce((sum, m) => sum + m.recipe.nutrition.carbs, 0),
          fat: newMeals.reduce((sum, m) => sum + m.recipe.nutrition.fat, 0),
        }
        return { ...d, meals: newMeals, totalNutrition }
      })

      const updatedPlan = { ...mealPlan, days: newDays }
      const fridgeItems = useFridgeForPlan ? myFridge : undefined
      updatedPlan.shoppingList = recalculateShoppingList(updatedPlan, fridgeItems)

      setMealPlan(updatedPlan)
      addToPlanHistory(updatedPlan)
      setCheckedItems(new Set())
      setCoinBalance(prev => prev !== null ? prev - 2 : prev)
      showToast('Страву замінено!', 'success')
    } catch (e: unknown) {
      const err = e as Error & { status?: number }
      if (err.status === 402) {
        showToast('Недостатньо монет', 'error')
        setShowOutOfCoinsModal(true)
      } else {
        showToast('Не вдалось замінити страву', 'error')
      }
    } finally {
      setSwappingMeal(null)
    }
  }, [mealPlan, useFridgeForPlan, myFridge, peopleCount, settings, recalculateShoppingList, addToPlanHistory, showToast])

  const searchZakazProducts = useCallback(async (query: string, index: number) => {
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
  }, [zakazSearchIndex, showToast])

  const fetchStores = useCallback(async () => {
    if (Object.keys(storesData).length > 0) return
    setStoresLoading(true)
    try {
      const data = await api.getStores()
      setStoresData(data)
    } catch {
      showToast('Не вдалось завантажити магазини', 'error')
    } finally {
      setStoresLoading(false)
    }
  }, [storesData, showToast])

  const startOrderPreparation = useCallback(() => {
    if (!mealPlan) return
    const unchecked = mealPlan.shoppingList.filter((_: ShoppingItem, i: number) => !checkedItems.has(i))
    const items: CartItem[] = unchecked.map((item: ShoppingItem) => ({
      shoppingItem: item,
      selectedProduct: null,
      alternatives: [],
      quantity: 1,
      excluded: false,
    }))
    setCartItems(items)
    setOrderStep('address')
    fetchStores()
  }, [mealPlan, checkedItems, fetchStores])

  const executeBatchSearch = useCallback(async () => {
    setOrderStep('searching')
    try {
      const ingredientNames = cartItems.map(ci => ci.shoppingItem.ingredient)
      const results = await api.batchSearchProducts(ingredientNames, selectedStoreId)

      setCartItems(prev => prev.map(ci => {
        const ingredient = ci.shoppingItem.ingredient.trim()
        const products = results[ingredient] || results[ingredient.toLowerCase()] || []
        const inStock = products.filter(p => p.in_stock)
        return {
          ...ci,
          selectedProduct: inStock[0] || products[0] || null,
          alternatives: products.slice(1),
        }
      }))
      setCurrentOrderId(null)
      setOrderStep('cart')
    } catch {
      showToast('Не вдалось знайти товари', 'error')
      setOrderStep('address')
    }
  }, [cartItems, selectedStoreId, showToast])

  const updateCartItemQuantity = useCallback((index: number, delta: number) => {
    setCartItems(prev => prev.map((ci, i) => {
      if (i !== index) return ci
      const newQty = Math.max(1, ci.quantity + delta)
      return { ...ci, quantity: newQty }
    }))
  }, [])

  const excludeCartItem = useCallback((index: number, excluded: boolean) => {
    setCartItems(prev => prev.map((ci, i) => i === index ? { ...ci, excluded } : ci))
  }, [])

  const selectAlternative = useCallback((itemIndex: number, product: ZakazProduct) => {
    setCartItems(prev => prev.map((ci, i) => {
      if (i !== itemIndex) return ci
      const oldSelected = ci.selectedProduct
      const newAlts = ci.alternatives.filter(a => a.ean !== product.ean)
      if (oldSelected) newAlts.unshift(oldSelected)
      return { ...ci, selectedProduct: product, alternatives: newAlts }
    }))
    setExpandedAlts(prev => { const n = new Set(prev); n.delete(itemIndex); return n })
  }, [])

  const searchAlternativeProduct = useCallback(async (index: number, query: string) => {
    setAltSearchIndex(index)
    setAltSearchLoading(true)
    setAltSearchResults([])
    try {
      const results = await api.searchProducts(query, selectedStoreId)
      setAltSearchResults(results)
    } catch {
      showToast('Не вдалось знайти товари', 'error')
    } finally {
      setAltSearchLoading(false)
    }
  }, [selectedStoreId, showToast])

  const calculateCartTotal = useCallback(() => {
    return cartItems
      .filter(ci => !ci.excluded && ci.selectedProduct)
      .reduce((sum, ci) => sum + (ci.selectedProduct!.price * ci.quantity), 0)
  }, [cartItems])

  const getStoreInfo = useCallback(() => {
    for (const cityData of Object.values(storesData)) {
      const store = cityData.stores.find(s => s.id === selectedStoreId)
      if (store) return store
    }
    return null
  }, [storesData, selectedStoreId])

  const estimateCartPrice = useCallback(async () => {
    const items = cartItems
      .filter(ci => !ci.excluded && ci.selectedProduct?.ean)
      .map(ci => ({ ean: ci.selectedProduct!.ean, amount: ci.quantity }))
    if (items.length === 0) {
      setCartEstimate(null)
      return
    }
    setCartEstimateLoading(true)
    const storeInfo = getStoreInfo()
    try {
      const result = await api.estimateZakazCart(selectedStoreId, items, storeInfo?.chain)
      if (result.success && result.data) {
        setCartEstimate({
          subtotal: result.data.subtotal,
          total: result.data.total,
          totalWeight: result.data.totalWeight,
        })
      }
    } catch {
      // Silently fail — estimate is optional
    } finally {
      setCartEstimateLoading(false)
    }
  }, [cartItems, selectedStoreId, getStoreInfo])

  // Sync Zakaz cookies to backend DB
  const saveZakazToBackend = useCallback((cookies: string | null, phone: string | null) => {
    if (api.isLoggedIn()) {
      api.updateSettings({ zakazCookies: cookies, zakazPhone: phone }).catch(() => {})
    }
  }, [])

  const connectZakaz = useCallback(async (phone: string, password: string) => {
    setZakazAuthStep('loading')
    setZakazPhone(phone)
    const storeInfo = getStoreInfo()
    try {
      const result = await api.zakazLogin(phone, password, storeInfo?.chain)
      if (result.success && result.cookies) {
        setZakazCookies(result.cookies)
        setZakazAuthStep('idle')
        localStorage.setItem('mealmate-zakaz-cookies', result.cookies)
        localStorage.setItem('mealmate-zakaz-phone', phone)
        saveZakazToBackend(result.cookies, phone)
        showToast('Zakaz.ua підключено!', 'success')
      } else {
        setZakazAuthStep('login')
        showToast(result.error || 'Не вдалось увійти', 'error')
      }
    } catch {
      setZakazAuthStep('login')
      showToast('Не вдалось увійти в Zakaz.ua', 'error')
    }
  }, [showToast, getStoreInfo, saveZakazToBackend])

  const getCaptchaToken = useCallback(async (): Promise<string | null> => {
    try {
      const w = window as any
      if (!w.grecaptcha?.enterprise) return null
      return await w.grecaptcha.enterprise.execute(
        '6LfZHBArAAAAAFZNAbtSDZp5_MY52hGdftmkk92O',
        { action: 'login' },
      )
    } catch {
      return null
    }
  }, [])

  const startZakazSignup = useCallback(async (phone: string) => {
    setZakazAuthStep('loading')
    setZakazPhone(phone)
    const storeInfo = getStoreInfo()
    try {
      const captchaToken = await getCaptchaToken()
      if (!captchaToken) {
        setZakazAuthStep('login')
        showToast('reCAPTCHA не готова, спробуйте ще раз', 'error')
        return
      }
      const result = await api.zakazSignup(phone, captchaToken, storeInfo?.chain)
      if (result.success) {
        setZakazAuthStep('signup-otp')
        showToast('SMS код надіслано!', 'success')
      } else {
        setZakazAuthStep('login')
        showToast(result.error || 'Не вдалось зареєструватись', 'error')
      }
    } catch {
      setZakazAuthStep('login')
      showToast('Помилка реєстрації', 'error')
    }
  }, [showToast, getStoreInfo, getCaptchaToken])

  const confirmZakazSignup = useCallback(async (otp: string) => {
    if (!zakazPhone) return
    setZakazAuthStep('loading')
    const storeInfo = getStoreInfo()
    try {
      const result = await api.zakazConfirmSignup(zakazPhone, otp, storeInfo?.chain)
      if (result.success && result.cookies) {
        setZakazCookies(result.cookies)
        setZakazAuthStep('idle')
        localStorage.setItem('mealmate-zakaz-cookies', result.cookies)
        localStorage.setItem('mealmate-zakaz-phone', zakazPhone)
        saveZakazToBackend(result.cookies, zakazPhone)
        showToast('Zakaz.ua підключено!', 'success')
      } else {
        setZakazAuthStep('signup-otp')
        showToast(result.error || 'Невірний код', 'error')
      }
    } catch {
      setZakazAuthStep('signup-otp')
      showToast('Помилка підтвердження', 'error')
    }
  }, [zakazPhone, showToast, getStoreInfo])

  const startZakazRecovery = useCallback(async (phone: string) => {
    setZakazAuthStep('loading')
    setZakazPhone(phone)
    const storeInfo = getStoreInfo()
    try {
      const captchaToken = await getCaptchaToken()
      if (!captchaToken) {
        setZakazAuthStep('login')
        showToast('reCAPTCHA не готова, спробуйте ще раз', 'error')
        return
      }
      const result = await api.zakazPasswordRecovery(phone, captchaToken, storeInfo?.chain)
      if (result.success) {
        setZakazAuthStep('recovery-otp')
        showToast('SMS код надіслано!', 'success')
      } else {
        setZakazAuthStep('login')
        showToast(result.error || 'Не вдалось надіслати код', 'error')
      }
    } catch {
      setZakazAuthStep('login')
      showToast('Помилка відновлення', 'error')
    }
  }, [showToast, getStoreInfo, getCaptchaToken])

  const confirmZakazRecovery = useCallback(async (otp: string) => {
    if (!zakazPhone) return
    setZakazAuthStep('loading')
    setZakazOtp(otp)
    const storeInfo = getStoreInfo()
    try {
      const result = await api.zakazConfirmRecovery(zakazPhone, otp, storeInfo?.chain)
      if (result.success) {
        setZakazAuthStep('recovery-password')
      } else {
        setZakazAuthStep('recovery-otp')
        showToast(result.error || 'Невірний код', 'error')
      }
    } catch {
      setZakazAuthStep('recovery-otp')
      showToast('Помилка підтвердження', 'error')
    }
  }, [zakazPhone, showToast, getStoreInfo])

  const finishZakazRecovery = useCallback(async (password: string) => {
    if (!zakazPhone || !zakazOtp) return
    setZakazAuthStep('loading')
    const storeInfo = getStoreInfo()
    try {
      const result = await api.zakazCreatePassword(zakazPhone, zakazOtp, password, storeInfo?.chain)
      if (result.success && result.cookies) {
        setZakazCookies(result.cookies)
        setZakazAuthStep('idle')
        setZakazOtp('')
        localStorage.setItem('mealmate-zakaz-cookies', result.cookies)
        localStorage.setItem('mealmate-zakaz-phone', zakazPhone)
        saveZakazToBackend(result.cookies, zakazPhone)
        showToast('Пароль змінено, Zakaz.ua підключено!', 'success')
      } else {
        setZakazAuthStep('recovery-password')
        showToast(result.error || 'Не вдалось змінити пароль', 'error')
      }
    } catch {
      setZakazAuthStep('recovery-password')
      showToast('Помилка зміни пароля', 'error')
    }
  }, [zakazPhone, zakazOtp, showToast, getStoreInfo])

  const disconnectZakaz = useCallback(() => {
    setZakazCookies(null)
    setZakazPhone(null)
    setZakazAuthStep('idle')
    localStorage.removeItem('mealmate-zakaz-cookies')
    localStorage.removeItem('mealmate-zakaz-phone')
    saveZakazToBackend(null, null)
    showToast('Zakaz.ua від\'єднано', 'info')
  }, [showToast, saveZakazToBackend])

  const finalizeOrder = useCallback(async () => {
    const storeInfo = getStoreInfo()
    const storeChain = storeInfo?.chain || 'novus'

    const activeItems = cartItems.filter(ci => !ci.excluded && ci.selectedProduct)
    const zakazItems = activeItems
      .filter(ci => ci.selectedProduct?.ean)
      .map(ci => ({ ean: ci.selectedProduct!.ean, amount: ci.quantity }))

    if (zakazCookies && zakazItems.length > 0) {
      // Add items to Zakaz.ua cart via backend
      setZakazCartLoading(true)
      try {
        const result = await api.zakazAddToCart(zakazCookies, selectedStoreId, zakazItems, storeChain)
        if (result.success) {
          showToast('Товари додано в кошик Zakaz.ua!', 'success')
        } else if (result.error === 'unauthorized') {
          setZakazCookies(null)
          localStorage.removeItem('mealmate-zakaz-cookies')
          setZakazAuthStep('idle')
          showToast('Сесія Zakaz.ua закінчилась. Увійдіть знову.', 'error')
        } else {
          // Non-auth error — keep cookies so user can retry
          showToast(result.error || 'Не вдалось додати в кошик', 'error')
        }
      } catch {
        // Network error — keep cookies so user can retry
        showToast('Не вдалось додати в кошик Zakaz.ua', 'error')
      } finally {
        setZakazCartLoading(false)
      }
    } else {
      // Not connected: just open the store page
      const storeBaseUrl = `https://${storeChain}.zakaz.ua`
      window.open(`${storeBaseUrl}/uk/`, '_blank')
      showToast('Підключіть Zakaz.ua для автоматичного кошика', 'info')
    }
  }, [storesData, selectedStoreId, cartItems, showToast, getStoreInfo, zakazCookies])

  const completeOrder = useCallback((status: 'in_progress' | 'completed') => {
    const storeInfo = getStoreInfo()
    const storeName = storeInfo?.name || 'Магазин'
    const storeChain = storeInfo?.chain || 'novus'

    const activeItems = cartItems.filter(ci => !ci.excluded && ci.selectedProduct)

    // Save order to history only once per cart session
    if (!currentOrderId) {
      const order: PreparedOrder = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        createdAt: new Date().toISOString(),
        service: 'zakaz',
        storeId: selectedStoreId,
        storeName,
        city: deliveryAddress.city,
        items: activeItems,
        totalEstimate: calculateCartTotal(),
        planId: mealPlan?.id,
        status,
      }
      setOrderHistory(prev => [order, ...prev])
      setCurrentOrderId(order.id)
      if (api.isLoggedIn()) {
        api.saveOrder(order).catch(() => {})
      }

      // Show fridge popup only for completed orders
      if (status === 'completed') {
        const orderedIngredients = activeItems
          .filter(ci => ci.selectedProduct)
          .map(ci => ci.shoppingItem.ingredient)
        const fridgeSet = new Set(myFridge.map(i => i.toLowerCase()))
        const newIngredients = orderedIngredients.filter(i => !fridgeSet.has(i.toLowerCase()))
        if (newIngredients.length > 0) {
          setFridgePopupItems(newIngredients)
          setFridgePopupChecked(new Set(newIngredients))
          setShowFridgePopup(true)
        }
      }
    }

    // Open Zakaz.ua main page
    const storeBaseUrl = `https://${storeChain}.zakaz.ua`
    window.open(`${storeBaseUrl}/uk/`, '_blank')
  }, [storesData, deliveryAddress, selectedStoreId, cartItems, calculateCartTotal, mealPlan, getStoreInfo, myFridge, currentOrderId])

  const markOrderDelivered = useCallback((orderId: string) => {
    const order = orderHistory.find(o => o.id === orderId)
    if (!order) return

    // Update order status
    setOrderHistory(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' as const } : o))

    // Show fridge popup with ordered ingredients
    const orderedIngredients = order.items
      .filter(ci => ci.selectedProduct && !ci.excluded)
      .map(ci => ci.shoppingItem.ingredient)
    const fridgeSet = new Set(myFridge.map(i => i.toLowerCase()))
    const newIngredients = orderedIngredients.filter(i => !fridgeSet.has(i.toLowerCase()))
    if (newIngredients.length > 0) {
      setFridgePopupItems(newIngredients)
      setFridgePopupChecked(new Set(newIngredients))
      setShowFridgePopup(true)
    }

    showToast('Замовлення позначено як доставлене', 'success')
  }, [orderHistory, myFridge, showToast])

  const loadOrderFromHistory = useCallback((order: PreparedOrder) => {
    setCartItems(order.items)
    setSelectedStoreId(order.storeId)
    setDeliveryAddress(prev => ({ ...prev, city: order.city }))
    setCurrentOrderId(order.id)
    setOrderStep('cart')
  }, [])

  const deleteOrderFromHistory = useCallback((orderId: string) => {
    setOrderHistory(prev => prev.filter(o => o.id !== orderId))
    if (api.isLoggedIn()) {
      api.deleteOrder(orderId).catch(() => {})
    }
  }, [])

  const bulkDeleteOrders = useCallback((orderIds: string[]) => {
    setOrderHistory(prev => prev.filter(o => !orderIds.includes(o.id)))
    if (api.isLoggedIn()) {
      api.batchDeleteOrders(orderIds).catch(() => {})
    }
  }, [])

  const bulkDeleteFromHistory = useCallback((recipeIds: string[]) => {
    setHistory(prev => prev.filter(r => !recipeIds.includes(r.id)))
    if (api.isLoggedIn()) {
      api.batchDeleteRecipes(recipeIds).catch(() => {})
    }
    const saved = localStorage.getItem(STORAGE_KEYS.history)
    if (saved) {
      try {
        const hist: Recipe[] = JSON.parse(saved)
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(hist.filter(r => !recipeIds.includes(r.id))))
      } catch {}
    }
  }, [])

  const bulkDeletePlans = useCallback((planIds: string[]) => {
    setPlanHistory(prev => prev.filter(p => !planIds.includes(p.id)))
    if (api.isLoggedIn()) {
      api.batchDeleteMealPlans(planIds).catch(() => {})
    }
  }, [])

  const getDayMacros = useCallback((day: { meals: { recipe: Recipe }[] }) => {
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
  }, [])

  const difficultyLabel = useCallback((d: 'easy' | 'medium' | 'hard') => {
    switch (d) {
      case 'easy': return { text: 'Легко', classes: 'bg-emerald-100 text-emerald-700' }
      case 'medium': return { text: 'Середньо', classes: 'bg-amber-100 text-amber-700' }
      case 'hard': return { text: 'Складно', classes: 'bg-red-100 text-red-700' }
    }
  }, [])

  const generateRecipe = useCallback(async () => {
    setIsLoading(true)
    try {
      const allIngredients = [...selectedIngredients, ...Array.from(pantryStaples)]
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
      setCoinBalance(prev => prev !== null ? prev - 2 : prev)
    } catch (e: unknown) {
      const err = e as Error & { status?: number }
      if (err.status === 402) {
        showToast('Недостатньо монет', 'error')
        setShowOutOfCoinsModal(true)
      } else {
        showToast('Не вдалось згенерувати рецепт. Спробуйте ще раз.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedIngredients, pantryStaples, peopleCount, settings, addToHistory, showToast])

  const generateMealPlan = useCallback(async (): Promise<string | null> => {
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
        cuisinePreferences: planCuisine.length > 0 ? planCuisine : undefined,
        skillLevel: planDifficulty || undefined,
        cookingTime: planCookingTime || undefined,
        specificRequest: planDescription || undefined,
        dailyCalorieGoal: settings.dailyCalorieGoal || undefined,
        dailyProteinGoal: settings.dailyProteinGoal || undefined,
        dailyCarbsGoal: settings.dailyCarbsGoal || undefined,
        dailyFatGoal: settings.dailyFatGoal || undefined,
      })
      // Recalculate shopping list excluding fridge items
      const fridgeItems = useFridgeForPlan ? myFridge : undefined
      plan.shoppingList = recalculateShoppingList(plan, fridgeItems)
      setMealPlan(plan)
      addToPlanHistory(plan)
      setCoinBalance(prev => prev !== null ? prev - 10 : prev)
      return plan.id
    } catch (e: unknown) {
      const err = e as Error & { status?: number }
      if (err.status === 402) {
        showToast('Недостатньо монет', 'error')
        setShowOutOfCoinsModal(true)
      } else {
        showToast('Не вдалось згенерувати план. Спробуйте ще раз.', 'error')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [planDays, useFridgeForPlan, myFridge, peopleCount, settings, recalculateShoppingList, addToPlanHistory, showToast])

  const toggleItem = useCallback((index: number) => {
    const newSet = new Set(checkedItems)
    if (newSet.has(index)) newSet.delete(index)
    else newSet.add(index)
    setCheckedItems(newSet)
  }, [checkedItems])

  const clearFridge = useCallback(() => {
    setMyFridge([])
    setMyFridgeCustom([])
    setSelectedIngredients([])
    setCustomIngredients([])
    setPantryStaples(new Set(DEFAULT_PANTRY))
  }, [])

  const toggleFridgePopupItem = useCallback((name: string) => {
    setFridgePopupChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }, [])

  const confirmFridgePopup = useCallback(() => {
    const itemsToAdd = Array.from(fridgePopupChecked)
    if (itemsToAdd.length > 0) {
      setMyFridge(prev => {
        const existing = new Set(prev)
        const newItems = itemsToAdd.filter(i => !existing.has(i))
        return [...prev, ...newItems]
      })
      showToast(`${itemsToAdd.length} продуктів додано в холодильник`, 'success')
    }
    setShowFridgePopup(false)
    setFridgePopupItems([])
    setFridgePopupChecked(new Set())
  }, [fridgePopupChecked, showToast])

  const dismissFridgePopup = useCallback(() => {
    setShowFridgePopup(false)
    setFridgePopupItems([])
    setFridgePopupChecked(new Set())
  }, [])

  const value: AppContextType = {
    coinBalance,
    subscriptionStatus,
    showOutOfCoinsModal, setShowOutOfCoinsModal,
    isAuth, authUser, authForm, authEmail, authPassword, authName, authError, authLoading,
    setAuthForm, setAuthEmail, setAuthPassword, setAuthName, setAuthError,
    handleLogin, handleRegister, handleLogout,
    peopleCount, setPeopleCount,
    selectedIngredients, setSelectedIngredients,
    isLoading, setIsLoading,
    recipe, setRecipe,
    mealPlan, setMealPlan,
    planDays, setPlanDays,
    checkedItems, setCheckedItems,
    customIngredient, setCustomIngredient,
    customIngredients, setCustomIngredients,
    activeCategory, setActiveCategory,
    pantryStaples, isHydrated,
    myFridge, myFridgeCustom,
    favorites, history, planHistory,
    settings, isDark,
    cookingStep, setCookingStep,
    cookingTimer, isTimerRunning, setIsTimerRunning,
    toast, showToast, setToast,
    overlayRecipe, setOverlayRecipe,
    overlayMealContext, setOverlayMealContext,
    useFridgeForPlan, setUseFridgeForPlan,
    planCuisine, setPlanCuisine,
    planDifficulty, setPlanDifficulty,
    planCookingTime, setPlanCookingTime,
    planDescription, setPlanDescription,
    selectedDayIndex, setSelectedDayIndex,
    showShoppingList, setShowShoppingList,
    swappingMeal,
    zakazSearchIndex, setZakazSearchIndex,
    zakazResults, zakazLoading,
    deliveryAddress, setDeliveryAddress,
    selectedStoreId, setSelectedStoreId,
    cartItems, setCartItems,
    orderHistory,
    orderStep, setOrderStep,
    storesData, storesLoading,
    altSearchIndex, setAltSearchIndex,
    altSearchQuery, setAltSearchQuery,
    altSearchResults, setAltSearchResults,
    altSearchLoading,
    expandedAlts, setExpandedAlts,
    toggleTheme, togglePantryStaple,
    addCustomIngredient, removeCustomIngredient, toggleIngredient,
    toggleMyFridgeItem, addMyFridgeCustom, removeMyFridgeCustom,
    useMyFridgeForRecipe,
    toggleFavorite, isFavorite, addToHistory,
    updateSettings, toggleAllergy, toggleDiet,
    startCooking, nextCookingStep, prevCookingStep, setTimer, formatTime,
    shareRecipe, printRecipe,
    recalculateShoppingList, swapMeal,
    searchZakazProducts, fetchStores,
    startOrderPreparation, executeBatchSearch,
    updateCartItemQuantity, excludeCartItem, selectAlternative,
    searchAlternativeProduct, calculateCartTotal,
    finalizeOrder, completeOrder, markOrderDelivered, loadOrderFromHistory, deleteOrderFromHistory, bulkDeleteOrders, bulkDeleteFromHistory, bulkDeletePlans,
    zakazCookies, zakazPhone, zakazAuthStep, zakazOtp, isZakazConnected,
    zakazCartLoading, currentOrderId, setZakazAuthStep,
    connectZakaz, startZakazSignup, confirmZakazSignup,
    startZakazRecovery, confirmZakazRecovery, finishZakazRecovery,
    disconnectZakaz,
    cartEstimate, cartEstimateLoading, estimateCartPrice,
    getDayMacros, difficultyLabel,
    generateRecipe, generateMealPlan,
    toggleItem, clearFridge,
    addToPlanHistory, loadPlanFromHistory, deletePlanFromHistory,
    fridgePopupItems, fridgePopupChecked, showFridgePopup, setShowFridgePopup,
    toggleFridgePopupItem, confirmFridgePopup, dismissFridgePopup,
  }

  return (
    <AppContext.Provider value={value}>
      {isHydrated ? children : (
        <div className="min-h-screen" style={{ background: 'var(--app-bg, #0a0908)' }} />
      )}
    </AppContext.Provider>
  )
}
