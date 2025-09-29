// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";
import "../src/KindnessToken.sol";

contract CompleteEndToEndTest is Script {
    // 最新部署地址 - Block 39991853
    FarmGame constant farmGame = FarmGame(0xF2865b5E17A2F8D777E25Bc3ab6F4fEd06651966);
    SeedNFT constant seedNFT = SeedNFT(0x40f21aF2a179395240E420294E1fC7d5cd82D2c5);
    LandNFT constant landNFT = LandNFT(0x7CD168C9D36690f355281Ed7fe42c6a86d5D3af8);
    KindnessToken constant kindToken = KindnessToken(0x7310445E157bAf6588C373E067518af671DD00f3);

    uint256 constant PLAYER_A_KEY = 0x;
    uint256 constant PLAYER_B_KEY = 0x;
    address constant PLAYER_A = 0x;
    address constant PLAYER_B = 0x;

    function run() external {
        console.log("=== COMPLETE END-TO-END CHAIN TEST ===");
        console.log("Testing ALL game features on actual chain...");

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

        // Test 6: Complete growth cycle
        console.log("\n6. TESTING COMPLETE GROWTH CYCLE");
        testCompleteGrowthCycle();

        // Test 7: Final harvest or steal
        console.log("\n7. TESTING HARVEST/STEAL");
        testHarvestOrSteal();

        // Test 8: Land cooldown
        console.log("\n8. TESTING LAND COOLDOWN");
        testLandCooldown();

        // Test 9: 新增功能 - 事件记录系统
        console.log("\n9. TESTING EVENT RECORDING SYSTEM");
        testEventRecordingSystem();

        // Test 10: 新增功能 - 排行榜系统
        console.log("\n10. TESTING LEADERBOARD SYSTEM");
        testLeaderboardSystem();

        // Test 11: 新增功能 - 数据统计系统
        console.log("\n11. TESTING DATA STATISTICS SYSTEM");
        testDataStatisticsSystem();

        // Test 12: 新增功能 - 玩家注册系统
        console.log("\n12. TESTING PLAYER REGISTRATION SYSTEM");
        testPlayerRegistrationSystem();

        console.log("\n=== END-TO-END TEST SUMMARY ===");
        printFinalStatus();
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

        // Advance growth multiple times with real time gaps
        for (uint256 i = 0; i < 3; i++) {
            console.log("  Growth attempt", i + 1);

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

            // Wait some time between attempts (only effective in real time)
            console.log("    Waiting for next growth check...");
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

        // Multiple attempts to reach ripeness
        uint256 attempts = 0;
        uint256 maxAttempts = 10;

        while (land.state != LandNFT.LandState.Ripe && attempts < maxAttempts) {
            attempts++;
            console.log("  Attempt", attempts, "to advance growth");

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

            // 50% chance each player tries to get the crop
            if (block.timestamp % 2 == 0) {
                // Player A harvests
                console.log("Player A attempting harvest...");
                vm.startBroadcast(PLAYER_A_KEY);
                try farmGame.harvestCrop(landIdA) {
                    console.log("  SUCCESS: Player A harvested their crop!");
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
        if (landIdA == type(uint256).max) return;

        LandNFT.LandInfo memory land = landNFT.getLandInfo(landIdA);
        console.log("Land", landIdA, "state:", uint256(land.state));

        if (land.state == LandNFT.LandState.LockedIdle) {
            console.log("  Land is in cooldown");
            if (land.lockEndTime > block.timestamp) {
                uint256 remaining = land.lockEndTime - block.timestamp;
                console.log("  Cooldown remaining:", remaining, "seconds");
            } else {
                console.log("  Cooldown expired, land should be available");
            }
        }
    }

    // ===== 新增功能测试函数 =====

    function testEventRecordingSystem() internal {
        console.log(unicode"测试事件记录系统...");

        // 获取玩家事件历史
        FarmGame.GameEvent[] memory eventsA = farmGame.getPlayerEvents(PLAYER_A, 10);
        FarmGame.GameEvent[] memory eventsB = farmGame.getPlayerEvents(PLAYER_B, 10);

        console.log(unicode"  Player A 事件数量:", eventsA.length);
        console.log(unicode"  Player B 事件数量:", eventsB.length);

        if (eventsA.length > 0) {
            console.log(unicode"  Player A 最新事件类型:", eventsA[0].eventType);
            console.log(unicode"  Player A 最新事件描述:", eventsA[0].description);
        }

        if (eventsB.length > 0) {
            console.log(unicode"  Player B 最新事件类型:", eventsB[0].eventType);
            console.log(unicode"  Player B 最新事件描述:", eventsB[0].description);
        }

        // 获取全局最近事件
        FarmGame.GameEvent[] memory recentEvents = farmGame.getRecentEvents(5);
        console.log(unicode"  全局最近事件数量:", recentEvents.length);

        require(eventsA.length > 0 || eventsB.length > 0, unicode"事件记录系统异常");
        console.log(unicode"  ✅ 事件记录系统正常！");
    }

    function testLeaderboardSystem() internal {
        console.log(unicode"🏆 测试排行榜系统...");

        // 测试收获排行榜
        FarmGame.LeaderboardEntry[] memory harvestBoard = farmGame.getHarvestLeaderboard(10);
        console.log(unicode"  收获排行榜条目数:", harvestBoard.length);

        if (harvestBoard.length > 0) {
            console.log(unicode"  === 收获排行榜 ===");
            for (uint256 i = 0; i < harvestBoard.length && i < 3; i++) {
                console.log(unicode"    排名", harvestBoard[i].rank, ":");
                console.log(unicode"      玩家:", harvestBoard[i].player);
                console.log(unicode"      收获数:", harvestBoard[i].harvestCount);
                console.log(unicode"      偷取数:", harvestBoard[i].stealCount);
                console.log(unicode"      总分:", harvestBoard[i].totalScore);
            }
        }

        // 测试善良排行榜
        FarmGame.LeaderboardEntry[] memory kindBoard = farmGame.getKindnessLeaderboard(10);
        console.log(unicode"  善良排行榜条目数:", kindBoard.length);

        if (kindBoard.length > 0) {
            console.log(unicode"  === 善良排行榜 ===");
            for (uint256 i = 0; i < kindBoard.length && i < 3; i++) {
                console.log(unicode"    排名", kindBoard[i].rank, ":");
                console.log(unicode"      玩家:", kindBoard[i].player);
                console.log(unicode"      帮助数:", kindBoard[i].helpCount);
                console.log(unicode"      KIND余额:", kindBoard[i].kindBalance);
                console.log(unicode"      总分:", kindBoard[i].totalScore);
            }
        }

        // 测试个人排名
        (uint256 harvestRankA, uint256 kindnessRankA) = farmGame.getPlayerRank(PLAYER_A);
        (uint256 harvestRankB, uint256 kindnessRankB) = farmGame.getPlayerRank(PLAYER_B);

        console.log(unicode"  Player A 排名 - 收获:", harvestRankA, unicode"善良:", kindnessRankA);
        console.log(unicode"  Player B 排名 - 收获:", harvestRankB, unicode"善良:", kindnessRankB);

        require(harvestBoard.length >= 2, unicode"收获排行榜数据不足");
        require(kindBoard.length >= 2, unicode"善良排行榜数据不足");
        console.log(unicode"  ✅ 排行榜系统正常！");
    }

    function testDataStatisticsSystem() internal {
        console.log(unicode"📊 测试数据统计系统...");

        // 全局统计
        FarmGame.GlobalStats memory stats = farmGame.getGlobalStats();
        console.log(unicode"  === 全局统计 ===");
        console.log(unicode"    总玩家数:", stats.totalPlayers);
        console.log(unicode"    总收获数:", stats.totalHarvests);
        console.log(unicode"    总偷取数:", stats.totalSteals);
        console.log(unicode"    总帮助数:", stats.totalHelps);
        console.log(unicode"    总事件数:", stats.totalEvents);

        // 玩家统计
        FarmGame.PlayerStats memory statsA = farmGame.getPlayerStats(PLAYER_A);
        FarmGame.PlayerStats memory statsB = farmGame.getPlayerStats(PLAYER_B);

        console.log(unicode"  === 玩家统计 ===");
        console.log(unicode"    Player A:");
        console.log(unicode"      收获数:", statsA.totalCropsHarvested);
        console.log(unicode"      偷取数:", statsA.totalCropsStolen);
        console.log(unicode"      帮助数:", statsA.totalHelpProvided);

        console.log(unicode"    Player B:");
        console.log(unicode"      收获数:", statsB.totalCropsHarvested);
        console.log(unicode"      偷取数:", statsB.totalCropsStolen);
        console.log(unicode"      帮助数:", statsB.totalHelpProvided);

        require(stats.totalPlayers >= 2, unicode"玩家统计数据异常");
        require(stats.totalEvents > 0, unicode"事件统计数据异常");
        console.log(unicode"  ✅ 数据统计系统正常！");
    }

    function testPlayerRegistrationSystem() internal {
        console.log(unicode"👥 测试玩家注册系统...");

        // 检查玩家注册状态
        bool registeredA = farmGame.isPlayerRegistered(PLAYER_A);
        bool registeredB = farmGame.isPlayerRegistered(PLAYER_B);

        console.log(unicode"  Player A 已注册:", registeredA);
        console.log(unicode"  Player B 已注册:", registeredB);

        // 获取总玩家数
        uint256 totalPlayers = farmGame.getTotalPlayers();
        console.log(unicode"  总注册玩家数:", totalPlayers);

        // 获取所有玩家列表
        address[] memory allPlayers = farmGame.getAllPlayers();
        console.log(unicode"  玩家列表长度:", allPlayers.length);

        require(registeredA && registeredB, unicode"玩家注册状态异常");
        require(totalPlayers >= 2, unicode"总玩家数异常");
        require(allPlayers.length >= 2, unicode"玩家列表异常");
        console.log(unicode"  ✅ 玩家注册系统正常！");
    }

    function printFinalStatus() internal view {
        console.log(unicode"=== 最终状态总结 ===");
        console.log(unicode"Player A seed balance:", seedNFT.balanceOf(PLAYER_A));
        console.log(unicode"Player B seed balance:", seedNFT.balanceOf(PLAYER_B));
        console.log(unicode"Player A KIND balance:", kindToken.balanceOf(PLAYER_A));
        console.log(unicode"Player B KIND balance:", kindToken.balanceOf(PLAYER_B));

        uint256[] memory availableLands = landNFT.getAvailableLands();
        console.log(unicode"Available lands:", availableLands.length, "/ 100");

        // 新增功能状态
        FarmGame.GlobalStats memory stats = farmGame.getGlobalStats();
        console.log(unicode"总玩家数:", stats.totalPlayers);
        console.log(unicode"总事件数:", stats.totalEvents);
        console.log(unicode"总帮助数:", stats.totalHelps);

        console.log(unicode"Test completed at block:", block.number);
        console.log(unicode"Test completed at time:", block.timestamp);
    }

    function findPlayerSeedToken(address player) internal view returns (uint256) {
        uint256 totalSupply = seedNFT.totalSupply();
        for (uint256 i = 0; i < totalSupply; i++) {
            try seedNFT.ownerOf(i) returns (address owner) {
                if (owner == player) {
                    return i;
                }
            } catch {
                continue;
            }
        }
        return type(uint256).max;
    }

    function findPlayerLand(address player) internal view returns (uint256) {
        for (uint256 i = 0; i < 100; i++) {
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