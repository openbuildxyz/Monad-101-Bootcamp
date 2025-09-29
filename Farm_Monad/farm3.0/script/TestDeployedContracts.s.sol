// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";
import "../src/KindnessToken.sol";
import "../src/Shop.sol";

contract TestDeployedContracts is Script {
    // 已部署的合约地址 (来自broadcast记录)
    SeedNFT constant seedNFT = SeedNFT(0x);
    KindnessToken constant kindToken = KindnessToken(0x);
    LandNFT constant landNFT = LandNFT(0x);
    Shop constant shop = Shop(0x);
    FarmGame constant farmGame = FarmGame(0x);

    // 测试账户
    address constant PLAYER_1 = 0x;
    address constant PLAYER_2 = 0x;

    function run() external {
        console.log(unicode"=== 🎮 Farm3.0 Monad测试网功能验证 ===");
        console.log("FarmGame:", address(farmGame));
        console.log("Player 1:", PLAYER_1);
        console.log("Player 2:", PLAYER_2);

        console.log(unicode"\n=== 📋 测试所有6个核心功能 ===");

        console.log(unicode"\n1. 🛒 测试买种子功能");
        testBuySeeds();

        console.log(unicode"\n2. 🌱 测试种植功能");
        testPlanting();

        console.log(unicode"\n3. 🤝 测试帮助他人功能");
        testHelpingOthers();

        console.log(unicode"\n4. 🌾 测试收获功能");
        testHarvesting();

        console.log(unicode"\n5. 😈 测试偷菜功能");
        testStealing();

        console.log(unicode"\n6. 🏆 测试排行榜功能");
        testLeaderboards();

        console.log(unicode"\n=== ✨ 测试完成 ===");
        printFinalStatus();
    }

    function testBuySeeds() internal {
        // Player 1买小麦种子
        vm.broadcast(PLAYER_1);
        try farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat) {
            console.log(unicode"  ✅ Player 1成功购买小麦种子");
        } catch Error(string memory reason) {
            console.log(unicode"  ❌ Player 1购买失败:", reason);
        }

        // Player 2买玉米种子
        vm.broadcast(PLAYER_2);
        try farmGame.buySeedWithNative{value: 0.0015 ether}(SeedNFT.CropType.Corn) {
            console.log(unicode"  ✅ Player 2成功购买玉米种子");
        } catch Error(string memory reason) {
            console.log(unicode"  ❌ Player 2购买失败:", reason);
        }

        // 检查种子余额
        uint256 balance1 = seedNFT.balanceOf(PLAYER_1);
        uint256 balance2 = seedNFT.balanceOf(PLAYER_2);
        console.log(unicode"  Player 1种子数量:", balance1);
        console.log(unicode"  Player 2种子数量:", balance2);
    }

    function testPlanting() internal {
        uint256[] memory availableLands = landNFT.getAvailableLands();
        console.log(unicode"  可用土地数量:", availableLands.length);

        if (availableLands.length >= 2) {
            uint256 landId1 = availableLands[0];
            uint256 landId2 = availableLands[1];

            // Player 1种植
            uint256 tokenId1 = findPlayerSeedToken(PLAYER_1);
            if (tokenId1 != type(uint256).max) {
                vm.broadcast(PLAYER_1);
                try farmGame.claimLand(landId1, tokenId1) {
                    console.log(unicode"  ✅ Player 1成功种植到土地", landId1);
                } catch Error(string memory reason) {
                    console.log(unicode"  ❌ Player 1种植失败:", reason);
                }
            }

            // Player 2种植
            uint256 tokenId2 = findPlayerSeedToken(PLAYER_2);
            if (tokenId2 != type(uint256).max) {
                vm.broadcast(PLAYER_2);
                try farmGame.claimLand(landId2, tokenId2) {
                    console.log(unicode"  ✅ Player 2成功种植到土地", landId2);
                } catch Error(string memory reason) {
                    console.log(unicode"  ❌ Player 2种植失败:", reason);
                }
            }
        }
    }

    function testHelpingOthers() internal {
        uint256 landId1 = findPlayerLand(PLAYER_1);
        uint256 landId2 = findPlayerLand(PLAYER_2);

        if (landId1 != type(uint256).max) {
            // Player 2帮助Player 1
            vm.broadcast(PLAYER_2);
            try farmGame.helpOther{value: 0.0001 ether}(landId1, FarmGame.BoosterType.Watering, false) {
                console.log(unicode"  ✅ Player 2成功帮助Player 1浇水");
                uint256 kindBalance = kindToken.balanceOf(PLAYER_2);
                console.log(unicode"  Player 2获得KIND代币:", kindBalance);
            } catch Error(string memory reason) {
                console.log(unicode"  ❌ 帮助失败:", reason);
            }
        }

        if (landId2 != type(uint256).max) {
            // Player 1帮助Player 2
            vm.broadcast(PLAYER_1);
            try farmGame.helpOther{value: 0.0002 ether}(landId2, FarmGame.BoosterType.Fertilizing, false) {
                console.log(unicode"  ✅ Player 1成功帮助Player 2施肥");
                uint256 kindBalance = kindToken.balanceOf(PLAYER_1);
                console.log(unicode"  Player 1获得KIND代币:", kindBalance);
            } catch Error(string memory reason) {
                console.log(unicode"  ❌ 帮助失败:", reason);
            }
        }
    }

    function testHarvesting() internal {
        uint256 landId1 = findPlayerLand(PLAYER_1);
        if (landId1 != type(uint256).max) {
            console.log(unicode"  尝试推进作物生长...");

            // 尝试多次推进生长
            for (uint256 i = 0; i < 20; i++) {
                try farmGame.checkAndAdvanceGrowth(landId1) {
                    LandNFT.LandInfo memory land = landNFT.getLandInfo(landId1);
                    if (land.state == LandNFT.LandState.Ripe) {
                        console.log(unicode"  🎉 作物成熟! 尝试收获...");

                        vm.broadcast(PLAYER_1);
                        try farmGame.harvestCrop(landId1) {
                            console.log(unicode"  ✅ Player 1成功收获作物!");
                            return;
                        } catch Error(string memory reason) {
                            console.log(unicode"  ❌ 收获失败:", reason);
                        }
                    }
                } catch {
                    // 继续尝试
                }
            }
            console.log(unicode"  ⏳ 作物尚未成熟，收获测试跳过");
        }
    }

    function testStealing() internal {
        uint256 landId2 = findPlayerLand(PLAYER_2);
        if (landId2 != type(uint256).max) {
            console.log(unicode"  尝试推进Player 2作物生长...");

            // 尝试多次推进生长
            for (uint256 i = 0; i < 20; i++) {
                try farmGame.checkAndAdvanceGrowth(landId2) {
                    LandNFT.LandInfo memory land = landNFT.getLandInfo(landId2);
                    if (land.state == LandNFT.LandState.Ripe) {
                        console.log(unicode"  🎉 Player 2作物成熟! Player 1尝试偷取...");

                        vm.broadcast(PLAYER_1);
                        try farmGame.stealCrop(landId2) {
                            console.log(unicode"  ✅ Player 1成功偷取作物!");
                            return;
                        } catch Error(string memory reason) {
                            console.log(unicode"  ❌ 偷取失败:", reason);
                        }
                    }
                } catch {
                    // 继续尝试
                }
            }
            console.log(unicode"  ⏳ 作物尚未成熟，偷取测试跳过");
        }
    }

    function testLeaderboards() internal {
        try farmGame.getHarvestLeaderboard(5) returns (FarmGame.LeaderboardEntry[] memory harvestBoard) {
            console.log(unicode"  ✅ 收获排行榜查询成功, 条目数:", harvestBoard.length);
        } catch {
            console.log(unicode"  ❌ 收获排行榜查询失败");
        }

        try farmGame.getKindnessLeaderboard(5) returns (FarmGame.LeaderboardEntry[] memory kindBoard) {
            console.log(unicode"  ✅ 善良排行榜查询成功, 条目数:", kindBoard.length);
        } catch {
            console.log(unicode"  ❌ 善良排行榜查询失败");
        }
    }

    function printFinalStatus() internal view {
        console.log(unicode"=== 📊 最终状态 ===");
        console.log(unicode"Player 1种子余额:", seedNFT.balanceOf(PLAYER_1));
        console.log(unicode"Player 2种子余额:", seedNFT.balanceOf(PLAYER_2));
        console.log(unicode"Player 1 KIND余额:", kindToken.balanceOf(PLAYER_1));
        console.log(unicode"Player 2 KIND余额:", kindToken.balanceOf(PLAYER_2));

        FarmGame.PlayerStats memory stats1 = farmGame.getPlayerStats(PLAYER_1);
        FarmGame.PlayerStats memory stats2 = farmGame.getPlayerStats(PLAYER_2);

        console.log(unicode"Player 1统计 - 收获:", stats1.totalCropsHarvested);
        console.log(unicode"         偷取:", stats1.totalCropsStolen, unicode"帮助:", stats1.totalHelpProvided);
        console.log(unicode"Player 2统计 - 收获:", stats2.totalCropsHarvested);
        console.log(unicode"         偷取:", stats2.totalCropsStolen, unicode"帮助:", stats2.totalHelpProvided);

        uint256[] memory availableLands = landNFT.getAvailableLands();
        console.log(unicode"剩余可用土地:", availableLands.length);
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