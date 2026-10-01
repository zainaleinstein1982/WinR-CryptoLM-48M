# Decoder-Only Transformer (CryptoLM-48M)

CryptoLM-48M is a 48,156,928-parameter language model trained entirely from scratch for GIBC V2 Track 01.

## Specifications
- **Vocabulary Size**: 32,000 (BPE Tokenizer)
- **Hidden Dimension (\`n_embd\`)**: 768
- **Transformer Layers (\`n_layer\`)**: 12
- **Attention Heads (\`n_head\`)**: 12
- **Context Length**: 2,048 tokens
- **Normalization**: RMSNorm with weight tying between token embeddings and output head.

*Linked pages*: [[solidity-reentrancy]], [[rust-cryptography]]
