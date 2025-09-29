import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig } from 'wagmi'
import { Toaster } from 'react-hot-toast'

// Web3 配置
import { config } from './config/wagmi'

// 布局组件
import { Layout } from './components/layout/Layout'

// 页面组件
import { FarmPage } from './pages/FarmPage'
import { ShopPage } from './pages/ShopPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { LeaderboardDebug } from './pages/LeaderboardPage/LeaderboardDebug'
import { LeaderboardTest } from './pages/LeaderboardPage/LeaderboardTest'
import { ContractTestSimple } from './pages/LeaderboardPage/ContractTestSimple'
import { EventsPage } from './pages/EventsPage'
import { EventsTest } from './pages/EventsPage/EventsTest'
import { EventsDataTest } from './pages/EventsPage/EventsDataTest'
import { PaginationTest } from './pages/EventsPage/PaginationTest'
import { PaginationLogicTest } from './pages/EventsPage/PaginationLogicTest'
import { StatsPageSimple } from './pages/StatsPage/StatsPageSimple'
import { ProfilePage } from './pages/ProfilePage'

// 创建 Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // 对于 429 错误，使用指数退避重试
        if (error?.message?.includes('429')) {
          return failureCount < 5
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<FarmPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/leaderboard-debug" element={<LeaderboardDebug />} />
              <Route path="/leaderboard-test" element={<LeaderboardTest />} />
              <Route path="/contract-test" element={<ContractTestSimple />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events-test" element={<EventsTest />} />
              <Route path="/events-data-test" element={<EventsDataTest />} />
              <Route path="/pagination-test" element={<PaginationTest />} />
              <Route path="/pagination-logic-test" element={<PaginationLogicTest />} />
              <Route path="/stats" element={<StatsPageSimple />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Layout>

          {/* 全局通知组件 */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                style: {
                  border: '1px solid #10b981',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </QueryClientProvider>
    </WagmiConfig>
  )
}

export default App