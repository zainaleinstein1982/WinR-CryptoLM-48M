# Solidity Reentrancy Guard & Security

Reentrancy is one of the most critical vulnerabilities in smart contract development. When an external contract call is made before state variables are updated, an attacker can re-enter the calling function recursively.

## Mitigation Strategies
1. **Checks-Effects-Interactions Pattern**: Always update state (effects) before making external calls (interactions).
2. **Reentrancy Guard Modifier**: Use a mutex lock (`bool locked`) to prevent recursive execution:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ReentrancyGuard {
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function safeWithdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

*Linked pages*: [[rust-cryptography]], [[transformer-architecture]]
