// Recipe types
export interface Ingredient {
  name: string
  amount: string
  unit: string
  category: 'vegetables' | 'fruits' | 'meat' | 'fish' | 'dairy' | 'grains' | 'spices' | 'other'
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

export interface Recipe {
  id: string
  title: string
  description: string
  prepTime: number // minutes
  cookTime: number // minutes
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  tags: string[]
  ingredients: Ingredient[]
  instructions: string[]
  tips?: string[]
  nutrition: NutritionInfo
  imagePrompt?: string
  // Catalog fields
  avgRating?: number
  ratingCount?: number
  isPublic?: boolean
}

// Meal Plan types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealSlot {
  type: MealType
  recipe: Recipe
}

export interface DayPlan {
  date: string
  meals: MealSlot[]
  totalNutrition: NutritionInfo
}

export interface WeekPlan {
  id: string
  startDate: string
  days: DayPlan[]
  shoppingList: ShoppingItem[]
  createdAt: string
}

// Shopping List types
export interface ShoppingItem {
  ingredient: string
  amount: string
  unit: string
  category: Ingredient['category']
  checked: boolean
  recipes: string[] // recipe titles that need this ingredient
}

export interface ShoppingList {
  id: string
  items: ShoppingItem[]
  createdAt: string
  forPlan?: string // week plan id
}

// User Preferences
export interface UserPreferences {
  peopleCount: number
  dietaryRestrictions: string[]
  allergies: string[]
  dislikedIngredients: string[]
  cuisinePreferences: string[]
  budget: 'low' | 'medium' | 'high'
  cookingTime: 'quick' | 'medium' | 'any' // quick = < 30min
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
}

// Generation Request types
export interface GenerateRecipeRequest {
  preferences: UserPreferences
  mealType?: MealType
  specificRequest?: string // e.g., "something with chicken"
  existingIngredients?: string[] // what's already in the fridge
}

export interface GenerateMealPlanRequest {
  preferences: UserPreferences
  days: number // 1-7
  mealsPerDay: MealType[]
  existingIngredients?: string[] // fridge contents
}

// Delivery / ordering types
export interface ZakazProduct {
  title: string
  ean: string
  price: number
  unit: string
  in_stock: boolean
  img: string | null
  web_url: string
}

export interface CartItem {
  shoppingItem: ShoppingItem
  selectedProduct: ZakazProduct | null
  alternatives: ZakazProduct[]
  quantity: number
  excluded: boolean
}

export interface DeliveryAddress {
  city: string
  address: string
}

export type DeliveryService = 'zakaz' // Phase 2: | 'silpo' | 'glovo'

export interface StoreOption {
  id: string
  name: string
  chain: string
}

export type OrderStatus = 'in_progress' | 'completed'

export interface PreparedOrder {
  id: string
  createdAt: string
  service: DeliveryService
  storeId: string
  storeName: string
  city: string
  items: CartItem[]
  totalEstimate: number
  planId?: string
  status?: OrderStatus
}

// User Settings
export interface UserSettings {
  allergies: string[]
  dietaryRestrictions: string[]
  dislikedIngredients: string[]
  dailyCalorieGoal: number
  dailyProteinGoal: number
  dailyCarbsGoal: number
  dailyFatGoal: number
}
