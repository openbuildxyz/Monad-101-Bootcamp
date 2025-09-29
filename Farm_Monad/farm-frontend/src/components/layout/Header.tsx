import { Link, useLocation } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'
import { ChevronDownIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useState } from 'react'

// import { Button } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { formatAddress, formatEth, formatKind } from '@/utils'
import { useKindBalance, useNativeBalance } from '@/hooks/web3'

interface NavigationItem {
  name: string
  href: string
  icon?: string
}

const navigation: NavigationItem[] = [
  { name: '农场', href: '/' },
  { name: '商店', href: '/shop' },
  { name: '排行榜', href: '/leaderboard' },
  { name: '事件', href: '/events' },
  { name: '统计', href: '/stats' },
  { name: '个人', href: '/profile' },
]

export function Header() {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  // 获取用户余额
  const { data: nativeBalance } = useNativeBalance(address)
  const { data: kindBalance } = useKindBalance(address)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo 和品牌 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌾</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Farm 3.0</span>
            </Link>
          </div>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'text-primary-600 border-b-2 border-primary-600 pb-1'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 用户信息和钱包连接 */}
          <div className="flex items-center space-x-4">
            {isConnected && address ? (
              <>
                {/* 余额显示 */}
                <div className="hidden sm:flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-lg">
                    <span className="text-gray-600">MON:</span>
                    <span className="font-medium">
                      {nativeBalance ? formatEth(nativeBalance.value, 4) : '0.0000'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-lg">
                    <span className="text-primary-600">KIND:</span>
                    <span className="font-medium text-primary-700">
                      {kindBalance ? formatKind(kindBalance, 2) : '0.00'}
                    </span>
                  </div>
                </div>

                {/* 用户菜单 */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {address.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{formatAddress(address)}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* 下拉菜单 */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        个人中心
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <div className="px-4 py-2 text-xs text-gray-500">余额信息</div>
                      <div className="px-4 py-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">MON:</span>
                          <span className="font-medium">
                            {nativeBalance ? formatEth(nativeBalance.value, 6) : '0.000000'}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600">KIND:</span>
                          <span className="font-medium">
                            {kindBalance ? formatKind(kindBalance, 4) : '0.0000'}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        type="button"
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          disconnect()
                          setIsProfileMenuOpen(false)
                        }}
                      >
                        断开钱包
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <WalletConnection />
            )}

            {/* 移动端菜单按钮 */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* 移动端余额显示 */}
              {isConnected && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 mb-2">钱包余额</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">MON:</span>
                      <span className="font-medium">
                        {nativeBalance ? formatEth(nativeBalance.value, 4) : '0.0000'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">KIND:</span>
                      <span className="font-medium">
                        {kindBalance ? formatKind(kindBalance, 2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}