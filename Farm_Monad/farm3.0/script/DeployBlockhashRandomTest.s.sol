// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BlockhashRandomTest.sol";

contract DeployBlockhashRandomTest is Script {
    function run() external {
        uint256 deployerPrivateKey = 0x;
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Deploying BlockhashRandomTest on Monad Testnet ===");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署测试合约
        BlockhashRandomTest randomTest = new BlockhashRandomTest();
        console.log("BlockhashRandomTest deployed at:", address(randomTest));
        
        vm.stopBroadcast();
        
        console.log("=== Running Basic Tests ===");
        
        // 检查区块信息
        (uint256 blockNumber, uint256 timestamp, bytes32 currentHash, bytes32 previousHash, uint256 difficulty) = 
            randomTest.getCurrentBlockInfo();
            
        console.log("Current block number:", blockNumber);
        console.log("Current timestamp:", timestamp);
        console.log("Previous block hash:", vm.toString(previousHash));
        console.log("Difficulty/prevrandao:", difficulty);
        
        // 测试随机数生成
        bytes32 testSeed = randomTest.generateWeatherSeed(1, deployer);
        console.log("Generated seed for land 1:", vm.toString(testSeed));
        
        BlockhashRandomTest.WeatherType weather = randomTest.seedToWeather(testSeed);
        console.log("Weather type:", uint8(weather));
        
        string memory weatherName;
        if (weather == BlockhashRandomTest.WeatherType.Sunny) weatherName = "Sunny";
        else if (weather == BlockhashRandomTest.WeatherType.Rainy) weatherName = "Rainy";
        else if (weather == BlockhashRandomTest.WeatherType.Cloudy) weatherName = "Cloudy";
        else weatherName = "Storm";
        
        console.log("Weather name:", weatherName);
        
        console.log("=== Ready for comprehensive testing ===");
        console.log("Contract deployed successfully at:", address(randomTest));
        console.log("You can now run the following tests:");
        console.log("- generateWeatherForLand(landId) - single test");
        console.log("- batchTestSameUser(count) - batch test same user");
        console.log("- batchTestDifferentScenarios(count) - batch test different users");
        console.log("- getWeatherDistribution() - view statistics");
        
        console.log("=== Deployment Summary ===");
        console.log("Network: Monad Testnet");
        console.log("Random Test Contract:", address(randomTest));
        console.log("Block Number:", blockNumber);
    }
}