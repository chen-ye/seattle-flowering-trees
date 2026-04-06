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
    filter: ["!=", ["get", "_source"], "Curated Blossoms"],
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
          ["max", 1.5, ["/", ["get", "_size"], 15]],
          2.5
        ],
        14, [
          "case",
          ["!=", ["get", "_size"], null],
          ["max", 3, ["/", ["get", "_size"], 8]],
          4.5
        ],
        19, [
          "case",
          ["!=", ["get", "_size"], null],
          ["max", 6, ["/", ["get", "_size"], 3]],
          8
        ]
      ],
      "circle-opacity": 0.8,
      "circle-stroke-width": 0.8,
      "circle-stroke-color": "rgba(255,255,255,0.6)",
    },
  });

  const curatedLayerId = `${prefix}-curated-points`;
  map.addLayer({
    id: curatedLayerId,
    type: "symbol",
    source: sourceId,
    filter: ["==", ["get", "_source"], "Curated Blossoms"],
    layout: {
      visibility: v,
      "text-field": "🌸",
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 14,
        14, 20,
        19, 36
      ],
      "text-allow-overlap": true
    }
  });

  const onRawPointClick = (e) => {
    const f = e.features[0];
    const p = f.properties;
    const coords = f.geometry.coordinates.slice();
    const nameHtml = p._common
      ? `<div class="popup-name">${p._common}</div>`
      : "";
    const sciHtml =
      p._scientific && p._scientific !== p._common
        ? `<div class="popup-sci">${p._scientific}</div>`
        : "";
    const condHtml = p._condition
      ? `<div class="popup-cond">Condition: ${p._condition}</div>`
      : "";
    const sizeHtml = p._size
      ? `<div class="popup-size">Trunk Diameter: ${p._size}"</div>`
      : "";
    const srcHtml = `<a href="${p._base}" target="_blank" class="popup-source" style="background:${p._color}; text-decoration:none; color:white;">${p._source}</a>`;

    new maplibregl.Popup({ offset: 8, maxWidth: "260px" })
      .setLngLat(coords)
      .setHTML(nameHtml + sciHtml + condHtml + sizeHtml + srcHtml)
      .addTo(map);
  };

  map.on("click", layerId, onRawPointClick);
  map.on("click", curatedLayerId, onRawPointClick);

  const onRawPointEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const onRawPointLeave = () => {
    map.getCanvas().style.cursor = "";
  };

  map.on("mouseenter", layerId, onRawPointEnter);
  map.on("mouseleave", layerId, onRawPointLeave);
  map.on("mouseenter", curatedLayerId, onRawPointEnter);
  map.on("mouseleave", curatedLayerId, onRawPointLeave);
}

export function applyVisibility(map, currentFilter) {
  const LAYER_GROUPS = {
    cherry: ["cherry-points", "cherry-curated-points"],
    all: ["all-points", "all-curated-points"],
  };

  Object.entries(LAYER_GROUPS).forEach(([key, layers]) => {
    const vis = key === currentFilter ? "visible" : "none";
    layers.forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    });
  });
}
