import os
import json
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace

def train_tokenizer(corpus_path, output_path):
    # Load config
    config_path = os.path.join(os.path.dirname(__file__), "../../public/model_config.json")
    with open(config_path, "r") as f:
        config = json.load(f)
    
    # Initialize a tokenizer with BPE model
    tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
    tokenizer.pre_tokenizer = Whitespace()

    # Trainer configuration
    trainer = BpeTrainer(
        vocab_size=config["vocab_size"],
        special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"]
    )

    # Train from file
    tokenizer.train(files=[corpus_path], trainer=trainer)

    # Save the tokenizer
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    tokenizer.save(os.path.join(output_path, "tokenizer.json"))
    print(f"Tokenizer saved to {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    corpus_dir = os.path.join(base_dir, "data")
    tokenizer_dir = os.path.join(base_dir, "tokenizer")
    
    if not os.path.exists(corpus_dir):
        os.makedirs(corpus_dir)
        
    corpus_path = os.path.join(corpus_dir, "corpus.txt")
    with open(corpus_path, "w") as f:
        f.write("The quick brown fox jumps over the lazy dog. ")
        f.write("MicroLLM is a small but powerful language model. ")
        f.write("It runs on 4GB of RAM and uses a Llama-style architecture. ")
    
    train_tokenizer(corpus_path, tokenizer_dir)
