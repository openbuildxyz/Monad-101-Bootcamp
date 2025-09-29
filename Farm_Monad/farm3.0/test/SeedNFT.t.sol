// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SeedNFT.sol";

contract SeedNFTTest is Test {
    SeedNFT public seedNFT;
    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        vm.prank(owner);
        seedNFT = new SeedNFT();
    }

    function testMintSeed() public {
        vm.prank(owner);
        uint256 tokenId = seedNFT.mintSeed(user, SeedNFT.CropType.Wheat, SeedNFT.Rarity.Common);
        
        assertEq(tokenId, 0);
        assertEq(seedNFT.ownerOf(tokenId), user);
        
        SeedNFT.SeedInfo memory info = seedNFT.getSeedInfo(tokenId);
        assertEq(uint256(info.cropType), uint256(SeedNFT.CropType.Wheat));
        assertEq(uint256(info.rarity), uint256(SeedNFT.Rarity.Common));
        assertEq(uint256(info.growthStage), uint256(SeedNFT.GrowthStage.Seed));
        assertEq(info.baseGrowthTime, 60 minutes);
    }

    function testStartGrowing() public {
        vm.prank(owner);
        uint256 tokenId = seedNFT.mintSeed(user, SeedNFT.CropType.Corn, SeedNFT.Rarity.Common);

        vm.prank(owner);
        seedNFT.startGrowing(tokenId);
        
        SeedNFT.SeedInfo memory info = seedNFT.getSeedInfo(tokenId);
        assertEq(uint256(info.growthStage), uint256(SeedNFT.GrowthStage.Growing));
        assertEq(info.growthStartTime, block.timestamp);
    }

    function testMatureSeed() public {
        vm.prank(owner);
        uint256 tokenId = seedNFT.mintSeed(user, SeedNFT.CropType.Wheat, SeedNFT.Rarity.Common);

        vm.prank(owner);
        seedNFT.startGrowing(tokenId);

        vm.prank(owner);
        seedNFT.matureSeed(tokenId);
        
        SeedNFT.SeedInfo memory info = seedNFT.getSeedInfo(tokenId);
        assertEq(uint256(info.growthStage), uint256(SeedNFT.GrowthStage.Mature));
        assertEq(info.maturedAt, block.timestamp);
    }

    function testApplyBooster() public {
        vm.prank(owner);
        uint256 tokenId = seedNFT.mintSeed(user, SeedNFT.CropType.Wheat, SeedNFT.Rarity.Common);

        vm.prank(owner);
        seedNFT.startGrowing(tokenId);

        vm.prank(owner);
        seedNFT.applyBooster(tokenId);
        
        SeedNFT.SeedInfo memory info = seedNFT.getSeedInfo(tokenId);
        assertEq(info.boostersApplied, 1);
    }

    function test_RevertWhen_StartGrowingNonExistentToken() public {
        vm.prank(owner); // Only owner can call startGrowing
        vm.expectRevert("SeedNFT: Token does not exist");
        seedNFT.startGrowing(999);
    }

    function test_RevertWhen_StartGrowingUnauthorized() public {
        vm.prank(owner);
        uint256 tokenId = seedNFT.mintSeed(user, SeedNFT.CropType.Wheat, SeedNFT.Rarity.Common);

        vm.prank(address(0x3));
        vm.expectRevert();
        seedNFT.startGrowing(tokenId);
    }
}