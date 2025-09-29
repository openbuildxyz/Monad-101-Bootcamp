import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'
// import type { BoosterType } from '@/types/game'

/**
 * 占用土地种植
 */
export function useClaimLand(landId?: number, tokenId?: number) {
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'claimLand',
    args: landId !== undefined && tokenId !== undefined ? [BigInt(landId), BigInt(tokenId)] : undefined,
    enabled: landId !== undefined && tokenId !== undefined,
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      console.log('Plant transaction successful')
      toast.success('种植成功!')
    },
    onError: (error) => {
      console.error('Plant transaction failed:', error)
      toast.error(`种植失败: ${error.message}`)
    }
  })
}

/**
 * 收获作物
 */
export function useHarvestCrop(landId?: number) {
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'harvestCrop',
    args: landId !== undefined ? [BigInt(landId)] : undefined,
    enabled: landId !== undefined,
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('收获成功!')
    },
    onError: (error) => {
      toast.error(`收获失败: ${error.message}`)
    }
  })
}

/**
 * 偷取作物
 */
export function useStealCrop(landId?: number) {
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'stealCrop',
    args: landId !== undefined ? [BigInt(landId)] : undefined,
    enabled: landId !== undefined,
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('偷菜成功!')
    },
    onError: (error) => {
      toast.error(`偷菜失败: ${error.message}`)
    }
  })
}

/**
 * 使用道具
 */
export function useApplyBooster(landId?: number, boosterType?: number, payWithKind?: boolean) {
  // 根据boosterType计算正确的支付金额
  const getBoosterValue = (boosterType: number, payWithKind: boolean) => {
    if (payWithKind) return undefined // KIND支付不需要ETH
    
    // 根据合约中的价格配置
    switch (boosterType) {
      case 0: // Watering
        return BigInt(100000000000000) // 0.0001 ETH
      case 1: // Fertilizing  
        return BigInt(200000000000000) // 0.0002 ETH
      default:
        return BigInt(100000000000000) // 默认0.0001 ETH
    }
  }

  const { config } = usePrepareContractWrite({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'applyBooster',
    args: landId !== undefined && boosterType !== undefined && payWithKind !== undefined ? [BigInt(landId), boosterType, payWithKind] : undefined,
    value: landId !== undefined && boosterType !== undefined && payWithKind !== undefined ? getBoosterValue(boosterType, payWithKind) : undefined,
    enabled: landId !== undefined && boosterType !== undefined && payWithKind !== undefined,
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('道具使用成功!')
    },
    onError: (error) => {
      toast.error(`道具使用失败: ${error.message}`)
    }
  })
}

/**
 * 帮助他人
 */
export function useHelpOther(landId?: number, boosterType?: number, payWithKind?: boolean) {
  console.log('=== useHelpOther 被调用 ===')
  console.log('参数:', { landId, boosterType, payWithKind })
  
  // 根据boosterType计算正确的支付金额
  const getBoosterValue = (boosterType: number, payWithKind: boolean) => {
    if (payWithKind) return undefined // KIND支付不需要ETH
    
    // 根据合约中的价格配置
    switch (boosterType) {
      case 0: // Watering
        return BigInt(100000000000000) // 0.0001 ETH
      case 1: // Fertilizing  
        return BigInt(200000000000000) // 0.0002 ETH
      default:
        return BigInt(100000000000000) // 默认0.0001 ETH
    }
  }

  const { config, error: prepareError, isError: isPrepareError } = usePrepareContractWrite({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'helpOther',
    args: landId !== undefined && boosterType !== undefined && payWithKind !== undefined ? [BigInt(landId), boosterType, payWithKind] : undefined,
    value: landId !== undefined && boosterType !== undefined && payWithKind !== undefined ? getBoosterValue(boosterType, payWithKind) : undefined,
    enabled: landId !== undefined && boosterType !== undefined && payWithKind !== undefined,
  })

  console.log('useHelpOther prepare 结果:', {
    config: !!config,
    prepareError,
    isPrepareError,
    enabled: landId !== undefined && boosterType !== undefined && payWithKind !== undefined
  })

  const result = useContractWrite({
    ...config,
    onSuccess: () => {
      console.log('✅ helpOther 合约调用成功')
      toast.success('帮助成功! 获得 1 KIND 奖励!')
    },
    onError: (error) => {
      console.log('❌ helpOther 合约调用失败:', error)
      toast.error(`帮助失败: ${error.message}`)
    }
  })

  console.log('useHelpOther 最终结果:', {
    write: !!result.write,
    isLoading: result.isLoading,
    error: result.error,
    isError: result.isError,
    isSuccess: result.isSuccess
  })

  return result
}

/**
 * 推进成长
 */
export function useAdvanceGrowth(landId?: number) {
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'checkAndAdvanceGrowth',
    args: landId !== undefined ? [BigInt(landId)] : undefined,
    enabled: landId !== undefined,
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('成长进度已更新!')
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`)
    }
  })
}

/**
 * 购买种子 (原生代币)
 */
export function useBuySeedWithNative() {
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'buySeedWithNative',
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('种子购买成功!')
    },
    onError: (error) => {
      toast.error(`购买失败: ${error.message}`)
    }
  })
}

/**
 * 购买种子 (KIND 代币)
 */
export function useBuySeedWithKind() {
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'buySeedWithKind',
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('种子购买成功!')
    },
    onError: (error) => {
      toast.error(`购买失败: ${error.message}`)
    }
  })
}