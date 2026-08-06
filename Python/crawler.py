import json
import os

from config import DEVELOPMENT, MAX_SERIES, OUTPUT_FILE
from episode_finder import get_episodes, scan_series
from ftp import get_series
from tmdb import search_tv

print("=" * 40)
print("      RaatFlix Crawler")
print("=" * 40)

series_list = get_series()

if DEVELOPMENT and MAX_SERIES:
    series_list = series_list[:MAX_SERIES]
    print(f"\nDevelopment Mode: Scanning {len(series_list)} series")

database = []

for series in series_list:
    print(f"\nScanning series: {series['title']}")

    # 1. Get all season folders (combines seasons across sources)
    seasons = scan_series(series)

    season_data = []

    for season in seasons:
        # 2. Get video episodes only (filters audio & aggregates mirror URLs)
        episodes = get_episodes(season)

        if episodes:
            season_data.append({
                "season": season["season"],
                "episodes": episodes
            })

    if not season_data:
        print("  ⚠️ Skipping series (no valid episodes found)")
        continue

    item = {
        "title": series["title"],
        "folder": series["folder"],
        "url": series["url"],
        "source_urls": series.get("source_urls", [series["url"]]),
        "seasons": season_data
    }

    # 3. Add TMDB metadata
    try:
        tmdb_data = search_tv(series["title"])

        if tmdb_data:
            item.update(tmdb_data)
            print("  ✓ TMDB OK")
        else:
            print("  ✗ TMDB Missed")

    except Exception as e:
        print("  Error (TMDB Failed):", e)

    database.append(item)

# Save to output file (Main/data/series.json)
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(database, f, indent=4, ensure_ascii=False)

print("\nFinished!")
print(f"Saved {len(database)} series to {OUTPUT_FILE}.")