import { SOURCES, COLORS } from "./constants.js";
import { fetchSourceData } from "./data.js";
import {
  createMap,
  addOrUpdateSource,
  addLayersForSource,
  applyVisibility,
  addCuratedLayer,
} from "./map.js";
import { CURATED_LOCATIONS } from "./curated_data.js";
import "./components.js";

let allFeatures = [];
let currentFilter = "cherry";
let currentBloomingFilters = ["early", "mid", "late"];



const map = createMap("map");
const ui = document.querySelector("app-ui");

let currentHoveredSpecies = null;
let currentHiddenSpecies = [];

ui.addEventListener("species-hover-changed", (e) => {
  currentHoveredSpecies = e.detail.color;
  updateHoverStyles();
});

ui.addEventListener("species-filter-changed", (e) => {
  currentHiddenSpecies = e.detail.hidden;
  refreshMapData();
});

function updateHoverStyles() {
  const layers = ["cherry-points", "all-points"];

  layers.forEach((layerId) => {
    if (!map.getLayer(layerId)) return;

    if (currentHoveredSpecies) {
      map.setPaintProperty(layerId, 'circle-opacity', [
        "case",
        ["==", ["coalesce", ["get", "_flower_color"], COLORS.single], currentHoveredSpecies],
        0.9,
        0.15
      ]);
      map.setPaintProperty(layerId, 'circle-stroke-color', [
        "case",
        ["==", ["coalesce", ["get", "_flower_color"], COLORS.single], currentHoveredSpecies],
        "#00BFFF",
        "rgba(255,255,255,0.2)"
      ]);
      map.setPaintProperty(layerId, 'circle-stroke-width', [
        "case",
        ["==", ["coalesce", ["get", "_flower_color"], COLORS.single], currentHoveredSpecies],
        3,
        0.8
      ]);
    } else {
      map.setPaintProperty(layerId, 'circle-opacity', 0.8);
      map.setPaintProperty(layerId, 'circle-stroke-color', "rgba(255,255,255,0.6)");
      map.setPaintProperty(layerId, 'circle-stroke-width', 0.8);
    }
  });
}


ui.sources = SOURCES.map((s) => ({ ...s, status: "" }));

ui.addEventListener("filter-changed", (e) => {
  currentFilter = e.detail.filter;
  applyVisibility(map, currentFilter);
  ui.requestUpdate();
});


ui.addEventListener("blooming-filters-changed", (e) => {
  currentBloomingFilters = e.detail.filters;
  refreshMapData();
  applyVisibility(map, currentFilter);
  ui.requestUpdate();
});

function refreshMapData() {
  const filteredFeatures = allFeatures.filter((f) => {
    const color = f.properties._flower_color || COLORS.single;
    if (currentHiddenSpecies.includes(color)) {
      return false;
    }

    if (f.properties._blooming) {
      if (!currentBloomingFilters.includes(f.properties._blooming)) {
        return false;
      }
    } else {
      if (currentBloomingFilters.length < 3) {
        if (!currentBloomingFilters.includes(f.properties._blooming)) {
          return false;
        }
      }
    }
    return true;
  });

  const cherryFeatures = filteredFeatures.filter((f) => f.properties._is_cherry);

  const cherryCreated = addOrUpdateSource(map, "cherry-source", cherryFeatures);
  if (cherryCreated) {
    addLayersForSource(map, "cherry-source", currentFilter === "cherry");
  }

  const allCreated = addOrUpdateSource(map, "all-source", filteredFeatures);
  if (allCreated) {
    addLayersForSource(map, "all-source", currentFilter === "all");
  }
}

map.on("load", async () => {

  map.addSource("terrain", {
    type: "raster-dem",
    tiles: [
      "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
    ],
    encoding: "terrarium",
    tileSize: 256,
    maxzoom: 14,
  });

  map.addLayer(
    {
      id: "hillshade",
      type: "hillshade",
      source: "terrain",
      paint: {
        "hillshade-exaggeration": 0.5,
        "hillshade-shadow-color": "#473B24",
        "hillshade-highlight-color": "#FFFFFF",
        "hillshade-accent-color": "#5a5a5a",
      },
    },
  );

  addCuratedLayer(map, CURATED_LOCATIONS);


  let loadedCount = 0;
  let failedCount = 0;

  const promises = SOURCES.map((src, index) =>
    fetchSourceData(src)
      .then((features) => {
        loadedCount++;
        const newSources = [...ui.sources];
        newSources[index].status = "loaded";
        ui.sources = newSources;

        allFeatures.push(...features);
        ui.features = allFeatures;

        refreshMapData();

        ui.loadedCount = loadedCount;
        ui.totalCherry = allFeatures.filter(
          (f) => f.properties._is_cherry,
        ).length;
        ui.totalPrunus = allFeatures.length;
      })
      .catch((err) => {
        failedCount++;
        const newSources = [...ui.sources];
        newSources[index].status = "error";
        ui.sources = newSources;
        console.warn(`[${src.label}] failed to load:`, err);
      }),
  );

  await Promise.all(promises);


  ui.failedCount = failedCount;
  ui.totalCherry = allFeatures.filter((f) => f.properties._is_cherry).length;
  ui.totalPrunus = allFeatures.length;

  setTimeout(() => {
    ui.statusHidden = true;
  }, 5000);
});
