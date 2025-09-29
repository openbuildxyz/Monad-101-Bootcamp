// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./TestRealDataSystem.s.sol";

contract LocalTestRealData is TestRealDataSystem {
    function run() external override {
        console.log("=== LOCAL ANVIL TEST: REAL DATA SYSTEM ===");
        console.log("Starting comprehensive test on local Anvil network...");
        console.log("Block number:", block.number);
        console.log("Block timestamp:", block.timestamp);

        // Call parent's setup and run functions
        setUp();

        console.log("Deploying contracts...");
        deployContracts();

        console.log("\n1. TESTING PLAYER REGISTRATION SYSTEM");
        testPlayerRegistration();

        console.log("\n2. TESTING COMPLETE GAME FLOW WITH EVENT RECORDING");
        testCompleteGameFlow();

        console.log("\n3. TESTING EVENT RECORDING SYSTEM");
        testEventRecording();

        console.log("\n4. TESTING LEADERBOARD SYSTEM");
        testLeaderboardSystem();

        console.log("\n5. TESTING GLOBAL STATISTICS");
        testGlobalStatistics();

        console.log("\n6. TESTING ADVANCED GAME SCENARIOS");
        testAdvancedScenarios();

        console.log("\n=== FINAL TEST SUMMARY ===");
        printFinalStatus();

        console.log("\n=== LOCAL TEST COMPLETED SUCCESSFULLY ===");
        console.log("All features tested and working!");
        console.log("Ready for deployment to testnet/mainnet");
    }
}