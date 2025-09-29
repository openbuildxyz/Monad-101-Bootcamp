// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";
import "../src/KindnessToken.sol";

contract CompleteGameTest is Script {
    FarmGame constant farmGame = FarmGame(0xff91290e0fB079097c6C6b7b68961E88ECB5E7E0);
    SeedNFT constant seedNFT = SeedNFT(0xCEAdfDA643baEdD53CDfb9bA9338FD8CD9aea9f9);
    LandNFT constant landNFT = LandNFT(0x714e649777364d4D8d211E80c7Ee5EbD54115285);
    KindnessToken constant kindToken = KindnessToken(0xc21619A4E7EFDf2dE3656B6638cb0b996Aa6354E);

    uint256 constant PLAYER_A_KEY = 0x;
    uint256 constant PLAYER_B_KEY = 0x;
    address constant PLAYER_A = 0x;
    address constant PLAYER_B = 0x;

    function run() external {
        console.log("=== COMPLETE FARM GAME TEST ===");

        // 1. Check current progress
        LandNFT.LandInfo memory land = landNFT.getLandInfo(0);
        console.log("Current accumulated growth:", land.accumulatedGrowth);
        console.log("Growth needed: 3600 seconds");

        // 2. Advance growth in 15-minute intervals until mature
        uint256 attempts = 0;
        uint256 maxAttempts = 10;

        while (land.state != LandNFT.LandState.Ripe && attempts < maxAttempts) {
            attempts++;
            console.log("\n--- Growth Attempt", attempts, "---");

            // Wait 15+ minutes for next weather segment
            vm.warp(block.timestamp + 900); // 15 minutes
            console.log("Time advanced to:", block.timestamp);

            // Try to advance growth
            try farmGame.checkAndAdvanceGrowth(0) {
                land = landNFT.getLandInfo(0);
                console.log("Growth progress:", land.accumulatedGrowth);
                console.log("Growth needed: 3600 seconds");
                console.log("Land state:", uint256(land.state));

                if (land.state == LandNFT.LandState.Ripe) {
                    console.log("SUCCESS: Crop is RIPE!");
                    break;
                } else {
                    uint256 remaining = 3600 - land.accumulatedGrowth;
                    console.log("Still need:", remaining, "seconds");
                }
            } catch Error(string memory reason) {
                console.log("Growth failed:", reason);
            }
        }

        if (land.state == LandNFT.LandState.Ripe) {
            // 3. Test harvest
            console.log("\n=== TESTING HARVEST ===");
            testHarvest();

            // 4. Test stealing (should fail after harvest)
            console.log("\n=== TESTING STEAL (should fail) ===");
            testSteal();
        } else {
            console.log("\nCrop still not ripe after", maxAttempts, "attempts");
            console.log("Final progress:", land.accumulatedGrowth);
            console.log("Growth needed: 3600 seconds");

            // Force a few more attempts
            for (uint256 i = 0; i < 3; i++) {
                vm.warp(block.timestamp + 1800); // 30 minutes
                try farmGame.checkAndAdvanceGrowth(0) {
                    land = landNFT.getLandInfo(0);
                    console.log("Force attempt", i);
                    console.log("  Progress:", land.accumulatedGrowth);
                    console.log("  State:", uint256(land.state));
                    if (land.state == LandNFT.LandState.Ripe) {
                        console.log("FINALLY RIPE!");
                        testHarvest();
                        break;
                    }
                } catch Error(string memory reason) {
                    console.log("Force attempt", i, "failed:", reason);
                }
            }
        }

        // 5. Final status
        console.log("\n=== FINAL STATUS ===");
        land = landNFT.getLandInfo(0);
        console.log("Final land state:", uint256(land.state));
        console.log("Player A seed balance:", seedNFT.balanceOf(PLAYER_A));
        console.log("Player B KIND balance:", kindToken.balanceOf(PLAYER_B));
        console.log("Time elapsed:", block.timestamp);
    }

    function testHarvest() internal {
        vm.startBroadcast(PLAYER_A_KEY);

        try farmGame.harvestCrop(0) {
            console.log("SUCCESS: Harvested crop!");

            // Check seed maturation
            SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(0);
            console.log("Seed stage after harvest:", uint256(seedInfo.growthStage));

            // Check land state
            LandNFT.LandInfo memory land = landNFT.getLandInfo(0);
            console.log("Land state after harvest:", uint256(land.state));

            if (land.lockEndTime > block.timestamp) {
                console.log("Cooldown remaining:", land.lockEndTime - block.timestamp, "seconds");
            }

        } catch Error(string memory reason) {
            console.log("FAILED: Harvest failed -", reason);
        }

        vm.stopBroadcast();
    }

    function testSteal() internal {
        vm.startBroadcast(PLAYER_B_KEY);

        try farmGame.stealCrop(0) {
            console.log("ERROR: Steal should have failed!");
        } catch Error(string memory reason) {
            console.log("CORRECT: Steal properly failed -", reason);
        }

        vm.stopBroadcast();
    }
}