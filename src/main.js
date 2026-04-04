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
let currentFilter = "cherry";
let clustered = true;

const map = createMap("map");
const ui = document.querySelector("app-ui");

ui.sources = SOURCES.map((s) => ({ ...s, status: "" }));

ui.addEventListener("filter-changed", (e) => {
  currentFilter = e.detail.filter;
  applyVisibility(map, currentFilter, clustered);
  ui.requestUpdate();
});

ui.addEventListener("cluster-toggled", (e) => {
  clustered = e.detail.clustered;
  applyVisibility(map, currentFilter, clustered);
  ui.requestUpdate();
});

function refreshMapData() {
  const cherryFeatures = allFeatures.filter((f) => f.properties._is_cherry);

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
}

map.on("load", async () => {
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

  const allCreated = addOrUpdateSource(map, "all-source", allFeatures);
  if (allCreated)
    addLayersForSource(map, "all-source", clustered && currentFilter === "all");

  const allRawCreated = addOrUpdateRawSource(
    map,
    "all-raw-source",
    allFeatures,
  );
  if (allRawCreated)
    addRawLayersForSource(
      map,
      "all-raw-source",
      !clustered && currentFilter === "all",
    );

  ui.failedCount = failedCount;
  ui.totalCherry = allFeatures.filter((f) => f.properties._is_cherry).length;
  ui.totalPrunus = allFeatures.length;

  setTimeout(() => {
    ui.statusHidden = true;
  }, 5000);
});
