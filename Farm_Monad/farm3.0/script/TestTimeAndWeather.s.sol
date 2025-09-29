// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";

contract TestTimeAndWeather is Script {
    FarmGame constant farmGame = FarmGame(0x);
    SeedNFT constant seedNFT = SeedNFT(0x);
    LandNFT constant landNFT = LandNFT(0x);

    uint256 constant PLAYER_A_KEY = 0x;
    address constant PLAYER_A = 0x;

    function run() external {
        console.log("=== Time and Weather System Test ===");

        // Find Player A's growing land
        uint256 landId = type(uint256).max;
        for (uint256 i = 0; i < 10; i++) {
            try landNFT.getLandInfo(i) returns (LandNFT.LandInfo memory info) {
                if (info.currentFarmer == PLAYER_A && info.state == LandNFT.LandState.Growing) {
                    landId = i;
                    break;
                }
            } catch {
                continue;
            }
        }

        if (landId == type(uint256).max) {
            console.log("No growing land found. Setting up test...");
            setupTest();
            return;
        }

        console.log("Testing land:", landId);

        // Get current land info
        LandNFT.LandInfo memory landInfo = landNFT.getLandInfo(landId);
        console.log("Current state:", uint256(landInfo.state));
        console.log("Weather seed:", landInfo.weatherSeed);
        console.log("Last weather update:", landInfo.lastWeatherUpdateTime);
        console.log("Accumulated growth:", landInfo.accumulatedGrowth);
        console.log("Current time:", block.timestamp);

        // Get seed info
        if (landInfo.seedTokenId > 0) {
            SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(landInfo.seedTokenId);
            console.log("Seed base growth time:", seedInfo.baseGrowthTime);
            console.log("Seed boosters applied:", seedInfo.boostersApplied);

            // Calculate effective growth time
            uint256 effectiveTime = calculateEffectiveGrowthTime(seedInfo);
            console.log("Effective growth time:", effectiveTime);
            console.log("Progress needed:", effectiveTime);
            console.log("Current progress:", landInfo.accumulatedGrowth);

            if (landInfo.accumulatedGrowth >= effectiveTime) {
                console.log("READY: Should be ripe for harvest!");
            } else {
                uint256 remaining = effectiveTime - landInfo.accumulatedGrowth;
                console.log("Remaining growth needed:", remaining);
            }
        }

        // Simulate weather
        try landNFT.simulateWeatherForLand(landId) returns (
            LandNFT.WeatherType[] memory weatherTypes,
            uint256[] memory growthValues
        ) {
            console.log("Weather simulation:");
            for (uint256 i = 0; i < weatherTypes.length && i < 5; i++) {
                console.log("  Segment", i);
                console.log("  Weather:", uint256(weatherTypes[i]));
                console.log("  Growth:", growthValues[i]);
            }
        } catch {
            console.log("Could not simulate weather");
        }

        // Try to advance growth multiple times
        console.log("\nAdvancing growth...");
        for (uint256 i = 0; i < 3; i++) {
            try farmGame.checkAndAdvanceGrowth(landId) {
                LandNFT.LandInfo memory updatedInfo = landNFT.getLandInfo(landId);
                console.log("Growth advance", i);
                console.log("  Progress:", updatedInfo.accumulatedGrowth);
                console.log("  State:", uint256(updatedInfo.state));

                if (updatedInfo.state == LandNFT.LandState.Ripe) {
                    console.log("RIPE: Crop is ready!");
                    break;
                }
            } catch Error(string memory reason) {
                console.log("Growth advance", i, "failed:", reason);
            }

            // Wait a bit (simulate time passing)
            if (i < 2) {
                vm.warp(block.timestamp + 900); // Add 15 minutes
                console.log("Time advanced to:", block.timestamp);
            }
        }
    }

    function setupTest() internal {
        console.log("Setting up fresh test scenario...");

        vm.startBroadcast(PLAYER_A_KEY);

        // Buy a seed
        try farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat) {
            console.log("Bought wheat seed");
        } catch Error(string memory reason) {
            console.log("Failed to buy seed:", reason);
            vm.stopBroadcast();
            return;
        }

        // Find the seed token
        uint256 tokenId = type(uint256).max;
        uint256 totalSupply = seedNFT.totalSupply();

        for (uint256 i = 0; i < totalSupply; i++) {
            try seedNFT.ownerOf(i) returns (address owner) {
                if (owner == PLAYER_A) {
                    tokenId = i;
                    break;
                }
            } catch {
                continue;
            }
        }

        if (tokenId == type(uint256).max) {
            console.log("Could not find seed token");
            vm.stopBroadcast();
            return;
        }

        // Find available land
        uint256[] memory availableLands = landNFT.getAvailableLands();
        if (availableLands.length == 0) {
            console.log("No available land");
            vm.stopBroadcast();
            return;
        }

        uint256 landId = availableLands[0];

        // Claim land
        try farmGame.claimLand(landId, tokenId) {
            console.log("Claimed land", landId, "with seed", tokenId);
            console.log("Re-run the test to check weather and growth");
        } catch Error(string memory reason) {
            console.log("Failed to claim land:", reason);
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