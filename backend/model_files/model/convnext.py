import timm

def build_model():
    model = timm.create_model(
        "convnextv2_base", 
        pretrained=True, # Imagenet1K pretrained
        num_classes=2
    )
    return model

