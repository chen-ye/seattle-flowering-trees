import csv
import json
import glob
import os

def process_csv(csv_filepath, geojson_filepath):
    features = []
    with open(csv_filepath, mode='r', encoding='utf-8-sig') as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            try:
                lat = float(row.get('Latitude', 0))
                lng = float(row.get('Longitude', 0))

                # Skip invalid coordinates
                if lat == 0 or lng == 0:
                    continue

                properties = {k: v for k, v in row.items() if k not in ['Latitude', 'Longitude']}

                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    },
                    "properties": properties
                }
                features.append(feature)
            except ValueError:
                continue # Skip rows with invalid numbers for lat/lng

    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(geojson_filepath, mode='w', encoding='utf-8') as geojson_file:
        json.dump(feature_collection, geojson_file, indent=2)
    print(f"Processed {csv_filepath} -> {geojson_filepath} ({len(features)} features)")

def main():
    data_dir = 'data/sammamish'
    csv_files = glob.glob(os.path.join(data_dir, '*.csv'))

    for csv_file in csv_files:
        geojson_file = os.path.splitext(csv_file)[0] + '.geojson'
        process_csv(csv_file, geojson_file)

if __name__ == '__main__':
    main()
