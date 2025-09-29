import { useState } from 'react'
import { useConnect, useAccount } from 'wagmi'
import { Button, Modal, ModalHeader, ModalBody } from '@/components/ui'
import { WalletIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export function WalletConnection() {
  const [isOpen, setIsOpen] = useState(false)
  const { connectors, connect, error, isLoading, pendingConnector } = useConnect()
  const { isConnected } = useAccount()

  const handleConnect = (connector: any) => {
    connect({ connector })
    setIsOpen(false)
  }

  if (isConnected) return null

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
        className="flex items-center space-x-2"
      >
        <WalletIcon className="w-4 h-4" />
        <span>连接钱包</span>
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
        <ModalHeader onClose={() => setIsOpen(false)}>
          连接钱包
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              选择一个钱包连接到 Farm 3.0 游戏
            </p>

            {/* 网络提醒 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">网络提醒</p>
                  <p className="text-yellow-700 mt-1">
                    请确保您的钱包已连接到 Monad 测试网络
                  </p>
                  <div className="mt-2 text-xs text-yellow-600">
                    <p><strong>网络名称:</strong> Monad Testnet</p>
                    <p><strong>Chain ID:</strong> 10143</p>
                    <p><strong>RPC URL:</strong> https://testnet-rpc.monad.xyz</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 连接器列表 */}
            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={!connector.ready || isLoading}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <WalletIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {connector.name}
                        {!connector.ready && ' (未安装)'}
                      </p>
                      {connector.id === 'metaMask' && (
                        <p className="text-xs text-gray-500">推荐使用</p>
                      )}
                    </div>
                  </div>

                  {isLoading && connector.id === pendingConnector?.id && (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  )}
                </button>
              ))}
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-red-800 font-medium">连接失败</p>
                    <p className="text-red-700 mt-1">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 帮助信息 */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• 首次连接需要添加 Monad 测试网络</p>
              <p>• 确保您有足够的 MON 代币进行游戏</p>
              <p>• 可以通过官方水龙头获取测试代币</p>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  )
}