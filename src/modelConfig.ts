export interface ModelConfig {
  vocab_size: number;
  dim: number;
  n_layers: number;
  n_heads: number;
  max_seq_len: number;
  hidden_dim_multiplier: number;
  batch_size: number;
  lr: number;
}

export const calculateParams = (config: ModelConfig) => {
  const { vocab_size, dim, n_layers, hidden_dim_multiplier } = config;
  const hidden_dim = Math.floor(dim * hidden_dim_multiplier);
  
  const embeddings = vocab_size * dim;
  const attention = 4 * (dim * dim) * n_layers;
  const ffn = 3 * (dim * hidden_dim) * n_layers;
  
  return embeddings + attention + ffn;
};

export const calculateMemory = (params: number, config: ModelConfig) => {
  const fp16 = (params * 2) / (1024 * 1024); // MB
  const q4 = (params * 0.6) / (1024 * 1024); // MB (approx 4.5 bits per param + overhead)
  
  // KV Cache calculation: 2 * n_layers * n_heads * (dim/n_heads) * max_seq_len * 2 (for FP16)
  // Simplified: 2 * n_layers * dim * max_seq_len * 2 bytes
  const kv_cache = (2 * config.n_layers * config.dim * config.max_seq_len * 2) / (1024 * 1024);
  
  return { fp16, q4, kv_cache };
};
