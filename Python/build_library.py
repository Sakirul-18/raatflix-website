import json
from pathlib import Path

from tmdb import search_tv

# Project paths
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "Main" / "data"

SERIES_JSON = DATA_DIR / "series.json"


def load_json(path):
    if not path.exists():
        return []

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


series = load_json(SERIES_JSON)

print(f"Loaded {len(series)} series.\n")

updated = 0

for i, item in enumerate(series, start=1):

    # Skip if TMDB data already exists
    if "tmdb_id" in item:
        continue

    print(f"[{i}/{len(series)}] Fetching: {item['title']}")

    try:
        tmdb = search_tv(item["title"])
    except Exception as e:
        print(f"  Error: {e}")
        continue

    if not tmdb:
        print("  ✗ Not found")
        continue

    # Merge TMDB data into existing entry
    item.update(tmdb)

    # Save immediately after each successful update
    save_json(SERIES_JSON, series)

    updated += 1
    print("  ✓ Added")

save_json(SERIES_JSON, series)

print(f"\nFinished! Updated {updated} series.")