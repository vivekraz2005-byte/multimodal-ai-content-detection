"""Extension allow-list plus signature checks; extension alone is not trusted."""
from pathlib import Path
from typing import Tuple, Dict, Any
from app.config import ALLOWED_EXTENSIONS
from app.utils.file_utils import get_mime_and_extension
SIGNATURES={
 'image':[(b'\xff\xd8\xff','JPEG'),(b'\x89PNG\r\n\x1a\n','PNG'),(b'GIF87a','GIF'),(b'GIF89a','GIF'),(b'RIFF','RIFF (must further validate WEBP/WAVE/AVI)')],
 'video':[(b'\x1aE\xdf\xa3','EBML/WebM/Matroska')],
 'audio':[(b'ID3','MP3/ID3'),(b'fLaC','FLAC'),(b'OggS','Ogg'),(b'RIFF','RIFF (must further validate WAVE)')],
 'document':[(b'%PDF','PDF'),(b'PK\x03\x04','ZIP/OOXML')]
}
class MediaClassifier:
 @staticmethod
 def classify(file_path: Path, original_filename: str)->Tuple[str,str,Dict[str,Any]]:
  path=Path(file_path); mime,ext=get_mime_and_extension(original_filename); ext=ext.lower()
  kind=next((cat for cat,exts in ALLOWED_EXTENSIONS.items() if ext in exts),None)
  if not kind: raise ValueError(f'Unsupported file extension: {ext}')
  if not path.is_file() or path.stat().st_size==0: raise ValueError('File is missing or empty')
  with path.open('rb') as f: header=f.read(32)
  found=next((label for sig,label in SIGNATURES.get(kind,[]) if header.startswith(sig)),None)
  # MP4/MOV is an ISO-BMFF ftyp box (usually at bytes 4..8); AVI is RIFF/AVI.
  if kind=='video' and len(header)>=12 and header[4:8]==b'ftyp': found='ISO Base Media (MP4/MOV)'
  if kind=='video' and header.startswith(b'RIFF') and header[8:12]==b'AVI ': found='AVI'
  if kind=='image' and header.startswith(b'RIFF') and header[8:12]==b'WEBP': found='WEBP'
  if kind=='audio' and header.startswith(b'RIFF') and header[8:12]==b'WAVE': found='WAVE'
  if kind=='document' and ext=='.txt':
   try: header.decode('utf-8'); found='UTF-8 text (prefix only)'
   except UnicodeDecodeError: found=None
  if not found: raise ValueError(f'File content signature does not match a supported {kind} format (extension {ext}).')
  return kind,mime,{'magic_match':True,'header_signature':found,'validated_by':'header signature only; full decoder validation occurs later'}
