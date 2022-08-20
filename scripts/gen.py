import json
import pandas as pd
import requests

from amadeus import Client, ResponseError
from datetime import datetime
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

amadeus = Client(
    client_id=AMADEUS_API_KEY,
    client_secret=AMADEUS_API_SECRET
)

cities = pd.read_csv("./airports.csv")


def city_data(city_name):
    data = cities.loc[cities['city'].str.contains(city_name)]
    data_dict = data.to_dict('records')[0]
    data_dict['query'] = city_name
    return data_dict

def get_flight_itin(start_code, end_code):

    response = amadeus.shopping.flight_offers_search.get(
        originLocationCode=start_code,
        destinationLocationCode=end_code,
        departureDate='2022-09-23',
        adults=1
    )
    journeys = response.data
    n_legs = [{"id": offer["id"], "length":
               len(offer["itineraries"][0]["segments"])} for offer in journeys]

    n_legs_sorted = sorted(n_legs, key=lambda j: j["length"])
    idx = int(n_legs_sorted[0]["id"]) - 1
    journey = journeys[idx]["itineraries"][0]
    legs = [ {
        "start": { "name": seg["departure"]["iataCode"] },
        "end": { "name": seg["arrival"]["iataCode"] },
        "aircraft": seg["aircraft"]["code"]
    } for seg in journey["segments"]]
    trip = {
        "type": "air",
        "legs": legs,
        "total_duration_s": journey["duration"]
    }
    return trip

def serialize_train_trip(legs, total_time):
    return {
        "type": "rail",
        "legs": [ {
            "start": { "name": l.origin.name, "lat": l.origin.lat, "lon": l.origin.lon },
            "end": { "name": l.dest.name, "lat": l.dest.lat, "lon": l.dest.lon },
            "time_s": l.get_duration().total_seconds()
            } for l in legs
        ],
        "total_duration_s": total_time
    }

def gen_data():
    start_city = "Hamburg"
    end_city = "Madrid"

    start_data = city_data(start_city)
    end_data = city_data(end_city)

    start_location = get_stop_location(start_city)
    end_location = get_stop_location(end_city)

    # Train Trip generation
    train_response = get_trip(origin=start_location, dest=end_location,
                    departure_time=datetime.now())
    train_trip = serialize_train_trip(train_response.legs, train_response.get_duration().total_seconds())

    # Plane Trip generation
    plane_trip = get_flight_itin(start_data["airport"], end_data["airport"])

    # JSON record generation
    slug = slugify(f"{start_city} - {end_city}")
    final_dict = {
        "origin": start_city,
        "destination": end_city,
        "alternatives": [
            train_trip,
            plane_trip
        ]
    }

    with open(f'./trip_data/{slug}.json', 'w') as f:
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
    print(df_enriched.head(20))
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
    airports = pd.read_csv('/home/webaba/Dev/virtuous-travel/scripts/airports_short.csv')
    pairs = pd.read_csv(input_file)

    input_list = pairs.to_dict('records')
    for task in input_list:
        print(task)

if __name__ == "__main__":
    #run()
    #rail_test()
    #trip = get_flight_itin("TLS", "HAM")
    #gen_data()
    #enrich_airports()
    #run()
    endgame('./input_data/pairs_0.csv')
