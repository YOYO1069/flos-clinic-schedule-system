// 深藍星空風格色彩配置
// 參考圖片：深邃的深藍色背景，帶有星光點綴

export const starryTheme = {
  // 背景色系（深藍星空）
  background: {
    primary: 'from-slate-900 via-blue-950 to-slate-900', // 主背景漸層
    secondary: 'from-slate-800 via-blue-900 to-slate-800', // 次要背景
    card: 'bg-slate-900/40 backdrop-blur-xl', // 卡片背景（磨砂玻璃）
    hover: 'hover:bg-slate-800/60', // Hover 效果
  },

  // 文字色系（柔和不刺眼）
  text: {
    primary: 'text-slate-100', // 主要文字（淺灰白）
    secondary: 'text-slate-300', // 次要文字
    muted: 'text-slate-400', // 弱化文字
    accent: 'text-blue-300', // 強調文字（柔和藍）
  },

  // 邊框色系
  border: {
    default: 'border-slate-700/50', // 預設邊框
    hover: 'hover:border-slate-600', // Hover 邊框
    focus: 'focus:border-blue-500/50', // Focus 邊框
  },

  // 陰影效果
  shadow: {
    card: 'shadow-lg shadow-blue-900/20', // 卡片陰影
    hover: 'hover:shadow-xl hover:shadow-blue-800/30', // Hover 陰影
    glow: 'shadow-2xl shadow-blue-500/10', // 光暈效果
  },

  // 統計卡片色系（柔和不刺眼）
  stats: {
    blue: {
      bg: 'from-blue-900/40 to-blue-800/30',
      text: 'text-blue-200',
      icon: 'text-blue-300',
      border: 'border-blue-700/30',
    },
    indigo: {
      bg: 'from-indigo-900/40 to-indigo-800/30',
      text: 'text-indigo-200',
      icon: 'text-indigo-300',
      border: 'border-indigo-700/30',
    },
    purple: {
      bg: 'from-purple-900/40 to-purple-800/30',
      text: 'text-purple-200',
      icon: 'text-purple-300',
      border: 'border-purple-700/30',
    },
    slate: {
      bg: 'from-slate-800/40 to-slate-700/30',
      text: 'text-slate-200',
      icon: 'text-slate-300',
      border: 'border-slate-600/30',
    },
  },

  // 按鈕色系
  button: {
    primary: 'bg-blue-900/60 hover:bg-blue-800/70 text-blue-100 border-blue-700/50',
    secondary: 'bg-slate-800/60 hover:bg-slate-700/70 text-slate-100 border-slate-600/50',
    danger: 'bg-red-900/60 hover:bg-red-800/70 text-red-100 border-red-700/50',
  },

  // 輸入框色系
  input: {
    bg: 'bg-slate-900/60',
    border: 'border-slate-700/50',
    text: 'text-slate-100',
    placeholder: 'placeholder-slate-500',
    focus: 'focus:border-blue-500/50 focus:ring-blue-500/20',
  },
}

// 響應式斷點
export const breakpoints = {
  mobile: '640px',  // sm
  tablet: '768px',  // md
  desktop: '1024px', // lg
  wide: '1280px',   // xl
}

// 響應式類別
export const responsive = {
  // 容器
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  
  // 卡片網格
  cardGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
  
  // 表單網格
  formGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  
  // 文字大小
  heading: {
    h1: 'text-2xl sm:text-3xl lg:text-4xl',
    h2: 'text-xl sm:text-2xl lg:text-3xl',
    h3: 'text-lg sm:text-xl lg:text-2xl',
  },
  
  // 間距
  spacing: {
    section: 'py-6 sm:py-8 lg:py-12',
    card: 'p-4 sm:p-6 lg:p-8',
  },
}
