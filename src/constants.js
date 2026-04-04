
const warnedMessages = new Set();
function warnOnce(msg) {
  if (!warnedMessages.has(msg)) {
    console.warn(msg);
    warnedMessages.add(msg);
  }
}
export const SOURCES = [
  {
    id: "bellevue",
    label: "Bellevue City Trees",
    color: "#f1c40f",
    base: "https://services1.arcgis.com/EYzEZbDhXZjURPbP/arcgis/rest/services/City_Trees/FeatureServer/29",
    combinedField: "SpeciesDesc",
    extractSpecies: (val) => {
      if (!val) return { sci: "", com: "" };
      const parts = val.split(" - ");
      if (parts.length > 1) {
        let com = parts[1].trim();
        com = com.replace(/\(.*\)/, "").trim();
        return { sci: parts[0].trim(), com: com };
      }
      return { sci: val, com: val };
    }
  },
  {
    id: "sdot",
    label: "SDOT",
    color: "#e8436a",
    base: "https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SDOT_Trees_CDL/FeatureServer/0",
  },
  {
    id: "uw",
    label: "UW Campus",
    color: "#9b59b6",
    base: "https://gis.maps.uw.edu/federated/rest/services/PublicData/PublicData/FeatureServer/37",
    sciField: "SpeciesName",
    commonField: "CommonName",
  },
  {
    id: "spr",
    label: "Seattle Parks",
    color: "#27ae60",
    base: "https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SPR_Tree_View/FeatureServer/0",
    sciField: "SPECIES",
    commonField: "COMMON",
  },
  {
    id: "ufs",
    label: "SPR Food Systems",
    color: "#e67e22",
    base: "https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SPR_Urban_Food_Systems_Fruit_Trees_Current/FeatureServer/0",
    combinedField: "GENUS",
    outFieldsOverride: ["GENUS", "SPECIES", "TREETYPE", "VARIETY"],
    extractSpecies: (val, p) => {
      const genus = (p.GENUS || "").trim();
      const species = (p.SPECIES || "").trim();
      const treeType = (p.TREETYPE || "").trim();
      const variety = (p.VARIETY || "").trim();

      let sci = genus;
      if (species) {
        sci = species.startsWith(genus) ? species : `${genus} ${species}`;
      }

      let com = treeType;
      if (variety && variety !== treeType) {
        com = (com && com !== " ") ? `${com} (${variety})` : variety;
      } else if (!com || com === " ") {
        com = variety || "";
      }

      return { sci, com };
    }
  },
  {
    id: "arboretum",
    label: "WP Arboretum",
    color: "#2980b9",
    base: "https://uwbgmaps.sefs.uw.edu/arcgis/rest/services/Master/MapServer/1",
    sciField: "BGBaseData.ScientificName",
    commonField: "BGBaseData.CommonName",
    condField: "BGBaseData.Condition",
  },
  {
    id: "redmond",
    label: "City of Redmond",
    color: "#3498db",
    base: "https://services7.arcgis.com/9u5SMK7jcrQbBJIC/arcgis/rest/services/TreeSite/FeatureServer/0",
    sciField: "GenusSpecies",
    commonField: "CommonName",
  },
  {
    id: "kirkland",
    label: "City of Kirkland",
    color: "#e74c3c",
    base: "https://services.arcgis.com/FLM8UAw9y5MmuVTV/arcgis/rest/services/Street_Trees/FeatureServer/0",
    sciField: "BOTANICALN",
    commonField: "COMMONNAME",
    condField: "TREECONDIT",
    sizeField: "DBH_Num",
  },
  {
    id: "shoreline",
    label: "City of Shoreline",
    color: "#2ecc71",
    base: "https://services7.arcgis.com/iZIPdzAfqdnP9vrA/arcgis/rest/services/TreeInventory_Public/FeatureServer/0",
    commonField: "common_name",
    sciField: "Genus",
    condField: "CONDITION",
    sizeField: "DBH",
  },
  {
    id: "pierce",
    label: "Pierce County",
    color: "#f39c12",
    base: "https://services.arcgis.com/TosFUe3nXUAksqSj/arcgis/rest/services/Tree_Inventory11/FeatureServer/0",
        combinedField: "Species",
    extractSpecies: (val) => {
      if (!val) return { sci: "", com: "" };
      const parts = val.split(" - ");
      if (parts.length > 1) {
        let com = parts[1].trim();
        com = com.replace(/\(.*\)/, "").trim();
        return { sci: parts[0].trim(), com: com };
      }
      return { sci: val, com: "" };
    },
    sizeField: "DBH__in_",
  },
];

