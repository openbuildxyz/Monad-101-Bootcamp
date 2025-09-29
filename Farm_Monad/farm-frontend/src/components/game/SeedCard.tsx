import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, Button, Modal, ModalBody, ModalFooter } from '@/components/ui'
import { cn } from '@/utils'
import { formatPrice } from '@/utils/format'
import { useNativeBalance, useKindBalance } from '@/hooks/web3'
import { useSeedPrice, useBuyWithNative, useBuyWithKind } from '@/hooks/contracts/useShop'
import { CropType, CROP_CONFIG, Rarity } from '@/types/game'

interface SeedCardProps {
  cropType: CropType
  className?: string
}

export function SeedCard({ cropType, className }: SeedCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'native' | 'kind'>('native')

  const { address, isConnected } = useAccount()
  const { data: nativeBalance } = useNativeBalance(address)
  const { data: kindBalance } = useKindBalance(address)

  const { data: priceInfo } = useSeedPrice(cropType)
  const buyWithNative = useBuyWithNative()
  const buyWithKind = useBuyWithKind()

  const config = CROP_CONFIG[cropType]
  const isRare = config.rarity === Rarity.Rare

  const canBuyWithNative = priceInfo?.availableForNative &&
    nativeBalance && nativeBalance.value >= priceInfo.nativePrice

  const canBuyWithKind = priceInfo?.availableForKind &&
    kindBalance && kindBalance >= priceInfo.kindPrice

  const handlePurchase = async () => {
    if (!priceInfo) return

    try {
      if (selectedPayment === 'native') {
        await buyWithNative.write({
          args: [cropType],
          value: priceInfo.nativePrice
        })
      } else {
        await buyWithKind.write({
          args: [cropType]
        })
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  return (
    <>
      <div
        className={cn(
          'transition-all duration-200 cursor-pointer hover:scale-105',
          isConnected && 'cursor-pointer',
          !isConnected && 'cursor-not-allowed'
        )}
        onClick={() => isConnected && setIsModalOpen(true)}
      >
        <Card
          className={cn(
            isRare && 'ring-2 ring-blue-200',
            className
          )}
        >
        <CardContent>
          <div className="text-center space-y-3">
            {/* 作物图标 */}
            <div className="text-4xl mb-2">{config.emoji}</div>

            {/* 作物信息 */}
            <div>
              <h3 className="font-semibold text-lg">{config.name}</h3>
              <p className="text-sm text-gray-600">
                成长时间: {Math.floor(config.baseGrowthTime / 60)}分钟
              </p>
              {isRare && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                  稀有
                </span>
              )}
            </div>

            {/* 价格信息 */}
            {priceInfo && (
              <div className="space-y-1">
                {priceInfo.availableForNative && (
                  <div className="text-sm">
                    <span className="text-gray-600">MON: </span>
                    <span className="font-medium">
                      {formatPrice(priceInfo.nativePrice, 'ETH')}
                    </span>
                  </div>
                )}
                {priceInfo.availableForKind && (
                  <div className="text-sm">
                    <span className="text-primary-600">KIND: </span>
                    <span className="font-medium text-primary-700">
                      {formatPrice(priceInfo.kindPrice, 'KIND')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 购买按钮 */}
            <Button
              size="sm"
              className="w-full"
              variant={canBuyWithNative || canBuyWithKind ? 'primary' : 'secondary'}
              disabled={!isConnected || (!canBuyWithNative && !canBuyWithKind)}
            >
              {!isConnected ? '连接钱包' : '购买种子'}
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>

      {/* 购买确认模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`购买 ${config.name}`}
      >
        <ModalBody>
          <div className="space-y-4">
            {/* 种子信息 */}
            <div className="text-center">
              <div className="text-6xl mb-2">{config.emoji}</div>
              <h3 className="text-xl font-semibold">{config.name}</h3>
              <p className="text-gray-600">
                成长时间: {Math.floor(config.baseGrowthTime / 60)}分钟
              </p>
              {isRare && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mt-2">
                  稀有作物
                </span>
              )}
            </div>

            {/* 支付方式选择 */}
            {priceInfo && (
              <div className="space-y-3">
                <h4 className="font-medium">选择支付方式:</h4>

                {priceInfo.availableForNative && (
                  <label className={cn(
                    'flex items-center p-3 border rounded-lg cursor-pointer transition-colors',
                    selectedPayment === 'native'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50',
                    !canBuyWithNative && 'opacity-50 cursor-not-allowed'
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      value="native"
                      checked={selectedPayment === 'native'}
                      onChange={(e) => setSelectedPayment(e.target.value as 'native')}
                      disabled={!canBuyWithNative}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">MON 代币</div>
                      <div className="text-sm text-gray-600">
                        价格: {formatPrice(priceInfo.nativePrice, 'ETH')}
                      </div>
                      <div className="text-xs text-gray-500">
                        余额: {nativeBalance ? formatPrice(nativeBalance.value, 'ETH') : '0 MON'}
                      </div>
                    </div>
                    {!canBuyWithNative && (
                      <span className="text-red-500 text-xs">余额不足</span>
                    )}
                  </label>
                )}

                {priceInfo.availableForKind && (
                  <label className={cn(
                    'flex items-center p-3 border rounded-lg cursor-pointer transition-colors',
                    selectedPayment === 'kind'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50',
                    !canBuyWithKind && 'opacity-50 cursor-not-allowed'
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      value="kind"
                      checked={selectedPayment === 'kind'}
                      onChange={(e) => setSelectedPayment(e.target.value as 'kind')}
                      disabled={!canBuyWithKind}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-primary-700">KIND 代币</div>
                      <div className="text-sm text-primary-600">
                        价格: {formatPrice(priceInfo.kindPrice, 'KIND')}
                      </div>
                      <div className="text-xs text-gray-500">
                        余额: {kindBalance ? formatPrice(kindBalance, 'KIND') : '0 KIND'}
                      </div>
                    </div>
                    {!canBuyWithKind && (
                      <span className="text-red-500 text-xs">余额不足</span>
                    )}
                  </label>
                )}
              </div>
            )}

            {/* 购买提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 提示: 购买种子后，您需要在农场页面选择空闲土地进行种植。
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handlePurchase}
            loading={buyWithNative.isLoading || buyWithKind.isLoading}
            disabled={
              (selectedPayment === 'native' && !canBuyWithNative) ||
              (selectedPayment === 'kind' && !canBuyWithKind)
            }
          >
            确认购买
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}