import sys
import os
import json
from faster_whisper import WhisperModel

def transcribe(file_path, model_size="small"):
    try:
        # Run on CPU by default to avoid CUDA complexities unless requested
        # 'int8' quantization is faster on CPU
        model = WhisperModel(model_size, device="cpu", compute_type="int8")

        segments, info = model.transcribe(
            file_path, 
            beam_size=5, 
            language="es", 
            condition_on_previous_text=False
        )

        full_text = ""
        for segment in segments:
            full_text += segment.text + " "

        result = {
            "success": True,
            "transcript": full_text.strip(),
            "language": info.language,
            "duration": info.duration
        }
        print(json.dumps(result))

    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)
    
    audio_file = sys.argv[1]
    if not os.path.exists(audio_file):
        print(json.dumps({"success": False, "error": f"File not found: {audio_file}"}))
        sys.exit(1)
        
    transcribe(audio_file)
