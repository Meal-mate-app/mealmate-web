/* eslint-disable @typescript-eslint/no-explicit-any */
import { Recipe, WeekPlan, ZakazProduct, PreparedOrder, StoreOption } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api/v1'

// --- Token management ---

let accessToken: string | null = null

export function getToken(): string | null {
  if (accessToken) return accessToken
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('mealmate-token')
  }
  return accessToken
}

export function setToken(token: string | null) {
  accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('mealmate-token', token)
      // Sync to cookie for middleware auth checks
      document.cookie = `mealmate-token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    } else {
      localStorage.removeItem('mealmate-token')
      localStorage.removeItem('mealmate-refresh-token')
      localStorage.removeItem('mealmate-user')
      // Clear auth cookie
      document.cookie = 'mealmate-token=; path=/; max-age=0'
    }
  }
}

export function setRefreshToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mealmate-refresh-token', token)
  }
}

export function getUser(): { uuid: string; email: string; name?: string } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('mealmate-user')
  return raw ? JSON.parse(raw) : null
}

function setUser(user: { uuid: string; email: string; name?: string } | null) {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('mealmate-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('mealmate-user')
    }
  }
}

// --- Fetch wrapper ---

async function apiFetch<T>(path: string, options: RequestInit = {}, skipAuthRedirect = false): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401 && !skipAuthRedirect) {
      setToken(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || `API error ${res.status}`) as Error & { status?: number }
    err.status = res.status
    throw err
  }

  const json = await res.json()
  // Backend wraps responses in { data: ... }
  return json.data !== undefined ? json.data : json
}

// --- Auth ---

export interface AuthResponse {
  user: { uuid: string; email: string; name?: string }
  accessToken: string
  refreshToken: string
}

export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
  setToken(data.accessToken)
  setRefreshToken(data.refreshToken)
  setUser(data.user)
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.accessToken)
  setRefreshToken(data.refreshToken)
  setUser(data.user)
  return data
}

export function logout() {
  setToken(null)
  setUser(null)
}

export async function getProfile() {
  return apiFetch<{ uuid: string; email: string; name?: string }>('/auth/me')
}

export async function getCoinBalance(): Promise<number> {
  const data = await apiFetch<{ coins: number }>('/auth/coins')
  return data.coins
}

export async function validateToken(): Promise<{ uuid: string; email: string; name?: string } | null> {
  if (!getToken()) return null
  try {
    return await apiFetch<{ uuid: string; email: string; name?: string }>('/auth/me', {}, true)
  } catch {
    setToken(null)
    return null
  }
}

// --- Response mapping helpers ---

function mapRecipe(raw: any): Recipe {
  return {
    id: raw.uuid || raw.id,
    title: raw.title || '',
    description: raw.description || '',
    prepTime: typeof raw.prepTime === 'number' ? raw.prepTime : parseInt(raw.prepTime) || 0,
    cookTime: typeof raw.cookTime === 'number' ? raw.cookTime : parseInt(raw.cookTime) || 0,
    servings: raw.servings || 2,
    difficulty: raw.difficulty || 'medium',
    cuisine: raw.cuisine || '',
    tags: raw.tags || [],
    ingredients: raw.ingredients || [],
    instructions: (raw.instructions || []).map((s: unknown) => {
      if (typeof s === 'string') return s
      if (s && typeof s === 'object') {
        const obj = s as Record<string, unknown>
        // Try common string keys first (skip numeric 'step' field which is the step number)
        const candidates = [obj.text, obj.description, obj.instruction, obj.content]
        if (typeof obj.step === 'string') candidates.unshift(obj.step)
        const direct = candidates.find(v => typeof v === 'string' && (v as string).length > 0)
        if (typeof direct === 'string') return direct
        // Find first long string value in the object
        const strVal = Object.values(obj).find(v => typeof v === 'string' && (v as string).length > 3)
        if (typeof strVal === 'string') return strVal
        return JSON.stringify(s)
      }
      return String(s)
    }),
    tips: raw.tips,
    nutrition: raw.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
    imagePrompt: raw.imagePrompt,
  }
}

function mapWeekPlan(raw: any): WeekPlan {
  const rawList = raw.shoppingList || raw.shopping_list || []
  const rawDays = raw.days || []
  return {
    id: raw.uuid || raw.id,
    startDate: raw.startDate || raw.start_date || '',
    days: rawDays.map((day: any) => ({
      ...day,
      meals: (day.meals || []).map((meal: any) => ({
        ...meal,
        recipe: meal.recipe ? mapRecipe(meal.recipe) : meal.recipe,
      })),
    })),
    shoppingList: rawList.map((item: any) => ({
      ingredient: item.ingredient || item.name || '',
      amount: item.amount || '',
      unit: item.unit || '',
      category: item.category || 'Інше',
      checked: item.checked || false,
      recipes: item.recipes || [],
    })),
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
  }
}

// --- Recipes ---

export async function generateRecipe(body: {
  ingredients: string[]
  peopleCount: number
  dietaryRestrictions?: string[]
  allergies?: string[]
  dislikedIngredients?: string[]
  mealType?: string
  specificRequest?: string
  cuisinePreferences?: string[]
  cookingTime?: string
  skillLevel?: string
  calorieGoal?: number
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
}): Promise<Recipe> {
  const raw = await apiFetch('/recipes/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return mapRecipe(raw)
}

export async function getFavorites(): Promise<Recipe[]> {
  const raw = await apiFetch<any[]>('/recipes/favorites')
  return raw.map(mapRecipe)
}

export async function getHistory(): Promise<Recipe[]> {
  const raw = await apiFetch<any[]>('/recipes/history')
  return raw.map(mapRecipe)
}

export async function saveRecipe(recipe: Recipe): Promise<Recipe> {
  const raw = await apiFetch('/recipes', {
    method: 'POST',
    body: JSON.stringify({
      title: recipe.title,
      description: recipe.description,
      prepTime: String(recipe.prepTime),
      cookTime: String(recipe.cookTime),
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      tags: recipe.tags,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tips: recipe.tips,
      nutrition: recipe.nutrition,
    }),
  })
  return mapRecipe(raw)
}

export async function toggleFavoriteApi(recipeId: string): Promise<Recipe> {
  const raw = await apiFetch(`/recipes/${recipeId}/favorite`, {
    method: 'PATCH',
  })
  return mapRecipe(raw)
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await apiFetch(`/recipes/${recipeId}`, { method: 'DELETE' })
}

export async function batchDeleteRecipes(ids: string[]): Promise<void> {
  await apiFetch('/recipes/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
}

// --- Meal Plans ---

export async function generateMealPlan(body: {
  days: number
  mealsPerDay: string[]
  ingredients?: string[]
  peopleCount?: number
  dietaryRestrictions?: string[]
  allergies?: string[]
  dislikedIngredients?: string[]
  cuisinePreferences?: string[]
  cookingTime?: string
  skillLevel?: string
  dailyCalorieGoal?: number
  dailyProteinGoal?: number
  dailyCarbsGoal?: number
  dailyFatGoal?: number
  specificRequest?: string
}): Promise<WeekPlan> {
  const raw = await apiFetch('/meal-plans/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return mapWeekPlan(raw)
}

export async function getMealPlans(): Promise<WeekPlan[]> {
  const raw = await apiFetch<any[]>('/meal-plans')
  return raw.map(mapWeekPlan)
}

export async function getMealPlan(planId: string): Promise<WeekPlan> {
  const raw = await apiFetch(`/meal-plans/${planId}`)
  return mapWeekPlan(raw)
}

export async function deleteMealPlan(planId: string): Promise<void> {
  await apiFetch(`/meal-plans/${planId}`, { method: 'DELETE' })
}

export async function batchDeleteMealPlans(ids: string[]): Promise<void> {
  await apiFetch('/meal-plans/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
}

// --- Fridge ---

export interface FridgeItem {
  name: string
  emoji?: string
  category?: string
  isCustom?: boolean
}

export async function getFridge(): Promise<FridgeItem[]> {
  return apiFetch<FridgeItem[]>('/fridge')
}

export async function syncFridge(items: FridgeItem[]): Promise<FridgeItem[]> {
  return apiFetch<FridgeItem[]>('/fridge', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
}

export async function clearFridge(): Promise<void> {
  await apiFetch('/fridge', { method: 'DELETE' })
}

// --- Settings ---

export interface UserSettingsApi {
  allergies?: string[]
  dietaryRestrictions?: string[]
  dislikedIngredients?: string[]
  dailyCalorieGoal?: number
  dailyProteinGoal?: number
  dailyCarbsGoal?: number
  dailyFatGoal?: number
  deliveryCity?: string
  deliveryAddress?: string
  zakazCookies?: string | null
  zakazPhone?: string | null
}

export async function getSettings(): Promise<UserSettingsApi> {
  return apiFetch<UserSettingsApi>('/settings')
}

export async function updateSettings(settings: UserSettingsApi): Promise<UserSettingsApi> {
  return apiFetch<UserSettingsApi>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}

// --- Orders ---

export async function getOrders(): Promise<PreparedOrder[]> {
  const raw = await apiFetch<any[]>('/orders')
  return raw.map((o: any) => ({
    ...o,
    id: o.uuid || o.id,
  }))
}

export async function saveOrder(order: PreparedOrder): Promise<PreparedOrder> {
  const raw = await apiFetch<any>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      service: order.service,
      storeId: order.storeId,
      storeName: order.storeName,
      city: order.city,
      items: order.items,
      totalEstimate: order.totalEstimate,
      planId: order.planId,
    }),
  })
  return { ...raw, id: raw.uuid || raw.id }
}

export async function deleteOrder(orderId: string): Promise<void> {
  await apiFetch(`/orders/${orderId}`, { method: 'DELETE' })
}

export async function batchDeleteOrders(ids: string[]): Promise<void> {
  await apiFetch('/orders/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
}

// --- External (Zakaz.ua) ---

export async function searchProducts(query: string, storeId?: string): Promise<ZakazProduct[]> {
  const params = new URLSearchParams({ q: query })
  if (storeId) params.set('store', storeId)
  return apiFetch<ZakazProduct[]>(`/external/search-products?${params}`)
}

export async function batchSearchProducts(
  items: string[],
  storeId?: string,
): Promise<Record<string, ZakazProduct[]>> {
  return apiFetch<Record<string, ZakazProduct[]>>('/external/batch-search-products', {
    method: 'POST',
    body: JSON.stringify({ items, storeId }),
  })
}

export async function getStores(): Promise<Record<string, { name: string; stores: StoreOption[] }>> {
  const raw = await apiFetch<any>('/external/stores')
  return raw.cities || raw
}

// --- Zakaz.ua Cart ---

export async function estimateZakazCart(
  storeId: string,
  items: { ean: string; amount: number }[],
  chain?: string,
): Promise<{
  success: boolean
  data?: { subtotal: number; total: number; totalWeight: number; currency: string }
  error?: string
}> {
  return apiFetch('/external/estimate-cart', {
    method: 'POST',
    body: JSON.stringify({ storeId, items, chain }),
  })
}

// --- Zakaz.ua Auth & Cart ---

export async function zakazLogin(
  phone: string,
  password: string,
  chain?: string,
): Promise<{ success: boolean; cookies?: string; error?: string }> {
  return apiFetch('/external/zakaz-login', {
    method: 'POST',
    body: JSON.stringify({ phone, password, chain }),
  })
}

export async function zakazSignup(
  phone: string,
  captchaToken: string,
  chain?: string,
): Promise<{ success: boolean; error?: string }> {
  return apiFetch('/external/zakaz-signup', {
    method: 'POST',
    body: JSON.stringify({ phone, captchaToken, chain }),
  })
}

export async function zakazConfirmSignup(
  phone: string,
  otp: string,
  chain?: string,
): Promise<{ success: boolean; cookies?: string; error?: string }> {
  return apiFetch('/external/zakaz-confirm-signup', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, chain }),
  })
}

export async function zakazPasswordRecovery(
  phone: string,
  captchaToken: string,
  chain?: string,
): Promise<{ success: boolean; error?: string }> {
  return apiFetch('/external/zakaz-password-recovery', {
    method: 'POST',
    body: JSON.stringify({ phone, captchaToken, chain }),
  })
}

export async function zakazConfirmRecovery(
  phone: string,
  otp: string,
  chain?: string,
): Promise<{ success: boolean; error?: string }> {
  return apiFetch('/external/zakaz-confirm-recovery', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, chain }),
  })
}

export async function zakazCreatePassword(
  phone: string,
  otp: string,
  password: string,
  chain?: string,
): Promise<{ success: boolean; cookies?: string; error?: string }> {
  return apiFetch('/external/zakaz-create-password', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, password, chain }),
  })
}

export async function zakazAddToCart(
  cookies: string,
  storeId: string,
  items: { ean: string; amount: number }[],
  chain?: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  return apiFetch('/external/zakaz-add-to-cart', {
    method: 'POST',
    body: JSON.stringify({ cookies, storeId, items, chain }),
  })
}

export async function zakazValidateSession(
  cookies: string,
  chain?: string,
): Promise<{ valid: boolean; error?: string }> {
  return apiFetch('/external/zakaz-validate-session', {
    method: 'POST',
    body: JSON.stringify({ cookies, chain }),
  })
}

// --- Init (single request for all data) ---

export interface InitData {
  favorites: Recipe[]
  history: Recipe[]
  orders: PreparedOrder[]
  plans: WeekPlan[]
  fridge: FridgeItem[]
  settings: UserSettingsApi | null
  coins: number
}

export async function getInit(): Promise<InitData> {
  const raw = await apiFetch<any>('/init')
  return {
    favorites: (raw.favorites || []).map(mapRecipe),
    history: (raw.history || []).map(mapRecipe),
    orders: (raw.orders || []).map((o: any) => ({ ...o, id: o.uuid || o.id })),
    plans: (raw.plans || []).map(mapWeekPlan),
    fridge: raw.fridge || [],
    settings: raw.settings || null,
    coins: raw.coins ?? 0,
  }
}

// --- Daily coins ---

export async function claimDailyCoins(): Promise<{ claimed: boolean; coins: number }> {
  return apiFetch('/auth/claim-daily-coins', { method: 'POST' })
}

// --- Payment / Subscription ---

export type PriceType = 'pro_monthly' | 'pro_yearly' | 'coins_15' | 'coins_50' | 'coins_150'

export async function createCheckoutSession(priceType: PriceType): Promise<{ url: string }> {
  return apiFetch('/payment/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ priceType }),
  })
}

export async function createCustomerPortal(): Promise<{ url: string }> {
  return apiFetch('/payment/customer-portal', { method: 'POST' })
}

export async function getSubscription(): Promise<{
  uuid: string
  userId: string
  status: string
  stripePriceId: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
} | null> {
  return apiFetch('/payment/subscription')
}

// --- Check if logged in ---

export function isLoggedIn(): boolean {
  return !!getToken()
}
