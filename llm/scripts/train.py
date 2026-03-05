import torch
import json
from model import MicroLlama
import os

# Load Config from JSON
config_path = os.path.join(os.path.dirname(__file__), "../../public/model_config.json")
with open(config_path, "r") as f:
    CONFIG = json.load(f)

def train():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Training on {device}")
    
    model = MicroLlama(**{k: v for k, v in CONFIG.items() if k not in ["batch_size", "lr"]}).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=CONFIG["lr"])
    
    # Dummy training loop (Deliverable 5)
    # In a real scenario, use a DataLoader with the corpus
    for epoch in range(10):
        # Simulated batch: [Batch, SeqLen]
        input_ids = torch.randint(0, CONFIG["vocab_size"], (CONFIG["batch_size"], CONFIG["max_seq_len"])).to(device)
        labels = input_ids.clone()
        
        optimizer.zero_grad()
        logits, loss = model(input_ids, labels)
        loss.backward()
        optimizer.step()
        
        print(f"Epoch {epoch}, Loss: {loss.item():.4f}")
        
        # Save checkpoint
        if epoch % 5 == 0:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_dir = os.path.join(base_dir, "model")
            if not os.path.exists(model_dir): 
                os.makedirs(model_dir)
            torch.save(model.state_dict(), os.path.join(model_dir, f"checkpoint_{epoch}.pt"))

if __name__ == "__main__":
    train()
