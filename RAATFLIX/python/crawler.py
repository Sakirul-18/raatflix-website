import json

from ftp import get_series
from config import OUTPUT_FILE

print("====================================")
print("       RaatFlix Crawler")
print("====================================")

series = get_series()

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(series, f, indent=4, ensure_ascii=False)

print(f"\nSaved {len(series)} series to:")
print(OUTPUT_FILE)