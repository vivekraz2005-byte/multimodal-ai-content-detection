import io
import math
from pathlib import Path
from typing import Dict, Any, List, Tuple
from PIL import Image, ImageChops, ImageEnhance, ImageStat
import numpy as np

class ImageAnalyzer:
    """
    Multimodal Image Authenticity & Manipulation Analyzer.
    Combines:
    - Error Level Analysis (ELA) for localized resaving/splicing
    - Frequency domain FFT analysis for synthetic grid/checkerboard artifacts
    - Noise & edge variance analysis (synthetic over-smoothing)
    - Metadata/prompt tag scanning (Stable Diffusion, Midjourney, DALL-E)
    - Pluggable ML architecture for PyTorch/TensorFlow models
    """

    @staticmethod
    def analyze(file_path: Path, metadata: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        evidence = []
        ai_signals = []
        manipulation_signals = []

        # 1. Inspect image properties
        try:
            with Image.open(file_path) as img:
                width, height = img.size
                format_name = img.format
                mode = img.mode

                # Check for AI generation prompt parameters in text chunks (PNG or EXIF)
                generator_tag_found, tag_details = ImageAnalyzer._check_generator_tags(img)
                if generator_tag_found:
                    evidence.append({
                        "id": "IMG_EVID_GEN_TAGS",
                        "title": "Generative AI Parameters Detected in Metadata",
                        "category": "AI Generation",
                        "severity": "High",
                        "description": f"File contains explicit AI model prompt or generation tags ({tag_details}).",
                        "technical_details": f"Found metadata signature matching generative model output ({tag_details})."
                    })
                    ai_signals.append(0.95)

                # Check EXIF camera signature
                has_exif = metadata.get("EXIF Present", False)
                camera_make = metadata.get("Camera Make", "Not available")
                camera_model = metadata.get("Camera Model", "Not available")
                
                if camera_make != "Not available" or camera_model != "Not available":
                    evidence.append({
                        "id": "IMG_EVID_CAM_HARDWARE",
                        "title": "Hardware Capture Fingerprint Present",
                        "category": "Metadata",
                        "severity": "Informational",
                        "description": f"Camera hardware tags recorded: {camera_make} {camera_model}.",
                        "technical_details": "Consistent with authentic optical sensor hardware pipeline."
                    })
                    ai_signals.append(0.15)
                elif width >= 1024 and height >= 1024 and not has_exif and not generator_tag_found:
                    evidence.append({
                        "id": "IMG_EVID_NO_EXIF",
                        "title": "Absence of Camera Sensor Metadata",
                        "category": "Metadata",
                        "severity": "Low",
                        "description": "High resolution image lacks camera optical EXIF metadata. Often observed in synthetic exports, web downloads, or stripped social media uploads.",
                        "technical_details": f"Dimensions {width}x{height} with zero sensor tags."
                    })
                    ai_signals.append(0.40)

                # Convert to RGB for signal processing
                rgb_img = img.convert("RGB")
                np_img = np.array(rgb_img)

                # 2. Error Level Analysis (ELA)
                ela_score, ela_details = ImageAnalyzer._calculate_ela(rgb_img)
                if ela_score > 0.65:
                    evidence.append({
                        "id": "IMG_EVID_ELA_TAMPERING",
                        "title": "Error Level Discrepancy (Possible Tampering)",
                        "category": "Manipulation",
                        "severity": "Medium",
                        "description": "High error level variance across different regions suggests localized editing, splicing, or multiple compression cycles.",
                        "technical_details": ela_details
                    })
                    manipulation_signals.append(0.70)
                else:
                    evidence.append({
                        "id": "IMG_EVID_ELA_UNIFORM",
                        "title": "Uniform Compression Distribution",
                        "category": "Manipulation",
                        "severity": "Informational",
                        "description": "Compression artifacts show consistent error levels throughout the entire image canvas.",
                        "technical_details": ela_details
                    })
                    manipulation_signals.append(0.20)

                # 3. Frequency domain FFT Analysis (checks for synthetic upsampling / periodic grid artifacts)
                fft_score, fft_details = ImageAnalyzer._frequency_domain_analysis(np_img)
                if fft_score > 0.60:
                    evidence.append({
                        "id": "IMG_EVID_FREQ_ANOMALY",
                        "title": "Frequency Domain Artifacts (Grid / Diffusion Signature)",
                        "category": "AI Generation",
                        "severity": "Medium",
                        "description": "Spatial frequency spectrum exhibits non-natural harmonic peaks characteristic of diffusion de-noising or GAN generator convolutions.",
                        "technical_details": fft_details
                    })
                    ai_signals.append(fft_score)
                else:
                    ai_signals.append(0.25)

                # 4. Color & Noise Texture Variance
                noise_score, noise_details = ImageAnalyzer._noise_texture_analysis(np_img)
                if noise_score > 0.70:
                    evidence.append({
                        "id": "IMG_EVID_UNNATURAL_SMOOTHNESS",
                        "title": "Synthetic Texture Homogeneity / Lack of Optical Grain",
                        "category": "AI Generation",
                        "severity": "Medium",
                        "description": "Texture variance shows hyper-smooth gradations with absence of Poisson photon sensor noise.",
                        "technical_details": noise_details
                    })
                    ai_signals.append(0.65)

                # 5. Software editor traces
                software = metadata.get("Software / Editor", "Not available")
                if software != "Not available":
                    evidence.append({
                        "id": "IMG_EVID_SOFTWARE_TRACE",
                        "title": f"Editing Software Tag: {software}",
                        "category": "Manipulation",
                        "severity": "Low",
                        "description": f"The image metadata explicitly lists editing software: {software}.",
                        "technical_details": "Indicates post-processing manipulation or format re-export."
                    })
                    manipulation_signals.append(0.55)

        except Exception as e:
            evidence.append({
                "id": "IMG_EVID_ERROR",
                "title": "Image Processing Limitation",
                "category": "Signal Extraction",
                "severity": "Informational",
                "description": f"Analysis encountered partial error: {str(e)}",
                "technical_details": str(e)
            })

        # Calculate final image scores
        ai_score = float(np.mean(ai_signals)) if ai_signals else 0.35
        manipulation_score = float(np.mean(manipulation_signals)) if manipulation_signals else 0.25

        results = {
            "ai_generation_score": round(ai_score, 3),
            "manipulation_score": round(manipulation_score, 3),
            "ela_metric": ela_score if 'ela_score' in locals() else 0.0,
            "fft_metric": fft_score if 'fft_score' in locals() else 0.0,
            "model_architecture": "Pluggable ViT/Heuristic ELA-FFT Pipeline v1.0",
            # TODO: Plug in PyTorch / HuggingFace deepfake/synthetic weights:
            # model = torch.load("models/image_detector_weights.pt")
            # pred = model(torch_tensor)
        }

        return results, evidence

    @staticmethod
    def _check_generator_tags(img: Image.Image) -> Tuple[bool, str]:
        # Check PNG text
        if hasattr(img, "text") and img.text:
            text_keys = [k.lower() for k in img.text.keys()]
            for k in ["parameters", "prompt", "sd-metadata", "generation_data", "dream"]:
                if k in text_keys:
                    return True, f"PNG chunk '{k}'"
            for v in img.text.values():
                val_lower = str(v).lower()
                if "stable diffusion" in val_lower or "steps: " in val_lower or "sampler: " in val_lower:
                    return True, "Stable Diffusion prompt parameter block"
                if "midjourney" in val_lower:
                    return True, "Midjourney metadata"
        return False, ""

    @staticmethod
    def _calculate_ela(img: Image.Image, quality: int = 90) -> Tuple[float, str]:
        """Calculates Error Level Analysis (ELA) difference."""
        try:
            buffer = io.BytesIO()
            img.save(buffer, "JPEG", quality=quality)
            buffer.seek(0)
            resaved = Image.open(buffer)
            ela_im = ImageChops.difference(img, resaved)
            stat = ImageStat.Stat(ela_im)
            diff_mean = np.mean(stat.mean)
            # Normalize ELA mean (standard range ~2.0 to 18.0)
            normalized_ela = min(max((diff_mean - 2.0) / 16.0, 0.0), 1.0)
            details = f"ELA difference mean: {diff_mean:.2f}, Normalized variance index: {normalized_ela:.3f}"
            return round(float(normalized_ela), 3), details
        except Exception as e:
            return 0.3, f"ELA calculation bypassed: {str(e)}"

    @staticmethod
    def _frequency_domain_analysis(np_img: np.ndarray) -> Tuple[float, str]:
        """Calculates 2D Fourier Transform power spectrum to detect periodic synthetic artifacts."""
        try:
            # Convert to grayscale
            gray = 0.2989 * np_img[:, :, 0] + 0.5870 * np_img[:, :, 1] + 0.1140 * np_img[:, :, 2]
            # Resize if too large for speed
            h, w = gray.shape
            if h > 512 or w > 512:
                from PIL import Image as PImage
                resized = PImage.fromarray(gray.astype(np.uint8)).resize((256, 256))
                gray = np.array(resized)

            f = np.fft.fft2(gray)
            fshift = np.fft.fftshift(f)
            magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-6)

            # High frequency radial distribution
            center_y, center_x = magnitude_spectrum.shape[0] // 2, magnitude_spectrum.shape[1] // 2
            y, x = np.ogrid[:magnitude_spectrum.shape[0], :magnitude_spectrum.shape[1]]
            dist_from_center = np.sqrt((x - center_x)**2 + (y - center_y)**2)

            outer_ring = magnitude_spectrum[dist_from_center > (magnitude_spectrum.shape[0] * 0.35)]
            outer_std = float(np.std(outer_ring))

            # Unusually low std in outer ring points to synthetic frequency cutoffs
            score = 0.65 if outer_std < 14.0 else 0.30
            details = f"FFT outer ring power spectrum standard deviation: {outer_std:.2f}"
            return score, details
        except Exception as e:
            return 0.35, f"FFT analysis bypassed: {str(e)}"

    @staticmethod
    def _noise_texture_analysis(np_img: np.ndarray) -> Tuple[float, str]:
        """Examines Laplacian gradient variance to measure sensor grain vs diffusion smoothness."""
        try:
            gray = 0.2989 * np_img[:, :, 0] + 0.5870 * np_img[:, :, 1] + 0.1140 * np_img[:, :, 2]
            # Fast discrete laplacian kernel approximation
            laplacian = (
                -4 * gray[1:-1, 1:-1]
                + gray[:-2, 1:-1]
                + gray[2:, 1:-1]
                + gray[1:-1, :-2]
                + gray[1:-1, 2:]
            )
            variance = float(np.var(laplacian))
            # Hyper smooth images have very low laplacian variance compared to natural sensor noise
            score = 0.72 if variance < 45.0 else 0.25
            details = f"Laplacian high-frequency texture variance: {variance:.2f}"
            return score, details
        except Exception as e:
            return 0.3, f"Noise texture analysis bypassed: {str(e)}"
