import torchvision.transforms as transforms
import io, random
from PIL import Image


# imagenet mean and std, (works on coco)
mean = (0.485, 0.456, 0.406) 
std = (0.229, 0.224, 0.225)

def train_transforms():
    return transforms.Compose([
            transforms.RandomResizedCrop((256,256), scale=(0.6, 1.0), ratio=(0.85, 1.15)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomApply([transforms.ColorJitter(0.06, 0.06, 0.06, 0.02)], p=0.3),
            transforms.RandomApply([transforms.Lambda(random_resamples)], p=0.3),
            transforms.RandomApply([transforms.Lambda(random_jpeg_reencodes)], p=0.3),
            transforms.RandomApply([transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 0.5))], p=0.2),
            transforms.RandomGrayscale(p=0.03),
            transforms.ToTensor(),
            transforms.Normalize(mean, std)
            ])

def dda_transforms():
    return transforms.Compose([
            transforms.RandomResizedCrop((256,256), scale=(0.75, 1.0), ratio=(0.9, 1.1)),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize(mean, std),
            ])

def test_transforms():
    return transforms.Compose([
            transforms.Resize(288),
            transforms.CenterCrop(256),
            transforms.ToTensor(),
            transforms.Normalize(mean, std),
            ])

def continual_transforms(): # lighter
    return transforms.Compose([
            transforms.RandomResizedCrop((256,256), scale=(0.85, 1.0), ratio=(0.95, 1.05)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomApply([transforms.ColorJitter(0.03, 0.03, 0.03, 0.01)], p=0.2),
            transforms.RandomApply([transforms.Lambda(random_resamples_continual)], p=0.10),
            transforms.RandomApply([transforms.Lambda(random_jpeg_reencodes_continual)], p=0.10),
            transforms.RandomApply([transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 0.5))], p=0.1),
            transforms.RandomGrayscale(p=0.03),
            transforms.ToTensor(),
            transforms.Normalize(mean, std)
            ])

def random_jpeg_reencodes(img, qmin=80, qmax=95): # recompress with diff quality
    buffer = io.BytesIO()
    quality = random.randint(qmin, qmax)
    img.save(buffer, format="JPEG", quality=quality)

    buffer.seek(0) # reset pointer
    return Image.open(buffer).convert("RGB")

def random_resamples(img, scale_min=0.80, scale_max=0.95): # resample down then back up (blur...) 
    w, h = img.size
    scale = random.uniform(scale_min, scale_max)
    new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))

    small = img.resize((new_w, new_h), resample=Image.BILINEAR) # down
    return small.resize((w, h), resample=Image.BILINEAR) # up

def random_resamples_continual(img):
    return random_resamples(img, 0.90, 0.97)

def random_jpeg_reencodes_continual(img):
    return random_jpeg_reencodes(img, 88, 98)