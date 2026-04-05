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
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 45,
  });
  return true;
}

export function addOrUpdateRawSource(map, sourceId, features) {
  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(geojson(features));
    return false;
  }
  map.addSource(sourceId, {
    type: "geojson",
    data: geojson(features),
    cluster: false,
  });
  return true;
}

export function addLayersForSource(map, sourceId, visible) {
  const v = visible ? "visible" : "none";
  const prefix = sourceId.replace("-source", "");

  map.addLayer({
    id: `${prefix}-clusters`,
    type: "circle",
    source: sourceId,
    filter: ["has", "point_count"],
    layout: { visibility: v },
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        COLORS.small,
        50,
        COLORS.medium,
        200,
        COLORS.large,
      ],
      "circle-radius": ["step", ["get", "point_count"], 14, 50, 20, 200, 28],
      "circle-opacity": 0.88,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "rgba(255,255,255,0.7)",
    },
  });

  map.addLayer({
    id: `${prefix}-cluster-count`,
    type: "symbol",
    source: sourceId,
    filter: ["has", "point_count"],
    layout: {
      visibility: v,
      "text-field": "{point_count_abbreviated}",
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": 11,
      "text-allow-overlap": true,
    },
    paint: { "text-color": "#fff" },
  });

  map.addLayer({
    id: `${prefix}-points`,
    type: "circle",
    source: sourceId,
    filter: ["!", ["has", "point_count"]],
    layout: { visibility: v },
    paint: {
      "circle-color": ["coalesce", ["get", "_flower_color"], COLORS.single],
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, [
          "case",
          ["!=", ["get", "_size"], null],
          ["max", 2, ["/", ["get", "_size"], 10]],
          3.5
        ],
        16, [
          "case",
          ["!=", ["get", "_size"], null],
          ["max", 4, ["/", ["get", "_size"], 5]],
          6
        ],
        19, [
          "case",
          ["!=", ["get", "_size"], null],
          ["max", 7, ["/", ["get", "_size"], 2.5]],
          9
        ]
      ],
      "circle-opacity": 0.85,
      "circle-stroke-width": 1,
      "circle-stroke-color": "rgba(255,255,255,0.65)",
    },
  });

  map.on("click", `${prefix}-clusters`, (e) => {
    const f = map.queryRenderedFeatures(e.point, {
      layers: [`${prefix}-clusters`],
    })[0];
    map
      .getSource(sourceId)
      .getClusterExpansionZoom(f.properties.cluster_id)
      .then((zoom) => {
        map.easeTo({ center: f.geometry.coordinates, zoom: zoom + 0.5 });
      });
  });

  map.on("click", `${prefix}-points`, (e) => {
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
  });

  map.on("mouseenter", `${prefix}-clusters`, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", `${prefix}-clusters`, () => {
    map.getCanvas().style.cursor = "";
  });
  map.on("mouseenter", `${prefix}-points`, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", `${prefix}-points`, () => {
    map.getCanvas().style.cursor = "";
  });
}

export function addRawLayersForSource(map, sourceId, visible) {
  const v = visible ? "visible" : "none";
  const prefix = sourceId.replace(/-source$/, "");
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

  map.on("click", layerId, (e) => {
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
  });
  map.on("mouseenter", layerId, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", layerId, () => {
    map.getCanvas().style.cursor = "";
  });
}

export function applyVisibility(map, currentFilter, clustered) {
  const active = clustered ? currentFilter : `${currentFilter}-raw`;
  const LAYER_GROUPS = {
    cherry: ["cherry-clusters", "cherry-cluster-count", "cherry-points"],
    all: ["all-clusters", "all-cluster-count", "all-points"],
    "cherry-raw": ["cherry-raw-points"],
    "all-raw": ["all-raw-points"],
  };

  Object.entries(LAYER_GROUPS).forEach(([key, layers]) => {
    const vis = key === active ? "visible" : "none";
    layers.forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    });
  });
}
