import { useBalance, useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import type { Address } from 'viem'

/**
 * 获取原生代币余额 (MON)
 */
export function useNativeBalance(address?: Address) {
  return useBalance({
    address,
    enabled: !!address,
    watch: true,
    cacheTime: 10_000, // 10 seconds
  })
}

/**
 * 获取 KIND 代币余额
 */
export function useKindBalance(address?: Address) {
  return useContractRead({
    address: CONTRACTS.KindnessToken,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ],
    functionName: 'balanceOf',
    args: [address!],
    enabled: !!address,
    watch: true,
    cacheTime: 10_000,
  })
}