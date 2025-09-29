// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

contract TransferOwnership is Script {
    // Contract addresses
    address constant OLD_FARM_GAME = 0xcdF957025aDD78d152A3fabd5858618815ba52a8;
    address constant NEW_FARM_GAME = 0x9FcacF469bAA38afB754F669e22651362f8F6d51;
    address constant SEED_NFT = 0x5ca157233FB3ec7f7C9Bd956527E60d2481C0bCb;
    address constant KINDNESS_TOKEN = 0xdF56ad5e51a39B0A4dfBDa6a99E283344c921e69;
    address constant LAND_NFT = 0xCB3ea0d57dE11a94d403af0C08deC24713fC9307;
    address constant SHOP = 0xc5b91791B9080e7aDe42a3D0B86FDFaF754E30e7;

    function run() external {
        uint256 deployerPrivateKey = 0x;
        
        console.log("Transferring ownership from OLD to NEW FarmGame...");
        console.log("Old FarmGame:", OLD_FARM_GAME);
        console.log("New FarmGame:", NEW_FARM_GAME);

        vm.startBroadcast(deployerPrivateKey);

        // Since NEW_FARM_GAME owns OLD_FARM_GAME, we can call through it
        // But we need a different approach. Let's call the contracts directly as deployer
        
        // Check who owns what first
        (bool success1, bytes memory result1) = SEED_NFT.call(abi.encodeWithSignature("owner()"));
        if (success1) {
            address seedOwner = abi.decode(result1, (address));
            console.log("SeedNFT owner:", seedOwner);
        }
        
        (bool success2, bytes memory result2) = LAND_NFT.call(abi.encodeWithSignature("owner()"));
        if (success2) {
            address landOwner = abi.decode(result2, (address));
            console.log("LandNFT owner:", landOwner);
        }
        
        (bool success3, bytes memory result3) = KINDNESS_TOKEN.call(abi.encodeWithSignature("owner()"));
        if (success3) {
            address kindOwner = abi.decode(result3, (address));
            console.log("KindnessToken owner:", kindOwner);
        }
        
        (bool success4, bytes memory result4) = SHOP.call(abi.encodeWithSignature("owner()"));
        if (success4) {
            address shopOwner = abi.decode(result4, (address));
            console.log("Shop owner:", shopOwner);
        }

        vm.stopBroadcast();
    }
}