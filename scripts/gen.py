from datetime import datetime
import pandas as pd
from interrail.api import get_stop_location, get_trip

countries = ['France', 'United Kingdom', 'Germany', 'Spain', 'Italy',
             'Netherlands'];

def rail():
    amsterdam = get_stop_location("Hamburg")
    paris = get_stop_location("Paris")

    trip = get_trip(origin=amsterdam, dest=paris,
                    departure_time=datetime.now())
    print(trip)

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
    rail()
