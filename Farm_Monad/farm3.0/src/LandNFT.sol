// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract LandNFT is ERC721, Ownable {
    enum LandState { Idle, Growing, Ripe, Stealing, LockedIdle }
    enum WeatherType { Sunny, Rainy, Storm, Cloudy }
    
    struct LandInfo {
        LandState state;
        uint256 seedTokenId;
        uint256 claimTime;
        uint256 lockEndTime;
        uint256 weatherSeed;
        uint256 lastWeatherUpdateTime;
        uint256 accumulatedGrowth;
        address currentFarmer;
    }
    
    mapping(uint256 => LandInfo) public landInfo;
    uint256 public constant COOLDOWN_PERIOD = 5 minutes;
    uint256 public constant WEATHER_SEGMENT_DURATION = 15 minutes;
    uint256 public constant MAX_WEATHER_SEGMENTS = 100;
    
    uint256 private _landCount;
    string private _baseTokenURI;
    
    event LandClaimed(uint256 indexed landId, address indexed farmer, uint256 indexed seedTokenId);
    event LandStateChanged(uint256 indexed landId, LandState newState);
    event WeatherGenerated(uint256 indexed landId, uint256 weatherSeed);
    event GrowthProgressUpdated(uint256 indexed landId, uint256 accumulatedGrowth);
    
    constructor(uint256 totalLands) ERC721("Farm Land NFT", "LAND") Ownable(msg.sender) {
        _landCount = totalLands;
        
        for (uint256 i = 0; i < totalLands; i++) {
            _mint(address(this), i);
            landInfo[i] = LandInfo({
                state: LandState.Idle,
                seedTokenId: 0,
                claimTime: 0,
                lockEndTime: 0,
                weatherSeed: 0,
                lastWeatherUpdateTime: 0,
                accumulatedGrowth: 0,
                currentFarmer: address(0)
            });
        }
    }
    
    function claimLand(uint256 landId, uint256 seedTokenId, address farmer) external onlyOwner {
        require(landId < _landCount, "LandNFT: Land does not exist");
        require(block.timestamp >= landInfo[landId].lockEndTime, "LandNFT: Land in cooldown");
        require(landInfo[landId].state == LandState.Idle, "LandNFT: Land not available");
        
        landInfo[landId].state = LandState.Growing;
        landInfo[landId].seedTokenId = seedTokenId;
        landInfo[landId].claimTime = block.timestamp;
        landInfo[landId].currentFarmer = farmer;
        landInfo[landId].lastWeatherUpdateTime = block.timestamp;
        landInfo[landId].accumulatedGrowth = 0;
        
        emit LandClaimed(landId, farmer, seedTokenId);
        emit LandStateChanged(landId, LandState.Growing);
    }
    
    function setWeatherSeed(uint256 landId, uint256 weatherSeed) external onlyOwner {
        require(landId < _landCount, "LandNFT: Land does not exist");
        require(landInfo[landId].state == LandState.Growing, "LandNFT: Land not growing");
        
        landInfo[landId].weatherSeed = weatherSeed;
        emit WeatherGenerated(landId, weatherSeed);
    }
    
    function advanceGrowth(uint256 landId, uint256 baseGrowthTime) external onlyOwner returns (bool isRipe) {
        require(landId < _landCount, "LandNFT: Land does not exist");
        require(landInfo[landId].state == LandState.Growing, "LandNFT: Land not growing");
        
        LandInfo storage land = landInfo[landId];
        uint256 currentTime = block.timestamp;
        
        if (currentTime <= land.lastWeatherUpdateTime) {
            return false;
        }
        
        uint256 timeElapsed = currentTime - land.lastWeatherUpdateTime;
        uint256 segmentsPassed = timeElapsed / WEATHER_SEGMENT_DURATION;
        
        if (segmentsPassed > MAX_WEATHER_SEGMENTS) {
            segmentsPassed = MAX_WEATHER_SEGMENTS;
        }
        
        uint256 growthToAdd = 0;
        uint256 segmentStartTime = land.lastWeatherUpdateTime;
        
        for (uint256 i = 0; i < segmentsPassed; i++) {
            WeatherType weather = _generateWeather(land.weatherSeed, segmentStartTime);
            uint256 segmentGrowth = _calculateSegmentGrowth(weather, WEATHER_SEGMENT_DURATION);
            growthToAdd += segmentGrowth;
            segmentStartTime += WEATHER_SEGMENT_DURATION;
        }
        
        land.accumulatedGrowth += growthToAdd;
        land.lastWeatherUpdateTime = segmentStartTime;
        
        emit GrowthProgressUpdated(landId, land.accumulatedGrowth);
        
        if (land.accumulatedGrowth >= baseGrowthTime) {
            land.state = LandState.Ripe;
            emit LandStateChanged(landId, LandState.Ripe);
            return true;
        }
        
        return false;
    }
    
    function harvestCrop(uint256 landId) external onlyOwner {
        require(landId < _landCount, "LandNFT: Land does not exist");
        require(landInfo[landId].state == LandState.Ripe, "LandNFT: Crop not ready");
        
        _resetLand(landId);
        emit LandStateChanged(landId, LandState.LockedIdle);
    }
    
    function stealCrop(uint256 landId) external onlyOwner {
        require(landId < _landCount, "LandNFT: Land does not exist");
        require(landInfo[landId].state == LandState.Ripe, "LandNFT: Crop not ready");
        
        _resetLand(landId);
        emit LandStateChanged(landId, LandState.LockedIdle);
    }
    
    function _resetLand(uint256 landId) private {
        landInfo[landId].state = LandState.LockedIdle;
        landInfo[landId].seedTokenId = 0;
        landInfo[landId].claimTime = 0;
        landInfo[landId].lockEndTime = block.timestamp + COOLDOWN_PERIOD;
        landInfo[landId].weatherSeed = 0;
        landInfo[landId].lastWeatherUpdateTime = 0;
        landInfo[landId].accumulatedGrowth = 0;
        landInfo[landId].currentFarmer = address(0);
    }
    
    function checkAndUpdateIdleStatus() external {
        for (uint256 i = 0; i < _landCount; i++) {
            if (landInfo[i].state == LandState.LockedIdle && 
                block.timestamp >= landInfo[i].lockEndTime) {
                landInfo[i].state = LandState.Idle;
                emit LandStateChanged(i, LandState.Idle);
            }
        }
    }
    
    function _generateWeather(uint256 weatherSeed, uint256 segmentStartTime) private pure returns (WeatherType) {
        uint256 hash = uint256(keccak256(abi.encodePacked(weatherSeed, segmentStartTime)));
        uint256 weatherValue = hash % 100;
        
        if (weatherValue < 40) return WeatherType.Sunny;    // 40%
        if (weatherValue < 65) return WeatherType.Rainy;    // 25%  
        if (weatherValue < 80) return WeatherType.Cloudy;   // 15%
        return WeatherType.Storm;                           // 20%
    }
    
    function _calculateSegmentGrowth(WeatherType weather, uint256 segmentDuration) private pure returns (uint256) {
        if (weather == WeatherType.Sunny) {
            return segmentDuration; // Normal growth
        } else if (weather == WeatherType.Rainy) {
            return (segmentDuration * 120) / 100; // +20% growth
        } else if (weather == WeatherType.Cloudy) {
            return (segmentDuration * 90) / 100; // -10% growth
        } else if (weather == WeatherType.Storm) {
            return 0; // No growth during storm
        }
        return segmentDuration;
    }
    
    function getLandInfo(uint256 landId) external view returns (LandInfo memory) {
        require(landId < _landCount, "LandNFT: Land does not exist");
        return landInfo[landId];
    }
    
    function getTotalLands() external view returns (uint256) {
        return _landCount;
    }
    
    function getAvailableLands() external view returns (uint256[] memory) {
        uint256 availableCount = 0;
        
        for (uint256 i = 0; i < _landCount; i++) {
            if (landInfo[i].state == LandState.Idle && block.timestamp >= landInfo[i].lockEndTime) {
                availableCount++;
            }
        }
        
        uint256[] memory availableLands = new uint256[](availableCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _landCount; i++) {
            if (landInfo[i].state == LandState.Idle && block.timestamp >= landInfo[i].lockEndTime) {
                availableLands[index] = i;
                index++;
            }
        }
        
        return availableLands;
    }
    
    function simulateWeatherForLand(uint256 landId) external view returns (WeatherType[] memory, uint256[] memory) {
        require(landId < _landCount, "LandNFT: Land does not exist");
        require(landInfo[landId].state == LandState.Growing, "LandNFT: Land not growing");
        
        LandInfo memory land = landInfo[landId];
        uint256 currentTime = block.timestamp;
        
        if (currentTime <= land.lastWeatherUpdateTime) {
            return (new WeatherType[](0), new uint256[](0));
        }
        
        uint256 timeElapsed = currentTime - land.lastWeatherUpdateTime;
        uint256 segmentsPassed = timeElapsed / WEATHER_SEGMENT_DURATION;
        
        if (segmentsPassed > MAX_WEATHER_SEGMENTS) {
            segmentsPassed = MAX_WEATHER_SEGMENTS;
        }
        
        WeatherType[] memory weatherTypes = new WeatherType[](segmentsPassed);
        uint256[] memory growthValues = new uint256[](segmentsPassed);
        
        uint256 segmentStartTime = land.lastWeatherUpdateTime;
        
        for (uint256 i = 0; i < segmentsPassed; i++) {
            WeatherType weather = _generateWeather(land.weatherSeed, segmentStartTime);
            weatherTypes[i] = weather;
            growthValues[i] = _calculateSegmentGrowth(weather, WEATHER_SEGMENT_DURATION);
            segmentStartTime += WEATHER_SEGMENT_DURATION;
        }
        
        return (weatherTypes, growthValues);
    }
    
    // NFT元数据相关函数
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < _landCount, "LandNFT: URI query for nonexistent token");
        
        // 如果设置了baseURI，返回传统的baseURI + tokenId格式
        if (bytes(_baseTokenURI).length > 0) {
            return string(abi.encodePacked(_baseTokenURI, Strings.toString(tokenId)));
        }
        
        // 否则返回动态生成的JSON元数据
        return _generateTokenURI(tokenId);
    }
    
    function _generateTokenURI(uint256 tokenId) private view returns (string memory) {
        LandInfo memory info = landInfo[tokenId];
        
        // 获取当前天气
        string memory currentWeather = _getCurrentWeatherName(tokenId);
        
        // 生成属性JSON
        string memory attributes = _generateAttributes(tokenId, info, currentWeather);
        
        // 组装完整的JSON元数据
        string memory json = string(abi.encodePacked(
            '{'
                '"name": "Farm Land #', Strings.toString(tokenId), '",',
                '"description": "A piece of farmland in ', _getStateName(info.state), ' state with ', currentWeather, ' weather",',
                '"image": "', _getLandImageUrl(tokenId, info.state, currentWeather), '",',
                '"attributes": ', attributes,
            '}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
    
    function _generateAttributes(uint256 tokenId, LandInfo memory info, string memory currentWeather) private view returns (string memory) {
        string memory baseAttributes = string(abi.encodePacked(
            '['
                '{"trait_type": "Land ID", "value": ', Strings.toString(tokenId), ', "display_type": "number"},',
                '{"trait_type": "State", "value": "', _getStateName(info.state), '"},',
                '{"trait_type": "Current Weather", "value": "', currentWeather, '"}'
        ));
        
        string memory dynamicAttributes = '';
        
        if (info.currentFarmer != address(0)) {
            dynamicAttributes = string(abi.encodePacked(
                dynamicAttributes,
                ',{"trait_type": "Current Farmer", "value": "', Strings.toHexString(uint160(info.currentFarmer), 20), '"}'
            ));
        }
        
        if (info.seedTokenId > 0) {
            dynamicAttributes = string(abi.encodePacked(
                dynamicAttributes,
                ',{"trait_type": "Seed Token ID", "value": ', Strings.toString(info.seedTokenId), ', "display_type": "number"}'
            ));
        }
        
        if (info.claimTime > 0) {
            dynamicAttributes = string(abi.encodePacked(
                dynamicAttributes,
                ',{"trait_type": "Claim Time", "value": ', Strings.toString(info.claimTime), ', "display_type": "date"}'
            ));
        }
        
        if (info.lockEndTime > 0) {
            dynamicAttributes = string(abi.encodePacked(
                dynamicAttributes,
                ',{"trait_type": "Lock End Time", "value": ', Strings.toString(info.lockEndTime), ', "display_type": "date"}'
            ));
        }
        
        if (info.accumulatedGrowth > 0) {
            dynamicAttributes = string(abi.encodePacked(
                dynamicAttributes,
                ',{"trait_type": "Accumulated Growth", "value": ', Strings.toString(info.accumulatedGrowth), ', "display_type": "number", "unit": "growth points"}'
            ));
        }
        
        return string(abi.encodePacked(baseAttributes, dynamicAttributes, ']'));
    }
    
    function _getCurrentWeatherName(uint256 landId) private view returns (string memory) {
        LandInfo memory land = landInfo[landId];
        
        if (land.weatherSeed == 0) {
            return "Unknown";
        }
        
        // 计算当前时间段的天气
        uint256 currentTime = block.timestamp;
        uint256 segmentStartTime = (currentTime / WEATHER_SEGMENT_DURATION) * WEATHER_SEGMENT_DURATION;
        WeatherType weather = _generateWeather(land.weatherSeed, segmentStartTime);
        
        return _getWeatherName(weather);
    }
    
    function _getStateName(LandState state) private pure returns (string memory) {
        if (state == LandState.Idle) return "Idle";
        if (state == LandState.Growing) return "Growing";
        if (state == LandState.Ripe) return "Ripe";
        if (state == LandState.Stealing) return "Stealing";
        if (state == LandState.LockedIdle) return "Locked Idle";
        return "Unknown";
    }
    
    function _getWeatherName(WeatherType weather) private pure returns (string memory) {
        if (weather == WeatherType.Sunny) return "Sunny";
        if (weather == WeatherType.Rainy) return "Rainy";
        if (weather == WeatherType.Storm) return "Storm";
        if (weather == WeatherType.Cloudy) return "Cloudy";
        return "Unknown";
    }
    
    function _getLandImageUrl(uint256 landId, LandState state, string memory weather) private pure returns (string memory) {
        // 构造图片URL: https://farm-assets.example.com/land_{landId}_{state}_{weather}.png
        return string(abi.encodePacked(
            "https://farm-assets.example.com/land_",
            Strings.toString(landId), "_",
            _getStateName(state), "_",
            weather, ".png"
        ));
    }
}