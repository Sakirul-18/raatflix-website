import json
import re
import subprocess
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote
from concurrent.futures import ThreadPoolExecutor

from config import HEADERS

# Web-native audio codecs supported by standard browsers
WEB_AUDIO_CODECS = {"aac", "mp3", "opus", "flac", "vorbis"}

VIDEO_EXTENSIONS = (
    ".mp4",
    ".mkv",
    ".avi",
    ".mov",
    ".m4v",
    ".m3u8",
)

MAX_WORKERS = 10


def has_audio_stream(stream_url):
    """
    Uses ffprobe to quickly inspect remote file headers over HTTP/FTP 
    and detect browser-compatible audio streams without downloading the video file.
    """
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-user_agent", "RaatFlix/1.0",
        "-probesize", "500000",
        "-analyzeduration", "500000",
        "-show_streams",
        "-select_streams", "a",
        stream_url
    ]

    try:
        result = subprocess.run(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            encoding="utf-8",      # 👈 Explicitly use UTF-8 instead of Windows CP1252
            errors="ignore",       # 👈 Ignore any corrupt or unrecognized characters
            timeout=6
        )
        data = json.loads(result.stdout)
        streams = data.get("streams", [])

        if not streams:
            return False

        for stream in streams:
            codec = stream.get("codec_name", "").lower()
            if codec in WEB_AUDIO_CODECS:
                return True

        return False

    except Exception:
        return True


def scan_series(series):
    """
    Scan all disk paths for a TV series and combine all season folder URLs across disks.
    """
    print(f"Scanning: {series['title']}")
    urls_to_scan = series.get("source_urls", [series["url"]])
    
    seen_seasons = {}

    for s_url in urls_to_scan:
        try:
            response = requests.get(s_url, headers=HEADERS, timeout=20)
            response.raise_for_status()
        except Exception:
            continue

        soup = BeautifulSoup(response.text, "html.parser")

        for link in soup.find_all("a"):
            href = link.get("href")

            # FIXED: Added href.startswith("/") to filter out absolute root links (e.g. /disk6/)
            if not href or href.startswith("/") or href.startswith("?") or href == "../" or "h5ai" in href.lower() or not href.endswith("/"):
                continue

            season_name = unquote(href[:-1]).strip()

            if not season_name:
                continue

            season_url = urljoin(s_url, href)
            if season_name not in seen_seasons:
                seen_seasons[season_name] = {
                    "season": season_name,
                    "url": season_url,
                    "urls": [season_url]  # Group all disk locations for this season
                }
            else:
                if season_url not in seen_seasons[season_name]["urls"]:
                    seen_seasons[season_name]["urls"].append(season_url)

    seasons = list(seen_seasons.values())
    print(f"Found {len(seasons)} unique seasons")

    return seasons


def _verify_and_parse(item):
    filename, stream_url = item

    if not has_audio_stream(stream_url):
        print(f"❌ Skipped (No/Invalid Web Audio): {filename}")
        return None

    episode_number = None
    match = re.search(r"[Ss]\d+[Ee](\d+)", filename)
    if match:
        episode_number = int(match.group(1))
    else:
        match = re.search(r"\b[Ee]?[Pp]?(\d{1,3})\b", filename)
        if match:
            episode_number = int(match.group(1))

    print(f"✅ Episode accepted: {filename}")
    return {
        "episodeNumber": episode_number,
        "filename": filename,
        "streamUrl": stream_url
    }


def get_episodes(season):
    """
    Scan all disk locations for a season, verify audio codecs, and map cross-disk duplicate episodes into mirrors.
    """
    season_urls = season.get("urls", [season["url"]])
    candidate_files = []

    # Gather episodes from all disk paths for this season
    for s_url in season_urls:
        try:
            response = requests.get(s_url, headers=HEADERS, timeout=20)
            response.raise_for_status()
        except Exception:
            continue

        soup = BeautifulSoup(response.text, "html.parser")

        for link in soup.find_all("a"):
            href = link.get("href")

            # FIXED: Blocked absolute breadcrumbs starting with /
            if not href or href.startswith("/") or href.startswith("?") or href == "../" or "h5ai" in href.lower() or href.endswith("/"):
                continue

            filename = unquote(href)

            if not filename.lower().endswith(VIDEO_EXTENSIONS):
                continue

            stream_url = urljoin(s_url, href)
            candidate_files.append((filename, stream_url))

    episodes_dict = {}

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        results = executor.map(_verify_and_parse, candidate_files)
        for res in results:
            if res is None:
                continue
            
            ep_num = res["episodeNumber"]
            key = ep_num if ep_num is not None else res["filename"]

            if key not in episodes_dict:
                episodes_dict[key] = {
                    "episodeNumber": ep_num,
                    "filename": res["filename"],
                    "streamUrl": res["streamUrl"],
                    "mirrors": []
                }
            else:
                # Avoid adding identical URLs to mirrors
                if res["streamUrl"] != episodes_dict[key]["streamUrl"] and res["streamUrl"] not in episodes_dict[key]["mirrors"]:
                    episodes_dict[key]["mirrors"].append(res["streamUrl"])

    episodes = list(episodes_dict.values())
    episodes.sort(
        key=lambda x: (
            x["episodeNumber"] is None,
            x["episodeNumber"] if x["episodeNumber"] is not None else 9999
        )
    )

    print(f"Found {len(episodes)} valid episodes for {season['season']}")

    return episodes