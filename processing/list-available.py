import json
from os import listdir
from os.path import isfile, join
from pathlib import Path

TRIP_FOLDER = "./trip_data"
TRIP_CITY_FILE = "../data/cities.json"


def get_city_set():
    all_cities = []
    available_pairs = {}

    trip_files = [f for f in listdir(TRIP_FOLDER) if isfile(join(TRIP_FOLDER, f))]
    for idx, f in enumerate(trip_files):
        # Update all cities
        from_city, to_city = [x.capitalize() for x in Path(f).stem.split('-')]
        all_cities.append(from_city)
        all_cities.append(to_city)

        # Update available pairs
        to_append = available_pairs.get(from_city, [])
        to_append.append(to_city)
        available_pairs[from_city] = to_append
    return set(all_cities), available_pairs


def save_to_json(city_set, pairs):
    obj = {
        'cities': sorted(list(city_set)),
        'pairs': pairs
    }

    with open(TRIP_CITY_FILE, 'w') as f:
        json.dump(obj, f, indent=4)


if __name__ == "__main__":
    cities, pairs = get_city_set()
    save_to_json(cities, pairs)
