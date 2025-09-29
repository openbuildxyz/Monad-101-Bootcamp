// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SeedNFT.sol";
import "./KindnessToken.sol";

contract Shop is Ownable, ReentrancyGuard {
    SeedNFT public immutable seedNFT;
    KindnessToken public immutable kindToken;
    
    struct SeedPrice {
        uint256 nativePrice;  // Price in native token (wei)
        uint256 kindPrice;    // Price in KIND tokens
        bool availableForNative;
        bool availableForKind;
    }
    
    mapping(SeedNFT.CropType => SeedPrice) public seedPrices;
    mapping(address => uint256) public totalPurchases;
    
    event SeedPurchased(
        address indexed buyer, 
        SeedNFT.CropType cropType, 
        SeedNFT.Rarity rarity, 
        uint256 tokenId,
        bool paidWithKind,
        uint256 price
    );
    
    event PriceUpdated(SeedNFT.CropType cropType, uint256 nativePrice, uint256 kindPrice);
    
    constructor(address _seedNFT, address _kindToken) Ownable(msg.sender) {
        seedNFT = SeedNFT(_seedNFT);
        kindToken = KindnessToken(_kindToken);
        
        // Initialize prices for common seeds (native token)
        seedPrices[SeedNFT.CropType.Wheat] = SeedPrice({
            nativePrice: 0.001 ether,
            kindPrice: 0,
            availableForNative: true,
            availableForKind: false
        });
        
        seedPrices[SeedNFT.CropType.Corn] = SeedPrice({
            nativePrice: 0.0015 ether,
            kindPrice: 0,
            availableForNative: true,
            availableForKind: false
        });
        
        seedPrices[SeedNFT.CropType.Pumpkin] = SeedPrice({
            nativePrice: 0.002 ether,
            kindPrice: 0,
            availableForNative: true,
            availableForKind: false
        });
        
        // Initialize prices for rare seeds (KIND token)
        seedPrices[SeedNFT.CropType.Strawberry] = SeedPrice({
            nativePrice: 0,
            kindPrice: 10 * 10**18, // 10 KIND
            availableForNative: false,
            availableForKind: true
        });
        
        seedPrices[SeedNFT.CropType.Grape] = SeedPrice({
            nativePrice: 0,
            kindPrice: 15 * 10**18, // 15 KIND
            availableForNative: false,
            availableForKind: true
        });
        
        seedPrices[SeedNFT.CropType.Watermelon] = SeedPrice({
            nativePrice: 0,
            kindPrice: 20 * 10**18, // 20 KIND
            availableForNative: false,
            availableForKind: true
        });
    }
    
    function buySeedWithNative(SeedNFT.CropType cropType) external payable nonReentrant {
        SeedPrice memory price = seedPrices[cropType];
        require(price.availableForNative, "Shop: Seed not available for native token");
        require(msg.value >= price.nativePrice, "Shop: Insufficient payment");
        
        // Mint seed NFT
        SeedNFT.Rarity rarity = _getRarityForCropType(cropType);
        uint256 tokenId = seedNFT.mintSeed(msg.sender, cropType, rarity);
        
        totalPurchases[msg.sender]++;
        
        emit SeedPurchased(msg.sender, cropType, rarity, tokenId, false, price.nativePrice);
        
        // Refund excess payment
        if (msg.value > price.nativePrice) {
            payable(msg.sender).transfer(msg.value - price.nativePrice);
        }
    }
    
    function buySeedWithKind(SeedNFT.CropType cropType) external nonReentrant {
        SeedPrice memory price = seedPrices[cropType];
        require(price.availableForKind, "Shop: Seed not available for KIND token");
        require(kindToken.balanceOf(msg.sender) >= price.kindPrice, "Shop: Insufficient KIND balance");
        
        // Burn KIND tokens
        kindToken.burn(msg.sender, price.kindPrice);
        
        // Mint seed NFT
        SeedNFT.Rarity rarity = _getRarityForCropType(cropType);
        uint256 tokenId = seedNFT.mintSeed(msg.sender, cropType, rarity);
        
        totalPurchases[msg.sender]++;
        
        emit SeedPurchased(msg.sender, cropType, rarity, tokenId, true, price.kindPrice);
    }
    
    function _getRarityForCropType(SeedNFT.CropType cropType) private pure returns (SeedNFT.Rarity) {
        // Common crops
        if (cropType == SeedNFT.CropType.Wheat || 
            cropType == SeedNFT.CropType.Corn || 
            cropType == SeedNFT.CropType.Pumpkin) {
            return SeedNFT.Rarity.Common;
        }
        // Rare crops
        if (cropType == SeedNFT.CropType.Strawberry || 
            cropType == SeedNFT.CropType.Grape || 
            cropType == SeedNFT.CropType.Watermelon) {
            return SeedNFT.Rarity.Rare;
        }
        return SeedNFT.Rarity.Common;
    }
    
    function updateSeedPrice(
        SeedNFT.CropType cropType, 
        uint256 nativePrice, 
        uint256 kindPrice,
        bool availableForNative,
        bool availableForKind
    ) external onlyOwner {
        seedPrices[cropType] = SeedPrice({
            nativePrice: nativePrice,
            kindPrice: kindPrice,
            availableForNative: availableForNative,
            availableForKind: availableForKind
        });
        
        emit PriceUpdated(cropType, nativePrice, kindPrice);
    }
    
    function getSeedPrice(SeedNFT.CropType cropType) external view returns (SeedPrice memory) {
        return seedPrices[cropType];
    }
    
    function getAvailableSeedsForNative() external view returns (SeedNFT.CropType[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i <= uint256(SeedNFT.CropType.Watermelon); i++) {
            if (seedPrices[SeedNFT.CropType(i)].availableForNative) {
                count++;
            }
        }
        
        SeedNFT.CropType[] memory availableSeeds = new SeedNFT.CropType[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i <= uint256(SeedNFT.CropType.Watermelon); i++) {
            if (seedPrices[SeedNFT.CropType(i)].availableForNative) {
                availableSeeds[index] = SeedNFT.CropType(i);
                index++;
            }
        }
        
        return availableSeeds;
    }
    
    function getAvailableSeedsForKind() external view returns (SeedNFT.CropType[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i <= uint256(SeedNFT.CropType.Watermelon); i++) {
            if (seedPrices[SeedNFT.CropType(i)].availableForKind) {
                count++;
            }
        }
        
        SeedNFT.CropType[] memory availableSeeds = new SeedNFT.CropType[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i <= uint256(SeedNFT.CropType.Watermelon); i++) {
            if (seedPrices[SeedNFT.CropType(i)].availableForKind) {
                availableSeeds[index] = SeedNFT.CropType(i);
                index++;
            }
        }
        
        return availableSeeds;
    }
    
    function getUserPurchaseCount(address user) external view returns (uint256) {
        return totalPurchases[user];
    }
    
    function withdrawNative() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Shop: No native tokens to withdraw");
        payable(owner()).transfer(balance);
    }
    
    function emergencyWithdrawKind() external onlyOwner {
        uint256 balance = kindToken.balanceOf(address(this));
        if (balance > 0) {
            kindToken.transfer(owner(), balance);
        }
    }
}