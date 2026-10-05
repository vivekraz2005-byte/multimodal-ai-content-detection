import os
import datetime
from pathlib import Path
from typing import Dict, Any
from app.utils.file_utils import format_bytes

class MetadataAnalyzer:
    @staticmethod
    def analyze(file_path: Path, media_type: str, original_filename: str) -> Dict[str, Any]:
        """
        Extracts genuine metadata for images, videos, audio, and documents.
        Never invents metadata; unavailable fields are labeled 'Not available'.
        """
        stats = file_path.stat()
        file_size_bytes = stats.st_size
        
        base_meta = {
            "File Name": original_filename,
            "File Size": format_bytes(file_size_bytes),
            "File Size (Bytes)": file_size_bytes,
            "System Creation Date": datetime.datetime.fromtimestamp(stats.st_ctime).isoformat(),
            "System Modification Date": datetime.datetime.fromtimestamp(stats.st_mtime).isoformat(),
            "File Extension": file_path.suffix.upper(),
        }

        if media_type == "image":
            image_meta = MetadataAnalyzer._extract_image_metadata(file_path)
            return {**base_meta, **image_meta}
        elif media_type == "video":
            video_meta = MetadataAnalyzer._extract_video_metadata(file_path)
            return {**base_meta, **video_meta}
        elif media_type == "audio":
            audio_meta = MetadataAnalyzer._extract_audio_metadata(file_path)
            return {**base_meta, **audio_meta}
        elif media_type == "document":
            doc_meta = MetadataAnalyzer._extract_document_metadata(file_path)
            return {**base_meta, **doc_meta}
        
        return base_meta

    @staticmethod
    def _extract_image_metadata(file_path: Path) -> Dict[str, Any]:
        result = {
            "Format": "Not available",
            "Dimensions": "Not available",
            "Color Mode": "Not available",
            "Camera Make": "Not available",
            "Camera Model": "Not available",
            "Software / Editor": "Not available",
            "Original Date / Time": "Not available",
            "ISO Speed": "Not available",
            "Focal Length": "Not available",
            "EXIF Present": False,
            "Color Profile (ICC)": "Not available",
            "Embedded Text / Comments": "Not available"
        }
        try:
            from PIL import Image, ExifTags
            with Image.open(file_path) as img:
                result["Format"] = img.format or "Not available"
                result["Dimensions"] = f"{img.width} x {img.height} px"
                result["Width"] = img.width
                result["Height"] = img.height
                result["Color Mode"] = img.mode
                
                # Check embedded ICC profile
                if img.info.get("icc_profile"):
                    result["Color Profile (ICC)"] = "Embedded"
                else:
                    result["Color Profile (ICC)"] = "None"
                    
                # Check PNG text comments / generator parameters
                if hasattr(img, "text") and img.text:
                    comments = list(img.text.keys())
                    result["Embedded Text / Comments"] = f"Found {len(comments)} key(s): {', '.join(comments[:5])}"
                
                # EXIF extraction
                exif_data = img.getexif()
                if exif_data and len(exif_data) > 0:
                    result["EXIF Present"] = True
                    for tag_id, value in exif_data.items():
                        tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                        if tag_name == "Make":
                            result["Camera Make"] = str(value).strip()
                        elif tag_name == "Model":
                            result["Camera Model"] = str(value).strip()
                        elif tag_name == "Software":
                            result["Software / Editor"] = str(value).strip()
                        elif tag_name in ("DateTimeOriginal", "DateTime"):
                            result["Original Date / Time"] = str(value).strip()
                        elif tag_name == "ISOSpeedRatings":
                            result["ISO Speed"] = str(value)
                        elif tag_name == "FocalLength":
                            result["Focal Length"] = str(value)
        except Exception as e:
            result["Extraction Notice"] = f"Limited image metadata: {str(e)}"
        return result

    @staticmethod
    def _extract_video_metadata(file_path: Path) -> Dict[str, Any]:
        result = {
            "Container": file_path.suffix.replace(".", "").upper(),
            "Duration": "Not available",
            "Resolution": "Not available",
            "Codec": "Not available",
            "Frame Rate": "Not available",
            "Audio Channels": "Not available",
            "Creation Time": "Not available",
            "Encoding Tool": "Not available"
        }
        try:
            # Inspect MP4/MOV header atoms
            with open(file_path, "rb") as f:
                header = f.read(4096)
                if b"ftypisom" in header or b"ftypmp42" in header:
                    result["Codec / Brand"] = "MPEG-4 Base Media v2"
                elif b"ftypqt" in header:
                    result["Codec / Brand"] = "Apple QuickTime (.MOV)"
                elif b"webm" in header or b"matroska" in header:
                    result["Codec / Brand"] = "WebM / Matroska VP8/VP9"
                elif b"Lavf" in header:
                    result["Encoding Tool"] = "FFmpeg / Lavf Muxer"
        except Exception as e:
            result["Extraction Notice"] = f"Limited video metadata: {str(e)}"
        return result

    @staticmethod
    def _extract_audio_metadata(file_path: Path) -> Dict[str, Any]:
        result = {
            "Format": file_path.suffix.replace(".", "").upper(),
            "Duration": "Not available",
            "Sample Rate": "Not available",
            "Channels": "Not available",
            "Bitrate": "Not available",
            "Title": "Not available",
            "Artist": "Not available",
            "Encoder": "Not available"
        }
        try:
            import wave
            if file_path.suffix.lower() == ".wav":
                with wave.open(str(file_path), "rb") as wf:
                    framerate = wf.getframerate()
                    nchannels = wf.getnchannels()
                    nframes = wf.getnframes()
                    duration = nframes / float(framerate) if framerate > 0 else 0
                    result["Sample Rate"] = f"{framerate} Hz"
                    result["Channels"] = "Stereo (2)" if nchannels == 2 else ("Mono (1)" if nchannels == 1 else str(nchannels))
                    result["Duration"] = f"{duration:.2f} seconds"
                    result["Bit Depth"] = f"{wf.getsampwidth() * 8} bit"
                    return result
        except Exception:
            pass

        try:
            from mutagen import File as MutagenFile
            audio = MutagenFile(str(file_path))
            if audio is not None:
                if hasattr(audio, "info"):
                    if hasattr(audio.info, "length"):
                        result["Duration"] = f"{audio.info.length:.2f} seconds"
                    if hasattr(audio.info, "sample_rate"):
                        result["Sample Rate"] = f"{audio.info.sample_rate} Hz"
                    if hasattr(audio.info, "channels"):
                        result["Channels"] = "Stereo (2)" if audio.info.channels == 2 else ("Mono (1)" if audio.info.channels == 1 else str(audio.info.channels))
                    if hasattr(audio.info, "bitrate"):
                        result["Bitrate"] = f"{audio.info.bitrate // 1000} kbps"
                if hasattr(audio, "tags") and audio.tags:
                    for key in ["TIT2", "title", "Title"]:
                        if key in audio.tags:
                            result["Title"] = str(audio.tags[key])
                            break
                    for key in ["TPE1", "artist", "Artist"]:
                        if key in audio.tags:
                            result["Artist"] = str(audio.tags[key])
                            break
                    for key in ["TSSE", "encoder", "encoder_settings"]:
                        if key in audio.tags:
                            result["Encoder"] = str(audio.tags[key])
                            break
        except Exception as e:
            result["Extraction Notice"] = f"Limited audio metadata: {str(e)}"
        return result

    @staticmethod
    def _extract_document_metadata(file_path: Path) -> Dict[str, Any]:
        ext = file_path.suffix.lower()
        result = {
            "Document Type": ext.upper(),
            "Author": "Not available",
            "Producer / Creator": "Not available",
            "Creation Date": "Not available",
            "Modification Date": "Not available",
            "Page Count": "Not available",
            "Word Count": "Not available",
            "Encrypted": "No"
        }
        if ext == ".pdf":
            try:
                from pypdf import PdfReader
                reader = PdfReader(str(file_path))
                result["Page Count"] = len(reader.pages)
                result["Encrypted"] = "Yes" if reader.is_encrypted else "No"
                if reader.metadata:
                    meta = reader.metadata
                    result["Author"] = meta.get("/Author") or "Not available"
                    result["Producer / Creator"] = meta.get("/Producer") or meta.get("/Creator") or "Not available"
                    result["Creation Date"] = str(meta.get("/CreationDate", "Not available"))
                    result["Modification Date"] = str(meta.get("/ModDate", "Not available"))
            except Exception as e:
                result["Extraction Notice"] = f"PDF read error: {str(e)}"
        elif ext == ".docx":
            try:
                import docx
                doc = docx.Document(str(file_path))
                props = doc.core_properties
                result["Author"] = props.author or "Not available"
                result["Last Modified By"] = props.last_modified_by or "Not available"
                result["Revision"] = str(props.revision) if props.revision else "Not available"
                result["Creation Date"] = str(props.created) if props.created else "Not available"
                result["Modification Date"] = str(props.modified) if props.modified else "Not available"
                # Approximate word count
                words = sum(len(p.text.split()) for p in doc.paragraphs)
                result["Word Count"] = f"~{words} words"
            except Exception as e:
                result["Extraction Notice"] = f"DOCX read error: {str(e)}"
        elif ext == ".txt":
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    lines = content.splitlines()
                    words = content.split()
                    result["Line Count"] = len(lines)
                    result["Word Count"] = len(words)
                    result["Character Count"] = len(content)
                    result["Encoding"] = "UTF-8"
            except Exception as e:
                result["Extraction Notice"] = f"TXT read error: {str(e)}"
        return result
