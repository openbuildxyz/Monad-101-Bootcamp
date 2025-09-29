// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SeedNFT.sol";

contract DeploySeedNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        SeedNFT seedNFT = new SeedNFT();
        
        console.log("SeedNFT deployed at:", address(seedNFT));
        console.log("Deployer address:", vm.addr(deployerPrivateKey));

        vm.stopBroadcast();
    }
}