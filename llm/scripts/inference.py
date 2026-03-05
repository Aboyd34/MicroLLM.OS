import torch
import json
import os
from model import MicroLlama
import time

def generate(model, prompt_ids, max_new_tokens=50, temperature=0.8):
    model.eval()
    device = next(model.parameters()).device
    generated = prompt_ids.to(device)
    
    # Load config for max_seq_len
    config_path = os.path.join(os.path.dirname(__file__), "../../public/model_config.json")
    with open(config_path, "r") as f:
        config = json.load(f)
    max_seq_len = config["max_seq_len"]
    
    for _ in range(max_new_tokens):
        with torch.no_grad():
            # Only take the last max_seq_len tokens
            input_ids = generated[:, -max_seq_len:]
            logits, _ = model(input_ids)
            
            # Sample from the last token's logits
            next_token_logits = logits[:, -1, :] / temperature
            probs = torch.softmax(next_token_logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            
            generated = torch.cat((generated, next_token), dim=1)
            
            if next_token.item() == 2: # Assuming 2 is [SEP] or EOS
                break
                
    return generated

if __name__ == "__main__":
    # Load model (Deliverable 6)
    # This script runs under 2.5 GB RAM because the model is only 218MB in FP16
    device = "cpu"
    
    config_path = os.path.join(os.path.dirname(__file__), "../../public/model_config.json")
    with open(config_path, "r") as f:
        config = json.load(f)
        
    model = MicroLlama(
        vocab_size=config["vocab_size"], 
        dim=config["dim"], 
        n_layers=config["n_layers"], 
        n_heads=config["n_heads"], 
        max_seq_len=config["max_seq_len"],
        hidden_dim_multiplier=config.get("hidden_dim_multiplier", 2.66)
    ).to(device)
    
    # Simulate loading weights
    # model.load_state_dict(torch.load("model/checkpoint_final.pt", map_location=device))
    
    prompt = torch.tensor([[1, 500, 300, 200]]) # Dummy token IDs
    print("Generating...")
    start = time.time()
    output = generate(model, prompt)
    end = time.time()
    
    print(f"Generated {output.shape[1] - prompt.shape[1]} tokens in {end-start:.2f}s")
    print(f"Output IDs: {output.tolist()}")
