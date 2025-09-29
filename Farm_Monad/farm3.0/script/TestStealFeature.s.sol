// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./TestRealDataSystem.s.sol";

contract TestStealFeature is TestRealDataSystem {
    function run() external override {
        console.log("=== DEDICATED STEAL FEATURE TEST ===");

        setUp();
        deployContracts();

        console.log("\n1. Setup players with seeds");
        setupPlayersWithSeeds();

        console.log("\n2. Plant crops");
        plantCrops();

        console.log("\n3. Force crop maturation and test stealing");
        testStealingMechanism();

        console.log("\n4. Verify steal was recorded");
        verifyStealRecords();

        console.log("\n=== STEAL FEATURE TEST COMPLETED ===");
    }

    function setupPlayersWithSeeds() internal {
        // Player A buys wheat
        vm.startBroadcast(PLAYER_A_KEY);
        farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat);
        vm.stopBroadcast();

        // Player B buys corn
        vm.startBroadcast(PLAYER_B_KEY);
        farmGame.buySeedWithNative{value: 0.0015 ether}(SeedNFT.CropType.Corn);
        vm.stopBroadcast();

        console.log("  Players have seeds ready");
    }

    function plantCrops() internal {
        uint256[] memory lands = landNFT.getAvailableLands();
        require(lands.length >= 2, "Need at least 2 lands");

        uint256 landA = lands[0];
        uint256 landB = lands[1];

        // Player A plants
        vm.startBroadcast(PLAYER_A_KEY);
        uint256 tokenIdA = findPlayerSeedToken(playerA);
        farmGame.claimLand(landA, tokenIdA);
        console.log("  Player A planted on land:", landA);
        vm.stopBroadcast();

        // Player B plants
        vm.startBroadcast(PLAYER_B_KEY);
        uint256 tokenIdB = findPlayerSeedToken(playerB);
        farmGame.claimLand(landB, tokenIdB);
        console.log("  Player B planted on land:", landB);
        vm.stopBroadcast();
    }

    function testStealingMechanism() internal {
        uint256[] memory lands = landNFT.getAvailableLands();
        uint256 landB = lands[1]; // Player B's land

        console.log("  Advancing time to mature crop...");
        vm.warp(block.timestamp + 5 hours); // Much longer time

        // Force crop to mature with many attempts
        console.log("  Forcing crop maturation...");
        uint256 attempts = 0;
        bool isRipe = false;

        while (attempts < 50 && !isRipe) {
            attempts++;
            try farmGame.checkAndAdvanceGrowth(landB) {
                LandNFT.LandInfo memory land = landNFT.getLandInfo(landB);
                if (land.state == LandNFT.LandState.Ripe) {
                    console.log("    Crop is ripe after", attempts, "attempts");
                    isRipe = true;
                    break;
                }
            } catch {
                // Continue trying
            }
        }

        LandNFT.LandInfo memory landInfo = landNFT.getLandInfo(landB);
        console.log("  Land state:", uint256(landInfo.state));

        if (landInfo.state == LandNFT.LandState.Ripe) {
            console.log("  SUCCESS: Crop is ripe, proceeding with steal test");

            // Record Player A's initial seeds
            uint256 initialSeeds = seedNFT.balanceOf(playerA);
            console.log("    Player A initial seeds:", initialSeeds);

            // Player A steals from Player B
            console.log("  Player A stealing from Player B...");
            vm.startBroadcast(PLAYER_A_KEY);
            farmGame.stealCrop(landB);
            vm.stopBroadcast();

            // Check results
            uint256 finalSeeds = seedNFT.balanceOf(playerA);
            console.log("    Player A final seeds:", finalSeeds);

            require(finalSeeds > initialSeeds, "Steal should increase Player A's seeds");
            console.log("  SUCCESS: Steal executed successfully!");

        } else {
            console.log("  ERROR: Crop did not mature to Ripe state");
            console.log("  Current state:", uint256(landInfo.state));
            console.log("  0=Idle, 1=Growing, 2=Ripe, 3=Stealing, 4=LockedIdle");
        }
    }

    function verifyStealRecords() internal {
        // Check global stats
        FarmGame.GlobalStats memory stats = farmGame.getGlobalStats();
        console.log("  Global steal count:", stats.totalSteals);

        // Check leaderboard
        FarmGame.LeaderboardEntry[] memory leaderboard = farmGame.getHarvestLeaderboard(5);

        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].player == playerA) {
                console.log("  Player A steal count:", leaderboard[i].stealCount);
                require(leaderboard[i].stealCount > 0, "Player A should have steal count > 0");
                break;
            }
        }

        // Check events
        FarmGame.GameEvent[] memory events = farmGame.getPlayerEvents(playerA, 20);
        bool foundStealEvent = false;

        for (uint256 i = 0; i < events.length; i++) {
            if (keccak256(bytes(events[i].eventType)) == keccak256(bytes("steal"))) {
                console.log("  Found steal event in Player A's history");
                foundStealEvent = true;
                break;
            }
        }

        require(foundStealEvent, "Should find steal event in Player A's history");
        console.log("  SUCCESS: Steal properly recorded in all systems");
    }
}