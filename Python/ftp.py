import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote

from config import FTP_SOURCES, HEADERS
from parser import clean_series_name


def get_series():
    print("Connecting to all media sources...")
    merged_series = {}

    for source_url in FTP_SOURCES:
        print(f"Scanning source: {source_url}")
        try:
            response = requests.get(source_url, headers=HEADERS, timeout=20)
            response.raise_for_status()
        except Exception as e:
            print(f"⚠️ Failed to connect to {source_url}: {e}")
            continue

        soup = BeautifulSoup(response.text, "html.parser")

        for link in soup.find_all("a"):
            href = link.get("href")

            if not href:
                continue

            # FIXED: Added href.startswith("/") to skip absolute breadcrumbs like /disk6/
            if href.startswith("/") or href == "../" or href.startswith("?") or "h5ai" in href.lower() or not href.endswith("/"):
                continue

            folder_name = unquote(href[:-1]).strip()

            if not folder_name or folder_name.startswith("."):
                continue

            title = clean_series_name(folder_name)
            series_url = urljoin(source_url, href)

            if title not in merged_series:
                merged_series[title] = {
                    "title": title,
                    "folder": folder_name,
                    "url": series_url,
                    "source_urls": [series_url]
                }
            else:
                merged_series[title]["source_urls"].append(series_url)

    series_list = list(merged_series.values())
    print(f"Found {len(series_list)} unique TV series across all sources.")

    return series_list