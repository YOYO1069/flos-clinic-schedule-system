/**
 * 色彩主題配置
 * 提供豐富的漸層色彩和視覺效果
 */

export const gradients = {
  // 主要背景漸層
  primary: 'from-indigo-950 via-purple-900 to-pink-950',
  secondary: 'from-blue-950 via-indigo-900 to-purple-950',
  tertiary: 'from-purple-950 via-pink-900 to-rose-950',
  
  // 卡片漸層
  card: {
    blue: 'from-blue-500/20 to-indigo-600/20',
    purple: 'from-purple-500/20 to-pink-600/20',
    green: 'from-emerald-500/20 to-teal-600/20',
    orange: 'from-orange-500/20 to-red-600/20',
    pink: 'from-pink-500/20 to-rose-600/20',
    cyan: 'from-cyan-500/20 to-blue-600/20',
  },
  
  // 按鈕漸層
  button: {
    primary: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
    success: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
    danger: 'from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700',
    warning: 'from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700',
    purple: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
  },
  
  // 狀態漸層
  status: {
    completed: 'from-emerald-500 to-green-600',
    pending: 'from-amber-500 to-orange-600',
    cancelled: 'from-gray-500 to-slate-600',
    active: 'from-blue-500 to-indigo-600',
  },
  
  // 統計卡片漸層
  stats: {
    total: 'from-blue-500 to-blue-600',
    active: 'from-emerald-500 to-emerald-600',
    new: 'from-orange-500 to-orange-600',
    visits: 'from-purple-500 to-purple-600',
  }
}

export const glowEffects = {
  blue: 'shadow-lg shadow-blue-500/50',
  purple: 'shadow-lg shadow-purple-500/50',
  pink: 'shadow-lg shadow-pink-500/50',
  green: 'shadow-lg shadow-emerald-500/50',
  orange: 'shadow-lg shadow-orange-500/50',
}

export const hoverEffects = {
  lift: 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
  glow: 'hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300',
  brighten: 'hover:brightness-110 transition-all duration-300',
}

export const borderGradients = {
  rainbow: 'border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
  blue: 'border-2 border-transparent bg-gradient-to-r from-blue-400 to-indigo-600',
  purple: 'border-2 border-transparent bg-gradient-to-r from-purple-400 to-pink-600',
}

export const textGradients = {
  rainbow: 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
  blue: 'bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent',
  purple: 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent',
  gold: 'bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent',
}
