import requests

from config import TMDB_API_KEY

BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p"


def search_tv(title):
    """
    Search a TV series on TMDB.
    Returns None if nothing is found.
    """

    url = f"{BASE_URL}/search/tv"

    params = {
        "api_key": TMDB_API_KEY,
        "query": title,
        "language": "en-US",
    }

    try:
        response = requests.get(url, params=params, timeout=20)
        response.raise_for_status()

        results = response.json().get("results", [])

        if not results:
            return None

        tv = results[0]

        for result in results:
             if result.get("name", "").lower() == title.lower():
                tv = result
                break

        # Get full TV details
        detail_url = f"{BASE_URL}/tv/{tv['id']}"

        detail = requests.get(
            detail_url,
            params={
                "api_key": TMDB_API_KEY,
                "language": "en-US"
            },
            timeout=20
        ).json()

        return {
            "tmdb_id": detail["id"],
            "title": detail["name"],
            "overview": detail.get("overview", ""),
            "poster": (
    IMAGE_BASE + "/w500" + detail["poster_path"]
    if detail.get("poster_path")
    else "https://via.placeholder.com/500x750?text=No+Poster"
),
            "backdrop": (
    IMAGE_BASE + "/original" + detail["backdrop_path"]
    if detail.get("backdrop_path")
    else "https://via.placeholder.com/1920x1080?text=No+Backdrop"
),
            "rating": detail.get("vote_average", 0),
            "votes": detail.get("vote_count", 0),
            "year": detail.get("first_air_date", "")[:4],
            "genres": [g["name"] for g in detail.get("genres", [])],
            "status": detail.get("status"),
            "language": detail.get("original_language"),
            "number_of_seasons": detail.get("number_of_seasons"),
            "number_of_episodes": detail.get("number_of_episodes"),
        }

    except Exception as e:
        print(f"TMDB Error ({title}): {e}")
        return None