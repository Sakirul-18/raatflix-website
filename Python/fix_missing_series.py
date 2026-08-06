import json
import re
from pathlib import Path

from tmdb import search_tv


ROOT = Path(__file__).resolve().parent.parent
FILE = ROOT / "Main" / "data" / "series.json"


def save_json(data):
    with open(FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


import json
import re
from pathlib import Path

from tmdb import search_tv


ROOT = Path(__file__).resolve().parent.parent
FILE = ROOT / "Main" / "data" / "series.json"


def save_json(data):
    with open(FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def clean_title(title):
    import re

    # 1. Strip off directory paths (e.g. "/FILE/ & Shows/A Love So Beautiful" -> "A Love So Beautiful")
    if "/" in title:
        title = title.rstrip("/").split("/")[-1]

    # 2. Remove anything inside () or []
    title = re.sub(r"\(.*?\)", "", title)
    title = re.sub(r"\[.*?\]", "", title)

    # 3. Remove common release tags & extra text
    remove_words = [
        "TV Series",
        "TV Mini Series",
        "Mini Series",
        "Multi Audio",
        "Dual Audio",
        "Hindi Dubbed",
        "Hin Dubbed",
        "Hinbdi Dubbed",
        "English Dubbed",
        "Eng Dubbed",
        "ESub",
        "x264",
        "x265",
        "HEVC",
        "WEB-DL",
        "WEBRip",
        "BluRay",
        "1080p",
        "720p",
        "480p",
    ]

    for word in remove_words:
        pattern = re.compile(r"\b" + re.escape(word) + r"\b", re.IGNORECASE)
        title = pattern.sub("", title)

    # 4. Clean up spaces
    title = re.sub(r"\s+", " ", title).strip()

    return title


with open(FILE, "r", encoding="utf-8") as f:
    series = json.load(f)


updated = 0


for item in series:

    # Only fix missing TMDB/poster
    if item.get("poster") and item.get("tmdb_id"):
        continue

    original_title = item["title"]
    search_title = clean_title(original_title)

    print(f"\nFixing: {original_title}")
    print(f"Searching TMDB: {search_title}")

    try:
        data = search_tv(search_title)

        if data:
            item.update(data)
            updated += 1
            print("  ✓ TMDB added")

        else:
            print("  ✗ Not found")

    except Exception as e:
        print("  Error:", e)


save_json(series)

print()
print("Updated:", updated)
print("Finished")