import { FLOWER_SVG } from "./svg.js";
import { COLORS } from "./constants.js";

export function createMap(containerId) {
  let initialCenter = [-122.335, 47.608];
  let initialZoom = 11;

  const urlParams = new URLSearchParams(window.location.search);
  const zoomParam = urlParams.get('zoom');
  const lngParam = urlParams.get('lng');
  const latParam = urlParams.get('lat');

  if (zoomParam && !isNaN(parseFloat(zoomParam))) {
    initialZoom = parseFloat(zoomParam);
  }
  if (lngParam && latParam && !isNaN(parseFloat(lngParam)) && !isNaN(parseFloat(latParam))) {
    initialCenter = [parseFloat(lngParam), parseFloat(latParam)];
  }

  const map = new maplibregl.Map({
    container: containerId,
    style:
      "https://api.protomaps.com/styles/v5/white/en.json?key=e719bed843250125",
    center: initialCenter,
    zoom: initialZoom,
    minZoom: 9,
    maxZoom: 19,
    attributionControl: {
      compact: true,
      customAttribution: 'Cherry Blossom by bis kim from <a href="https://thenounproject.com/browse/icons/term/cherry-blossom/" target="_blank" title="Cherry Blossom Icons">Noun Project</a> (CC BY 3.0) | Data from <a href="https://services1.arcgis.com/EYzEZbDhXZjURPbP/arcgis/rest/services/City_Trees/FeatureServer/29">City of Bellev City</a>, <a href="https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SDOT_Trees_CDL/FeatureServer/0">SDOT</a>, <a href="https://gis.maps.uw.edu/federated/rest/services/PublicData/PublicData/FeatureServer/37">UW</a>, <a href="https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SPR_Tree_View/FeatureServer/0">SPR</a>, <a href="https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SPR_Urban_Food_Systems_Fruit_Trees_Current/FeatureServer/0">SPR Food Systems</a>, <a href="https://uwbgmaps.sefs.uw.edu/arcgis/rest/services/Master/MapServer/1">WP Arboretum</a>, <a href="https://services7.arcgis.com/9u5SMK7jcrQbBJIC/arcgis/rest/services/TreeSite/FeatureServer/0">City of Redmond</a>, <a href="https://services.arcgis.com/FLM8UAw9y5MmuVTV/arcgis/rest/services/Street_Trees/FeatureServer/0">City of Kirkland</a>, <a href="https://services7.arcgis.com/iZIPdzAfqdnP9vrA/arcgis/rest/services/TreeInventory_Public/FeatureServer/0">City of Shoreline</a>, <a href="https://www.theurbanist.org/the-urbanists-guide-to-beating-the-seattle-cherry-blossom-crowds/">Nat Henry</a>'
    }
  });

  map.addControl(new maplibregl.NavigationControl(), "bottom-left");
  map.addControl(
    new maplibregl.ScaleControl({ unit: "imperial" }),
    "bottom-left",
  );
  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }),
    "bottom-left"
  );

  map.on("moveend", () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const params = new URLSearchParams(window.location.search);
    params.set('lng', center.lng.toFixed(5));
    params.set('lat', center.lat.toFixed(5));
    params.set('zoom', zoom.toFixed(2));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  });

  return map;
}

export function geojson(features) {
  return { type: "FeatureCollection", features };
}

export function addOrUpdateSource(map, sourceId, features) {
  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(geojson(features));
    return false;
  }
  map.addSource(sourceId, {
    type: "geojson",
    data: geojson(features),

  });
  return true;
}

export function addLayersForSource(map, sourceId, visible) {
  const v = visible ? "visible" : "none";
  const prefix = sourceId.replace("-source", "");

  const layerId = `${prefix}-points`;
  map.addLayer({
    id: layerId,
    type: "circle",
    source: sourceId,
    layout: { visibility: v },
    paint: {
      "circle-color": ["coalesce", ["get", "_flower_color"], COLORS.single],
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, [
          "case",
          ["!=", ["get", "_size"], null],
          ["min", 15, ["max", 1.5, ["/", ["get", "_size"], 15]]],
          2.5
        ],
        14, [
          "case",
          ["!=", ["get", "_size"], null],
          ["min", 30, ["max", 3, ["/", ["get", "_size"], 8]]],
          4.5
        ],
        19, [
          "case",
          ["!=", ["get", "_size"], null],
          ["min", 60, ["max", 6, ["/", ["get", "_size"], 3]]],
          8
        ]
      ],
      "circle-opacity": 0.8,
      "circle-stroke-width": 0.8,
      "circle-stroke-color": "rgba(255,255,255,0.6)",
    },
  });


  const onRawPointClick = (e) => {
    const f = e.features[0];
    const p = f.properties;
    const coords = f.geometry.coordinates.slice();
    const popupContent = document.createElement("tooltip-popup");
    popupContent.p = p;

    new maplibregl.Popup({ offset: 8, maxWidth: "260px" })
      .setLngLat(coords)
      .setDOMContent(popupContent)
      .addTo(map);
  };

  map.on("click", layerId, onRawPointClick);

  const onRawPointEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const onRawPointLeave = () => {
    map.getCanvas().style.cursor = "";
  };

  map.on("mouseenter", layerId, onRawPointEnter);
  map.on("mouseleave", layerId, onRawPointLeave);
}

export function applyVisibility(map, currentFilter) {
  const LAYER_GROUPS = {
    cherry: ["cherry-points"],
    all: ["all-points"],
  };

  Object.entries(LAYER_GROUPS).forEach(([key, layers]) => {
    const vis = key === currentFilter ? "visible" : "none";
    layers.forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    });
  });
}


export function addCuratedLayer(map, curatedLocations) {
  const sourceId = "curated-source";
  const layerId = "curated-points";

  const features = curatedLocations.map(loc => {
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [loc.lon, loc.lat] },
      properties: {
        _name: loc.address,
        _type: loc.type,
      }
    };
  });

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(geojson(features));
  } else {
    map.addSource(sourceId, {
      type: "geojson",
      data: geojson(features),
    });
  }

  if (!map.hasImage('flower-icon')) {
    const img = new Image(96, 96);
    img.onload = () => {
      if (!map.hasImage('flower-icon')) {
        map.addImage('flower-icon', img);
      }
      addLayer();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(FLOWER_SVG);
  } else {
    addLayer();
  }

  function addLayer() {
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "symbol",
        source: sourceId,
        layout: {
          "icon-image": "flower-icon",
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0.125,
            14, 0.25,
            19, 0.5
          ],
          "icon-allow-overlap": true
        }
      });

      map.on("click", layerId, (e) => {
        const f = e.features[0];
        const p = f.properties;
        const coords = f.geometry.coordinates.slice();

        const popupContent = document.createElement("tooltip-popup");
        popupContent.p = p;

        new maplibregl.Popup({ offset: 8, maxWidth: "260px" })
          .setLngLat(coords)
          .setDOMContent(popupContent)
          .addTo(map);
      });

      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    }
  }
}
