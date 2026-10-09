
import torch
import timm
from PIL import Image
from torchvision import transforms

checkpoint_path = "model_files/checkpoints/checkpoint_phase2.pth"

checkpoint = torch.load(
    checkpoint_path,
    map_location="cpu",
    weights_only=True
)

model = timm.create_model(
    "convnextv2_base",
    pretrained=False,
    num_classes=2
)
model.load_state_dict(checkpoint["model"])
model.eval()

transform = transforms.Compose([
    transforms.Resize(288),
    transforms.CenterCrop(256),
    transforms.ToTensor(),
    transforms.Normalize(
        (0.485, 0.456, 0.406),
        (0.229, 0.224, 0.225)
    ),
])

for path in [
    "model_files/test_real.jpg",
    "model_files/test_ai.png",
]:
    image = Image.open(path).convert("RGB")
    tensor = transform(image).unsqueeze(0)

    with torch.inference_mode():
        probabilities = torch.softmax(model(tensor), dim=1)[0]

    print(f"\nImage: {path}")
    print(f"Real: {probabilities[0].item() * 100:.2f}%")
    print(f"Fake: {probabilities[1].item() * 100:.2f}%")
