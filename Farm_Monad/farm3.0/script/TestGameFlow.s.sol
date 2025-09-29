// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";
import "../src/KindnessToken.sol";

contract TestGameFlow is Script {
    // Deployed contract addresses
    FarmGame constant farmGame = FarmGame(0x);
    SeedNFT constant seedNFT = SeedNFT(0x);
    LandNFT constant landNFT = LandNFT(0x);
    KindnessToken constant kindToken = KindnessToken(0x);

    // Test accounts
    uint256 constant PLAYER_A_KEY = 0x;
    uint256 constant PLAYER_B_KEY = 0x;

    address constant PLAYER_A = 0x;
    address constant PLAYER_B = 0x;

    function run() external {
        console.log("=== Farm Game Complete Flow Test ===");
        console.log("Network: Monad Testnet (10143)");
        console.log("FarmGame:", address(farmGame));
        console.log("Player A:", PLAYER_A);
        console.log("Player B:", PLAYER_B);
        console.log("");

        // Test 1: Player A buys wheat seed with native token
        console.log("=== Test 1: Player A buys wheat seed ===");
        testBuySeedWithNative();

        // Test 2: Player A claims land and plants seed
        console.log("=== Test 2: Player A claims land ===");
        testClaimLand();

        // Test 3: Check land status and growth
        console.log("=== Test 3: Check land status ===");
        testCheckLandStatus();

        // Test 4: Player B helps Player A (watering)
        console.log("=== Test 4: Player B helps Player A ===");
        testHelpOther();

        // Test 5: Advance growth and check for ripeness
        console.log("=== Test 5: Advance growth ===");
        testAdvanceGrowth();

        // Test 6: Try to steal crop (should fail until ripe)
        console.log("=== Test 6: Try stealing (should fail) ===");
        testStealAttempt();

        // Test 7: Harvest crop when ready
        console.log("=== Test 7: Harvest crop ===");
        testHarvestCrop();

        // Test 8: Test KIND token operations
        console.log("=== Test 8: KIND token operations ===");
        testKindTokenOperations();

        console.log("=== All Tests Completed ===");
    }

    function testBuySeedWithNative() internal {
        vm.startBroadcast(PLAYER_A_KEY);

        try farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat) {
            console.log("SUCCESS: Player A bought wheat seed successfully");

            // Check seed balance
            uint256 balance = seedNFT.balanceOf(PLAYER_A);
            console.log("   Player A now owns", balance, "seeds");

            // Get total supply to find the latest token ID
            uint256 totalSupply = seedNFT.totalSupply();
            if (totalSupply > 0) {
                uint256 tokenId = totalSupply - 1; // Latest token ID
                try seedNFT.ownerOf(tokenId) returns (address owner) {
                    if (owner == PLAYER_A) {
                        SeedNFT.SeedInfo memory seedInfo = seedNFT.getSeedInfo(tokenId);
                        console.log("   Latest seed ID:", tokenId);
                        console.log("   Type: Wheat, Stage:", uint256(seedInfo.growthStage));
                    }
                } catch {
                    console.log("   Could not get token owner");
                }
            }
        } catch Error(string memory reason) {
            console.log("FAILED: Failed to buy seed:", reason);
        }

        vm.stopBroadcast();
        console.log("");
    }

    function testClaimLand() internal {
        vm.startBroadcast(PLAYER_A_KEY);

        // Get the latest seed token ID
        uint256 seedBalance = seedNFT.balanceOf(PLAYER_A);
        if (seedBalance == 0) {
            console.log("FAILED: No seeds available to plant");
            vm.stopBroadcast();
            return;
        }

        // Find the latest seed token owned by Player A
        uint256 tokenId = type(uint256).max;
        uint256 totalSupply = seedNFT.totalSupply();

        for (uint256 i = 0; i < totalSupply; i++) {
            try seedNFT.ownerOf(i) returns (address owner) {
                if (owner == PLAYER_A) {
                    tokenId = i; // Use the first found token
                    break;
                }
            } catch {
                continue;
            }
        }

        if (tokenId == type(uint256).max) {
            console.log("FAILED: Could not find owned seed token");
            vm.stopBroadcast();
            return;
        }
        console.log("   Using seed token ID:", tokenId);

        // Find available land
        uint256[] memory availableLands = landNFT.getAvailableLands();
        if (availableLands.length == 0) {
            console.log("FAILED: No available land");
            vm.stopBroadcast();
            return;
        }

        uint256 landId = availableLands[0];
        console.log("   Claiming land ID:", landId);

        try farmGame.claimLand(landId, tokenId) {
            console.log("SUCCESS: Player A claimed land successfully");

            // Check land status
            LandNFT.LandInfo memory landInfo = landNFT.getLandInfo(landId);
            console.log("   Land state:", uint256(landInfo.state));
            console.log("   Seed token ID:", landInfo.seedTokenId);
            console.log("   Current farmer:", landInfo.currentFarmer);
        } catch Error(string memory reason) {
            console.log("FAILED: Failed to claim land:", reason);
        }

        vm.stopBroadcast();
        console.log("");
    }

    function testCheckLandStatus() internal {
        // Find Player A's land
        for (uint256 i = 0; i < 10; i++) { // Check first 10 lands
            try landNFT.getLandInfo(i) returns (LandNFT.LandInfo memory landInfo) {
                if (landInfo.currentFarmer == PLAYER_A) {
                    console.log("   Land", i, "- State:", uint256(landInfo.state));
                    console.log("   Weather seed:", landInfo.weatherSeed);
                    console.log("   Accumulated growth:", landInfo.accumulatedGrowth);
                    console.log("   Last update:", landInfo.lastWeatherUpdateTime);

                    // Check seed info
                    if (landInfo.seedTokenId > 0) {
                        try seedNFT.getSeedInfo(landInfo.seedTokenId) returns (SeedNFT.SeedInfo memory seedInfo) {
                            console.log("   Seed stage:", uint256(seedInfo.growthStage));
                            console.log("   Base growth time:", seedInfo.baseGrowthTime);
                            console.log("   Boosters applied:", seedInfo.boostersApplied);
                        } catch {
                            console.log("   Could not get seed info");
                        }
                    }
                    break;
                }
            } catch {
                continue;
            }
        }
        console.log("");
    }

    function testHelpOther() internal {
        vm.startBroadcast(PLAYER_B_KEY);

        // Find Player A's growing land
        uint256 landId = type(uint256).max;
        for (uint256 i = 0; i < 10; i++) {
            try landNFT.getLandInfo(i) returns (LandNFT.LandInfo memory landInfo) {
                if (landInfo.currentFarmer == PLAYER_A && landInfo.state == LandNFT.LandState.Growing) {
                    landId = i;
                    break;
                }
            } catch {
                continue;
            }
        }

        if (landId == type(uint256).max) {
            console.log("FAILED: No growing land found for Player A");
            vm.stopBroadcast();
            console.log("");
            return;
        }

        console.log("   Player B helping on land", landId);

        try farmGame.helpOther{value: 0.0001 ether}(landId, FarmGame.BoosterType.Watering, false) {
            console.log("SUCCESS: Player B helped Player A with watering");

            // Check KIND token balance
            uint256 kindBalance = kindToken.balanceOf(PLAYER_B);
            console.log("   Player B KIND balance:", kindBalance);

            // Check remaining daily helps
            uint256 remaining = farmGame.getRemainingDailyHelps(PLAYER_B);
            console.log("   Remaining daily helps:", remaining);
        } catch Error(string memory reason) {
            console.log("FAILED: Failed to help:", reason);
        }

        vm.stopBroadcast();
        console.log("");
    }

    function testAdvanceGrowth() internal {
        // Find Player A's growing land
        for (uint256 i = 0; i < 10; i++) {
            try landNFT.getLandInfo(i) returns (LandNFT.LandInfo memory landInfo) {
                if (landInfo.currentFarmer == PLAYER_A && landInfo.state == LandNFT.LandState.Growing) {
                    console.log("   Advancing growth for land", i);

                    try farmGame.checkAndAdvanceGrowth(i) {
                        console.log("SUCCESS: Growth advanced successfully");

                        // Check updated status
                        LandNFT.LandInfo memory updatedInfo = landNFT.getLandInfo(i);
                        console.log("   New accumulated growth:", updatedInfo.accumulatedGrowth);
                        console.log("   Land state:", uint256(updatedInfo.state));

                        if (updatedInfo.state == LandNFT.LandState.Ripe) {
                            console.log("READY: Crop is ready for harvest!");
                        }
                    } catch Error(string memory reason) {
                        console.log("FAILED: Failed to advance growth:", reason);
                    }
                    break;
                }
            } catch {
                continue;
            }
        }
        console.log("");
    }

    function testStealAttempt() internal {
        vm.startBroadcast(PLAYER_B_KEY);

        // Find Player A's ripe land
        for (uint256 i = 0; i < 10; i++) {
            try landNFT.getLandInfo(i) returns (LandNFT.LandInfo memory landInfo) {
                if (landInfo.currentFarmer == PLAYER_A) {
                    console.log("   Attempting to steal from land", i);
                    console.log("   Land state:", uint256(landInfo.state));

                    if (landInfo.state == LandNFT.LandState.Ripe) {
                        try farmGame.stealCrop(i) {
                            console.log("SUCCESS: Successfully stole crop!");

                            // Check if seed was transferred
                            uint256 stolenTokenId = landInfo.seedTokenId;
                            address newOwner = seedNFT.ownerOf(stolenTokenId);
                            console.log("   Seed token", stolenTokenId, "now owned by:", newOwner);

                            if (newOwner == PLAYER_B) {
                                console.log("VICTORY: Player B successfully stole the crop!");
                            }
                        } catch Error(string memory reason) {
                            console.log("FAILED: Steal attempt failed:", reason);
                        }
                    } else {
                        console.log("   Crop not ready for stealing (not ripe)");
                    }
                    break;
                }
            } catch {
                continue;
            }
        }

        vm.stopBroadcast();
        console.log("");
    }

    function testHarvestCrop() internal {
        vm.startBroadcast(PLAYER_A_KEY);

        // Find Player A's ripe land
        for (uint256 i = 0; i < 10; i++) {
            try landNFT.getLandInfo(i) returns (LandNFT.LandInfo memory landInfo) {
                if (landInfo.currentFarmer == PLAYER_A && landInfo.state == LandNFT.LandState.Ripe) {
                    console.log("   Harvesting crop from land", i);

                    uint256 tokenId = landInfo.seedTokenId;

                    try farmGame.harvestCrop(i) {
                        console.log("SUCCESS: Successfully harvested crop!");

                        // Check seed maturation
                        try seedNFT.getSeedInfo(tokenId) returns (SeedNFT.SeedInfo memory seedInfo) {
                            console.log("   Seed stage:", uint256(seedInfo.growthStage));
                            console.log("   Matured at:", seedInfo.maturedAt);

                            if (seedInfo.growthStage == SeedNFT.GrowthStage.Mature) {
                                console.log("MATURE: Seed successfully matured!");
                            }
                        } catch {
                            console.log("   Could not get updated seed info");
                        }

                        // Check land status
                        LandNFT.LandInfo memory updatedInfo = landNFT.getLandInfo(i);
                        console.log("   Land state:", uint256(updatedInfo.state));
                        console.log("   Lock end time:", updatedInfo.lockEndTime);

                    } catch Error(string memory reason) {
                        console.log("FAILED: Failed to harvest:", reason);
                    }
                    break;
                }
            } catch {
                continue;
            }
        }

        vm.stopBroadcast();
        console.log("");
    }

    function testKindTokenOperations() internal {
        console.log("   Player A KIND balance:", kindToken.balanceOf(PLAYER_A));
        console.log("   Player B KIND balance:", kindToken.balanceOf(PLAYER_B));

        // Test buying rare seed with KIND
        uint256 playerBBalance = kindToken.balanceOf(PLAYER_B);
        if (playerBBalance >= 10 * 10**18) {
            vm.startBroadcast(PLAYER_B_KEY);

            try farmGame.buySeedWithKind(SeedNFT.CropType.Strawberry) {
                console.log("SUCCESS: Player B bought strawberry seed with KIND");

                uint256 newBalance = kindToken.balanceOf(PLAYER_B);
                console.log("   Player B KIND balance after purchase:", newBalance);

                uint256 seedBalance = seedNFT.balanceOf(PLAYER_B);
                console.log("   Player B now owns", seedBalance, "seeds");
            } catch Error(string memory reason) {
                console.log("FAILED: Failed to buy rare seed:", reason);
            }

            vm.stopBroadcast();
        } else {
            console.log("   Player B doesn't have enough KIND for rare seeds");
        }

        console.log("");
    }
}