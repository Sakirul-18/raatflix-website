import re

def clean_series_name(name):
    name = re.sub(r"\(.*?\)", "", name)
    name = re.sub(r"\[.*?\]", "", name)

    remove_words = [
        "TV Series",
        "TV Mini Series",
        "Mini Series",
        "Dual Audio",
        "Multi Audio",
        "Hindi Dubbed",
        "Hin Dubbed",
        "English Dubbed",
        "Dubbed",
        "Dubbbed",
        "Anime",
        "1080p",
        "720p",
        "480p",
        "WEB-DL",
        "WEBRip",
        "BluRay",
        "x264",
        "x265",
        "HEVC",
        "Hin+Eng",
        "Eng+Hin",
        "Eng+Kor",
        "Kor+Eng",
    ]

    for word in remove_words:
        name = re.sub(word, "", name, flags=re.IGNORECASE)

    name = re.sub(r"\s+", " ", name).strip()

    return name