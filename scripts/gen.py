import json
import os.path
import pandas as pd
import requests
import traceback

from amadeus import Client, ResponseError
from datetime import datetime
from haversine import haversine
from interrail.api import get_stop_location, get_trip
from slugify import slugify

API_KEY = "6WWYMQ0NYY4GZJJ7E8Y6TTB7WXHY"
HEADER = {'Authorization': f'Bearer {API_KEY}'}
AMADEUS_API_KEY = "ulR4stWMDsljXqwGCSie63FYsjtuxTMR"
AMADEUS_API_SECRET = "qR98Q1c4PChkWRiK"
AMADEUS_FLIGHT_SEARCH_URI = "https://test.api.amadeus.com/v2/shopping/flight-offers"

countries = ['France', 'United Kingdom', 'Germany', 'Spain', 'Italy',
             'Greece', 'Hungary', 'Ireland', 'Portugal', 'Poland', 'Sweden',
             'Netherlands', 'Norway', 'Serbia', 'Czech Republic']

# Travel time is September 23, 2022 at 10 am
TRAVEL_TIME = datetime(2022, 9, 23, 10, 0, 0)
TRAVEL_TIME_STR = '2022-09-23'

amadeus = Client(
    client_id=AMADEUS_API_KEY,
    client_secret=AMADEUS_API_SECRET
)

airports = pd.read_csv('/home/webaba/Dev/virtuous-travel/scripts/airports_short.csv')
all_airports = pd.read_csv('/home/webaba/Dev/virtuous-travel/scripts/airports_full.csv')

def get_distance(iata1, iata2):
    row1 = all_airports[all_airports.airport == iata1].iloc[0]
    row2 = all_airports[all_airports.airport == iata2].iloc[0]
    pos1 = row1.lat, row1.lon
    pos2 = row2.lat, row2.lon

    return haversine(pos1, pos2) # km by default


def get_flight_itin(start_code, end_code):
    print(f"Getting flight itinerary between {start_code} and {end_code}")
    response = amadeus.shopping.flight_offers_search.get(
        originLocationCode=start_code,
        destinationLocationCode=end_code,
        departureDate=TRAVEL_TIME_STR,
        adults=1
    )
    journeys = response.data
    if len(journeys) == 0:
        raise(Exception("No air trip found"))

    n_legs = [{"id": offer["id"], "length":
               len(offer["itineraries"][0]["segments"])} for offer in journeys]


    n_legs_sorted = sorted(n_legs, key=lambda j: j["length"])
    print(n_legs_sorted)
    idx = int(n_legs_sorted[0]["id"]) - 1
    journey = journeys[idx]["itineraries"][0]
    legs = [ {
        "start": { "name": seg["departure"]["iataCode"] },
        "end": { "name": seg["arrival"]["iataCode"] },
        "aircraft": seg["aircraft"]["code"],
        "distance": get_distance(seg["departure"]["iataCode"],
                                 seg["arrival"]["iataCode"])
    } for seg in journey["segments"]]
    trip = {
        "type": "air",
        "legs": legs,
        "total_duration_s": journey["duration"]
    }

    total_distance = sum((l["distance"] for l in legs))
    trip["total_distance_km"] = total_distance

    return trip

def serialize_train_trip(legs, total_time):
    total_dist = sum((haversine((l.origin.lat, l.origin.lon), (l.dest.lat,
                                                                  l.dest.lon))
                      for l in legs))
    return {
        "type": "rail",
        "legs": [ {
            "start": { "name": l.origin.name, "lat": l.origin.lat, "lon": l.origin.lon },
            "end": { "name": l.dest.name, "lat": l.dest.lat, "lon": l.dest.lon },
            "time_s": l.get_duration().total_seconds()
            } for l in legs
        ],
        "total_duration_s": total_time,
        "total_distance_km": total_dist
    }

def gen_data(origin_city, dest_city, origin_airport, dest_airport):
    slug = slugify(f"{origin_city} - {dest_city}")
    filename = f'./trip_data/{slug}.json'
    if (os.path.isfile(filename)):
        print(f"Skipping {slug}")
        return

    # Train Trip generation
    origin_location = get_stop_location(origin_city)
    dest_location = get_stop_location(dest_city)

    train_response = get_trip(origin=origin_location, dest=dest_location,
                    departure_time=datetime.now())
    train_trip = serialize_train_trip(train_response.legs, train_response.get_duration().total_seconds())

    # Plane Trip generation
    plane_trip = get_flight_itin(origin_airport, dest_airport)

    # JSON record generation
    final_dict = {
        "origin": origin_city,
        "destination": dest_city,
        "alternatives": [
            train_trip,
            plane_trip
        ]
    }

    with open(filename, 'w') as f:
        json.dump(final_dict, f, indent=4)

def gen_airports_latlon():
    airports_db = pd.read_csv("./airports_db.csv")[['iata_code', 'coordinates']]
    small_mask = (airports_db.iata_code.isna())
    main_airports = airports_db[~small_mask] 
    main_airports[['lon','lat']] = main_airports['coordinates'].str.split(',', 1, expand=True)
    return main_airports

def enrich_airports():
    df = pd.read_csv('/home/webaba/Dev/virtuous-travel/scripts/airports.csv')
    #df = df[df.country.isin(countries)]
    df_with_latlon = gen_airports_latlon()
    df_enriched = pd.merge(df, df_with_latlon, how='inner', left_on='airport',
                           right_on='iata_code')
    df_final = df_enriched[[
        'city', 'country', 'airport', 'lon', 'lat'
    ]]
    df_final.to_csv("./airports_full.csv")

def gen_pairs():
    df = pd.read_csv('/home/webaba/Dev/virtuous-travel/scripts/airports_short.csv')
    df = df[df.country.isin(countries)]
    joined = df.merge(df, how='cross')[['city_x', 'city_y', 'iata_code_x',
                                        'iata_code_y', 'lat_x', 'lat_y',
                                        'lon_x', 'lon_y']]
    same_rows = (joined.city_x == joined.city_y)
    joined = joined[~same_rows]

    # Split into multiple files of 500 rows
    total_length = len(joined)
    m = 500
    n_chunks = int(total_length / m)
    [ joined.iloc[k*m:(k+1)*m-1].to_csv(f'./pairs_{k}.csv', index=False) for k in
     range(0, n_chunks) ]

    joined.iloc[m*n_chunks:-1].to_csv(f'./pairs_{n_chunks}.csv', index=False)

def endgame(input_file):
    pairs = pd.read_csv(input_file)

    input_list = pairs.to_dict('records')
    for task in input_list:
        try:
            print(f"|||||||| {task['city_x']} <<<< ----- >>>> {task['city_y']} |||||||")
            gen_data(task["city_x"], task["city_y"],
                     task["iata_code_x"], task["iata_code_y"])
        except:
            traceback.print_exc()


if __name__ == "__main__":
    #gen_pairs()
    endgame('./input_data/pairs_0.csv')
