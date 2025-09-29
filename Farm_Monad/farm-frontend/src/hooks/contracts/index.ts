// 合约交互 hooks 统一导出
export * from './useLandInfo'
export * from './useLandInfoOptimized'
export * from './useFarmActions'
export * from './useSeedNFT'
export * from './useTodayHelpCount'

// 旧的排行榜Hooks (模拟数据)
export {
  useCropLeaderboard as useOldCropLeaderboard,
  useKindnessLeaderboard as useOldKindnessLeaderboard,
  useLeaderboardStats as useOldLeaderboardStats
} from './useLeaderboard'

// 新增的真实合约数据Hooks
export * from './useGameEvents'
export * from './useRealLeaderboard'
export * from './useGlobalStats'

// 简化的排行榜Hooks (避免合约调用问题)
export * from './useSimpleLeaderboard'

// 修复的真实排行榜Hooks (使用真实合约数据)
export * from './useRealLeaderboardFixed'

// 简化的真实排行榜Hooks (避免复杂查询)
export * from './useSimpleRealLeaderboard'

// 简化的事件Hooks (避免复杂查询)
export * from './useSimpleEvents'

// 分页事件Hooks (每页20个事件)
export * from './usePaginatedEvents'

// 分页排行榜Hooks (每页20条数据)
export * from './usePaginatedLeaderboard'

// 实时土地信息Hook (快速更新)
export * from './useLandInfoRealTime'