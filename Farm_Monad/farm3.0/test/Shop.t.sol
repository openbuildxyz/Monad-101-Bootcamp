// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Shop.sol";
import "../src/SeedNFT.sol";
import "../src/KindnessToken.sol";

contract ShopTest is Test {
    Shop public shop;
    SeedNFT public seedNFT;
    KindnessToken public kindToken;
    
    address public owner = address(0x1234);
    address public buyer = address(0x2);
    
    function setUp() public {
        vm.startPrank(owner);
        
        seedNFT = new SeedNFT();
        kindToken = new KindnessToken();
        shop = new Shop(address(seedNFT), address(kindToken));
        
        // Transfer ownership of SeedNFT and KindToken to shop so it can mint
        seedNFT.transferOwnership(address(shop));
        kindToken.transferOwnership(address(shop));
        
        vm.stopPrank();
        
        // Give buyer some native tokens
        vm.deal(buyer, 10 ether);
    }

    function testBuySeedWithNative() public {
        Shop.SeedPrice memory wheatPrice = shop.getSeedPrice(SeedNFT.CropType.Wheat);
        
        vm.prank(buyer);
        shop.buySeedWithNative{value: wheatPrice.nativePrice}(SeedNFT.CropType.Wheat);
        
        assertEq(seedNFT.balanceOf(buyer), 1);
        assertEq(shop.getUserPurchaseCount(buyer), 1);
        
        uint256 tokenId = 0;
        SeedNFT.SeedInfo memory info = seedNFT.getSeedInfo(tokenId);
        assertEq(uint256(info.cropType), uint256(SeedNFT.CropType.Wheat));
        assertEq(uint256(info.rarity), uint256(SeedNFT.Rarity.Common));
    }

    function testBuyMultipleSeedsWithNative() public {
        Shop.SeedPrice memory wheatPrice = shop.getSeedPrice(SeedNFT.CropType.Wheat);
        Shop.SeedPrice memory cornPrice = shop.getSeedPrice(SeedNFT.CropType.Corn);
        
        vm.startPrank(buyer);
        shop.buySeedWithNative{value: wheatPrice.nativePrice}(SeedNFT.CropType.Wheat);
        shop.buySeedWithNative{value: cornPrice.nativePrice}(SeedNFT.CropType.Corn);
        vm.stopPrank();
        
        assertEq(seedNFT.balanceOf(buyer), 2);
        assertEq(shop.getUserPurchaseCount(buyer), 2);
    }

    function testBuySeedWithKind() public {
        // First give buyer some KIND tokens
        // Since shop is owner of kindToken, we need to temporarily transfer ownership
        vm.prank(address(shop));
        kindToken.mint(buyer, 50 * 10**18); // 50 KIND tokens
        
        Shop.SeedPrice memory strawberryPrice = shop.getSeedPrice(SeedNFT.CropType.Strawberry);
        
        vm.prank(buyer);
        shop.buySeedWithKind(SeedNFT.CropType.Strawberry);
        
        assertEq(seedNFT.balanceOf(buyer), 1);
        assertEq(kindToken.balanceOf(buyer), 50 * 10**18 - strawberryPrice.kindPrice);
        
        uint256 tokenId = 0;
        SeedNFT.SeedInfo memory info = seedNFT.getSeedInfo(tokenId);
        assertEq(uint256(info.cropType), uint256(SeedNFT.CropType.Strawberry));
        assertEq(uint256(info.rarity), uint256(SeedNFT.Rarity.Rare));
    }

    function testRefundExcessPayment() public {
        Shop.SeedPrice memory wheatPrice = shop.getSeedPrice(SeedNFT.CropType.Wheat);
        uint256 excessPayment = wheatPrice.nativePrice + 1 ether;
        uint256 buyerBalanceBefore = buyer.balance;
        
        vm.prank(buyer);
        shop.buySeedWithNative{value: excessPayment}(SeedNFT.CropType.Wheat);
        
        uint256 buyerBalanceAfter = buyer.balance;
        assertEq(buyerBalanceAfter, buyerBalanceBefore - wheatPrice.nativePrice);
    }

    function testGetAvailableSeeds() public {
        SeedNFT.CropType[] memory nativeSeeds = shop.getAvailableSeedsForNative();
        SeedNFT.CropType[] memory kindSeeds = shop.getAvailableSeedsForKind();
        
        assertEq(nativeSeeds.length, 3); // Wheat, Corn, Pumpkin
        assertEq(kindSeeds.length, 3);   // Strawberry, Grape, Watermelon
        
        assertEq(uint256(nativeSeeds[0]), uint256(SeedNFT.CropType.Wheat));
        assertEq(uint256(kindSeeds[0]), uint256(SeedNFT.CropType.Strawberry));
    }

    function testUpdateSeedPrice() public {
        vm.prank(owner);
        shop.updateSeedPrice(
            SeedNFT.CropType.Wheat,
            0.005 ether,
            5 * 10**18,
            true,
            true
        );
        
        Shop.SeedPrice memory newPrice = shop.getSeedPrice(SeedNFT.CropType.Wheat);
        assertEq(newPrice.nativePrice, 0.005 ether);
        assertEq(newPrice.kindPrice, 5 * 10**18);
        assertTrue(newPrice.availableForNative);
        assertTrue(newPrice.availableForKind);
    }

    function test_RevertWhen_InsufficientPayment() public {
        Shop.SeedPrice memory wheatPrice = shop.getSeedPrice(SeedNFT.CropType.Wheat);
        
        vm.prank(buyer);
        vm.expectRevert("Shop: Insufficient payment");
        shop.buySeedWithNative{value: wheatPrice.nativePrice - 1}(SeedNFT.CropType.Wheat);
    }

    function test_RevertWhen_SeedNotAvailableForNative() public {
        vm.prank(buyer);
        vm.expectRevert("Shop: Seed not available for native token");
        shop.buySeedWithNative{value: 1 ether}(SeedNFT.CropType.Strawberry);
    }

    function test_RevertWhen_InsufficientKindBalance() public {
        vm.prank(buyer);
        vm.expectRevert("Shop: Insufficient KIND balance");
        shop.buySeedWithKind(SeedNFT.CropType.Strawberry);
    }

    function test_RevertWhen_SeedNotAvailableForKind() public {
        // Give buyer KIND tokens first
        vm.prank(address(shop));
        kindToken.mint(buyer, 50 * 10**18);
        
        vm.prank(buyer);
        vm.expectRevert("Shop: Seed not available for KIND token");
        shop.buySeedWithKind(SeedNFT.CropType.Wheat);
    }

    function testWithdrawNative() public {
        Shop.SeedPrice memory wheatPrice = shop.getSeedPrice(SeedNFT.CropType.Wheat);
        
        vm.prank(buyer);
        shop.buySeedWithNative{value: wheatPrice.nativePrice}(SeedNFT.CropType.Wheat);
        
        uint256 ownerBalanceBefore = owner.balance;
        uint256 shopBalance = address(shop).balance;
        
        vm.prank(owner);
        shop.withdrawNative();
        
        uint256 ownerBalanceAfter = owner.balance;
        assertEq(ownerBalanceAfter, ownerBalanceBefore + shopBalance);
    }
}