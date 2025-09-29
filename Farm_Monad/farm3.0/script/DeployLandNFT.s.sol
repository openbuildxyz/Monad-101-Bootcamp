// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/LandNFT.sol";

contract DeployLandNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        uint256 totalLands = 100; // Deploy 100 land plots
        LandNFT landNFT = new LandNFT(totalLands);
        
        console.log("LandNFT deployed at:", address(landNFT));
        console.log("Total lands:", landNFT.getTotalLands());
        console.log("Deployer address:", vm.addr(deployerPrivateKey));

        vm.stopBroadcast();
    }
}