export const SCI_ALIASES = [
  "SCIENTIFIC_NAME",
  "BOTANICAL_NAME",
  "SCI_NAME",
  "TAXON_NAME",
  "TAXON",
  "SCIENTIFIC",
  "BOTANICAL",
  "GENUS_SPECIES",
  "SPEC_GENUS",
];
export const COMMON_ALIASES = [
  "COMMON_NAME",
  "COMMON_NM",
  "SPECIES_NAME",
  "TREE_SPECIES",
  "TREE_NAME",
  "SPECTYPE",
  "SPECIES",
  "COMMON",
  "TREE_TYPE",
];
export const SIZE_ALIASES = [
  "DIAM",
  "DBH_WL",
  "DIAMETERATBREASTHEIGHT",
  "BGBASEDATA.DIAMETERATBREASTHEIGHT",
  "DBH",
  "DSH",
  "DIAMETER",
  "TREE_DIAM",
  "TREE_DBH",
  "TREEDIAMETER_IN",
];

export const COND_ALIASES = [
  "CONDITION",
  "CONDITION_",
  "TREE_CONDITION",
  "COND",
  "RATING",
];

export const COLORS = {
  single: "#e8436a",
  small: "#f28cb1",
  medium: "#d63579",
  large: "#a0195a",
};

export const FLOWER_COLORS = {
  "PRUNUS X YEDOENSIS": "#f4c8dc",
  "PRUNUS YEDOENSIS": "#f4c8dc",
  "PRUNUS SERRULATA": "#e8628c",
  "PRUNUS X OKAME": "#e8436a",
  "PRUNUS INCISA": "#e86090",
  "PRUNUS SUBHIRTELLA": "#f0a0c0",
  "PRUNUS PENDULA": "#f0a0c0",
  "PRUNUS SARGENTII": "#d9527a",
  "PRUNUS SPECIOSA": "#f8e8f2",
  "PRUNUS CAMPANULATA": "#c0306a",
  "PRUNUS NIPPONICA": "#f0b8d0",
  "PRUNUS JAMASAKURA": "#e07aa0",
  "PRUNUS CERASOIDES": "#d04878",
  "PRUNUS MUME": "#f0a8c8",
  "PRUNUS TRILOBA": "#f0b4cc",
  "PRUNUS AVIUM": "#f8f0f4",
  "PRUNUS CERASUS": "#f5e8f0",
  "PRUNUS MAHALEB": "#f5f0f5",
  "PRUNUS SEROTINA": "#f5f5f5",
  "PRUNUS CERASIFERA": "#d8a0d8",
  "PRUNUS DOMESTICA": "#e8e0f0",
  "PRUNUS SALICINA": "#f0d8e8",
  "PRUNUS AMERICANA": "#f5ece8",
  "PRUNUS SPINOSA": "#e8e4f0",
  "PRUNUS PERSICA": "#f07860",
  "PRUNUS DULCIS": "#f8d8e8",
  "PRUNUS ARMENIACA": "#f5e8d8",
  "PRUNUS VIRGINIANA": "#f0f0f0",
  "PRUNUS PADUS": "#f8f8f8",
  "PRUNUS LAUROCERASUS": "#f0f0f0",
  "PRUNUS LUSITANICA": "#f0f0f0",
  "PRUNUS CAROLINIANA": "#f5f5f0",
  "PRUNUS KWANZAN": "#e8628c",
  "PRUNUS SEKIYAMA": "#e8628c",
  "PRUNUS BLIREIANA": "#e8628c",
  "PRUNUS SHIROTAE": "#f8f0f4",
  "PRUNUS AMANOGAWA": "#f4c8dc",
  "PRUNUS SERRULA": "#f8f0f4",
  "PRUNUS EMARGINATA": "#f8f0f4",
  "PRUNUS ACCOLADE": "#f0a0c0",
  "PRUNUS OKAME": "#e8436a",
  "PRUNUS SPIRE": "#f4c8dc",
  "PRUNUS SNOW GOOSE": "#f8f0f4",
  "PRUNUS NEWPORT": "#f4c8dc",
  "PRUNUS CASCADE SNOW": "#f8f0f4",
  "PRUNUS BENI-TAMANISHIKI": "#f0a0c0",
  "PRUNUS SHIRO-FUGEN": "#f8f0f4",
  "PRUNUS SNOW FOUNTAIN": "#f8f0f4",
  "PRUNUS DREAM CATCHER": "#f0a0c0",
  "PRUNUS SHOGETSU": "#f4c8dc",
  "PRUNUS SUBCORDATA": "#f8f0f4",
  "PRUNUS TOMENTOSA": "#f4c8dc",
  "PRUNUS JAPONICA": "#f4c8dc",
  "PRUNUS GLANDULOSA": "#f4c8dc",
  "PRUNUS JUDDII": "#f0a0c0",
  "PRUNUS ILICIFOLIA": "#f8f8f8",
  "PRUNUS PUGETENSIS": "#f8f0f4",
  "PRUNUS BLIREANA": "#e8628c",
  "PRUNUS YEDEOENSIS": "#f4c8dc",
};

