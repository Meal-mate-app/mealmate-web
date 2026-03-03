import { UserSettings } from '@/types'

// Налаштування за замовчуванням
export const DEFAULT_SETTINGS: UserSettings = {
  allergies: [],
  dietaryRestrictions: [],
  dislikedIngredients: [],
  dailyCalorieGoal: 2000,
  dailyProteinGoal: 50,
  dailyCarbsGoal: 250,
  dailyFatGoal: 65,
}

// Опції для налаштувань
export const ALLERGY_OPTIONS = ['Глютен', 'Лактоза', 'Горіхи', 'Арахіс', 'Яйця', 'Соя', 'Риба', 'Молюски', 'Кунжут']
export const DIET_OPTIONS = ['Вегетаріанство', 'Веганство', 'Кето', 'Без глютену', 'Без лактози', 'Низькокалорійна', 'Високобілкова']

export const INGREDIENT_CATEGORIES = [
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

// Базові продукти які зазвичай є на кухні
export const PANTRY_STAPLES = [
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

export const DEFAULT_PANTRY = PANTRY_STAPLES.map(s => s.name)
export const PANTRY_STAPLE_NAMES = new Set(DEFAULT_PANTRY)

// Category visual styles - gradient backgrounds for ingredient emoji circles
export const CATEGORY_EMOJI_BG: Record<string, string> = {
  "М'ясо та птиця": 'from-rose-100 to-red-50 shadow-rose-200/50',
  'Риба та морепродукти': 'from-sky-100 to-cyan-50 shadow-sky-200/50',
  'Овочі': 'from-emerald-100 to-green-50 shadow-emerald-200/50',
  'Молочні продукти': 'from-amber-100 to-yellow-50 shadow-amber-200/50',
  'Крупи та борошно': 'from-orange-100 to-amber-50 shadow-orange-200/50',
  'Фрукти': 'from-pink-100 to-rose-50 shadow-pink-200/50',
  'Консерви та соуси': 'from-slate-100 to-gray-50 shadow-slate-200/50',
  'Спеції та приправи': 'from-yellow-100 to-orange-50 shadow-yellow-200/50',
}

export const STORAGE_KEYS = {
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
