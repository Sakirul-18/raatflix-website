import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Multi-source FTP/HTTP series roots in order of priority (Highest to Lowest)
FTP_SOURCES = [
    # --- Priority 1: High-Speed CTGFun Disks ---
    "https://movie.ctgfun.com/disk6/TV%20Series%20Part%20Three/",
    "https://movie.ctgfun.com/disk8/TV%20SERIES%20-%20PART%20TWO/",
    "https://movie.ctgfun.com/disk9/TV%20SERIES/",
    "https://movie.ctgfun.com/disk7/ANIME%20-%20PART%20TWO/",
    "https://ftp.ctgfun.com/TV_Series/",
    "https://media.ctgfun.com/disk8/TV%20SERIES%20%5BPART-2%5D/",
    "https://media.ctgfun.com/disk7/TV%20SERIES%20%5BPART-4%5D/",
    "https://media.ctgfun.com/disk5/TV%20SERIES%20%5BPART-3%5D/",


      # --- Priority 2: CircleFTP Disks ---
    "http://ftp16.circleftp.net/FILE/Dubbed%20TV%20Series%20%26%20Shows/",
    "http://ftp8.circleftp.net/FILE/Hindi%20TV%20Series/",
    "http://ftp4.circleftp.net/FILE/English%20%26%20Foreign%20TV%20Series/",
    "http://ftp6.circleftp.net/FILE/English%20%26%20Foreign%20TV%20Series/",
    "http://ftp9.circleftp.net/FILE/English%20%26%20Foreign%20TV%20Series/",
    "http://ftp10.circleftp.net/FILE/File/English%20%26%20Foreign%20TV%20Series/",
    "http://ftp12.circleftp.net/FILE/English%20%26%20Foreign%20TV%20Series/",
    "http://ftp11.circleftp.net/FILE/English%20%26%20Foreign%20TV%20Series/",
    "http://ftp7.circleftp.net/FILE/English%20%26%20Foreign%20TV%20Series/",
    "http://ftp15.circleftp.net/FILE/English%20%26%20Foreign%20Anime%20Series/",
    "http://ftp17.circleftp.net/FILE/English%20%26%20Foreign%20Anime%20Series/",

]

# Output files
DATA_DIR = os.path.join(BASE_DIR, "..", "Main", "data")

SERIES_JSON = os.path.join(DATA_DIR, "series.json")
MOVIES_JSON = os.path.join(DATA_DIR, "movies.json")
ANIME_JSON = os.path.join(DATA_DIR, "anime.json")
ANIMATION_JSON = os.path.join(DATA_DIR, "animation.json")

OUTPUT_FILE = SERIES_JSON

HEADERS = {
    "User-Agent": "RaatFlix/1.0"
}

DEVELOPMENT = False
MAX_SERIES = None

TMDB_API_KEY = "dc6f87972e0d1abcbe229939c76e124a"