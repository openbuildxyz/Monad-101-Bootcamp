// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./TestRealDataSystem.s.sol";

contract DebugStealTest is TestRealDataSystem {
    function run() external override {
        console.log("=== DEBUG STEAL TEST ===");

        setUp();
        deployContracts();

        // Buy seeds
        vm.startBroadcast(PLAYER_A_KEY);
        farmGame.buySeedWithNative{value: 0.001 ether}(SeedNFT.CropType.Wheat);
        vm.stopBroadcast();

        vm.startBroadcast(PLAYER_B_KEY);
        farmGame.buySeedWithNative{value: 0.0015 ether}(SeedNFT.CropType.Corn);
        vm.stopBroadcast();

        // Find tokens
        uint256 tokenA = findPlayerSeedToken(playerA);
        uint256 tokenB = findPlayerSeedToken(playerB);

        console.log("Player A token:", tokenA);
        console.log("Player B token:", tokenB);

        // Check seed info before planting
        SeedNFT.SeedInfo memory seedInfoA = seedNFT.getSeedInfo(tokenA);
        SeedNFT.SeedInfo memory seedInfoB = seedNFT.getSeedInfo(tokenB);

        console.log("Player A seed stage before planting:", uint256(seedInfoA.growthStage));
        console.log("Player B seed stage before planting:", uint256(seedInfoB.growthStage));

        // Get lands
        uint256[] memory lands = landNFT.getAvailableLands();
        uint256 landA = lands[0];
        uint256 landB = lands[1];

        console.log("Using land A:", landA);
        console.log("Using land B:", landB);

        // Check land info before planting
        LandNFT.LandInfo memory landInfoA = landNFT.getLandInfo(landA);
        LandNFT.LandInfo memory landInfoB = landNFT.getLandInfo(landB);

        console.log("Land A state before planting:", uint256(landInfoA.state));
        console.log("Land B state before planting:", uint256(landInfoB.state));

        // Plant Player A
        console.log("Planting Player A...");
        vm.startBroadcast(PLAYER_A_KEY);
        farmGame.claimLand(landA, tokenA);
        vm.stopBroadcast();

        // Check status after Player A plants
        landInfoA = landNFT.getLandInfo(landA);
        seedInfoA = seedNFT.getSeedInfo(tokenA);
        console.log("Land A state after Player A plants:", uint256(landInfoA.state));
        console.log("Player A seed stage after planting:", uint256(seedInfoA.growthStage));

        // Plant Player B
        console.log("Planting Player B...");
        vm.startBroadcast(PLAYER_B_KEY);
        farmGame.claimLand(landB, tokenB);
        vm.stopBroadcast();

        // Check status after Player B plants
        landInfoB = landNFT.getLandInfo(landB);
        seedInfoB = seedNFT.getSeedInfo(tokenB);
        console.log("Land B state after Player B plants:", uint256(landInfoB.state));
        console.log("Player B seed stage after planting:", uint256(seedInfoB.growthStage));

        console.log("=== DEBUG COMPLETED ===");
    }
}