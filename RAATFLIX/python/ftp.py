import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote
from requests.exceptions import RequestException

from config import FTP_ROOT, HEADERS

def get_series():
    print("Connecting to FTP...")
    try:
        response = requests.get(FTP_ROOT, headers=HEADERS, timeout=20)
        response.raise_for_status()
    except RequestException as e:
        print(f"Failed to connect to FTP server: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    series = []

    for link in soup.find_all("a"):
        href = link.get("href")
        if not href or href.startswith("?") or href == "../" or not href.endswith("/"):
            continue

        folder_name = unquote(href[:-1]).strip()
        series.append({
            "title": folder_name,
            "folder": folder_name,
            "url": urljoin(FTP_ROOT, href)
        })

    print(f"Found {len(series)} TV series.")
    return series