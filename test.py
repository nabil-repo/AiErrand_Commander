import requests

url = " https://places-api.foursquare.com/places/search?ll=21.1458004,79.0881546&radius=1000&categories=17069&limit=10&sort=DISTANCE"

headers = {
    "Accept": "application/json",
    "Authorization": "Bearer"+" """,
    "X-Places-Api-Version": "2025-06-17"
}

response = requests.request("GET", url, headers=headers)

print(response.text)
