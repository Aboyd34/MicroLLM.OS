# MicroLLM-4GB: Ultra-Constrained LLM Project

This project implements a 109M parameter Llama-style LLM designed to train and run on a 4GB RAM machine.

## Project Structure
```text
/llm/
├── data/
│   └── corpus.txt          # Toy training dataset
├── tokenizer/
│   └── tokenizer.json      # BPE tokenizer (generated)
├── model/
│   ├── checkpoint_final.pt # FP16 weights
│   └── model_q4.gguf       # Quantized weights (GGUF)
└── scripts/
    ├── tokenizer_gen.py    # Tokenizer trainer
    ├── model.py            # Architecture definition
    ├── train.py            # Training script
    ├── inference.py        # Inference script (< 2.5 GB RAM)
    └── quantize.py         # Quantization pipeline
```

## Setup & Commands

### 1. Install Dependencies (Python)
```bash
pip install torch transformers tokenizers numpy sentencepiece
```

### 2. Generate Tokenizer
```bash
python llm/scripts/tokenizer_gen.py
```

### 3. Train Model
```bash
python llm/scripts/train.py
```

### 4. Quantize Model (to GGUF)
*Note: Use llama.cpp for production GGUF quantization.*
```bash
python llm/scripts/quantize.py
```

### 5. Run Inference
```bash
python llm/scripts/inference.py
```

### 6. Build Windows Application (.exe)
```bash
npm run electron:build
```
The installer will be generated in the `release/` directory.

## Memory Math (Self-Audit)
- **Parameters:** 109.4M
- **FP16 Size:** 218.8 MB
- **Q4_K_M Size:** ~65.6 MB
- **KV Cache (512 context):** 18.8 MB
- **Total Inference RAM:** ~234.4 MB (Target: < 2.5 GB)
- **Disk Usage:** < 1 GB (Target: < 58 GB)