export const SPECIES_LABELS = {
  "PRUNUS X YEDOENSIS": "Yoshino Cherry",
  "PRUNUS YEDOENSIS": "Yoshino Cherry",
  "PRUNUS SERRULATA": "Japanese Cherry",
  "PRUNUS X OKAME": "Okame Cherry",
  "PRUNUS INCISA": "Fuji Cherry",
  "PRUNUS SUBHIRTELLA": "Higan Cherry",
  "PRUNUS PENDULA": "Weeping Cherry",
  "PRUNUS SARGENTII": "Sargent Cherry",
  "PRUNUS SPECIOSA": "Oshima Cherry",
  "PRUNUS CAMPANULATA": "Taiwan Cherry",
  "PRUNUS NIPPONICA": "Alpine Cherry",
  "PRUNUS JAMASAKURA": "Mountain Cherry",
  "PRUNUS MUME": "Japanese Apricot",
  "PRUNUS TRILOBA": "Flowering Almond",
  "PRUNUS AVIUM": "Sweet Cherry",
  "PRUNUS CERASUS": "Sour Cherry",
  "PRUNUS SEROTINA": "Black Cherry",
  "PRUNUS CERASIFERA": "Cherry Plum",
  "PRUNUS DOMESTICA": "European Plum",
  "PRUNUS PERSICA": "Peach",
  "PRUNUS DULCIS": "Almond",
  "PRUNUS ARMENIACA": "Apricot",
  "PRUNUS VIRGINIANA": "Chokecherry",
  "PRUNUS PADUS": "Bird Cherry",
  "PRUNUS LAUROCERASUS": "Cherry Laurel",
  "PRUNUS KWANZAN": "Kwanzan Cherry",
  "PRUNUS SEKIYAMA": "Kwanzan Cherry",
  "PRUNUS BLIREIANA": "Blireiana Plum",
  "PRUNUS SHIROTAE": "Shirotae Cherry",
  "PRUNUS AMANOGAWA": "Amanogawa Cherry",
  "PRUNUS SERRULA": "Birchbark Cherry",
  "PRUNUS EMARGINATA": "Bitter Cherry",
  "PRUNUS ACCOLADE": "Accolade Cherry",
  "PRUNUS OKAME": "Okame Cherry",
  "PRUNUS SPIRE": "Spire Cherry",
  "PRUNUS SNOW GOOSE": "Snow Goose Cherry",
  "PRUNUS NEWPORT": "Newport Plum",
  "PRUNUS CASCADE SNOW": "Cascade Snow Cherry",
  "PRUNUS BENI-TAMANISHIKI": "Spring Snow Cherry",
  "PRUNUS SHIRO-FUGEN": "Shiro-fugen Cherry",
  "PRUNUS SNOW FOUNTAIN": "Snow Fountain Cherry",
  "PRUNUS DREAM CATCHER": "Dream Catcher Cherry",
  "PRUNUS SHOGETSU": "Shogetsu Cherry",
  "PRUNUS SUBCORDATA": "Sierra Plum",
  "PRUNUS TOMENTOSA": "Nanking Cherry",
  "PRUNUS JAPONICA": "Korean Cherry",
  "PRUNUS GLANDULOSA": "Flowering Almond",
  "PRUNUS JUDDII": "Judd Cherry",
  "PRUNUS AMERICANA": "American Plum",
  "PRUNUS CAROLINIANA": "Carolina Laurelcherry",
  "PRUNUS ILICIFOLIA": "Hollyleaf Cherry",
  "PRUNUS LUSITANICA": "Portugal Laurel",
  "PRUNUS SALICINA": "Japanese Plum",
  "PRUNUS BLIREANA": "Blireiana Plum",
  "PRUNUS PUGETENSIS": "Puget Sound Cherry",
  "PRUNUS YEDEOENSIS": "Yoshino Cherry",
};

