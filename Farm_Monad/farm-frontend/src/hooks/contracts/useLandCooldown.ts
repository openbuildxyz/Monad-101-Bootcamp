import { useContractWrite } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACTS } from '@/types/contracts'
import { LandNFTABI } from '@/contracts'

/**
 * 检查并更新空闲状态
 * 用于将冷却结束的土地从LockedIdle状态更新为Idle状态
 */
export function useCheckAndUpdateIdleStatus() {
  return useContractWrite({
    address: CONTRACTS.LandNFT,
    abi: LandNFTABI,
    functionName: 'checkAndUpdateIdleStatus',
    args: undefined,
    onSuccess: () => {
      toast.success('冷却状态检查完成!')
    },
    onError: (error) => {
      if (error.message.includes('429')) {
        toast.error('RPC请求过于频繁，请稍后再试')
      } else {
        toast.error(`检查失败: ${error.message}`)
      }
    }
  })
}
