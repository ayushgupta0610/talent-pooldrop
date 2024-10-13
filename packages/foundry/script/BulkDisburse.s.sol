// scripts/deploy_bulk_disburse.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import {BulkDisburse} from "../src/BulkDisburse.sol";

contract DeployBulkDisburse is Script {
    function run() external {
        // Set the owner address (replace with the actual owner's address)
        address owner = 0x4B7b13C0bbcCa0D6c6863a6E0A0101554271EB17;

        // Start the broadcast to deploy the contract
        vm.startBroadcast();

        // Deploy the BulkDisburse contract
        BulkDisburse bulkDisburse = new BulkDisburse(owner);

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
