// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/LandNFT.sol";

contract DiagnoseWeatherBug is Script {
    LandNFT constant landNFT = LandNFT(0x);

    function run() external view {
        console.log("=== Weather System Bug Diagnosis ===");
        console.log("Current time:", block.timestamp);

        // Check land 0
        LandNFT.LandInfo memory land = landNFT.getLandInfo(0);
        console.log("Land 0 last weather update:", land.lastWeatherUpdateTime);
        console.log("Time difference:", block.timestamp - land.lastWeatherUpdateTime);

        // The bug: currentTime <= lastWeatherUpdateTime almost always returns true
        // because when we just called advanceGrowth, currentTime equals lastWeatherUpdateTime

        uint256 timeElapsed = block.timestamp - land.lastWeatherUpdateTime;
        uint256 segmentsPassed = timeElapsed / 900; // WEATHER_SEGMENT_DURATION = 15 minutes = 900 seconds

        console.log("Time elapsed:", timeElapsed);
        console.log("Segments that should be processed:", segmentsPassed);

        // The condition that's failing
        bool wouldReturn = block.timestamp <= land.lastWeatherUpdateTime;
        console.log("Would early return (BUG):", wouldReturn);

        if (segmentsPassed == 0 && timeElapsed > 0) {
            console.log("BUG CONFIRMED: Time elapsed but no segments to process");
            console.log("This happens because time elapsed < 900 seconds (15 minutes)");
            console.log("Weather system requires 15+ minute intervals to work");
        }

        console.log("\nSolution: Either:");
        console.log("1. Reduce WEATHER_SEGMENT_DURATION to 1 minute (60 seconds)");
        console.log("2. Or change logic to accumulate partial segments");
        console.log("3. Or wait 15+ minutes between growth checks");
    }
}