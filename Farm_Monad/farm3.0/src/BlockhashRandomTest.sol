// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BlockhashRandomTest {
    
    enum WeatherType { Sunny, Rainy, Cloudy, Storm }
    
    struct RandomResult {
        bytes32 seed;
        uint256 blockNumber;
        uint256 timestamp;
        address user;
        WeatherType weather;
    }
    
    mapping(uint256 => RandomResult[]) public testResults;
    mapping(WeatherType => uint256) public weatherCount;
    uint256 public totalTests;
    
    event RandomGenerated(
        uint256 indexed testId,
        bytes32 seed,
        WeatherType weather,
        uint256 blockNumber,
        address user
    );
    
    // 核心随机数生成函数 - 模拟农场游戏的实际使用
    function generateWeatherSeed(uint256 landId, address user) public view returns (bytes32) {
        return keccak256(abi.encodePacked(
            blockhash(block.number - 1),    // 前一个区块的哈希
            block.timestamp,                // 当前时间戳  
            user,                          // 用户地址
            landId,                        // 土地ID
            block.difficulty               // 区块难度（如果支持的话）
        ));
    }
    
    // 将seed转换为天气类型
    function seedToWeather(bytes32 seed) public pure returns (WeatherType) {
        uint256 value = uint256(seed) % 100;
        
        if (value < 40) return WeatherType.Sunny;    // 40%
        if (value < 65) return WeatherType.Rainy;    // 25%  
        if (value < 80) return WeatherType.Cloudy;   // 15%
        return WeatherType.Storm;                    // 20%
    }
    
    // 完整的随机天气生成流程
    function generateWeatherForLand(uint256 landId) external returns (WeatherType) {
        bytes32 seed = generateWeatherSeed(landId, msg.sender);
        WeatherType weather = seedToWeather(seed);
        
        // 记录结果用于分析
        testResults[landId].push(RandomResult({
            seed: seed,
            blockNumber: block.number,
            timestamp: block.timestamp,
            user: msg.sender,
            weather: weather
        }));
        
        weatherCount[weather]++;
        totalTests++;
        
        emit RandomGenerated(landId, seed, weather, block.number, msg.sender);
        
        return weather;
    }
    
    // 批量测试 - 同一个用户连续生成随机数
    function batchTestSameUser(uint256 count) external {
        for (uint256 i = 0; i < count; i++) {
            uint256 landId = 1000 + i;
            bytes32 seed = generateWeatherSeed(landId, msg.sender);
            WeatherType weather = seedToWeather(seed);
            
            testResults[landId].push(RandomResult({
                seed: seed,
                blockNumber: block.number,
                timestamp: block.timestamp,
                user: msg.sender,
                weather: weather
            }));
            
            weatherCount[weather]++;
            totalTests++;
            
            emit RandomGenerated(landId, seed, weather, block.number, msg.sender);
        }
    }
    
    // 批量测试 - 模拟不同用户
    function batchTestDifferentScenarios(uint256 count) external {
        for (uint256 i = 0; i < count; i++) {
            // 模拟不同场景
            uint256 landId = 2000 + (i % 10);  // 重复使用一些landId
            bytes32 seed = generateWeatherSeed(landId, address(uint160(0x1000 + i))); // 不同用户地址
            WeatherType weather = seedToWeather(seed);
            
            testResults[landId].push(RandomResult({
                seed: seed,
                blockNumber: block.number,
                timestamp: block.timestamp,
                user: address(uint160(0x1000 + i)),
                weather: weather
            }));
            
            weatherCount[weather]++;
            totalTests++;
            
            emit RandomGenerated(landId, seed, weather, block.number, address(uint160(0x1000 + i)));
        }
    }
    
    // 获取天气分布统计
    function getWeatherDistribution() external view returns (
        uint256 sunnyCount,
        uint256 rainyCount, 
        uint256 cloudyCount,
        uint256 stormCount,
        uint256 total
    ) {
        return (
            weatherCount[WeatherType.Sunny],
            weatherCount[WeatherType.Rainy],
            weatherCount[WeatherType.Cloudy],
            weatherCount[WeatherType.Storm],
            totalTests
        );
    }
    
    // 获取天气分布百分比
    function getWeatherPercentages() external view returns (
        uint256 sunnyPercent,
        uint256 rainyPercent,
        uint256 cloudyPercent, 
        uint256 stormPercent
    ) {
        if (totalTests == 0) return (0, 0, 0, 0);
        
        return (
            (weatherCount[WeatherType.Sunny] * 100) / totalTests,
            (weatherCount[WeatherType.Rainy] * 100) / totalTests,
            (weatherCount[WeatherType.Cloudy] * 100) / totalTests,
            (weatherCount[WeatherType.Storm] * 100) / totalTests
        );
    }
    
    // 检查种子的唯一性
    function checkSeedUniqueness(uint256 landId, uint256 count) external view returns (
        uint256 uniqueSeeds,
        uint256 totalSeeds
    ) {
        RandomResult[] storage results = testResults[landId];
        
        bytes32[] memory seeds = new bytes32[](count);
        uint256 actualCount = results.length < count ? results.length : count;
        
        // 收集种子
        for (uint256 i = 0; i < actualCount; i++) {
            seeds[i] = results[results.length - actualCount + i].seed;
        }
        
        // 计算唯一种子数量
        uint256 unique = 0;
        for (uint256 i = 0; i < actualCount; i++) {
            bool isUnique = true;
            for (uint256 j = 0; j < i; j++) {
                if (seeds[i] == seeds[j]) {
                    isUnique = false;
                    break;
                }
            }
            if (isUnique) unique++;
        }
        
        return (unique, actualCount);
    }
    
    // 获取特定土地的测试历史
    function getLandTestHistory(uint256 landId) external view returns (
        bytes32[] memory seeds,
        uint256[] memory blockNumbers,
        uint256[] memory timestamps,
        address[] memory users,
        WeatherType[] memory weathers
    ) {
        RandomResult[] storage results = testResults[landId];
        uint256 length = results.length;
        
        seeds = new bytes32[](length);
        blockNumbers = new uint256[](length);
        timestamps = new uint256[](length);
        users = new address[](length);
        weathers = new WeatherType[](length);
        
        for (uint256 i = 0; i < length; i++) {
            seeds[i] = results[i].seed;
            blockNumbers[i] = results[i].blockNumber;
            timestamps[i] = results[i].timestamp;
            users[i] = results[i].user;
            weathers[i] = results[i].weather;
        }
    }
    
    // 测试边界条件：同一区块内多次调用
    function testSameBlockCalls(uint256 landId, uint256 count) external returns (bool allDifferent) {
        bytes32[] memory seeds = new bytes32[](count);
        
        for (uint256 i = 0; i < count; i++) {
            // 通过改变用户地址来确保不同的输入
            address testUser = address(uint160(uint256(uint160(msg.sender)) + i));
            seeds[i] = generateWeatherSeed(landId + i, testUser);
        }
        
        // 检查是否所有种子都不同
        allDifferent = true;
        for (uint256 i = 0; i < count; i++) {
            for (uint256 j = i + 1; j < count; j++) {
                if (seeds[i] == seeds[j]) {
                    allDifferent = false;
                    break;
                }
            }
            if (!allDifferent) break;
        }
        
        return allDifferent;
    }
    
    // 重置统计数据
    function resetStats() external {
        weatherCount[WeatherType.Sunny] = 0;
        weatherCount[WeatherType.Rainy] = 0;
        weatherCount[WeatherType.Cloudy] = 0;
        weatherCount[WeatherType.Storm] = 0;
        totalTests = 0;
    }
    
    // 检查当前区块信息
    function getCurrentBlockInfo() external view returns (
        uint256 blockNumber,
        uint256 timestamp,
        bytes32 currentBlockHash,
        bytes32 previousBlockHash,
        uint256 difficulty
    ) {
        return (
            block.number,
            block.timestamp,
            blockhash(block.number), // 通常为空
            blockhash(block.number - 1),
            block.difficulty
        );
    }
}