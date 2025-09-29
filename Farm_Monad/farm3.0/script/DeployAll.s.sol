// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SeedNFT.sol";
import "../src/KindnessToken.sol";
import "../src/LandNFT.sol";
import "../src/Shop.sol";
import "../src/FarmGame.sol";

contract DeployAll is Script {
    // Deployer private key (first address)
    uint256 constant DEPLOYER_PRIVATE_KEY = 0x;

    function run() external {
        address deployer = vm.addr(DEPLOYER_PRIVATE_KEY);

        console.log("=== Farm Game Complete Deployment ===");
        console.log("Network: Monad Testnet (10143)");
        console.log("Deployer address:", deployer);
        console.log("Starting deployment...\n");

        vm.startBroadcast(DEPLOYER_PRIVATE_KEY);

        // 1. Deploy SeedNFT
        console.log("1. Deploying SeedNFT...");
        SeedNFT seedNFT = new SeedNFT();
        console.log("   SeedNFT deployed at:", address(seedNFT));

        // 2. Deploy KindnessToken
        console.log("2. Deploying KindnessToken...");
        KindnessToken kindToken = new KindnessToken();
        console.log("   KindnessToken deployed at:", address(kindToken));

        // 3. Deploy LandNFT with 100 lands
        console.log("3. Deploying LandNFT...");
        uint256 totalLands = 100;
        LandNFT landNFT = new LandNFT(totalLands);
        console.log("   LandNFT deployed at:", address(landNFT));
        console.log("   Total lands:", totalLands);

        // 4. Deploy Shop
        console.log("4. Deploying Shop...");
        Shop shop = new Shop(address(seedNFT), address(kindToken));
        console.log("   Shop deployed at:", address(shop));

        // 5. Deploy FarmGame
        console.log("5. Deploying FarmGame...");
        FarmGame farmGame = new FarmGame(
            address(seedNFT),
            address(landNFT),
            address(shop),
            address(kindToken)
        );
        console.log("   FarmGame deployed at:", address(farmGame));

        // 6. Set up permissions and ownership
        console.log("6. Setting up permissions...");

        // Transfer ownership of all contracts to FarmGame
        seedNFT.transferOwnership(address(farmGame));
        console.log("   SeedNFT ownership transferred to FarmGame");

        kindToken.transferOwnership(address(farmGame));
        console.log("   KindnessToken ownership transferred to FarmGame");

        landNFT.transferOwnership(address(farmGame));
        console.log("   LandNFT ownership transferred to FarmGame");

        shop.transferOwnership(address(farmGame));
        console.log("   Shop ownership transferred to FarmGame");

        vm.stopBroadcast();

        // 7. Display final summary
        console.log("\n=== Deployment Complete ===");
        console.log("All contracts deployed and configured successfully!");
        console.log("\nContract Addresses:");
        console.log("SeedNFT:       ", address(seedNFT));
        console.log("KindnessToken: ", address(kindToken));
        console.log("LandNFT:       ", address(landNFT));
        console.log("Shop:          ", address(shop));
        console.log("FarmGame:      ", address(farmGame));
        console.log("\nDeployer:      ", deployer);
        console.log("Block Number:  ", block.number);

        // 8. Verification info
        console.log("\n=== Post-Deployment Info ===");
        console.log("Network: Monad Testnet");
        console.log("Chain ID: 10143");
        console.log("RPC: https://testnet-rpc.monad.xyz");
        console.log("\nReady for testing!");
    }
}