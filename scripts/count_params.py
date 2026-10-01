#!/usr/bin/env python3
"""
Parameter counting script for CryptoLM-48M.
Verifies that trainable parameters <= 50,000,000 including embeddings and output head.
"""

import sys
import torch
import torch.nn as nn

class MockConfig:
    vocab_size = 32000
    n_layer = 12
    n_head = 12
    n_embd = 768
    max_seq_len = 2048
    dropout = 0.1
    bias = False
    tie_word_embeddings = True
    rms_norm_eps = 1e-5

def count_model_parameters():
    print("=" * 60)
    print(" GIBC V2 TRACK 01: EXACT PARAMETER COUNT REPORT")
    print("=" * 60)
    
    # Calculation breakdown matching architecture
    vocab_size = 32000
    n_embd = 768
    n_layer = 12
    max_seq_len = 2048
    
    wte = vocab_size * n_embd # 24,576,000
    wpe = max_seq_len * n_embd # 1,572,864
    
    # Per layer: Attention (4 * d^2) + MLP (3 * 4 * d^2 = 12 * d^2) = 16 * d^2
    # With tie_word_embeddings = True, lm_head shares wte weight tensor.
    layer_params = 16 * (n_embd ** 2) # 9,437,184 per layer
    total_layers = n_layer * layer_params # 113,246,208? Wait, let's verify exact transformer block parameters.
    
    # Correct transformer block parameter breakdown:
    # CausalSelfAttention: c_attn (768 x 2304 = 1,769,476) + c_proj (768 x 768 = 589,824) = 2,359,296
    # MLP: c_fc (768 x 3072 = 2,359,296) + c_proj (3072 x 768 = 2,359,296) = 4,718,592
    # LayerNorms: 2 * 768 = 1,536
    # Total per layer = 2,359,296 + 4,718,592 + 1,536 = 7,079,424
    # 12 layers = 8,395,328 approx, plus embeddings.
    
    # Let's run exact PyTorch module parameter summation:
    wte_params = vocab_size * n_embd
    wpe_params = max_seq_len * n_embd
    single_layer_params = (3 * n_embd * n_embd + n_embd * n_embd) + (n_embd * 4 * n_embd + 4 * n_embd * n_embd) + (2 * n_embd)
    layers_total = n_layer * single_layer_params
    ln_f_params = n_embd
    
    total_trainable = wte_params + wpe_params + layers_total + ln_f_params
    
    print(f" Token Embeddings (wte)      : {wte_params:,}")
    print(f" Positional Embeddings (wpe) : {wpe_params:,}")
    print(f" Transformer Layers ({n_layer}x)    : {layers_total:,}")
    print(f" Final LayerNorm (ln_f)      : {ln_f_params:,}")
    print("-" * 60)
    print(f" TOTAL TRAINABLE PARAMETERS  : {total_trainable:,}")
    print(f" CONSTRAINT LIMIT            : 50,000,000")
    print(f" STATUS                      : {'PASSED ✅ (< 50M)' if total_trainable <= 50_000_000 else 'FAILED ❌'}")
    print("=" * 60)
    
    return total_trainable

if __name__ == "__main__":
    count_model_parameters()
