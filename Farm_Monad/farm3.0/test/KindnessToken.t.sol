// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindnessToken.sol";

contract KindnessTokenTest is Test {
    KindnessToken public kindToken;
    address public owner = address(0x1);
    address public helper = address(0x2);
    address public helped = address(0x3);

    function setUp() public {
        vm.prank(owner);
        kindToken = new KindnessToken();
    }

    function testRewardKindness() public {
        vm.prank(owner);
        kindToken.rewardKindness(helper, helped);
        
        assertEq(kindToken.balanceOf(helper), kindToken.HELP_REWARD());
        assertEq(kindToken.getRemainingDailyHelps(helper), kindToken.DAILY_HELP_LIMIT() - 1);
    }

    function testMultipleRewards() public {
        uint256 rewardCount = 3;
        
        for (uint256 i = 0; i < rewardCount; i++) {
            vm.prank(owner);
            kindToken.rewardKindness(helper, helped);
        }
        
        assertEq(kindToken.balanceOf(helper), kindToken.HELP_REWARD() * rewardCount);
        assertEq(kindToken.getRemainingDailyHelps(helper), kindToken.DAILY_HELP_LIMIT() - rewardCount);
    }

    function testDailyLimitReached() public {
        for (uint256 i = 0; i < kindToken.DAILY_HELP_LIMIT(); i++) {
            vm.prank(owner);
            kindToken.rewardKindness(helper, helped);
        }
        
        assertEq(kindToken.getRemainingDailyHelps(helper), 0);
        
        vm.prank(owner);
        vm.expectRevert("KIND: Daily help limit reached");
        kindToken.rewardKindness(helper, helped);
    }

    function testDailyLimitReset() public {
        for (uint256 i = 0; i < kindToken.DAILY_HELP_LIMIT(); i++) {
            vm.prank(owner);
            kindToken.rewardKindness(helper, helped);
        }
        
        assertEq(kindToken.getRemainingDailyHelps(helper), 0);
        
        vm.warp(block.timestamp + 1 days);
        
        assertEq(kindToken.getRemainingDailyHelps(helper), kindToken.DAILY_HELP_LIMIT());
        
        vm.prank(owner);
        kindToken.rewardKindness(helper, helped);
        
        assertEq(kindToken.getRemainingDailyHelps(helper), kindToken.DAILY_HELP_LIMIT() - 1);
    }

    function testCannotHelpSelf() public {
        vm.prank(owner);
        vm.expectRevert("KIND: Cannot help yourself");
        kindToken.rewardKindness(helper, helper);
    }

    function testOnlyOwnerCanReward() public {
        vm.prank(helper);
        vm.expectRevert();
        kindToken.rewardKindness(helper, helped);
    }

    function testMintAndBurn() public {
        uint256 amount = 1000 * 10**18;
        
        vm.prank(owner);
        kindToken.mint(helper, amount);
        assertEq(kindToken.balanceOf(helper), amount);
        
        vm.prank(owner);
        kindToken.burn(helper, amount / 2);
        assertEq(kindToken.balanceOf(helper), amount / 2);
    }

    function testGetCurrentDay() public {
        uint256 expectedDay = block.timestamp / 1 days;
        assertEq(kindToken.getCurrentDay(), expectedDay);
    }
}