// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Shop.sol";

contract DeployShop is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Use deployed contract addresses
        address seedNFTAddress = 0x;
        address kindTokenAddress = 0x;
        
        Shop shop = new Shop(seedNFTAddress, kindTokenAddress);
        
        console.log("Shop deployed at:", address(shop));
        console.log("Connected SeedNFT:", seedNFTAddress);
        console.log("Connected KindnessToken:", kindTokenAddress);
        console.log("Deployer address:", vm.addr(deployerPrivateKey));

        vm.stopBroadcast();
    }
}