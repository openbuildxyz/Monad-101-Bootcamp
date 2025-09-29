// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";

contract TestFixedSystem is Script {
    // New fixed contract addresses
    FarmGame constant farmGame = FarmGame(0x);
    SeedNFT constant seedNFT = SeedNFT(0x);
    LandNFT constant landNFT = LandNFT(0x);

    uint256 constant PLAYER_A_KEY = 0x;
    address constant PLAYER_A = 0x;

    function run() external {
        console.log("=== Testing Fixed Weather System ===");
        console.log("New FarmGame:", address(farmGame));
        console.log("New LandNFT:", address(landNFT));

        // Check weather segment duration
        uint256 segmentDuration = landNFT.WEATHER_SEGMENT_DURATION();
        console.log("Weather segment duration:", segmentDuration, "seconds");

        if (segmentDuration == 60) {
            console.log("SUCCESS: Weather segments are now 1 minute (60 seconds)");
        } else {
            console.log("ERROR: Expected 60 seconds, got", segmentDuration);
            return;
        }

        console.log("\n=== Complete Game Flow Test ===");

        vm.startBroadcast(PLAYER_A_KEY);

        // 1. Buy a seed
        console.log("1. Buying wheat seed...");
        try farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat) {
            console.log("  SUCCESS: Seed purchased");
            uint256 balance = seedNFT.balanceOf(PLAYER_A);
            console.log("  Player A seed balance:", balance);
        } catch Error(string memory reason) {
            console.log("  FAILED:", reason);
            vm.stopBroadcast();
            return;
        }

        // 2. Find and claim land
        console.log("2. Claiming land...");
        uint256[] memory availableLands = landNFT.getAvailableLands();
        console.log("  Available lands:", availableLands.length);

        if (availableLands.length == 0) {
            console.log("  ERROR: No available lands");
            vm.stopBroadcast();
            return;
        }

        // Find the latest seed token
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
            console.log("  ERROR: No seed token found");
            vm.stopBroadcast();
            return;
        }

        uint256 landId = availableLands[0];
        try farmGame.claimLand(landId, tokenId) {
            console.log("  SUCCESS: Claimed land", landId, "with seed", tokenId);
        } catch Error(string memory reason) {
            console.log("  FAILED:", reason);
            vm.stopBroadcast();
            return;
        }

        vm.stopBroadcast();

        // 3. Check initial status
        console.log("3. Checking land status...");
        LandNFT.LandInfo memory land = landNFT.getLandInfo(landId);
        console.log("  Land state:", uint256(land.state));
        console.log("  Accumulated growth:", land.accumulatedGrowth);
        console.log("  Last weather update:", land.lastWeatherUpdateTime);
        console.log("  Current time:", block.timestamp);

        // 4. Wait a bit and test growth advance
        console.log("4. Testing growth advance (should work with 1+ minute gaps)...");
        uint256 initialTime = block.timestamp;

        // Wait 75 seconds (1 minute 15 seconds)
        vm.warp(block.timestamp + 75);
        console.log("  Time advanced by 75 seconds to:", block.timestamp);

        uint256 timeDiff = block.timestamp - land.lastWeatherUpdateTime;
        uint256 expectedSegments = timeDiff / 60; // 60 seconds per segment now
        console.log("  Time difference:", timeDiff, "seconds");
        console.log("  Expected segments to process:", expectedSegments);

        // Try growth advance
        try farmGame.checkAndAdvanceGrowth(landId) {
            console.log("  SUCCESS: Growth advance completed");

            // Check new status
            LandNFT.LandInfo memory updatedLand = landNFT.getLandInfo(landId);
            console.log("  Old growth:", land.accumulatedGrowth);
            console.log("  New growth:", updatedLand.accumulatedGrowth);

            uint256 growthIncrease = updatedLand.accumulatedGrowth - land.accumulatedGrowth;
            console.log("  Growth increase:", growthIncrease, "seconds");

            if (growthIncrease > 0) {
                console.log("  EXCELLENT: Weather system is working!");
                console.log("  Progress: ", updatedLand.accumulatedGrowth, "/ 3600 seconds needed");

                uint256 progressPercent = (updatedLand.accumulatedGrowth * 100) / 3600;
                console.log("  Completion:", progressPercent, "% complete");
            } else {
                console.log("  ISSUE: No growth occurred");
            }
        } catch Error(string memory reason) {
            console.log("  FAILED:", reason);
        }

        console.log("\n=== Test Complete ===");
        console.log("Weather system fix:", segmentDuration == 60 ? "SUCCESS" : "FAILED");
        console.log("Growth system:", "Tested - check growth increase above");
        console.log("Deployment time:", initialTime);
    }
}