export const COLOR_LABEL = {};
for (const [prefix, color] of Object.entries(FLOWER_COLORS)) {
  if (!COLOR_LABEL[color] && SPECIES_LABELS[prefix])
    COLOR_LABEL[color] = SPECIES_LABELS[prefix];
}

export const FLOWER_COLOR_KEYS = Object.keys(FLOWER_COLORS).sort(
  (a, b) => b.length - a.length,
);

export function getFlowerColor(scientific) {
  if (!scientific) return null;
  let upper = scientific.trim().toUpperCase().replace(/\s+/g, " ").replace(/[`'"]/g, "");
  upper = upper.replace(/^PRUNUS X /, "PRUNUS ");
  upper = upper.replace(/SHIRO -FUGEN/, "SHIRO-FUGEN");

  for (const prefix of FLOWER_COLOR_KEYS) {
    if (upper.startsWith(prefix) || upper.includes(prefix.replace("PRUNUS ", ""))) {
      return FLOWER_COLORS[prefix];
    }
  }
  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    warnOnce(`[getFlowerColor] Unmatched Prunus variety: ${scientific}`);
  }
  return null;
}

export function formatSciLabel(sci) {
  if (!sci) return "Other Prunus";
  let clean = sci.trim().replace(/[`'"]/g, "").replace(/\s+/g, " ");
  clean = clean.replace(/^Prunus x /i, "Prunus ");
  const parts = clean.split(" ");
  return parts.length >= 2 ? `P. ${parts[1].toLowerCase()}` : sci;
}

export function isFloweringCherry(common, scientific) {
  const cn = common.toUpperCase();
  const sci = scientific.toUpperCase();

  if (cn.includes("CHERRY") && !cn.includes("LAUREL")) return true;

  const CHERRY_PREFIXES = [
    "PRUNUS SERRULATA",
    "PRUNUS YEDOENSIS",
    "PRUNUS X YEDOENSIS",
    "PRUNUS SUBHIRTELLA",
    "PRUNUS SARGENTII",
    "PRUNUS INCISA",
    "PRUNUS PENDULA",
    "PRUNUS SPECIOSA",
    "PRUNUS CAMPANULATA",
    "PRUNUS NIPPONICA",
    "PRUNUS JAMASAKURA",
    "PRUNUS KWANZAN",
    "PRUNUS SEKIYAMA",
    "PRUNUS SHIROTAE",
    "PRUNUS AMANOGAWA",
    "PRUNUS SERRULA",
    "PRUNUS ACCOLADE",
    "PRUNUS OKAME",
    "PRUNUS SPIRE",
    "PRUNUS SNOW GOOSE",
    "PRUNUS CASCADE SNOW",
    "PRUNUS BENI-TAMANISHIKI",
    "PRUNUS SHIRO-FUGEN",
    "PRUNUS SNOW FOUNTAIN",
    "PRUNUS DREAM CATCHER",
    "PRUNUS SHOGETSU",
    "PRUNUS JUDDII",
    "PRUNUS YEDEOENSIS",
    "PRUNUS PUGETENSIS",
  ];
  let upperSci = sci.replace(/\s+/g, " ").replace(/[`'"]/g, "");
  upperSci = upperSci.replace(/^PRUNUS X /, "PRUNUS ");
  upperSci = upperSci.replace(/SHIRO -FUGEN/, "SHIRO-FUGEN");
  const matched = CHERRY_PREFIXES.some((prefix) => upperSci.startsWith(prefix) || upperSci.includes(prefix.replace("PRUNUS ", "")));
  if (!matched && upperSci.startsWith("PRUNUS") && upperSci !== "PRUNUS" && upperSci !== "PRUNUS SP") {
    // Some are genuinely not flowering cherries (e.g. laurels, plums), but log anyway to catch misses
    warnOnce(`[isFloweringCherry] Prunus variety not in CHERRY_PREFIXES (might be correct if not a cherry): ${scientific}`);
  }
  return matched;
}


export const BLOOMING_PERIODS = {
  "PRUNUS MUME": "early",
  "PRUNUS CAMPANULATA": "early",
  "PRUNUS CERASIFERA": "early",
  "PRUNUS X OKAME": "early",
  "PRUNUS OKAME": "early",
  "PRUNUS BLIREIANA": "early",
  "PRUNUS SUBHIRTELLA": "early",
  "PRUNUS PENDULA": "early",
  "PRUNUS DULCIS": "early",
  "PRUNUS ARMENIACA": "early",
  "PRUNUS TOMENTOSA": "early",
  "PRUNUS CAROLINIANA": "early",
  "PRUNUS SALICINA": "early",
  "PRUNUS BLIREANA": "early",

  "PRUNUS YEDOENSIS": "mid",
  "PRUNUS X YEDOENSIS": "mid",
  "PRUNUS ACCOLADE": "mid",
  "PRUNUS SARGENTII": "mid",
  "PRUNUS SPECIOSA": "mid",
  "PRUNUS INCISA": "mid",
  "PRUNUS NIPPONICA": "mid",
  "PRUNUS JAMASAKURA": "mid",
  "PRUNUS PERSICA": "mid",
  "PRUNUS AVIUM": "mid",
  "PRUNUS CERASUS": "mid",
  "PRUNUS TRILOBA": "mid",
  "PRUNUS AMANOGAWA": "mid",
  "PRUNUS SPIRE": "mid",
  "PRUNUS SNOW GOOSE": "mid",
  "PRUNUS CASCADE SNOW": "mid",
  "PRUNUS SNOW FOUNTAIN": "mid",
  "PRUNUS DREAM CATCHER": "mid",
  "PRUNUS JAPONICA": "mid",
  "PRUNUS GLANDULOSA": "mid",
  "PRUNUS JUDDII": "mid",
  "PRUNUS NEWPORT": "mid",
  "PRUNUS BENI-TAMANISHIKI": "mid",
  "PRUNUS AMERICANA": "mid",
  "PRUNUS SERRULA": "mid",
  "PRUNUS DOMESTICA": "mid",
  "PRUNUS PUGETENSIS": "mid",
  "PRUNUS YEDEOENSIS": "mid",

  "PRUNUS SERRULATA": "late",
  "PRUNUS KWANZAN": "late",
  "PRUNUS SEKIYAMA": "late",
  "PRUNUS SHIROTAE": "late",
  "PRUNUS SHIRO-FUGEN": "late",
  "PRUNUS SHOGETSU": "late",
  "PRUNUS SEROTINA": "late",
  "PRUNUS VIRGINIANA": "late",
  "PRUNUS PADUS": "late",
  "PRUNUS EMARGINATA": "late",
  "PRUNUS LAUROCERASUS": "late",
  "PRUNUS ILICIFOLIA": "late",
  "PRUNUS LUSITANICA": "late"
};

export const BLOOMING_KEYS = Object.keys(BLOOMING_PERIODS).sort(
  (a, b) => b.length - a.length,
);

export function getBloomingPeriod(scientific) {
  if (!scientific) return null;
  let upper = scientific.trim().toUpperCase().replace(/\s+/g, " ").replace(/[`'"]/g, "");
  upper = upper.replace(/^PRUNUS X /, "PRUNUS ");
  upper = upper.replace(/SHIRO -FUGEN/, "SHIRO-FUGEN");

  for (const prefix of BLOOMING_KEYS) {
    if (upper.startsWith(prefix) || upper.includes(prefix.replace("PRUNUS ", ""))) {
      return BLOOMING_PERIODS[prefix];
    }
  }
  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    warnOnce(`[getBloomingPeriod] Unmatched Prunus variety: ${scientific}`);
  }
  return null;
}
