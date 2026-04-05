import { SOURCES } from "./constants.js";
import { fetchSourceData } from "./data.js";
import {
  createMap,
  addOrUpdateSource,
  addOrUpdateRawSource,
  addLayersForSource,
  addRawLayersForSource,
  applyVisibility,
} from "./map.js";
import "./components.js";

let allFeatures = [];
let clustered = false;
let currentFilter = "cherry";
let currentBloomingFilters = ["early", "mid", "late"];

const map = createMap("map");
const ui = document.querySelector("app-ui");

ui.sources = SOURCES.map((s) => ({ ...s, status: "" }));

ui.addEventListener("filter-changed", (e) => {
  currentFilter = e.detail.filter;
  applyVisibility(map, currentFilter, clustered);
  ui.requestUpdate();
});


ui.addEventListener("blooming-filters-changed", (e) => {
  currentBloomingFilters = e.detail.filters;
  refreshMapData();
  applyVisibility(map, currentFilter, clustered);
  ui.requestUpdate();
});

ui.addEventListener("cluster-toggled", (e) => {
  clustered = e.detail.clustered;
  applyVisibility(map, currentFilter, clustered);
  ui.requestUpdate();
});

function refreshMapData() {
  const filteredFeatures = allFeatures.filter((f) => {
    if (f.properties._blooming) {
      if (!currentBloomingFilters.includes(f.properties._blooming)) {
        return false;
      }
    } else {      if (currentBloomingFilters.length < 3) {
        if (!currentBloomingFilters.includes(f.properties._blooming)) {
          return false;
        }
      }
    }
    return true;
  });

  const cherryFeatures = filteredFeatures.filter((f) => f.properties._is_cherry);

  const cherryCreated = addOrUpdateSource(map, "cherry-source", cherryFeatures);
  if (cherryCreated)
    addLayersForSource(
      map,
      "cherry-source",
      clustered && currentFilter === "cherry",
    );

  const cherryRawCreated = addOrUpdateRawSource(
    map,
    "cherry-raw-source",
    cherryFeatures,
  );
  if (cherryRawCreated)
    addRawLayersForSource(
      map,
      "cherry-raw-source",
      !clustered && currentFilter === "cherry",
    );

  const allCreated = addOrUpdateSource(map, "all-source", filteredFeatures);
  if (allCreated)
    addLayersForSource(
      map,
      "all-source",
      clustered && currentFilter === "all",
    );

  const allRawCreated = addOrUpdateRawSource(
    map,
    "all-raw-source",
    filteredFeatures,
  );
  if (allRawCreated)
    addRawLayersForSource(
      map,
      "all-raw-source",
      !clustered && currentFilter === "all",
    );
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
