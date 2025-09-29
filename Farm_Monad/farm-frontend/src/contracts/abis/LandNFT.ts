// LandNFT 合约 ABI - 更新于 2025-09-29
export const LandNFTABI = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'totalLands',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'COOLDOWN_PERIOD',
    inputs: [],
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
    name: 'MAX_WEATHER_SEGMENTS',
    inputs: [],
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
    name: 'WEATHER_SEGMENT_DURATION',
    inputs: [],
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
    name: 'advanceGrowth',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'baseGrowthTime',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [
      {
        name: 'isRipe',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [
      {
        name: 'owner',
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
    name: 'checkAndUpdateIdleStatus',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'claimLand',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'seedTokenId',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'farmer',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getApproved',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
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
    name: 'getAvailableLands',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getLandInfo',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct LandNFT.LandInfo',
        components: [
          {
            name: 'state',
            type: 'uint8',
            internalType: 'enum LandNFT.LandState'
          },
          {
            name: 'seedTokenId',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'claimTime',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'lockEndTime',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'weatherSeed',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'lastWeatherUpdateTime',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'accumulatedGrowth',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'currentFarmer',
            type: 'address',
            internalType: 'address'
          }
        ]
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getTotalLands',
    inputs: [],
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
    name: 'harvestCrop',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'landInfo',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [
      {
        name: 'state',
        type: 'uint8',
        internalType: 'enum LandNFT.LandState'
      },
      {
        name: 'seedTokenId',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'claimTime',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'lockEndTime',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'weatherSeed',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'lastWeatherUpdateTime',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'accumulatedGrowth',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'currentFarmer',
        type: 'address',
        internalType: 'address'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string'
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
    name: 'ownerOf',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
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
    name: 'safeTransferFrom',
    inputs: [
      {
        name: 'from',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'to',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    inputs: [
      {
        name: 'from',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'to',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setApprovalForAll',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'approved',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setBaseURI',
    inputs: [
      {
        name: 'baseURI',
        type: 'string',
        internalType: 'string'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setWeatherSeed',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'weatherSeed',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'simulateWeatherForLand',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'uint8[]',
        internalType: 'enum LandNFT.WeatherType[]'
      },
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'stealCrop',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
        internalType: 'bytes4'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      {
        name: 'from',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'to',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
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
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'approved',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
        indexed: true
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'ApprovalForAll',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'approved',
        type: 'bool',
        internalType: 'bool',
        indexed: false
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'GrowthProgressUpdated',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256',
        indexed: true
      },
      {
        name: 'accumulatedGrowth',
        type: 'uint256',
        internalType: 'uint256',
        indexed: false
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'LandClaimed',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256',
        indexed: true
      },
      {
        name: 'farmer',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'seedTokenId',
        type: 'uint256',
        internalType: 'uint256',
        indexed: true
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'LandStateChanged',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256',
        indexed: true
      },
      {
        name: 'newState',
        type: 'uint8',
        internalType: 'enum LandNFT.LandState',
        indexed: false
      }
    ],
    anonymous: false
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
    name: 'Transfer',
    inputs: [
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
        indexed: true
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
        indexed: true
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'WeatherGenerated',
    inputs: [
      {
        name: 'landId',
        type: 'uint256',
        internalType: 'uint256',
        indexed: true
      },
      {
        name: 'weatherSeed',
        type: 'uint256',
        internalType: 'uint256',
        indexed: false
      }
    ],
    anonymous: false
  },
  {
    type: 'error',
    name: 'ERC721IncorrectOwner',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'owner',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'ERC721InsufficientApproval',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ]
  },
  {
    type: 'error',
    name: 'ERC721InvalidApprover',
    inputs: [
      {
        name: 'approver',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'ERC721InvalidOperator',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'ERC721InvalidOwner',
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
    name: 'ERC721InvalidReceiver',
    inputs: [
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'ERC721InvalidSender',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'ERC721NonexistentToken',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ]
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
    name: 'StringsInsufficientHexLength',
    inputs: [
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'length',
        type: 'uint256',
        internalType: 'uint256'
      }
    ]
  }
] as const