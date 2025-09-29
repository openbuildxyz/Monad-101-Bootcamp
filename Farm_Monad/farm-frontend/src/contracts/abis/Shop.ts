// Shop 合约 ABI - 更新于 2025-09-29
export const ShopABI = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_seedNFT',
        type: 'address',
        internalType: 'address'
      },
      {
        name: '_kindToken',
        type: 'address',
        internalType: 'address'
      }
    ],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'buySeedWithKind',
    inputs: [
      {
        name: 'cropType',
        type: 'uint8',
        internalType: 'enum SeedNFT.CropType'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'buySeedWithNative',
    inputs: [
      {
        name: 'cropType',
        type: 'uint8',
        internalType: 'enum SeedNFT.CropType'
      }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'emergencyWithdrawKind',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getAvailableSeedsForKind',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint8[]',
        internalType: 'enum SeedNFT.CropType[]'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getAvailableSeedsForNative',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint8[]',
        internalType: 'enum SeedNFT.CropType[]'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getSeedPrice',
    inputs: [
      {
        name: 'cropType',
        type: 'uint8',
        internalType: 'enum SeedNFT.CropType'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Shop.SeedPrice',
        components: [
          {
            name: 'nativePrice',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'kindPrice',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'availableForNative',
            type: 'bool',
            internalType: 'bool'
          },
          {
            name: 'availableForKind',
            type: 'bool',
            internalType: 'bool'
          }
        ]
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getUserPurchaseCount',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'kindToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract KindnessToken'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'seedNFT',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract SeedNFT'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'seedPrices',
    inputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'enum SeedNFT.CropType'
      }
    ],
    outputs: [
      {
        name: 'nativePrice',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'kindPrice',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'availableForNative',
        type: 'bool',
        internalType: 'bool'
      },
      {
        name: 'availableForKind',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalPurchases',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'updateSeedPrice',
    inputs: [
      {
        name: 'cropType',
        type: 'uint8',
        internalType: 'enum SeedNFT.CropType'
      },
      {
        name: 'nativePrice',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'kindPrice',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'availableForNative',
        type: 'bool',
        internalType: 'bool'
      },
      {
        name: 'availableForKind',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'withdrawNative',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
        indexed: true
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'PriceUpdated',
    inputs: [
      {
        name: 'cropType',
        type: 'uint8',
        internalType: 'enum SeedNFT.CropType',
        indexed: false
      },
      {
        name: 'nativePrice',
        type: 'uint256',
        internalType: 'uint256',
        indexed: false
      },
      {
        name: 'kindPrice',
        type: 'uint256',
        internalType: 'uint256',
        indexed: false
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'SeedPurchased',
    inputs: [
      {
        name: 'buyer',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'cropType',
        type: 'uint8',
        internalType: 'enum SeedNFT.CropType',
        indexed: false
      },
      {
        name: 'rarity',
        type: 'uint8',
        internalType: 'enum SeedNFT.Rarity',
        indexed: false
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
        indexed: false
      },
      {
        name: 'paidWithKind',
        type: 'bool',
        internalType: 'bool',
        indexed: false
      },
      {
        name: 'price',
        type: 'uint256',
        internalType: 'uint256',
        indexed: false
      }
    ],
    anonymous: false
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: []
  }
] as const