import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8">
          <div className="max-w-2xl w-full bg-red-900/20 border border-red-500/50 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-400 mb-4">⚠️ 頁面載入錯誤</h1>
            <p className="text-white mb-4">抱歉，頁面載入時發生錯誤。請重新整理頁面或聯絡技術支援。</p>
            
            {this.state.error && (
              <div className="bg-black/30 rounded p-4 mb-4">
                <p className="text-red-300 font-mono text-sm">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            {this.state.errorInfo && (
              <details className="bg-black/30 rounded p-4">
                <summary className="text-blue-300 cursor-pointer mb-2">詳細錯誤資訊</summary>
                <pre className="text-gray-300 text-xs overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              重新載入頁面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
