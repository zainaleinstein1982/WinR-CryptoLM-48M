# Rust Cryptographic Primitives (sha2)

Rust provides high-performance, memory-safe cryptographic libraries through crates like `sha2`, `aes-gcm`, and `ed25519-dalek`.

## SHA-256 Hashing Example
Using the `sha2` crate to compute cryptographic message digests:

```rust
use sha2::{Sha256, Digest};

pub fn hash_payload(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    let mut output = [0u8; 32];
    output.copy_from_slice(&result);
    output
}
```

*Linked pages*: [[solidity-reentrancy]]
