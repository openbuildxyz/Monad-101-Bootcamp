// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";
import "../src/KindnessToken.sol";
import "../src/Shop.sol";

contract LocalCompleteEndToEndTest is Script {
    // Dynamic contract addresses (will be set after deployment)
    FarmGame public farmGame;
    SeedNFT public seedNFT;
    LandNFT public landNFT;
    KindnessToken public kindToken;
    Shop public shop;

    // Test accounts (anvil default accounts)
    uint256 constant DEPLOYER_KEY = 0x; // anvil account 0
    uint256 constant PLAYER_A_KEY = 0x;   // anvil account 1
    uint256 constant PLAYER_B_KEY = 0x;   // anvil account 2

    address constant DEPLOYER = 0x;
    address constant PLAYER_A = 0x;
    address constant PLAYER_B = 0x;

    uint256 constant TOTAL_LANDS = 100;

    function run() external {
        console.log("=== LOCAL ANVIL COMPLETE END-TO-END TEST ===");
        console.log("Testing ALL game features on local anvil...");

        // Step 0: Deploy all contracts
        console.log("\n0. DEPLOYING CONTRACTS");
        deployAllContracts();

        // Test 1: Buy seeds (both players)
        console.log("\n1. TESTING SEED PURCHASE");
        testSeedPurchase();

        // Test 2: Land claiming
        console.log("\n2. TESTING LAND CLAIMING");
        testLandClaiming();

        // Test 3: Helper system
        console.log("\n3. TESTING HELPER SYSTEM");
        testHelperSystem();

        // Test 4: Weather and growth over time
        console.log("\n4. TESTING WEATHER & GROWTH PROGRESSION");
        testWeatherAndGrowth();

        // Test 5: Try stealing before ripe
        console.log("\n5. TESTING STEAL PROTECTION");
        testStealProtection();

        // Test 6: Complete growth cycle (accelerated with vm.warp)
        console.log("\n6. TESTING COMPLETE GROWTH CYCLE");
        testCompleteGrowthCycle();

        // Test 7: Final harvest or steal
        console.log("\n7. TESTING HARVEST/STEAL");
        testHarvestOrSteal();

        // Test 8: Land cooldown
        console.log("\n8. TESTING LAND COOLDOWN");
        testLandCooldown();

        console.log("\n=== LOCAL END-TO-END TEST SUMMARY ===");
        printFinalStatus();
    }

    function deployAllContracts() internal {
        vm.startBroadcast(DEPLOYER_KEY);

        console.log("Deploying with deployer:", DEPLOYER);

        // Deploy all contracts
        seedNFT = new SeedNFT();
        console.log("SeedNFT deployed at:", address(seedNFT));

        kindToken = new KindnessToken();
        console.log("KindnessToken deployed at:", address(kindToken));

        landNFT = new LandNFT(TOTAL_LANDS);
        console.log("LandNFT deployed at:", address(landNFT));

        shop = new Shop(address(seedNFT), address(kindToken));
        console.log("Shop deployed at:", address(shop));

        farmGame = new FarmGame(
            address(seedNFT),
            address(landNFT),
            address(shop),
            address(kindToken)
        );
        console.log("FarmGame deployed at:", address(farmGame));

        // Set up permissions
        seedNFT.transferOwnership(address(farmGame));
        landNFT.transferOwnership(address(farmGame));
        kindToken.transferOwnership(address(farmGame));
        shop.transferOwnership(address(farmGame));

        console.log("  All ownerships transferred to FarmGame");

        vm.stopBroadcast();

        // Fund test accounts
        vm.deal(PLAYER_A, 100 ether);
        vm.deal(PLAYER_B, 100 ether);
        console.log("  Test accounts funded with 100 ETH each");
    }

    function testSeedPurchase() internal {
        vm.startBroadcast(PLAYER_A_KEY);

        console.log("Player A buying wheat seed...");
        try farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat) {
            console.log("  SUCCESS: Player A bought wheat seed");
        } catch Error(string memory reason) {
            console.log("  FAILED:", reason);
        }

        vm.stopBroadcast();

        vm.startBroadcast(PLAYER_B_KEY);

        console.log("Player B buying corn seed...");
        try farmGame.buySeedWithNative{value: 0.0015 ether}(SeedNFT.CropType.Corn) {
            console.log("  SUCCESS: Player B bought corn seed");
        } catch Error(string memory reason) {
            console.log("  FAILED:", reason);
        }

        vm.stopBroadcast();

        // Check balances
        uint256 balanceA = seedNFT.balanceOf(PLAYER_A);
        uint256 balanceB = seedNFT.balanceOf(PLAYER_B);
        console.log("  Player A seeds:", balanceA);
        console.log("  Player B seeds:", balanceB);
    }

    function testLandClaiming() internal {
        uint256[] memory availableLands = landNFT.getAvailableLands();
        console.log("Available lands:", availableLands.length);

        if (availableLands.length < 2) {
            console.log("  ERROR: Need at least 2 available lands");
            return;
        }

        // Player A claims land 0
        vm.startBroadcast(PLAYER_A_KEY);
        uint256 tokenIdA = findPlayerSeedToken(PLAYER_A);
        if (tokenIdA != type(uint256).max) {
            try farmGame.claimLand(availableLands[0], tokenIdA) {
                console.log("  SUCCESS: Player A claimed land", availableLands[0]);
            } catch Error(string memory reason) {
                console.log("  FAILED: Player A -", reason);
            }
        }
        vm.stopBroadcast();

        // Player B claims land 1
        vm.startBroadcast(PLAYER_B_KEY);
        uint256 tokenIdB = findPlayerSeedToken(PLAYER_B);
        if (tokenIdB != type(uint256).max) {
            try farmGame.claimLand(availableLands[1], tokenIdB) {
                console.log("  SUCCESS: Player B claimed land", availableLands[1]);
            } catch Error(string memory reason) {
                console.log("  FAILED: Player B -", reason);
            }
        }
        vm.stopBroadcast();
    }

    function testHelperSystem() internal {
        // Find Player A's land
        uint256 landIdA = findPlayerLand(PLAYER_A);
        if (landIdA == type(uint256).max) {
            console.log("  ERROR: Player A has no land");
            return;
        }

        console.log("Player B helping Player A on land", landIdA);

        vm.startBroadcast(PLAYER_B_KEY);
        try farmGame.helpOther{value: 0.0001 ether}(landIdA, FarmGame.BoosterType.Watering, false) {
            console.log("  SUCCESS: Player B helped with watering");

            uint256 kindBalance = kindToken.balanceOf(PLAYER_B);
            console.log("  Player B KIND balance:", kindBalance);
        } catch Error(string memory reason) {
            console.log("  FAILED:", reason);
        }
        vm.stopBroadcast();
    }

    function testWeatherAndGrowth() internal {
        uint256 landIdA = findPlayerLand(PLAYER_A);
        if (landIdA == type(uint256).max) return;

        console.log("Testing weather and growth on land", landIdA);

        LandNFT.LandInfo memory land = landNFT.getLandInfo(landIdA);
        console.log("  Initial growth:", land.accumulatedGrowth);
        console.log("  Current time:", block.timestamp);

        // Advance growth multiple times with time warping
        for (uint256 i = 0; i < 3; i++) {
            console.log("  Growth attempt", i + 1);

            // Warp time by 15 minutes for next weather segment
            vm.warp(block.timestamp + 900);
            console.log("    Time warped to:", block.timestamp);

            try farmGame.checkAndAdvanceGrowth(landIdA) {
                LandNFT.LandInfo memory updatedLand = landNFT.getLandInfo(landIdA);
                console.log("    New growth:", updatedLand.accumulatedGrowth);
                console.log("    Land state:", uint256(updatedLand.state));

                if (updatedLand.state == LandNFT.LandState.Ripe) {
                    console.log("    RIPE: Ready for harvest!");
                    break;
                }
            } catch Error(string memory reason) {
                console.log("    FAILED:", reason);
            }
        }
    }

    function testStealProtection() internal {
        uint256 landIdA = findPlayerLand(PLAYER_A);
        if (landIdA == type(uint256).max) return;

        LandNFT.LandInfo memory land = landNFT.getLandInfo(landIdA);
        console.log("Testing steal on land", landIdA, "state:", uint256(land.state));

        vm.startBroadcast(PLAYER_B_KEY);
        try farmGame.stealCrop(landIdA) {
            console.log("  ERROR: Steal should not have succeeded!");
        } catch Error(string memory reason) {
            console.log("  CORRECT: Steal properly blocked -", reason);
        }
        vm.stopBroadcast();
    }

    function testCompleteGrowthCycle() internal {
        uint256 landIdA = findPlayerLand(PLAYER_A);
        if (landIdA == type(uint256).max) return;

        console.log("Attempting to complete growth cycle for land", landIdA);

        LandNFT.LandInfo memory land = landNFT.getLandInfo(landIdA);
        console.log("  Current progress:", land.accumulatedGrowth, "/ 3600 needed");

        // Accelerated growth with time warping
        uint256 attempts = 0;
        uint256 maxAttempts = 10;

        while (land.state != LandNFT.LandState.Ripe && attempts < maxAttempts) {
            attempts++;
            console.log("  Attempt", attempts, "to advance growth");

            // Warp time significantly to accelerate growth
            vm.warp(block.timestamp + 900); // 15 minutes each attempt
            console.log("    Warped time to:", block.timestamp);

            try farmGame.checkAndAdvanceGrowth(landIdA) {
                land = landNFT.getLandInfo(landIdA);
                console.log("    Progress:", land.accumulatedGrowth, "State:", uint256(land.state));

                if (land.state == LandNFT.LandState.Ripe) {
                    console.log("    SUCCESS: Crop is now RIPE!");
                    return;
                }
            } catch Error(string memory reason) {
                console.log("    FAILED:", reason);
            }
        }

        console.log("  RESULT: Crop", land.state == LandNFT.LandState.Ripe ? "IS RIPE" : "NOT YET RIPE");
    }

    function testHarvestOrSteal() internal {
        uint256 landIdA = findPlayerLand(PLAYER_A);
        if (landIdA == type(uint256).max) return;

        LandNFT.LandInfo memory land = landNFT.getLandInfo(landIdA);

        if (land.state == LandNFT.LandState.Ripe) {
            console.log("Crop is ripe! Testing harvest vs steal...");

            // Test both harvest and steal scenarios
            if (block.timestamp % 2 == 0) {
                // Player A harvests
                console.log("Player A attempting harvest...");
                vm.startBroadcast(PLAYER_A_KEY);
                try farmGame.harvestCrop(landIdA) {
                    console.log("  SUCCESS: Player A harvested their crop!");

                    // Check seed state
                    uint256 seedTokenId = land.seedTokenId;
                    SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(seedTokenId);
                    console.log("  Seed stage:", uint256(seedInfo.growthStage));
                } catch Error(string memory reason) {
                    console.log("  FAILED:", reason);
                }
                vm.stopBroadcast();
            } else {
                // Player B steals
                console.log("Player B attempting steal...");
                vm.startBroadcast(PLAYER_B_KEY);
                try farmGame.stealCrop(landIdA) {
                    console.log("  SUCCESS: Player B stole the crop!");

                    // Verify NFT ownership changed
                    uint256 seedTokenId = land.seedTokenId;
                    address newOwner = seedNFT.ownerOf(seedTokenId);
                    console.log("  New seed owner:", newOwner);
                    console.log("  Expected owner (Player B):", PLAYER_B);
                } catch Error(string memory reason) {
                    console.log("  FAILED:", reason);
                }
                vm.stopBroadcast();
            }
        } else {
            console.log("Crop not yet ripe for harvest/steal");
        }
    }

    function testLandCooldown() internal {
        uint256 landIdA = findPlayerLand(PLAYER_A);
        if (landIdA == type(uint256).max) {
            // Try to find any land in cooldown state
            for (uint256 i = 0; i < 10; i++) {
                LandNFT.LandInfo memory landInfo = landNFT.getLandInfo(i);
                if (landInfo.state == LandNFT.LandState.LockedIdle) {
                    landIdA = i;
                    break;
                }
            }
        }

        if (landIdA == type(uint256).max) {
            console.log("No land found for cooldown testing");
            return;
        }

        LandNFT.LandInfo memory land = landNFT.getLandInfo(landIdA);
        console.log("Land", landIdA, "state:", uint256(land.state));

        if (land.state == LandNFT.LandState.LockedIdle) {
            console.log("  Land is in cooldown");
            if (land.lockEndTime > block.timestamp) {
                uint256 remaining = land.lockEndTime - block.timestamp;
                console.log("  Cooldown remaining:", remaining, "seconds");

                // Test land availability during cooldown
                console.log("  Testing land claim during cooldown...");
                vm.startBroadcast(PLAYER_A_KEY);
                try farmGame.claimLand(landIdA, 0) {
                    console.log("  ERROR: Should not be able to claim during cooldown!");
                } catch Error(string memory reason) {
                    console.log("  CORRECT: Claim blocked during cooldown -", reason);
                }
                vm.stopBroadcast();

                // Warp past cooldown period
                vm.warp(land.lockEndTime + 1);
                console.log("  Time warped past cooldown period");

                landNFT.checkAndUpdateIdleStatus();

                land = landNFT.getLandInfo(landIdA);
                console.log("  Land state after cooldown:", uint256(land.state));
            } else {
                console.log("  Cooldown already expired");
            }
        }
    }

    function printFinalStatus() internal view {
        console.log("Player A seed balance:", seedNFT.balanceOf(PLAYER_A));
        console.log("Player B seed balance:", seedNFT.balanceOf(PLAYER_B));
        console.log("Player A KIND balance:", kindToken.balanceOf(PLAYER_A));
        console.log("Player B KIND balance:", kindToken.balanceOf(PLAYER_B));

        // Get player stats
        FarmGame.PlayerStats memory statsA = farmGame.getPlayerStats(PLAYER_A);
        FarmGame.PlayerStats memory statsB = farmGame.getPlayerStats(PLAYER_B);

        console.log("Player A stats - Harvested:", statsA.totalCropsHarvested);
        console.log("Player A stats - Stolen:", statsA.totalCropsStolen);
        console.log("Player A stats - Helped:", statsA.totalHelpProvided);
        console.log("Player B stats - Harvested:", statsB.totalCropsHarvested);
        console.log("Player B stats - Stolen:", statsB.totalCropsStolen);
        console.log("Player B stats - Helped:", statsB.totalHelpProvided);

        uint256[] memory availableLands = landNFT.getAvailableLands();
        console.log("Available lands:", availableLands.length, "/ 100");

        console.log("Test completed at block:", block.number);
        console.log("Test completed at time:", block.timestamp);
    }

    function findPlayerSeedToken(address player) internal view returns (uint256) {
        uint256 totalSupply = seedNFT.totalSupply();
        for (uint256 i = 0; i < totalSupply; i++) {
            try seedNFT.ownerOf(i) returns (address owner) {
                if (owner == player) {
                    SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(i);
                    if (seedInfo.growthStage == SeedNFT.GrowthStage.Seed) {
                        return i;
                    }
                }
            } catch {
                continue;
            }
        }
        return type(uint256).max;
    }

    function findPlayerLand(address player) internal view returns (uint256) {
        for (uint256 i = 0; i < TOTAL_LANDS; i++) {
            try landNFT.getLandInfo(i) returns (LandNFT.LandInfo memory land) {
                if (land.currentFarmer == player && land.state != LandNFT.LandState.Idle) {
                    return i;
                }
            } catch {
                continue;
            }
        }
        return type(uint256).max;
    }
}