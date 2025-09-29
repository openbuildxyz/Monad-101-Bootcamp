// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FarmGame.sol";

contract DeployFarmGame is Script {
    // Deployed contract addresses on Monad Testnet (Chain ID: 10143)
    address constant SEED_NFT = 0x5ca157233FB3ec7f7C9Bd956527E60d2481C0bCb;
    address constant KINDNESS_TOKEN = 0xdF56ad5e51a39B0A4dfBDa6a99E283344c921e69;
    address constant LAND_NFT = 0xCB3ea0d57dE11a94d403af0C08deC24713fC9307;
    address constant SHOP = 0xc5b91791B9080e7aDe42a3D0B86FDFaF754E30e7;

    function run() external {
        uint256 deployerPrivateKey = 0x;
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying FarmGame contract...");
        console.log("Deployer address:", deployer);
        console.log("Using existing contract addresses:");
        console.log("  SeedNFT:", SEED_NFT);
        console.log("  KindnessToken:", KINDNESS_TOKEN);
        console.log("  LandNFT:", LAND_NFT);
        console.log("  Shop:", SHOP);

        vm.startBroadcast(deployerPrivateKey);

        FarmGame farmGame = new FarmGame(
            SEED_NFT,
            LAND_NFT,
            SHOP,
            KINDNESS_TOKEN
        );

        console.log("FarmGame deployed at:", address(farmGame));
        console.log("Transaction successful!");

        vm.stopBroadcast();

        // Log deployment info for updating deployed-addresses.md
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Monad Testnet (10143)");
        console.log("FarmGame Address:", address(farmGame));
        console.log("Block Number:", block.number);
        console.log("Deployer:", deployer);
    }
}