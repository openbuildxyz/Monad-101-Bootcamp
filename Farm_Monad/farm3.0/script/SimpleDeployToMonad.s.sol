// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SeedNFT.sol";
import "../src/LandNFT.sol";
import "../src/KindnessToken.sol";
import "../src/Shop.sol";
import "../src/FarmGame.sol";

contract SimpleDeployToMonad is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        console.log("=== DEPLOYING TO MONAD TESTNET ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        // Deploy contracts step by step
        console.log("1. Deploying KindnessToken...");
        KindnessToken kindToken = new KindnessToken();
        console.log("   KindnessToken deployed at:", address(kindToken));

        console.log("2. Deploying SeedNFT...");
        SeedNFT seedNFT = new SeedNFT();
        console.log("   SeedNFT deployed at:", address(seedNFT));

        console.log("3. Deploying LandNFT...");
        LandNFT landNFT = new LandNFT(100);
        console.log("   LandNFT deployed at:", address(landNFT));

        console.log("4. Deploying Shop...");
        Shop shop = new Shop(address(seedNFT), address(kindToken));
        console.log("   Shop deployed at:", address(shop));

        console.log("5. Deploying FarmGame...");
        FarmGame farmGame = new FarmGame(
            address(seedNFT),
            address(landNFT),
            address(shop),
            address(kindToken)
        );
        console.log("   FarmGame deployed at:", address(farmGame));

        console.log("6. Transferring ownership...");
        seedNFT.transferOwnership(address(farmGame));
        landNFT.transferOwnership(address(farmGame));
        kindToken.transferOwnership(address(farmGame));

        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("All contracts deployed successfully!");

        vm.stopBroadcast();
    }
}