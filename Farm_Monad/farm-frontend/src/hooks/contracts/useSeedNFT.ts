import { useContractRead, useAccount } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { SeedNFTABI } from '@/contracts'
import { useMemo } from 'react'

// 种子信息类型
export interface SeedInfo {
  cropType: number
  rarity: number
  growthStage: number
  growthStartTime: number
  baseGrowthTime: number
  maturedAt: number
  boostersApplied: number
}

// 用户种子NFT类型
export interface UserSeedNFT {
  tokenId: number
  seedInfo: SeedInfo
}

/**
 * 获取用户拥有的种子NFT数量
 */
export function useUserSeedBalance() {
  const { address } = useAccount()
  
  return useContractRead({
    address: CONTRACTS.SeedNFT,
    abi: SeedNFTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  })
}

/**
 * 获取总供应量
 */
export function useTotalSupply() {
  return useContractRead({
    address: CONTRACTS.SeedNFT,
    abi: SeedNFTABI,
    functionName: 'totalSupply',
  })
}

/**
 * 获取用户拥有的所有种子NFT
 */
export function useUserSeeds() {
  const { address } = useAccount()
  
  // 调试信息已移除
  
  // 获取总供应量
  const { data: totalSupply } = useTotalSupply()
  
  // 获取所有可能的Token ID（从0到totalSupply-1）
  const allTokenIds = useMemo(() => {
    if (!totalSupply || totalSupply === 0n) return []
    return Array.from({ length: Number(totalSupply) }, (_, i) => i)
  }, [totalSupply])
  
  // 检查每个Token ID是否属于当前用户
  const ownershipQueries = allTokenIds.map((tokenId) => 
    useContractRead({
      address: CONTRACTS.SeedNFT,
      abi: SeedNFTABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
      enabled: !!address && !!totalSupply && totalSupply > 0n,
    })
  )
  
  // 获取用户拥有的Token ID
  const tokenIds = useMemo(() => {
    if (!address || !ownershipQueries.length) return []
    
    return allTokenIds.filter((_, index) => {
      const query = ownershipQueries[index]
      return query.data === address
    })
  }, [address, allTokenIds, ownershipQueries])
  
  // 调试信息已移除
  
  // 获取每个Token ID的详细信息
  const seedQueries = tokenIds.map((tokenId) => 
    useContractRead({
      address: CONTRACTS.SeedNFT,
      abi: SeedNFTABI,
      functionName: 'getSeedInfo',
      args: [BigInt(tokenId)],
      enabled: !!address && tokenIds.length > 0,
    })
  )
  
  // 组合数据 - 只返回未被种植的种子
  const userSeeds = useMemo(() => {
    if (!address || tokenIds.length === 0) return []
    
    return tokenIds.map((tokenId, i) => {
      const seedInfo = seedQueries[i]?.data
      if (!seedInfo) return null
      
      const rawCropType = Number(seedInfo.cropType)
      const baseGrowthTime = Number(seedInfo.baseGrowthTime)
      const growthStartTime = Number(seedInfo.growthStartTime)
      
      // 过滤掉已经被种植的种子（growthStartTime > 0 表示已种植）
      if (growthStartTime > 0) {
        return null
      }
      
      // 前端修复：通过baseGrowthTime判断正确的作物类型
      // 合约bug：购买南瓜但返回错误的cropType
      let correctedCropType = rawCropType
      
      // 根据baseGrowthTime修正cropType
      if (baseGrowthTime === 7200) { // 120分钟 = 南瓜
        correctedCropType = 2 // 南瓜
      } else if (baseGrowthTime === 5400) { // 90分钟 = 玉米
        correctedCropType = 1 // 玉米
      } else if (baseGrowthTime === 3600) { // 60分钟 = 小麦
        correctedCropType = 0 // 小麦
      } else if (baseGrowthTime === 4500) { // 75分钟 = 草莓
        correctedCropType = 3 // 草莓
      } else if (baseGrowthTime === 6000) { // 100分钟 = 葡萄
        correctedCropType = 4 // 葡萄
      } else if (baseGrowthTime === 6600) { // 110分钟 = 西瓜
        correctedCropType = 5 // 西瓜
      }
      
      // 特殊修复：如果用户最近购买了南瓜(0.002 MON)，但所有数据都显示为玉米
      // 这可能是合约的严重bug，我们需要通过其他方式判断
      // 暂时无法通过现有数据修复，因为合约返回的所有数据都是错误的
      
      // 调试信息
      if (rawCropType !== correctedCropType) {
        console.log(`🔧 修复作物类型: Token ${tokenId} - 原始: ${rawCropType}, 修正: ${correctedCropType}, 成长时间: ${baseGrowthTime}秒`)
      }
      
      return {
        tokenId,
        seedInfo: {
          cropType: correctedCropType,
          rarity: Number(seedInfo.rarity),
          growthStage: Number(seedInfo.growthStage),
          growthStartTime: Number(seedInfo.growthStartTime),
          baseGrowthTime: Number(seedInfo.baseGrowthTime),
          maturedAt: Number(seedInfo.maturedAt),
          boostersApplied: Number(seedInfo.boostersApplied),
        } as SeedInfo
      } as UserSeedNFT
    }).filter(Boolean) as UserSeedNFT[]
  }, [address, tokenIds, seedQueries])
  
  return {
    userSeeds,
    isLoading: seedQueries.some(query => query.isLoading),
    error: seedQueries.find(query => query.error)?.error,
  }
}

/**
 * 获取特定种子的详细信息
 */
export function useSeedInfo(tokenId: number) {
  return useContractRead({
    address: CONTRACTS.SeedNFT,
    abi: SeedNFTABI,
    functionName: 'getSeedInfo',
    args: [BigInt(tokenId)],
  })
}
