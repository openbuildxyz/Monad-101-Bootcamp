// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/LandNFT.sol";

contract LandNFTTest is Test {
    LandNFT public landNFT;
    address public owner = address(0x1);
    address public farmer = address(0x2);
    uint256 public constant TOTAL_LANDS = 10;

    function setUp() public {
        vm.prank(owner);
        landNFT = new LandNFT(TOTAL_LANDS);
    }

    function testInitialState() public {
        assertEq(landNFT.getTotalLands(), TOTAL_LANDS);
        
        for (uint256 i = 0; i < TOTAL_LANDS; i++) {
            LandNFT.LandInfo memory info = landNFT.getLandInfo(i);
            assertEq(uint256(info.state), uint256(LandNFT.LandState.Idle));
            assertEq(info.currentFarmer, address(0));
        }
        
        uint256[] memory availableLands = landNFT.getAvailableLands();
        assertEq(availableLands.length, TOTAL_LANDS);
    }

    function testClaimLand() public {
        uint256 landId = 0;
        uint256 seedTokenId = 123;
        
        vm.prank(owner);
        landNFT.claimLand(landId, seedTokenId, farmer);
        
        LandNFT.LandInfo memory info = landNFT.getLandInfo(landId);
        assertEq(uint256(info.state), uint256(LandNFT.LandState.Growing));
        assertEq(info.seedTokenId, seedTokenId);
        assertEq(info.currentFarmer, farmer);
        assertEq(info.claimTime, block.timestamp);
        assertEq(info.accumulatedGrowth, 0);
    }

    function testSetWeatherSeed() public {
        uint256 landId = 0;
        uint256 seedTokenId = 123;
        uint256 weatherSeed = 999;
        
        vm.prank(owner);
        landNFT.claimLand(landId, seedTokenId, farmer);
        
        vm.prank(owner);
        landNFT.setWeatherSeed(landId, weatherSeed);
        
        LandNFT.LandInfo memory info = landNFT.getLandInfo(landId);
        assertEq(info.weatherSeed, weatherSeed);
    }

    function testAdvanceGrowth() public {
        uint256 landId = 0;
        uint256 seedTokenId = 123;
        uint256 weatherSeed = 999;
        uint256 baseGrowthTime = 60 minutes;
        
        vm.prank(owner);
        landNFT.claimLand(landId, seedTokenId, farmer);
        
        vm.prank(owner);
        landNFT.setWeatherSeed(landId, weatherSeed);
        
        vm.warp(block.timestamp + 30 minutes);
        
        vm.prank(owner);
        bool isRipe = landNFT.advanceGrowth(landId, baseGrowthTime);
        
        LandNFT.LandInfo memory info = landNFT.getLandInfo(landId);
        assertGt(info.accumulatedGrowth, 0);
        
        if (info.accumulatedGrowth >= baseGrowthTime) {
            assertTrue(isRipe);
            assertEq(uint256(info.state), uint256(LandNFT.LandState.Ripe));
        }
    }

    function testHarvestCrop() public {
        uint256 landId = 0;
        uint256 seedTokenId = 123;
        uint256 weatherSeed = 999;
        uint256 baseGrowthTime = 15 minutes; // Short time for testing
        
        vm.prank(owner);
        landNFT.claimLand(landId, seedTokenId, farmer);
        
        vm.prank(owner);
        landNFT.setWeatherSeed(landId, weatherSeed);
        
        vm.warp(block.timestamp + 30 minutes);
        
        vm.prank(owner);
        landNFT.advanceGrowth(landId, baseGrowthTime);
        
        LandNFT.LandInfo memory info = landNFT.getLandInfo(landId);
        if (uint256(info.state) == uint256(LandNFT.LandState.Ripe)) {
            vm.prank(owner);
            landNFT.harvestCrop(landId);
            
            info = landNFT.getLandInfo(landId);
            assertEq(uint256(info.state), uint256(LandNFT.LandState.LockedIdle));
            assertEq(info.currentFarmer, address(0));
            assertGt(info.lockEndTime, block.timestamp);
        }
    }

    function testCooldownPeriod() public {
        uint256 landId = 0;
        uint256 seedTokenId = 123;
        
        // Claim, grow and harvest the land
        vm.prank(owner);
        landNFT.claimLand(landId, seedTokenId, farmer);
        
        vm.prank(owner);
        landNFT.setWeatherSeed(landId, 999);
        
        vm.warp(block.timestamp + 30 minutes);
        
        vm.prank(owner);
        landNFT.advanceGrowth(landId, 15 minutes);
        
        LandNFT.LandInfo memory info = landNFT.getLandInfo(landId);
        if (uint256(info.state) == uint256(LandNFT.LandState.Ripe)) {
            vm.prank(owner);
            landNFT.harvestCrop(landId);
            
            // Try to claim during cooldown - should fail
            vm.prank(owner);
            vm.expectRevert("LandNFT: Land in cooldown");
            landNFT.claimLand(landId, seedTokenId + 1, farmer);
            
            // Wait for cooldown to end
            vm.warp(block.timestamp + landNFT.COOLDOWN_PERIOD() + 1);
            
            landNFT.checkAndUpdateIdleStatus();
            
            info = landNFT.getLandInfo(landId);
            assertEq(uint256(info.state), uint256(LandNFT.LandState.Idle));
        }
    }

    function testStealCrop() public {
        uint256 landId = 0;
        uint256 seedTokenId = 123;
        uint256 weatherSeed = 999;
        uint256 baseGrowthTime = 15 minutes;
        
        vm.prank(owner);
        landNFT.claimLand(landId, seedTokenId, farmer);
        
        vm.prank(owner);
        landNFT.setWeatherSeed(landId, weatherSeed);
        
        vm.warp(block.timestamp + 30 minutes);
        
        vm.prank(owner);
        landNFT.advanceGrowth(landId, baseGrowthTime);
        
        LandNFT.LandInfo memory info = landNFT.getLandInfo(landId);
        if (uint256(info.state) == uint256(LandNFT.LandState.Ripe)) {
            vm.prank(owner);
            landNFT.stealCrop(landId);
            
            info = landNFT.getLandInfo(landId);
            assertEq(uint256(info.state), uint256(LandNFT.LandState.LockedIdle));
        }
    }

    function testSimulateWeather() public {
        uint256 landId = 0;
        uint256 seedTokenId = 123;
        uint256 weatherSeed = 999;
        
        vm.prank(owner);
        landNFT.claimLand(landId, seedTokenId, farmer);
        
        vm.prank(owner);
        landNFT.setWeatherSeed(landId, weatherSeed);
        
        vm.warp(block.timestamp + 30 minutes);
        
        (LandNFT.WeatherType[] memory weatherTypes, uint256[] memory growthValues) = 
            landNFT.simulateWeatherForLand(landId);
        
        assertGt(weatherTypes.length, 0);
        assertEq(weatherTypes.length, growthValues.length);
    }

    function test_RevertWhen_ClaimNonExistentLand() public {
        vm.prank(owner);
        vm.expectRevert("LandNFT: Land does not exist");
        landNFT.claimLand(TOTAL_LANDS, 123, farmer);
    }

    function test_RevertWhen_ClaimBusyLand() public {
        uint256 landId = 0;
        
        vm.prank(owner);
        landNFT.claimLand(landId, 123, farmer);
        
        vm.prank(owner);
        vm.expectRevert("LandNFT: Land not available");
        landNFT.claimLand(landId, 124, farmer);
    }
}