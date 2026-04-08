import requests
import json
import os
import time
from shapely.geometry import Polygon, MultiPolygon, box
from shapely.ops import unary_union
from shapely import from_geojson

CITIES = [
    "Seattle",
    "Bellevue",
    "Redmond",
    "Kirkland",
    "Shoreline",
    "Renton",
    "Sammamish"
]

def get_city_boundary(city_name):
    print(f"Fetching {city_name} via Overpass...")

    # Using Overpass API since Nominatim blocks our User-Agent
    query = f"""
    [out:json];
    area["name"="Washington"]["admin_level"="4"]->.state;
    relation["name"="{city_name}"]["boundary"="administrative"]["admin_level"="8"](area.state);
    out geom;
    """

    # The Overpass 'out geom' returns ways with coordinates, we need to assemble them into a polygon
    # An easier way is to use the Overpass query to output a specific format, but Overpass doesn't output GeoJSON directly.
    # We can use the overpass-api w/ out geom and let a package like `osmnx` or we can write a simple way assembler.
    # Actually, a simpler approach is to use the OpenStreetMap API directly with the relation ID if we knew it.
    pass

# We will use another public Nominatim instance or just a custom user agent with a real email
def get_city_boundary_nom(city_name):
    print(f"Fetching {city_name} via alternate Nominatim...")
    time.sleep(1.5)

    nom_url = f"https://nominatim.openstreetmap.org/search?city={city_name}&state=Washington&country=USA&format=geojson&polygon_geojson=1"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    nom_response = requests.get(nom_url, headers=headers)

    if nom_response.status_code != 200:
        print(f"Error fetching {city_name}: {nom_response.status_code} {nom_response.text}")
        return None

    try:
        nom_data = nom_response.json()
    except Exception as e:
        print(f"Error parsing JSON for {city_name}: {e}")
        return None

    for feature in nom_data.get('features', []):
        if feature['properties']['osm_type'] == 'relation':
            return feature['geometry']

    for feature in nom_data.get('features', []):
        if feature['geometry']['type'] in ['Polygon', 'MultiPolygon']:
            return feature['geometry']

    print(f"Warning: No valid boundary geometry found for {city_name}.")
    return None

def main():
    city_geoms = []
    for city in CITIES:
        geom = get_city_boundary_nom(city)
        if geom:
            try:
                shape = from_geojson(json.dumps(geom))
                if not shape.is_valid:
                    shape = shape.buffer(0)
                city_geoms.append(shape)
            except Exception as e:
                print(f"Error parsing geometry for {city}: {e}")

    if not city_geoms:
        print("No geometries fetched. Exiting.")
        return

    # Combine all city geometries
    combined_cities = unary_union(city_geoms)

    # Create a large bounding box to act as the "world" or "region"
    world_box = box(-180.0, -90.0, 180.0, 90.0)

    # Subtract cities from the world box
    mask = world_box.difference(combined_cities)

    # Convert mask to GeoJSON
    def geom_to_geojson(geom):
        if isinstance(geom, Polygon):
            return {
                "type": "Polygon",
                "coordinates": [list(geom.exterior.coords)] + [list(ring.coords) for ring in geom.interiors]
            }
        elif isinstance(geom, MultiPolygon):
            return {
                "type": "MultiPolygon",
                "coordinates": [
                    [list(poly.exterior.coords)] + [list(ring.coords) for ring in poly.interiors]
                    for poly in geom.geoms
                ]
            }
        return None

    feature = {
        "type": "Feature",
        "properties": {},
        "geometry": geom_to_geojson(mask)
    }

    feature_collection = {
        "type": "FeatureCollection",
        "features": [feature]
    }

    os.makedirs('data', exist_ok=True)
    with open('data/mask.geojson', 'w') as f:
        json.dump(feature_collection, f)

    print("Successfully generated data/mask.geojson")

if __name__ == "__main__":
    main()
