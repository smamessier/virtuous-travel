import json
import pandas as pd
import requests

from datetime import datetime
from interrail.api import get_stop_location, get_trip
from slugify import slugify

API_KEY = "6WWYMQ0NYY4GZJJ7E8Y6TTB7WXHY"
HEADER = {'Authorization': f'Bearer {API_KEY}'}
AMADEUS_API_KEY = "ulR4stWMDsljXqwGCSie63FYsjtuxTMR"
AMADEUS_API_SECRET = "qR98Q1c4PChkWRiK"
AMADEUS_FLIGHT_SEARCH_URI = "https://test.api.amadeus.com/v2/shopping/flight-offers"

countries = ['France', 'United Kingdom', 'Germany', 'Spain', 'Italy',
             'Netherlands']


def get_flight_itin(start_code, end_code):
    payload = {
        "currencyCode": "USD",
        "originDestinations": [{
            "id": "1",
            "originLocationCode": start_code,
            "destinationLocationCode": end_code,
            "departureDateTimeRange": {
                "date": "2022-09-23",
                "time": "10:00:00"
            }
        }],
        "travelers": [{
            "id": "1",
            "travelerType": "ADULT"
        }],
        "searchCriteria": {
            "maxFlightOffers": 2,
            "flightFilters": {
                "cabinRestrictions": [
                    {
                        "cabin": "ECONOMY",
                        "coverage": "MOST_SEGMENTS",
                        "originDestinationIds": ["1"]
                    }
                ]
            }
        }
    }

    response = requests.post(AMADEUS_FLIGHT_SEARCH_URI, payload)
    print(response)

def gen_trip(start_city, end_city, legs, total_time):
    return {
        "start_city": start_city,
        "end_city": end_city,
        "legs": [ {
            "start": { "name": l.origin.name, "lat": l.origin.lat, "lon": l.origin.lon },
            "end": { "name": l.dest.name, "lat": l.dest.lat, "lon": l.dest.lon },
            "time_s": l.get_duration().total_seconds()
            } for l in legs
        ],
        "total_duration_s": total_time
    }

def gen_data():
    start = "Hamburg"
    end = "Paris Orly"

    start_location = get_stop_location(start)
    end_location = get_stop_location(end)

    trip = get_trip(origin=start_location, dest=end_location,
                    departure_time=datetime.now())

    slug = slugify(f"{start} - {end}")
    with open(f'./trip_data/{slug}.json', 'w') as f:
        json.dump(gen_trip(start, end, trip.legs,
                              trip.get_duration().total_seconds()),
                  f, indent=4)

def run():
    df = pd.read_csv('/home/webaba/Dev/virtuous-travel/scripts/airports.csv')
    df = df[df.country.isin(countries)]
    joined = df.merge(df, how='cross')[['city_x', 'city_y']]
    same_rows = (joined.city_x == joined.city_y)
    joined = joined[~same_rows]
    print(joined.head(10))
    joined.to_csv('/tmp/test/emissions.csv', index=False)

if __name__ == "__main__":
    #run()
    #rail_test()
    get_flight_itin("CDG", "HAM")
