import whisper
import sys
import json
import io
import os
import subprocess
import tempfile

# Force stdout to UTF-8 for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def transcribe(audio_path):
    model = whisper.load_model("tiny")

     # Convert audio to clean 16-bit WAV
    tmp_wav = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg", "-y", "-i", audio_path, "-ac", "1", "-ar", "16000", tmp_wav], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
   
    audio_path = os.path.abspath(audio_path)
    result = model.transcribe(audio_path)
    # Return only JSON-safe text
    print(json.dumps({"text": result["text"]}, ensure_ascii=False))

if __name__ == "__main__":
    transcribe(sys.argv[1])
