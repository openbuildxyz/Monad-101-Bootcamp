// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";

contract TestHarvest is Script {
    FarmGame constant farmGame = FarmGame(0x);
    SeedNFT constant seedNFT = SeedNFT(0x);
    LandNFT constant landNFT = LandNFT(0x);

    uint256 constant PLAYER_A_KEY = 0x;
    uint256 constant PLAYER_B_KEY = 0x;
    address constant PLAYER_A = 0x;
    address constant PLAYER_B = 0x;

    function run() external {
        console.log("=== Complete Harvest Flow Test ===");

        // Find Player A's land
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
            console.log("No growing land found");
            return;
        }

        console.log("Testing land:", landId);
        LandNFT.LandInfo memory landInfo = landNFT.getLandInfo(landId);
        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(landInfo.seedTokenId);

        console.log("Seed base time:", seedInfo.baseGrowthTime, "seconds");
        console.log("Current progress:", landInfo.accumulatedGrowth, "seconds");
        console.log("Boosters applied:", seedInfo.boostersApplied);

        // Calculate how much time we need to simulate
        uint256 effectiveTime = calculateEffectiveGrowthTime(seedInfo);
        console.log("Effective growth time needed:", effectiveTime, "seconds");

        if (landInfo.accumulatedGrowth >= effectiveTime) {
            console.log("Already ripe! Trying to harvest...");
            testHarvest(landId);
            return;
        }

        // Simulate enough time to make crop ripe
        uint256 timeNeeded = effectiveTime - landInfo.accumulatedGrowth;
        console.log("Time needed for maturity:", timeNeeded, "seconds");

        // Jump forward in time to mature the crop
        uint256 segmentsNeeded = (timeNeeded / 900) + 2; // 900 seconds = 15 minutes
        console.log("Advancing time by", segmentsNeeded * 15, "minutes...");

        vm.warp(block.timestamp + (segmentsNeeded * 900));
        console.log("New time:", block.timestamp);

        // Advance growth
        try farmGame.checkAndAdvanceGrowth(landId) {
            LandNFT.LandInfo memory updatedInfo = landNFT.getLandInfo(landId);
            console.log("After time jump - Progress:", updatedInfo.accumulatedGrowth);
            console.log("State:", uint256(updatedInfo.state));

            if (updatedInfo.state == LandNFT.LandState.Ripe) {
                console.log("SUCCESS: Crop is now ripe!");
                testHarvest(landId);
                testSteal(landId);
            } else {
                console.log("Still not ripe. Trying multiple advances...");
                for (uint256 i = 0; i < 5; i++) {
                    vm.warp(block.timestamp + 900); // 15 more minutes
                    try farmGame.checkAndAdvanceGrowth(landId) {
                        LandNFT.LandInfo memory newInfo = landNFT.getLandInfo(landId);
                        console.log("Attempt", i);
                        console.log("  Progress:", newInfo.accumulatedGrowth);
                        console.log("  State:", uint256(newInfo.state));
                        if (newInfo.state == LandNFT.LandState.Ripe) {
                            console.log("RIPE at attempt", i);
                            testHarvest(landId);
                            return;
                        }
                    } catch Error(string memory reason) {
                        console.log("Advance failed:", reason);
                    }
                }
            }
        } catch Error(string memory reason) {
            console.log("Failed to advance growth:", reason);
        }
    }

    function testHarvest(uint256 landId) internal {
        console.log("\n=== Testing Harvest ===");

        vm.startBroadcast(PLAYER_A_KEY);

        try farmGame.harvestCrop(landId) {
            console.log("SUCCESS: Harvested crop!");

            // Check land state
            LandNFT.LandInfo memory landInfo = landNFT.getLandInfo(landId);
            console.log("Land state after harvest:", uint256(landInfo.state));
            console.log("Lock end time:", landInfo.lockEndTime);
            console.log("Current time:", block.timestamp);

            if (landInfo.lockEndTime > block.timestamp) {
                uint256 cooldown = landInfo.lockEndTime - block.timestamp;
                console.log("Cooldown remaining:", cooldown, "seconds");
            }

        } catch Error(string memory reason) {
            console.log("FAILED: Harvest failed -", reason);
        }

        vm.stopBroadcast();
    }

    function testSteal(uint256 landId) internal {
        console.log("\n=== Testing Steal (should fail after harvest) ===");

        vm.startBroadcast(PLAYER_B_KEY);

        try farmGame.stealCrop(landId) {
            console.log("ERROR: Steal should have failed!");
        } catch Error(string memory reason) {
            console.log("CORRECT: Steal failed as expected -", reason);
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