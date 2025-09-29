// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SeedNFT.sol";
import "./LandNFT.sol";
import "./Shop.sol";
import "./KindnessToken.sol";

contract FarmGame is Ownable, ReentrancyGuard {
    SeedNFT public immutable seedNFT;
    LandNFT public immutable landNFT;
    Shop public immutable shop;
    KindnessToken public immutable kindToken;
    
    enum BoosterType { Watering, Fertilizing }
    
    struct BoosterPrice {
        uint256 nativePrice;
        uint256 kindPrice;
        bool availableForNative;
        bool availableForKind;
    }
    
    struct PlayerStats {
        uint256 totalCropsHarvested;
        uint256 totalCropsStolen;
        uint256 totalHelpProvided;
    }
    
    mapping(BoosterType => BoosterPrice) public boosterPrices;
    mapping(address => mapping(uint256 => uint256)) public dailyHelps; // player => day => count
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256) public lastHelpDay;

    // ===== 玩家注册系统 =====
    mapping(address => bool) public registeredPlayers;
    address[] public playerList;
    uint256 public totalPlayers;

    // ===== 事件记录系统 =====
    struct GameEvent {
        address player;
        uint256 timestamp;
        string eventType; // "plant", "harvest", "steal", "help", "boost"
        uint256 landId;
        uint256 seedTokenId;
        uint256 value;
        string description;
    }

    GameEvent[] public gameEvents;
    mapping(address => uint256[]) public playerEventIndexes;
    uint256 public totalEvents;

    // ===== 排行榜数据结构 =====
    struct LeaderboardEntry {
        address player;
        uint256 harvestCount;
        uint256 stealCount;
        uint256 helpCount;
        uint256 kindBalance;
        uint256 totalScore;
        uint256 rank;
    }

    // ===== 全局统计 =====
    struct GlobalStats {
        uint256 totalPlayers;
        uint256 totalHarvests;
        uint256 totalSteals;
        uint256 totalHelps;
        uint256 totalEvents;
    }

    uint256 public constant DAILY_HELP_LIMIT = 15;
    uint256 public constant MAX_BOOSTERS_PER_CROP = 10;
    uint256 public constant WATERING_TIME_REDUCTION = 2 minutes;
    uint256 public constant FERTILIZING_PERCENTAGE_REDUCTION = 5; // 5%
    
    // Weather randomness tracking
    mapping(uint256 => uint256) public weatherRequestToLand;
    uint256 private _weatherRequestCounter;
    
    event LandClaimed(address indexed player, uint256 indexed landId, uint256 indexed tokenId);
    event CropHarvested(address indexed player, uint256 indexed landId, uint256 indexed seedTokenId);
    event CropStolen(address indexed thief, address indexed victim, uint256 indexed landId, uint256 seedTokenId);
    event BoosterApplied(address indexed player, uint256 indexed landId, BoosterType boosterType);
    event HelpProvided(address indexed helper, address indexed helped, uint256 indexed landId, BoosterType boosterType);
    event WeatherRequested(uint256 indexed landId, uint256 requestId);
    event WeatherUpdated(uint256 indexed landId, uint256 weatherSeed);
    event SeedPurchased(address indexed buyer, SeedNFT.CropType cropType, uint256 tokenId, bool paidWithKind, uint256 price);

    // ===== 新增事件 =====
    event PlayerRegistered(address indexed player, uint256 timestamp);
    event GameEventRecorded(
        address indexed player,
        string indexed eventType,
        uint256 indexed landId,
        uint256 timestamp
    );
    
    constructor(
        address _seedNFT,
        address _landNFT,
        address _shop,
        address _kindToken
    ) Ownable(msg.sender) {
        seedNFT = SeedNFT(_seedNFT);
        landNFT = LandNFT(_landNFT);
        shop = Shop(_shop);
        kindToken = KindnessToken(_kindToken);
        
        // Initialize booster prices
        boosterPrices[BoosterType.Watering] = BoosterPrice({
            nativePrice: 0.0001 ether,
            kindPrice: 1 * 10**18, // 1 KIND
            availableForNative: true,
            availableForKind: true
        });
        
        boosterPrices[BoosterType.Fertilizing] = BoosterPrice({
            nativePrice: 0.0002 ether,
            kindPrice: 2 * 10**18, // 2 KIND
            availableForNative: true,
            availableForKind: true
        });
    }
    
    function claimLand(uint256 landId, uint256 tokenId) external nonReentrant {
        require(seedNFT.ownerOf(tokenId) == msg.sender, "FarmGame: Not seed owner");
        require(seedNFT.getSeedInfo(tokenId).growthStage == SeedNFT.GrowthStage.Seed, "FarmGame: Seed not in Seed stage");

        LandNFT.LandInfo memory land = landNFT.getLandInfo(landId);
        require(land.state == LandNFT.LandState.Idle, "FarmGame: Land not available");
        require(block.timestamp >= land.lockEndTime, "FarmGame: Land in cooldown");

        // Register player
        _registerPlayer(msg.sender);

        // Claim the land and bind SeedNFT
        landNFT.claimLand(landId, tokenId, msg.sender);

        // Start seed growing
        seedNFT.startGrowing(tokenId);

        // Generate weather randomness
        uint256 requestId = _requestWeatherRandomness(landId);

        // Record plant event
        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(tokenId);
        string memory cropName = _getCropTypeName(seedInfo.cropType);

        _recordEvent(
            msg.sender,
            "plant",
            landId,
            tokenId,
            1,
            string(abi.encodePacked(unicode"种植了", cropName))
        );

        emit LandClaimed(msg.sender, landId, tokenId);
        emit WeatherRequested(landId, requestId);
    }
    
    function buySeedWithNative(SeedNFT.CropType cropType) external payable nonReentrant {
        Shop.SeedPrice memory price = shop.getSeedPrice(cropType);
        require(price.availableForNative, "FarmGame: Seed not available for native token");
        require(msg.value >= price.nativePrice, "FarmGame: Insufficient payment");

        // Register player
        _registerPlayer(msg.sender);

        // Mint seed NFT directly
        SeedNFT.Rarity rarity = _getRarityForCropType(cropType);
        uint256 tokenId = seedNFT.mintSeed(msg.sender, cropType, rarity);

        // Record purchase event
        string memory cropName = _getCropTypeName(cropType);
        _recordEvent(
            msg.sender,
            "purchase",
            0, // No land ID for purchase
            tokenId,
            1,
            string(abi.encodePacked(unicode"购买了", cropName, unicode"种子"))
        );

        emit SeedPurchased(msg.sender, cropType, tokenId, false, price.nativePrice);

        // Refund excess payment
        if (msg.value > price.nativePrice) {
            payable(msg.sender).transfer(msg.value - price.nativePrice);
        }
    }
    
    function buySeedWithKind(SeedNFT.CropType cropType) external nonReentrant {
        Shop.SeedPrice memory price = shop.getSeedPrice(cropType);
        require(price.availableForKind, "FarmGame: Seed not available for KIND token");
        require(kindToken.balanceOf(msg.sender) >= price.kindPrice, "FarmGame: Insufficient KIND balance");

        // Register player
        _registerPlayer(msg.sender);

        // Burn KIND tokens
        kindToken.burn(msg.sender, price.kindPrice);

        // Mint seed NFT directly
        SeedNFT.Rarity rarity = _getRarityForCropType(cropType);
        uint256 tokenId = seedNFT.mintSeed(msg.sender, cropType, rarity);

        // Record purchase event
        string memory cropName = _getCropTypeName(cropType);
        _recordEvent(
            msg.sender,
            "purchase",
            0, // No land ID for purchase
            tokenId,
            1,
            string(abi.encodePacked(unicode"用KIND购买了", cropName, unicode"种子"))
        );

        emit SeedPurchased(msg.sender, cropType, tokenId, true, price.kindPrice);
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
    
    function harvestCrop(uint256 landId) external nonReentrant {
        LandNFT.LandInfo memory land = landNFT.getLandInfo(landId);
        require(land.currentFarmer == msg.sender, "FarmGame: Not the farmer");
        require(land.state == LandNFT.LandState.Ripe, "FarmGame: Crop not ready");

        uint256 seedTokenId = land.seedTokenId;

        // Harvest the crop
        landNFT.harvestCrop(landId);

        // Mature the seed NFT
        seedNFT.matureSeed(seedTokenId);

        // Update player stats
        playerStats[msg.sender].totalCropsHarvested++;

        // Record harvest event
        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(seedTokenId);
        string memory cropName = _getCropTypeName(seedInfo.cropType);

        _recordEvent(
            msg.sender,
            "harvest",
            landId,
            seedTokenId,
            1,
            string(abi.encodePacked(unicode"收获了", cropName))
        );

        emit CropHarvested(msg.sender, landId, seedTokenId);
    }
    
    function stealCrop(uint256 landId) external nonReentrant {
        LandNFT.LandInfo memory land = landNFT.getLandInfo(landId);
        require(land.currentFarmer != msg.sender, "FarmGame: Cannot steal from yourself");
        require(land.state == LandNFT.LandState.Ripe, "FarmGame: Crop not ready");

        uint256 seedTokenId = land.seedTokenId;
        address victim = land.currentFarmer;

        // Register player
        _registerPlayer(msg.sender);

        // Transfer the seed NFT to the thief using force transfer
        seedNFT.forceTransfer(victim, msg.sender, seedTokenId);

        // Steal the crop
        landNFT.stealCrop(landId);

        // Mature the seed NFT
        seedNFT.matureSeed(seedTokenId);

        // Update stats
        playerStats[msg.sender].totalCropsStolen++;

        // Record steal event
        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(seedTokenId);
        string memory cropName = _getCropTypeName(seedInfo.cropType);

        _recordEvent(
            msg.sender,
            "steal",
            landId,
            seedTokenId,
            1,
            string(abi.encodePacked(unicode"偷取了", cropName))
        );

        emit CropStolen(msg.sender, victim, landId, seedTokenId);
    }
    
    function applyBooster(uint256 landId, BoosterType boosterType, bool payWithKind) external payable nonReentrant {
        LandNFT.LandInfo memory land = landNFT.getLandInfo(landId);
        require(land.currentFarmer == msg.sender, "FarmGame: Not the farmer");
        require(land.state == LandNFT.LandState.Growing, "FarmGame: Crop not growing");

        uint256 seedTokenId = land.seedTokenId;
        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(seedTokenId);
        require(seedInfo.boostersApplied < MAX_BOOSTERS_PER_CROP, "FarmGame: Max boosters reached");

        BoosterPrice memory price = boosterPrices[boosterType];

        if (payWithKind) {
            require(price.availableForKind, "FarmGame: Booster not available for KIND");
            require(kindToken.balanceOf(msg.sender) >= price.kindPrice, "FarmGame: Insufficient KIND");
            kindToken.burn(msg.sender, price.kindPrice);
        } else {
            require(price.availableForNative, "FarmGame: Booster not available for native token");
            require(msg.value >= price.nativePrice, "FarmGame: Insufficient payment");

            // Refund excess payment
            if (msg.value > price.nativePrice) {
                payable(msg.sender).transfer(msg.value - price.nativePrice);
            }
        }

        // Apply the booster
        seedNFT.applyBooster(seedTokenId);

        // Record boost event
        string memory boosterName = boosterType == BoosterType.Watering ? unicode"浇水" : unicode"施肥";

        _recordEvent(
            msg.sender,
            "boost",
            landId,
            seedTokenId,
            1,
            string(abi.encodePacked(unicode"使用了", boosterName, unicode"道具"))
        );

        emit BoosterApplied(msg.sender, landId, boosterType);
    }
    
    function helpOther(uint256 landId, BoosterType boosterType, bool payWithKind) external payable nonReentrant {
        LandNFT.LandInfo memory land = landNFT.getLandInfo(landId);
        require(land.currentFarmer != msg.sender, "FarmGame: Cannot help yourself");
        require(land.currentFarmer != address(0), "FarmGame: No farmer on this land");
        require(land.state == LandNFT.LandState.Growing, "FarmGame: Crop not growing");

        uint256 currentDay = block.timestamp / 1 days;

        // Reset daily help count if it's a new day
        if (lastHelpDay[msg.sender] < currentDay) {
            dailyHelps[msg.sender][currentDay] = 0;
            lastHelpDay[msg.sender] = currentDay;
        }

        require(dailyHelps[msg.sender][currentDay] < DAILY_HELP_LIMIT, "FarmGame: Daily help limit reached");

        uint256 seedTokenId = land.seedTokenId;
        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(seedTokenId);
        require(seedInfo.boostersApplied < MAX_BOOSTERS_PER_CROP, "FarmGame: Max boosters reached");

        // Register player
        _registerPlayer(msg.sender);

        BoosterPrice memory price = boosterPrices[boosterType];

        if (payWithKind) {
            require(price.availableForKind, "FarmGame: Booster not available for KIND");
            require(kindToken.balanceOf(msg.sender) >= price.kindPrice, "FarmGame: Insufficient KIND");
            kindToken.burn(msg.sender, price.kindPrice);
        } else {
            require(price.availableForNative, "FarmGame: Booster not available for native token");
            require(msg.value >= price.nativePrice, "FarmGame: Insufficient payment");

            // Refund excess payment
            if (msg.value > price.nativePrice) {
                payable(msg.sender).transfer(msg.value - price.nativePrice);
            }
        }

        // Apply the booster to the other player's crop
        seedNFT.applyBooster(seedTokenId);

        // Reward the helper with KIND tokens
        kindToken.rewardKindness(msg.sender, land.currentFarmer);

        // Update counters
        dailyHelps[msg.sender][currentDay]++;
        playerStats[msg.sender].totalHelpProvided++;

        // Record help event
        string memory boosterName = boosterType == BoosterType.Watering ? unicode"浇水" : unicode"施肥";

        _recordEvent(
            msg.sender,
            "help",
            landId,
            seedTokenId,
            1,
            string(abi.encodePacked(unicode"帮助其他农民", boosterName))
        );

        emit HelpProvided(msg.sender, land.currentFarmer, landId, boosterType);
    }
    
    function checkAndAdvanceGrowth(uint256 landId) external {
        LandNFT.LandInfo memory land = landNFT.getLandInfo(landId);
        require(land.state == LandNFT.LandState.Growing, "FarmGame: Land not growing");
        
        uint256 seedTokenId = land.seedTokenId;
        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(seedTokenId);
        
        // Calculate effective growth time with boosters
        uint256 effectiveGrowthTime = _calculateEffectiveGrowthTime(seedInfo);
        
        // Advance growth progress with weather effects
        bool isRipe = landNFT.advanceGrowth(landId, effectiveGrowthTime);
        
        if (isRipe) {
            // Crop is ready for harvest
        }
    }
    
    function _calculateEffectiveGrowthTime(SeedNFT.SeedInfo memory seedInfo) private pure returns (uint256) {
        uint256 baseTime = seedInfo.baseGrowthTime;
        uint256 boostersApplied = seedInfo.boostersApplied;
        
        // Apply time reduction from watering (assuming half are watering, half fertilizing)
        uint256 wateringBoosters = boostersApplied / 2;
        uint256 fertilizingBoosters = boostersApplied - wateringBoosters;
        
        // Watering reduces time by 2 minutes per application
        baseTime = baseTime > (wateringBoosters * WATERING_TIME_REDUCTION) ? 
                   baseTime - (wateringBoosters * WATERING_TIME_REDUCTION) : 0;
        
        // Fertilizing reduces time by 5% per application
        for (uint256 i = 0; i < fertilizingBoosters; i++) {
            baseTime = (baseTime * (100 - FERTILIZING_PERCENTAGE_REDUCTION)) / 100;
        }
        
        return baseTime;
    }
    
    function _requestWeatherRandomness(uint256 landId) private returns (uint256 requestId) {
        // Generate deterministic request ID
        requestId = _weatherRequestCounter++;
        weatherRequestToLand[requestId] = landId;
        
        // Generate secure weather seed using blockhash approach
        uint256 weatherSeed = _generateWeatherSeed(landId, msg.sender);
        
        landNFT.setWeatherSeed(landId, weatherSeed);
        emit WeatherUpdated(landId, weatherSeed);
        
        return requestId;
    }
    
    function _generateWeatherSeed(uint256 landId, address user) private view returns (uint256) {
        bytes32 prevBlockHash = block.number > 0 ? blockhash(block.number - 1) : bytes32(0);
        return uint256(keccak256(abi.encodePacked(
            prevBlockHash,                  // 前一个区块的哈希
            block.timestamp,                // 当前时间戳
            user,                          // 用户地址
            landId,                        // 土地ID
            block.prevrandao               // 区块随机数（替代difficulty）
        )));
    }
    
    
    function updateBoosterPrice(
        BoosterType boosterType,
        uint256 nativePrice,
        uint256 kindPrice,
        bool availableForNative,
        bool availableForKind
    ) external onlyOwner {
        boosterPrices[boosterType] = BoosterPrice({
            nativePrice: nativePrice,
            kindPrice: kindPrice,
            availableForNative: availableForNative,
            availableForKind: availableForKind
        });
    }
    
    
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    function getRemainingDailyHelps(address helper) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (lastHelpDay[helper] < currentDay) {
            return DAILY_HELP_LIMIT;
        }
        
        uint256 used = dailyHelps[helper][currentDay];
        return used >= DAILY_HELP_LIMIT ? 0 : DAILY_HELP_LIMIT - used;
    }
    
    function getBoosterPrice(BoosterType boosterType) external view returns (BoosterPrice memory) {
        return boosterPrices[boosterType];
    }
    
    function getSeedPrice(SeedNFT.CropType cropType) external view returns (Shop.SeedPrice memory) {
        return shop.getSeedPrice(cropType);
    }
    
    function getAvailableSeedsForNative() external view returns (SeedNFT.CropType[] memory) {
        return shop.getAvailableSeedsForNative();
    }
    
    function getAvailableSeedsForKind() external view returns (SeedNFT.CropType[] memory) {
        return shop.getAvailableSeedsForKind();
    }
    
    function emergencyPause() external onlyOwner {
        // Emergency pause functionality if needed
    }
    
    function withdrawNative() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "FarmGame: No native tokens to withdraw");
        payable(owner()).transfer(balance);
    }

    // ===== 玩家注册系统 =====

    /**
     * @dev 注册新玩家（内部函数）
     */
    function _registerPlayer(address player) private {
        if (!registeredPlayers[player]) {
            registeredPlayers[player] = true;
            playerList.push(player);
            totalPlayers++;

            emit PlayerRegistered(player, block.timestamp);
        }
    }

    /**
     * @dev 获取所有注册玩家
     */
    function getAllPlayers() external view returns (address[] memory) {
        return playerList;
    }

    /**
     * @dev 获取玩家数量
     */
    function getTotalPlayers() external view returns (uint256) {
        return totalPlayers;
    }

    /**
     * @dev 检查玩家是否已注册
     */
    function isPlayerRegistered(address player) external view returns (bool) {
        return registeredPlayers[player];
    }

    // ===== 事件记录系统 =====

    /**
     * @dev 记录游戏事件（内部函数）
     */
    function _recordEvent(
        address player,
        string memory eventType,
        uint256 landId,
        uint256 seedTokenId,
        uint256 value,
        string memory description
    ) private {
        // 确保玩家已注册
        _registerPlayer(player);

        // 创建事件记录
        GameEvent memory newEvent = GameEvent({
            player: player,
            timestamp: block.timestamp,
            eventType: eventType,
            landId: landId,
            seedTokenId: seedTokenId,
            value: value,
            description: description
        });

        // 存储事件
        gameEvents.push(newEvent);
        playerEventIndexes[player].push(totalEvents);
        totalEvents++;

        emit GameEventRecorded(player, eventType, landId, block.timestamp);
    }

    /**
     * @dev 获取玩家事件历史
     */
    function getPlayerEvents(address player, uint256 limit)
        external view returns (GameEvent[] memory) {
        uint256[] memory eventIndexes = playerEventIndexes[player];
        uint256 count = eventIndexes.length;

        if (limit > 0 && limit < count) {
            count = limit;
        }

        GameEvent[] memory events = new GameEvent[](count);
        for (uint256 i = 0; i < count; i++) {
            // 返回最新的事件
            events[i] = gameEvents[eventIndexes[count - 1 - i]];
        }

        return events;
    }

    /**
     * @dev 获取玩家事件数量
     */
    function getPlayerEventCount(address player) external view returns (uint256) {
        return playerEventIndexes[player].length;
    }

    /**
     * @dev 获取最新的全局事件
     */
    function getRecentEvents(uint256 limit) external view returns (GameEvent[] memory) {
        uint256 count = totalEvents > limit ? limit : totalEvents;
        GameEvent[] memory events = new GameEvent[](count);

        for (uint256 i = 0; i < count; i++) {
            events[i] = gameEvents[totalEvents - 1 - i];
        }

        return events;
    }

    // ===== 排行榜查询系统 =====

    /**
     * @dev 获取收获排行榜
     */
    function getHarvestLeaderboard(uint256 limit) external view returns (LeaderboardEntry[] memory) {
        require(limit > 0 && limit <= 100, "Invalid limit");

        uint256 playerCount = playerList.length;
        if (playerCount == 0) {
            return new LeaderboardEntry[](0);
        }

        // 创建临时数组存储所有玩家数据
        LeaderboardEntry[] memory allPlayers = new LeaderboardEntry[](playerCount);

        for (uint256 i = 0; i < playerCount; i++) {
            address player = playerList[i];
            PlayerStats memory stats = playerStats[player];

            allPlayers[i] = LeaderboardEntry({
                player: player,
                harvestCount: stats.totalCropsHarvested,
                stealCount: stats.totalCropsStolen,
                helpCount: stats.totalHelpProvided,
                kindBalance: kindToken.balanceOf(player),
                totalScore: stats.totalCropsHarvested + stats.totalCropsStolen,
                rank: 0 // 稍后设置
            });
        }

        // 冒泡排序（按总分降序）
        for (uint256 i = 0; i < playerCount - 1; i++) {
            for (uint256 j = 0; j < playerCount - i - 1; j++) {
                if (allPlayers[j].totalScore < allPlayers[j + 1].totalScore) {
                    LeaderboardEntry memory temp = allPlayers[j];
                    allPlayers[j] = allPlayers[j + 1];
                    allPlayers[j + 1] = temp;
                }
            }
        }

        // 设置排名并返回前N名
        uint256 returnCount = limit > playerCount ? playerCount : limit;
        LeaderboardEntry[] memory topPlayers = new LeaderboardEntry[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            allPlayers[i].rank = i + 1;
            topPlayers[i] = allPlayers[i];
        }

        return topPlayers;
    }

    /**
     * @dev 获取善良值排行榜
     */
    function getKindnessLeaderboard(uint256 limit) external view returns (LeaderboardEntry[] memory) {
        require(limit > 0 && limit <= 100, "Invalid limit");

        uint256 playerCount = playerList.length;
        if (playerCount == 0) {
            return new LeaderboardEntry[](0);
        }

        // 创建临时数组存储所有玩家数据
        LeaderboardEntry[] memory allPlayers = new LeaderboardEntry[](playerCount);

        for (uint256 i = 0; i < playerCount; i++) {
            address player = playerList[i];
            PlayerStats memory stats = playerStats[player];
            uint256 kindBalance = kindToken.balanceOf(player);

            allPlayers[i] = LeaderboardEntry({
                player: player,
                harvestCount: stats.totalCropsHarvested,
                stealCount: stats.totalCropsStolen,
                helpCount: stats.totalHelpProvided,
                kindBalance: kindBalance,
                totalScore: kindBalance, // 善良值排行榜按KIND余额排序
                rank: 0
            });
        }

        // 冒泡排序（按KIND余额降序）
        for (uint256 i = 0; i < playerCount - 1; i++) {
            for (uint256 j = 0; j < playerCount - i - 1; j++) {
                if (allPlayers[j].kindBalance < allPlayers[j + 1].kindBalance) {
                    LeaderboardEntry memory temp = allPlayers[j];
                    allPlayers[j] = allPlayers[j + 1];
                    allPlayers[j + 1] = temp;
                }
            }
        }

        // 设置排名并返回前N名
        uint256 returnCount = limit > playerCount ? playerCount : limit;
        LeaderboardEntry[] memory topPlayers = new LeaderboardEntry[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            allPlayers[i].rank = i + 1;
            topPlayers[i] = allPlayers[i];
        }

        return topPlayers;
    }

    /**
     * @dev 获取玩家排名
     */
    function getPlayerRank(address player) external view returns (uint256 harvestRank, uint256 kindnessRank) {
        require(registeredPlayers[player], "Player not registered");

        PlayerStats memory playerStat = playerStats[player];
        uint256 playerHarvestScore = playerStat.totalCropsHarvested + playerStat.totalCropsStolen;
        uint256 playerKindBalance = kindToken.balanceOf(player);

        harvestRank = 1;
        kindnessRank = 1;

        // 计算排名
        for (uint256 i = 0; i < playerList.length; i++) {
            address otherPlayer = playerList[i];
            if (otherPlayer != player) {
                PlayerStats memory otherStats = playerStats[otherPlayer];
                uint256 otherHarvestScore = otherStats.totalCropsHarvested + otherStats.totalCropsStolen;
                uint256 otherKindBalance = kindToken.balanceOf(otherPlayer);

                if (otherHarvestScore > playerHarvestScore) {
                    harvestRank++;
                }
                if (otherKindBalance > playerKindBalance) {
                    kindnessRank++;
                }
            }
        }
    }

    /**
     * @dev 获取全局统计数据
     */
    function getGlobalStats() external view returns (GlobalStats memory) {
        uint256 totalHarvests = 0;
        uint256 totalSteals = 0;
        uint256 totalHelps = 0;

        for (uint256 i = 0; i < playerList.length; i++) {
            PlayerStats memory stats = playerStats[playerList[i]];
            totalHarvests += stats.totalCropsHarvested;
            totalSteals += stats.totalCropsStolen;
            totalHelps += stats.totalHelpProvided;
        }

        return GlobalStats({
            totalPlayers: totalPlayers,
            totalHarvests: totalHarvests,
            totalSteals: totalSteals,
            totalHelps: totalHelps,
            totalEvents: totalEvents
        });
    }

    // ===== 辅助函数 =====

    /**
     * @dev 根据作物类型获取名称
     */
    function _getCropTypeName(SeedNFT.CropType cropType) private pure returns (string memory) {
        if (cropType == SeedNFT.CropType.Wheat) return unicode"小麦";
        if (cropType == SeedNFT.CropType.Corn) return unicode"玉米";
        if (cropType == SeedNFT.CropType.Pumpkin) return unicode"南瓜";
        if (cropType == SeedNFT.CropType.Strawberry) return unicode"草莓";
        if (cropType == SeedNFT.CropType.Grape) return unicode"葡萄";
        if (cropType == SeedNFT.CropType.Watermelon) return unicode"西瓜";
        return unicode"未知作物";
    }
}