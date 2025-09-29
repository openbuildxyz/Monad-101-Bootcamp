// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";

contract DebugGrowthSystem is Script {
    FarmGame constant farmGame = FarmGame(0xff91290e0fB079097c6C6b7b68961E88ECB5E7E0);
    SeedNFT constant seedNFT = SeedNFT(0xCEAdfDA643baEdD53CDfb9bA9338FD8CD9aea9f9);
    LandNFT constant landNFT = LandNFT(0x714e649777364d4D8d211E80c7Ee5EbD54115285);

    uint256 constant PLAYER_A_KEY = 0x;

    function run() external {
        console.log("=== Growth System Debug ===");

        // Get land info
        LandNFT.LandInfo memory land = landNFT.getLandInfo(0);
        console.log("Current time:", block.timestamp);
        console.log("Last weather update:", land.lastWeatherUpdateTime);
        console.log("Time elapsed:", block.timestamp - land.lastWeatherUpdateTime);
        console.log("Current accumulated growth:", land.accumulatedGrowth);

        // Get seed info
        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(land.seedTokenId);
        console.log("Seed base growth time:", seedInfo.baseGrowthTime);
        console.log("Boosters applied:", seedInfo.boostersApplied);

        // Calculate what effective time should be
        uint256 effectiveTime = calculateEffectiveGrowthTime(seedInfo);
        console.log("Calculated effective growth time:", effectiveTime);

        // Check weather simulation
        try landNFT.simulateWeatherForLand(0) returns (
            LandNFT.WeatherType[] memory weatherTypes,
            uint256[] memory growthValues
        ) {
            console.log("Weather simulation results:");
            uint256 totalSimulatedGrowth = 0;
            for (uint256 i = 0; i < weatherTypes.length && i < 3; i++) {
                console.log("  Segment", i);
                console.log("    Weather:", uint256(weatherTypes[i]));
                console.log("    Growth:", growthValues[i]);
                totalSimulatedGrowth += growthValues[i];
            }
            console.log("Total simulated growth to be added:", totalSimulatedGrowth);
        } catch {
            console.log("Weather simulation failed");
        }

        console.log("\n=== Attempting Growth Advance ===");

        vm.startBroadcast(PLAYER_A_KEY);

        // Record before state
        LandNFT.LandInfo memory beforeLand = landNFT.getLandInfo(0);
        console.log("BEFORE - Accumulated growth:", beforeLand.accumulatedGrowth);
        console.log("BEFORE - Last weather update:", beforeLand.lastWeatherUpdateTime);

        try farmGame.checkAndAdvanceGrowth(0) {
            console.log("Growth advance call succeeded");
        } catch Error(string memory reason) {
            console.log("Growth advance failed:", reason);
        }

        // Record after state
        LandNFT.LandInfo memory afterLand = landNFT.getLandInfo(0);
        console.log("AFTER - Accumulated growth:", afterLand.accumulatedGrowth);
        console.log("AFTER - Last weather update:", afterLand.lastWeatherUpdateTime);
        console.log("AFTER - State:", uint256(afterLand.state));

        // Check if anything changed
        if (afterLand.accumulatedGrowth > beforeLand.accumulatedGrowth) {
            console.log("SUCCESS: Growth increased by", afterLand.accumulatedGrowth - beforeLand.accumulatedGrowth);
        } else {
            console.log("PROBLEM: No growth occurred");
        }

        vm.stopBroadcast();
    }

    function calculateEffectiveGrowthTime(SeedNFT.SeedInfo memory seedInfo) internal pure returns (uint256) {
        uint256 baseTime = seedInfo.baseGrowthTime;
        uint256 boostersApplied = seedInfo.boostersApplied;

        // Apply time reduction from watering (assuming half are watering, half fertilizing)
        uint256 wateringBoosters = boostersApplied / 2;
        uint256 fertilizingBoosters = boostersApplied - wateringBoosters;

        // Watering reduces time by 2 minutes per application
        uint256 WATERING_TIME_REDUCTION = 2 minutes;
        baseTime = baseTime > (wateringBoosters * WATERING_TIME_REDUCTION) ?
                   baseTime - (wateringBoosters * WATERING_TIME_REDUCTION) : 0;

        // Fertilizing reduces time by 5% per application
        uint256 FERTILIZING_PERCENTAGE_REDUCTION = 5; // 5%
        for (uint256 i = 0; i < fertilizingBoosters; i++) {
            baseTime = (baseTime * (100 - FERTILIZING_PERCENTAGE_REDUCTION)) / 100;
        }

        return baseTime;
    }
}