import sys
from pathlib import Path
from rembg import remove
from PIL import Image

input_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])

print(f"Processing {input_path}...")
img = Image.open(input_path)
output = remove(img)
output.save(output_path)
print(f"Saved to {output_path}")
