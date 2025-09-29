// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract SeedNFT is ERC721, Ownable {
    enum CropType { Wheat, Corn, Pumpkin, Strawberry, Grape, Watermelon }
    enum Rarity { Common, Rare, Legendary }
    enum GrowthStage { Seed, Growing, Mature }
    
    struct SeedInfo {
        CropType cropType;
        Rarity rarity;
        GrowthStage growthStage;
        uint256 growthStartTime;
        uint256 baseGrowthTime;
        uint256 maturedAt;
        uint8 boostersApplied;
    }
    
    mapping(uint256 => SeedInfo) public seedInfo;
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    
    event SeedMinted(uint256 indexed tokenId, address indexed to, CropType cropType, Rarity rarity);
    event GrowthStageUpdated(uint256 indexed tokenId, GrowthStage newStage);
    event SeedMatured(uint256 indexed tokenId, uint256 maturedAt);
    
    constructor() ERC721("Farm Seed NFT", "SEED") Ownable(msg.sender) {}
    
    function mintSeed(address to, CropType cropType, Rarity rarity) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        
        uint256 baseTime = _getBaseGrowthTime(cropType);
        
        seedInfo[tokenId] = SeedInfo({
            cropType: cropType,
            rarity: rarity,
            growthStage: GrowthStage.Seed,
            growthStartTime: 0,
            baseGrowthTime: baseTime,
            maturedAt: 0,
            boostersApplied: 0
        });
        
        emit SeedMinted(tokenId, to, cropType, rarity);
        return tokenId;
    }
    
    function startGrowing(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "SeedNFT: Token does not exist");
        require(seedInfo[tokenId].growthStage == GrowthStage.Seed, "SeedNFT: Seed already growing or mature");
        
        seedInfo[tokenId].growthStage = GrowthStage.Growing;
        seedInfo[tokenId].growthStartTime = block.timestamp;
        
        emit GrowthStageUpdated(tokenId, GrowthStage.Growing);
    }
    
    function matureSeed(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "SeedNFT: Token does not exist");
        require(seedInfo[tokenId].growthStage == GrowthStage.Growing, "SeedNFT: Seed not growing");
        
        seedInfo[tokenId].growthStage = GrowthStage.Mature;
        seedInfo[tokenId].maturedAt = block.timestamp;
        
        emit GrowthStageUpdated(tokenId, GrowthStage.Mature);
        emit SeedMatured(tokenId, block.timestamp);
    }
    
    function applyBooster(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "SeedNFT: Token does not exist");
        require(seedInfo[tokenId].growthStage == GrowthStage.Growing, "SeedNFT: Seed not growing");
        require(seedInfo[tokenId].boostersApplied < 10, "SeedNFT: Maximum boosters applied");

        seedInfo[tokenId].boostersApplied++;
    }

    function forceTransfer(address from, address to, uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) == from, "SeedNFT: Transfer from incorrect owner");
        require(to != address(0), "SeedNFT: Transfer to zero address");

        _transfer(from, to, tokenId);
    }
    
    function _getBaseGrowthTime(CropType cropType) private pure returns (uint256) {
        if (cropType == CropType.Wheat) return 60 minutes;
        if (cropType == CropType.Corn) return 90 minutes;
        if (cropType == CropType.Pumpkin) return 120 minutes;
        if (cropType == CropType.Strawberry) return 75 minutes;
        if (cropType == CropType.Grape) return 100 minutes;
        if (cropType == CropType.Watermelon) return 110 minutes;
        return 60 minutes;
    }
    
    function getSeedInfo(uint256 tokenId) external view returns (SeedInfo memory) {
        require(_ownerOf(tokenId) != address(0), "SeedNFT: Token does not exist");
        return seedInfo[tokenId];
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // NFT元数据相关函数
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "SeedNFT: URI query for nonexistent token");
        
        // 如果设置了baseURI，返回传统的baseURI + tokenId格式
        if (bytes(_baseTokenURI).length > 0) {
            return string(abi.encodePacked(_baseTokenURI, Strings.toString(tokenId)));
        }
        
        // 否则返回动态生成的JSON元数据
        return _generateTokenURI(tokenId);
    }
    
    function _generateTokenURI(uint256 tokenId) private view returns (string memory) {
        SeedInfo memory info = seedInfo[tokenId];
        
        // 生成属性JSON
        string memory attributes = _generateAttributes(tokenId, info);
        
        // 组装完整的JSON元数据
        string memory json = string(abi.encodePacked(
            '{'
                '"name": "', _getCropName(info.cropType), ' ', _getGrowthStageName(info.growthStage), '",',
                '"description": "A ', _getRarityName(info.rarity), ' ', _getCropName(info.cropType), ' in ', _getGrowthStageName(info.growthStage), ' stage from Farm Game",',
                '"image": "', _getImageUrl(info.cropType, info.growthStage, info.rarity), '",',
                '"attributes": ', attributes,
            '}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
    
    function _generateAttributes(uint256 tokenId, SeedInfo memory info) private view returns (string memory) {
        return string(abi.encodePacked(
            '['
                '{"trait_type": "Crop Type", "value": "', _getCropName(info.cropType), '"},',
                '{"trait_type": "Rarity", "value": "', _getRarityName(info.rarity), '"},',
                '{"trait_type": "Growth Stage", "value": "', _getGrowthStageName(info.growthStage), '"},',
                '{"trait_type": "Base Growth Time", "value": ', Strings.toString(info.baseGrowthTime / 60), ', "display_type": "number", "unit": "minutes"},',
                '{"trait_type": "Boosters Applied", "value": ', Strings.toString(info.boostersApplied), ', "display_type": "number"}',
                info.growthStartTime > 0 ? string(abi.encodePacked(',{"trait_type": "Growth Started", "value": ', Strings.toString(info.growthStartTime), ', "display_type": "date"}')) : '',
                info.maturedAt > 0 ? string(abi.encodePacked(',{"trait_type": "Matured At", "value": ', Strings.toString(info.maturedAt), ', "display_type": "date"}')) : '',
            ']'
        ));
    }
    
    function _getCropName(CropType cropType) private pure returns (string memory) {
        if (cropType == CropType.Wheat) return "Wheat";
        if (cropType == CropType.Corn) return "Corn";
        if (cropType == CropType.Pumpkin) return "Pumpkin";
        if (cropType == CropType.Strawberry) return "Strawberry";
        if (cropType == CropType.Grape) return "Grape";
        if (cropType == CropType.Watermelon) return "Watermelon";
        return "Unknown";
    }
    
    function _getRarityName(Rarity rarity) private pure returns (string memory) {
        if (rarity == Rarity.Common) return "Common";
        if (rarity == Rarity.Rare) return "Rare";
        if (rarity == Rarity.Legendary) return "Legendary";
        return "Unknown";
    }
    
    function _getGrowthStageName(GrowthStage stage) private pure returns (string memory) {
        if (stage == GrowthStage.Seed) return "Seed";
        if (stage == GrowthStage.Growing) return "Growing";
        if (stage == GrowthStage.Mature) return "Mature";
        return "Unknown";
    }
    
    function _getImageUrl(CropType cropType, GrowthStage stage, Rarity rarity) private pure returns (string memory) {
        // 构造图片URL: https://farm-assets.example.com/{crop}_{stage}_{rarity}.png
        return string(abi.encodePacked(
            "https://farm-assets.example.com/",
            _getCropName(cropType), "_",
            _getGrowthStageName(stage), "_", 
            _getRarityName(rarity), ".png"
        ));
    }
}