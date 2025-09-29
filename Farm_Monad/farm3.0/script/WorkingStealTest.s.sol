// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./TestRealDataSystem.s.sol";

contract WorkingStealTest is TestRealDataSystem {
    function run() external override {
        console.log("=== WORKING STEAL TEST ===");

        setUp();
        deployContracts();

        // Buy seeds for both players
        vm.startBroadcast(PLAYER_A_KEY);
        farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat);
        vm.stopBroadcast();

        vm.startBroadcast(PLAYER_B_KEY);
        farmGame.buySeedWithNative{value: 0.0015 ether}(SeedNFT.CropType.Corn);
        vm.stopBroadcast();

        // Plant both players
        uint256[] memory lands = landNFT.getAvailableLands();
        uint256 landA = lands[0];
        uint256 landB = lands[1];

        vm.startBroadcast(PLAYER_A_KEY);
        uint256 tokenA = findPlayerSeedToken(playerA);
        farmGame.claimLand(landA, tokenA);
        console.log("Player A planted on land:", landA);
        vm.stopBroadcast();

        vm.startBroadcast(PLAYER_B_KEY);
        uint256 tokenB = findPlayerSeedToken(playerB);
        farmGame.claimLand(landB, tokenB);
        console.log("Player B planted on land:", landB);
        vm.stopBroadcast();

        // Advance time significantly for crop to mature
        console.log("Advancing time by 6 hours...");
        vm.warp(block.timestamp + 6 hours);

        // Force Player B's crop to mature using the correct landB
        console.log("Forcing Player B's crop to mature...");
        uint256 attempts = 0;
        bool isRipe = false;

        while (attempts < 100 && !isRipe) {
            attempts++;
            try farmGame.checkAndAdvanceGrowth(landB) {
                LandNFT.LandInfo memory land = landNFT.getLandInfo(landB);
                if (land.state == LandNFT.LandState.Ripe) {
                    console.log("Player B's crop is ripe after", attempts, "attempts");
                    isRipe = true;
                    break;
                }
            } catch {
                // Continue trying
            }
        }

        LandNFT.LandInfo memory landInfo = landNFT.getLandInfo(landB);
        console.log("Player B's land state:", uint256(landInfo.state));

        if (landInfo.state == LandNFT.LandState.Ripe) {
            console.log("SUCCESS: Player B's crop is ripe, executing steal...");

            // Record Player A's seeds before stealing
            uint256 beforeSeeds = seedNFT.balanceOf(playerA);
            console.log("Player A seeds before steal:", beforeSeeds);

            // Player A steals from Player B
            vm.startBroadcast(PLAYER_A_KEY);
            farmGame.stealCrop(landB);
            console.log("Player A stole from Player B successfully!");
            vm.stopBroadcast();

            // Check results
            uint256 afterSeeds = seedNFT.balanceOf(playerA);
            console.log("Player A seeds after steal:", afterSeeds);

            // Verify steal statistics
            FarmGame.GlobalStats memory stats = farmGame.getGlobalStats();
            console.log("Global steal count:", stats.totalSteals);

            FarmGame.LeaderboardEntry[] memory leaderboard = farmGame.getHarvestLeaderboard(5);
            for (uint256 i = 0; i < leaderboard.length; i++) {
                if (leaderboard[i].player == playerA) {
                    console.log("Player A steal count in leaderboard:", leaderboard[i].stealCount);
                    break;
                }
            }

            // Check events
            FarmGame.GameEvent[] memory events = farmGame.getPlayerEvents(playerA, 20);
            console.log("Player A total events:", events.length);

            for (uint256 i = 0; i < events.length; i++) {
                console.log("Event", i + 1, "type:", events[i].eventType);
                if (keccak256(bytes(events[i].eventType)) == keccak256(bytes("steal"))) {
                    console.log("FOUND STEAL EVENT!");
                }
            }

            console.log("=== STEAL TEST COMPLETED SUCCESSFULLY ===");
        } else {
            console.log("ERROR: Could not mature Player B's crop");
            console.log("Final state:", uint256(landInfo.state));
        }
    }
}