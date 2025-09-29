import { useContractRead, useContractWrite } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACTS } from '@/types/contracts'
import { ShopABI } from '@/contracts'
import type { CropType, SeedPrice } from '@/types/game'
import type { Address } from 'viem'

/**
 * 获取种子价格
 */
export function useSeedPrice(cropType: CropType) {
  return useContractRead({
    address: CONTRACTS.Shop,
    abi: ShopABI,
    functionName: 'getSeedPrice',
    args: [cropType],
    cacheTime: 30_000,
    select: (data: any): SeedPrice => ({
      nativePrice: data.nativePrice,
      kindPrice: data.kindPrice,
      availableForNative: data.availableForNative,
      availableForKind: data.availableForKind,
    })
  })
}

/**
 * 获取可用于原生代币购买的种子
 */
export function useAvailableSeedsForNative() {
  return useContractRead({
    address: CONTRACTS.Shop,
    abi: ShopABI,
    functionName: 'getAvailableSeedsForNative',
    cacheTime: 30_000,
    select: (data: any): CropType[] => data.map((type: number) => type as CropType)
  })
}

/**
 * 获取可用于KIND代币购买的种子
 */
export function useAvailableSeedsForKind() {
  return useContractRead({
    address: CONTRACTS.Shop,
    abi: ShopABI,
    functionName: 'getAvailableSeedsForKind',
    cacheTime: 30_000,
    select: (data: any): CropType[] => data.map((type: number) => type as CropType)
  })
}

/**
 * 获取用户购买次数
 */
export function useUserPurchaseCount(address?: Address) {
  return useContractRead({
    address: CONTRACTS.Shop,
    abi: ShopABI,
    functionName: 'getUserPurchaseCount',
    args: [address!],
    enabled: !!address,
    cacheTime: 10_000,
    select: (data: any): number => Number(data)
  })
}

/**
 * 使用原生代币购买种子
 */
export function useBuyWithNative() {
  return useContractWrite({
    address: CONTRACTS.FarmGame,
    abi: ShopABI,
    functionName: 'buySeedWithNative',
    onSuccess: () => {
      toast.success('种子购买成功!')
    },
    onError: (error: Error) => {
      toast.error(`购买失败: ${error.message}`)
    }
  })
}

/**
 * 使用KIND代币购买种子
 */
export function useBuyWithKind() {
  return useContractWrite({
    address: CONTRACTS.FarmGame,
    abi: ShopABI,
    functionName: 'buySeedWithKind',
    onSuccess: () => {
      toast.success('种子购买成功!')
    },
    onError: (error: Error) => {
      toast.error(`购买失败: ${error.message}`)
    }
  })
}