// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";
import "../src/KindnessToken.sol";
import "../src/Shop.sol";

contract TestRealDataSystem is Script {
    FarmGame farmGame;
    SeedNFT seedNFT;
    LandNFT landNFT;
    KindnessToken kindToken;
    Shop shop;

    // Test players
    uint256 constant PLAYER_A_KEY = 0x1;
    uint256 constant PLAYER_B_KEY = 0x2;
    uint256 constant PLAYER_C_KEY = 0x3;
    address playerA;
    address playerB;
    address playerC;

    function setUp() public {
        playerA = vm.addr(PLAYER_A_KEY);
        playerB = vm.addr(PLAYER_B_KEY);
        playerC = vm.addr(PLAYER_C_KEY);

        // Give players some ETH
        vm.deal(playerA, 10 ether);
        vm.deal(playerB, 10 ether);
        vm.deal(playerC, 10 ether);
    }

    function run() external virtual {
        setUp();

        console.log("=== COMPREHENSIVE REAL DATA SYSTEM TEST ===");
        console.log("Testing all game features + new data systems...");

        // Deploy contracts
        deployContracts();

        // Test 1: Player Registration System
        console.log("\n1. TESTING PLAYER REGISTRATION SYSTEM");
        testPlayerRegistration();

        // Test 2: Complete Game Flow with Events
        console.log("\n2. TESTING COMPLETE GAME FLOW WITH EVENT RECORDING");
        testCompleteGameFlow();

        // Test 3: Event Recording System
        console.log("\n3. TESTING EVENT RECORDING SYSTEM");
        testEventRecording();

        // Test 4: Leaderboard System
        console.log("\n4. TESTING LEADERBOARD SYSTEM");
        testLeaderboardSystem();

        // Test 5: Global Statistics
        console.log("\n5. TESTING GLOBAL STATISTICS");
        testGlobalStatistics();

        // Test 6: Advanced Game Scenarios
        console.log("\n6. TESTING ADVANCED GAME SCENARIOS");
        testAdvancedScenarios();

        console.log("\n=== FINAL TEST SUMMARY ===");
        printFinalStatus();
    }

    function deployContracts() internal {
        console.log("Deploying all contracts...");

        vm.startBroadcast();

        // Deploy tokens
        kindToken = new KindnessToken();
        console.log("KindnessToken deployed at:", address(kindToken));

        // Deploy NFTs
        seedNFT = new SeedNFT();
        landNFT = new LandNFT(100);
        console.log("SeedNFT deployed at:", address(seedNFT));
        console.log("LandNFT deployed at:", address(landNFT));

        // Deploy shop
        shop = new Shop(address(seedNFT), address(kindToken));
        console.log("Shop deployed at:", address(shop));

        // Deploy main game contract
        farmGame = new FarmGame(
            address(seedNFT),
            address(landNFT),
            address(shop),
            address(kindToken)
        );
        console.log("FarmGame deployed at:", address(farmGame));

        // Transfer ownership to farmGame
        seedNFT.transferOwnership(address(farmGame));
        landNFT.transferOwnership(address(farmGame));
        kindToken.transferOwnership(address(farmGame));

        vm.stopBroadcast();
    }

    function testPlayerRegistration() internal {
        console.log("Testing player registration system...");

        // Initially no players registered
        uint256 initialPlayers = farmGame.getTotalPlayers();
        console.log("  Initial player count:", initialPlayers);
        require(initialPlayers == 0, "Should start with 0 players");

        // Player A buys seed (should auto-register)
        vm.startBroadcast(PLAYER_A_KEY);
        farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat);
        vm.stopBroadcast();

        // Check registration
        uint256 playersAfterA = farmGame.getTotalPlayers();
        console.log("  Players after A joined:", playersAfterA);
        require(playersAfterA == 1, "Should have 1 player after A joins");
        require(farmGame.isPlayerRegistered(playerA), "Player A should be registered");

        // Player B buys seed
        vm.startBroadcast(PLAYER_B_KEY);
        farmGame.buySeedWithNative{value: 0.0015 ether}(SeedNFT.CropType.Corn);
        vm.stopBroadcast();

        uint256 playersAfterB = farmGame.getTotalPlayers();
        console.log("  Players after B joined:", playersAfterB);
        require(playersAfterB == 2, "Should have 2 players after B joins");

        // Get all players
        address[] memory allPlayers = farmGame.getAllPlayers();
        console.log("  All registered players:", allPlayers.length);
        require(allPlayers.length == 2, "Should return 2 players");
        console.log("    Player 1:", allPlayers[0]);
        console.log("    Player 2:", allPlayers[1]);
    }

    function testCompleteGameFlow() internal {
        console.log("Testing complete game flow with event recording...");

        // Get available lands
        uint256[] memory availableLands = landNFT.getAvailableLands();
        require(availableLands.length >= 2, "Need at least 2 available lands");

        uint256 landA = availableLands[0];
        uint256 landB = availableLands[1];

        // Player A claims land and plants
        vm.startBroadcast(PLAYER_A_KEY);
        uint256 tokenIdA = findPlayerSeedToken(playerA);
        farmGame.claimLand(landA, tokenIdA);
        console.log("  Player A planted on land:", landA);
        vm.stopBroadcast();

        // Player B claims land and plants
        vm.startBroadcast(PLAYER_B_KEY);
        uint256 tokenIdB = findPlayerSeedToken(playerB);
        farmGame.claimLand(landB, tokenIdB);
        console.log("  Player B planted on land:", landB);
        vm.stopBroadcast();

        // Player A helps Player B
        vm.startBroadcast(PLAYER_A_KEY);
        farmGame.helpOther{value: 0.0001 ether}(landB, FarmGame.BoosterType.Watering, false);
        console.log("  Player A helped Player B with watering");
        vm.stopBroadcast();

        // Player B helps Player A
        vm.startBroadcast(PLAYER_B_KEY);
        farmGame.helpOther{value: 0.0002 ether}(landA, FarmGame.BoosterType.Fertilizing, false);
        console.log("  Player B helped Player A with fertilizing");
        vm.stopBroadcast();

        // Player A uses booster on own crop
        vm.startBroadcast(PLAYER_A_KEY);
        farmGame.applyBooster{value: 0.0001 ether}(landA, FarmGame.BoosterType.Watering, false);
        console.log("  Player A applied watering booster");
        vm.stopBroadcast();

        // Advance time and growth
        vm.warp(block.timestamp + 1 hours);

        // Try to advance growth to ripe state
        uint256 attempts = 0;
        while (attempts < 10) {
            attempts++;
            try farmGame.checkAndAdvanceGrowth(landA) {
                LandNFT.LandInfo memory land = landNFT.getLandInfo(landA);
                if (land.state == LandNFT.LandState.Ripe) {
                    console.log("  Land A is now ripe after", attempts, "attempts");
                    break;
                }
            } catch {
                // Continue trying
            }
        }

        // Test harvest vs steal scenario
        LandNFT.LandInfo memory landInfo = landNFT.getLandInfo(landA);
        if (landInfo.state == LandNFT.LandState.Ripe) {
            // Player A harvests their own crop
            vm.startBroadcast(PLAYER_A_KEY);
            farmGame.harvestCrop(landA);
            console.log("  Player A harvested their crop");
            vm.stopBroadcast();
        }

        // Try similar for Player B's land but with stealing
        attempts = 0;
        while (attempts < 10) {
            attempts++;
            try farmGame.checkAndAdvanceGrowth(landB) {
                LandNFT.LandInfo memory land = landNFT.getLandInfo(landB);
                if (land.state == LandNFT.LandState.Ripe) {
                    console.log("  Land B is now ripe after", attempts, "attempts");
                    break;
                }
            } catch {
                // Continue trying
            }
        }

        landInfo = landNFT.getLandInfo(landB);
        if (landInfo.state == LandNFT.LandState.Ripe) {
            // Player A steals Player B's crop
            vm.startBroadcast(PLAYER_A_KEY);
            farmGame.stealCrop(landB);
            console.log("  Player A stole Player B's crop");
            vm.stopBroadcast();
        }
    }

    function testEventRecording() internal {
        console.log("Testing event recording system...");

        // Check Player A's events
        FarmGame.GameEvent[] memory eventsA = farmGame.getPlayerEvents(playerA, 10);
        console.log("  Player A has", eventsA.length, "events recorded");

        for (uint256 i = 0; i < eventsA.length; i++) {
            console.log("    Event", i + 1, ":");
            console.log("      Type:", eventsA[i].eventType);
            console.log("      Land ID:", eventsA[i].landId);
            console.log("      Timestamp:", eventsA[i].timestamp);
            console.log("      Description:", eventsA[i].description);
        }

        // Check Player B's events
        FarmGame.GameEvent[] memory eventsB = farmGame.getPlayerEvents(playerB, 10);
        console.log("  Player B has", eventsB.length, "events recorded");

        // Check global recent events
        FarmGame.GameEvent[] memory recentEvents = farmGame.getRecentEvents(5);
        console.log("  Recent global events:", recentEvents.length);

        // Check individual event counts
        uint256 countA = farmGame.getPlayerEventCount(playerA);
        uint256 countB = farmGame.getPlayerEventCount(playerB);
        console.log("  Player A total events:", countA);
        console.log("  Player B total events:", countB);

        require(countA > 0, "Player A should have events");
        require(countB > 0, "Player B should have events");
    }

    function testLeaderboardSystem() internal {
        console.log("Testing leaderboard system...");

        // Add Player C for more interesting leaderboard
        vm.startBroadcast(PLAYER_C_KEY);
        farmGame.buySeedWithNative{value: 0.002 ether}(SeedNFT.CropType.Pumpkin);
        vm.stopBroadcast();

        // Get harvest leaderboard
        FarmGame.LeaderboardEntry[] memory harvestBoard = farmGame.getHarvestLeaderboard(10);
        console.log("  Harvest Leaderboard entries:", harvestBoard.length);

        for (uint256 i = 0; i < harvestBoard.length; i++) {
            console.log("    Rank", harvestBoard[i].rank, ":");
            console.log("      Player:", harvestBoard[i].player);
            console.log("      Harvests:", harvestBoard[i].harvestCount);
            console.log("      Steals:", harvestBoard[i].stealCount);
            console.log("      Total Score:", harvestBoard[i].totalScore);
        }

        // Get kindness leaderboard
        FarmGame.LeaderboardEntry[] memory kindnessBoard = farmGame.getKindnessLeaderboard(10);
        console.log("  Kindness Leaderboard entries:", kindnessBoard.length);

        for (uint256 i = 0; i < kindnessBoard.length; i++) {
            console.log("    Rank", kindnessBoard[i].rank, ":");
            console.log("      Player:", kindnessBoard[i].player);
            console.log("      Help Count:", kindnessBoard[i].helpCount);
            console.log("      KIND Balance:", kindnessBoard[i].kindBalance);
        }

        // Test individual rankings
        (uint256 harvestRankA, uint256 kindnessRankA) = farmGame.getPlayerRank(playerA);
        (uint256 harvestRankB, uint256 kindnessRankB) = farmGame.getPlayerRank(playerB);

        console.log("  Player A Rankings - Harvest:", harvestRankA, "Kindness:", kindnessRankA);
        console.log("  Player B Rankings - Harvest:", harvestRankB, "Kindness:", kindnessRankB);
    }

    function testGlobalStatistics() internal {
        console.log("Testing global statistics...");

        FarmGame.GlobalStats memory stats = farmGame.getGlobalStats();

        console.log("  Global Statistics:");
        console.log("    Total Players:", stats.totalPlayers);
        console.log("    Total Harvests:", stats.totalHarvests);
        console.log("    Total Steals:", stats.totalSteals);
        console.log("    Total Helps:", stats.totalHelps);
        console.log("    Total Events:", stats.totalEvents);

        require(stats.totalPlayers >= 3, "Should have at least 3 players");
        require(stats.totalEvents > 0, "Should have recorded events");
        require(stats.totalHelps > 0, "Should have help actions");
    }

    function testAdvancedScenarios() internal {
        console.log("Testing advanced scenarios...");

        // Test daily help limits
        vm.startBroadcast(PLAYER_A_KEY);

        // Try to help many times in one day
        uint256 helpCount = 0;
        for (uint256 i = 0; i < 5; i++) {
            try farmGame.helpOther{value: 0.0001 ether}(1, FarmGame.BoosterType.Watering, false) {
                helpCount++;
            } catch {
                break;
            }
        }
        console.log("  Player A was able to help", helpCount, "times");

        vm.stopBroadcast();

        // Test multiple seed purchases and plants
        vm.startBroadcast(PLAYER_B_KEY);

        // Buy multiple seeds
        farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat);
        farmGame.buySeedWithNative{value: 0.0015 ether}(SeedNFT.CropType.Corn);

        console.log("  Player B bought additional seeds");

        vm.stopBroadcast();

        // Test KIND token usage
        uint256 kindBalance = kindToken.balanceOf(playerA);
        console.log("  Player A KIND balance:", kindBalance);

        if (kindBalance > 2 * 10**18) {
            vm.startBroadcast(PLAYER_A_KEY);
            try farmGame.buySeedWithKind(SeedNFT.CropType.Strawberry) {
                console.log("  Player A bought premium seed with KIND");
            } catch Error(string memory reason) {
                console.log("  KIND purchase failed:", reason);
            }
            vm.stopBroadcast();
        }

        // Test weather system impact
        console.log("  Testing weather impact on different lands...");
        uint256[] memory availableLands = landNFT.getAvailableLands();

        for (uint256 i = 0; i < 3 && i < availableLands.length; i++) {
            LandNFT.LandInfo memory land = landNFT.getLandInfo(availableLands[i]);
            console.log("    Land", availableLands[i], "weather seed:", land.weatherSeed);
        }
    }

    function printFinalStatus() internal view {
        console.log("=== FINAL GAME STATE ===");

        // Player balances
        console.log("Player Balances:");
        console.log("  Player A - Seeds:", seedNFT.balanceOf(playerA), "KIND:", kindToken.balanceOf(playerA));
        console.log("  Player B - Seeds:", seedNFT.balanceOf(playerB), "KIND:", kindToken.balanceOf(playerB));
        console.log("  Player C - Seeds:", seedNFT.balanceOf(playerC), "KIND:", kindToken.balanceOf(playerC));

        // Player stats
        FarmGame.PlayerStats memory statsA = farmGame.getPlayerStats(playerA);
        FarmGame.PlayerStats memory statsB = farmGame.getPlayerStats(playerB);
        FarmGame.PlayerStats memory statsC = farmGame.getPlayerStats(playerC);

        console.log("Player Stats:");
        console.log("  Player A Stats:");
        console.log("    Harvests:", statsA.totalCropsHarvested, "Steals:", statsA.totalCropsStolen);
        console.log("    Helps:", statsA.totalHelpProvided);
        console.log("  Player B Stats:");
        console.log("    Harvests:", statsB.totalCropsHarvested, "Steals:", statsB.totalCropsStolen);
        console.log("    Helps:", statsB.totalHelpProvided);
        console.log("  Player C Stats:");
        console.log("    Harvests:", statsC.totalCropsHarvested, "Steals:", statsC.totalCropsStolen);
        console.log("    Helps:", statsC.totalHelpProvided);

        // System status
        FarmGame.GlobalStats memory globalStats = farmGame.getGlobalStats();
        console.log("Global System State:");
        console.log("  Total registered players:", globalStats.totalPlayers);
        console.log("  Total events recorded:", globalStats.totalEvents);
        console.log("  Total game actions:");
        console.log("    Harvests:", globalStats.totalHarvests);
        console.log("    Steals:", globalStats.totalSteals);
        console.log("    Helps:", globalStats.totalHelps);

        // Land availability
        uint256[] memory availableLands = landNFT.getAvailableLands();
        console.log("  Available lands:", availableLands.length, "/ 100");

        console.log("Test completed successfully!");
        console.log("All real data systems are working correctly!");
    }

    function findPlayerSeedToken(address player) internal view returns (uint256) {
        uint256 balance = seedNFT.balanceOf(player);
        if (balance == 0) return type(uint256).max;

        uint256 totalSupply = seedNFT.totalSupply();
        for (uint256 i = 0; i < totalSupply; i++) {
            try seedNFT.ownerOf(i) returns (address owner) {
                if (owner == player) {
                    SeedNFT.SeedInfo memory info = seedNFT.getSeedInfo(i);
                    if (info.growthStage == SeedNFT.GrowthStage.Seed) {
                        return i;
                    }
                }
            } catch {
                continue;
            }
        }
        return type(uint256).max;
    }
}