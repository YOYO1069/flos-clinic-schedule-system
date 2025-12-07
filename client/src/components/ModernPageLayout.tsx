import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ModernPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  headerActions?: ReactNode;
}

export function ModernPageLayout({
  children,
  title,
  subtitle,
  onBack,
  showBackButton = true,
  headerActions
}: ModernPageLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 動態背景層 */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-pink-400/20 via-transparent to-transparent"></div>
      
      {/* 裝飾性圖形 */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* 內容層 */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 頭部區域 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button 
                  variant="outline" 
                  onClick={onBack || (() => window.history.back())}
                  className="bg-white/90 backdrop-blur-md border-2 border-white/50 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl font-semibold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  上一頁
                </Button>
              )}
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-2xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-lg md:text-xl text-white/90 font-semibold drop-shadow-lg mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>

          {/* 主要內容區域 */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// 現代化卡片組件
interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function ModernCard({ children, className = '', hover = true }: ModernCardProps) {
  return (
    <div className={`
      group relative overflow-hidden border-0 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl
      ${hover ? 'hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]' : ''}
      ${className}
    `}>
      {/* 卡片背景裝飾 */}
      {hover && (
        <>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </>
      )}
      
      {/* 內容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// 現代化按鈕組件
interface ModernButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function ModernButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = ''
}: ModernButtonProps) {
  const variants = {
    primary: 'from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 hover:shadow-purple-500/50',
    secondary: 'from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 hover:shadow-blue-500/50',
    success: 'from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 hover:shadow-emerald-500/50',
    danger: 'from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 hover:shadow-red-500/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative bg-gradient-to-r ${variants[variant]}
        text-white shadow-2xl transition-all duration-300 
        ${sizes[size]} font-bold rounded-xl border-2 border-white/30 
        hover:scale-105 hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
      <span className="relative z-10">{children}</span>
    </button>
  );
}
