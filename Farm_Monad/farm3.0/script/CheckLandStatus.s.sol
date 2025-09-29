// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";

contract CheckLandStatus is Script {
    FarmGame constant farmGame = FarmGame(0xff91290e0fB079097c6C6b7b68961E88ECB5E7E0);
    SeedNFT constant seedNFT = SeedNFT(0xCEAdfDA643baEdD53CDfb9bA9338FD8CD9aea9f9);
    LandNFT constant landNFT = LandNFT(0x714e649777364d4D8d211E80c7Ee5EbD54115285);

    function run() external view {
        console.log("=== Current Land Status ===");
        console.log("Current time:", block.timestamp);

        // Check first 10 lands
        for (uint256 i = 0; i < 10; i++) {
            try landNFT.getLandInfo(i) returns (LandNFT.LandInfo memory info) {
                if (info.currentFarmer != address(0)) {
                    console.log("\nLand", i);
                    console.log("  State:", uint256(info.state));
                    console.log("  Farmer:", info.currentFarmer);
                    console.log("  Seed token:", info.seedTokenId);
                    console.log("  Claim time:", info.claimTime);
                    console.log("  Weather seed:", info.weatherSeed);
                    console.log("  Last weather update:", info.lastWeatherUpdateTime);
                    console.log("  Accumulated growth:", info.accumulatedGrowth);

                    if (info.lockEndTime > 0) {
                        console.log("  Lock end time:", info.lockEndTime);
                        if (info.lockEndTime > block.timestamp) {
                            console.log("  Cooldown remaining:", info.lockEndTime - block.timestamp);
                        }
                    }

                    // Check seed info
                    if (info.seedTokenId < 1000) { // reasonable token ID
                        try seedNFT.getSeedInfo(info.seedTokenId) returns (SeedNFT.SeedInfo memory seedInfo) {
                            console.log("  Seed stage:", uint256(seedInfo.growthStage));
                            console.log("  Base growth time:", seedInfo.baseGrowthTime);
                            console.log("  Boosters applied:", seedInfo.boostersApplied);

                            if (seedInfo.growthStartTime > 0) {
                                console.log("  Growth started:", seedInfo.growthStartTime);
                                uint256 elapsed = block.timestamp - seedInfo.growthStartTime;
                                console.log("  Time elapsed:", elapsed);
                            }
                        } catch {
                            console.log("  Could not get seed info");
                        }
                    }

                    // Show state meaning
                    string memory stateName;
                    if (info.state == LandNFT.LandState.Idle) stateName = "Idle";
                    else if (info.state == LandNFT.LandState.Growing) stateName = "Growing";
                    else if (info.state == LandNFT.LandState.Ripe) stateName = "Ripe";
                    else if (info.state == LandNFT.LandState.Stealing) stateName = "Stealing";
                    else if (info.state == LandNFT.LandState.LockedIdle) stateName = "LockedIdle";
                    else stateName = "Unknown";

                    console.log("  State name:", stateName);
                }
            } catch {
                continue;
            }
        }

        console.log("\n=== Available Lands ===");
        try landNFT.getAvailableLands() returns (uint256[] memory available) {
            console.log("Available land count:", available.length);
            for (uint256 i = 0; i < available.length && i < 5; i++) {
                console.log("  Land", available[i], "is available");
            }
        } catch {
            console.log("Could not get available lands");
        }
    }
}