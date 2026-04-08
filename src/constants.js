
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
    sciField: "GENUS",
    commonField: "TREETYPE",
    extraFields: ["SPECIES"],
    parseSpecies: (p) => {
      const genus = (p.GENUS || "").trim();
      const species = (p.SPECIES || "").trim();
      let sci = genus;
      if (species && species !== "null") {
        sci = species.toLowerCase().startsWith(genus.toLowerCase()) ? species : genus + " " + species;
      }
      return { sci: sci.trim(), com: p.TREETYPE || "unknown" };
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
    base: "https://maps.kirklandwa.gov/appx/rest/services/KirklandPublic/MapServer/53",
    commonField: "SPECIES_COMMON",
    condField: "CONDITION",
    sizeField: "DIAMETER",
    extraFields: ["GENUS", "SPECIES_BOTANICAL"],
    parseSpecies: (p) => {
      const genus = (p.GENUS || "").trim();
      const bot = (p.SPECIES_BOTANICAL || "").trim();
      let sci = genus;
      if (bot) {
        const parts = bot.split(" ");
        if (parts.length > 1) {
           sci = genus + " " + parts.slice(1).join(" ");
        } else {
           sci = genus + " " + bot;
        }
      }
      return { sci: sci.trim(), com: p.SPECIES_COMMON || "unknown" };
    }
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
  {
    id: "renton",
    label: "Renton Tree Sites",
    color: "#16a085",
    combinedField: "Tree Species",
  },
      {
    id: "sammamish_public",
    label: "Sammamish Public Tree Inventory",
    color: "#8e44ad",
    sciField: "Genus",
    commonField: "Species",
    parseSpecies: (p) => {
      const sci = ((p.Genus || "") + " " + (p.Species || "")).trim();
      return { sci, com: sci };
    }
  },
  {
    id: "sammamish_row",
    label: "Sammamish ROW Tree Study",
    color: "#2c3e50",
    sciField: "Genus",
    commonField: "Species",
    parseSpecies: (p) => {
      const sci = ((p.Genus || "") + " " + (p.Species || "")).trim();
      return { sci, com: sci };
    }
  },
];
export const SCI_ALIASES = [
  "FAMILY",
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
  "PRUNUS YEODENSIS": "#f4c8dc",
  "PRUNUS AMYGDALUS": "#f8d8e8",
  "PRUNUS BILREIANA": "#e8628c",
  "PRUNUS CERRASIFERA": "#d8a0d8",
  "PRUNUS HOKUSAI": "#f4c8dc",
  "PRUNUS CORNUTA": "#f8f8f8",
  "PRUNUS SATO-ZAKURA": "#e8628c",
  "PRUNUS INCAM": "#e8436a",
  "PRUNUS CHOSHU-HIZAKURA": "#e8628c",
  "PRUNUS OSHOKUN": "#f4c8dc",
  "PRUNUS UKON": "#f8f0f4",
  "PRUNUS MUGUS": "#e8628c",
  "PRUNUS SIEBOLDII": "#f0a0c0",
  "PRUNUS OJOCHIN": "#f8f0f4",
  "PRUNUS VERECUNDA": "#f8f0f4",
  "PRUNUS BRIGANTINA": "#f8f8f8",
  "PRUNUS HUMILIS": "#f8f0f4",
  "PRUNUS MICROCARPA": "#f0a0c0",
  "PRUNUS DIELSIANA": "#f0a0c0",
  "PRUNUS MAACKII": "#f8f8f8",
  "PRUNUS ROYAL BURGUNDY": "#d63579",
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
  "PRUNUS AMYGDALUS": "Almond",
  "PRUNUS BILREIANA": "Blireiana Plum",
  "PRUNUS CERRASIFERA": "Cherry Plum",
  "PRUNUS HOKUSAI": "Hokusai Cherry",
  "PRUNUS CORNUTA": "Himalayan Bird Cherry",
  "PRUNUS SATO-ZAKURA": "Japanese Cherry",
  "PRUNUS INCAM": "Okame Cherry",
  "PRUNUS CHOSHU-HIZAKURA": "Choshu-hizakura Cherry",
  "PRUNUS OSHOKUN": "Oshokun Cherry",
  "PRUNUS UKON": "Ukon Cherry",
  "PRUNUS MUGUS": "Mugus Cherry",
  "PRUNUS SIEBOLDII": "Siebold's Cherry",
  "PRUNUS OJOCHIN": "Ojochin Cherry",
  "PRUNUS VERECUNDA": "Korean Hill Cherry",
  "PRUNUS BRIGANTINA": "Briançon Apricot",
  "PRUNUS HUMILIS": "Chinese Plum",
  "PRUNUS MICROCARPA": "Microcarpa Cherry",
  "PRUNUS DIELSIANA": "Diels Cherry",
  "PRUNUS MAACKII": "Amur Chokecherry",
  "PRUNUS ROYAL BURGUNDY": "Royal Burgundy Cherry",
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
  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP" && upper !== "PRUNUS SP." && upper !== "PRUNUS SPECIES") {
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

    "PRUNUS HOKUSAI",
    "PRUNUS CORNUTA",
    "PRUNUS SATO-ZAKURA",
    "PRUNUS INCAM",
    "PRUNUS CHOSHU-HIZAKURA",
    "PRUNUS OSHOKUN",
    "PRUNUS UKON",
    "PRUNUS MUGUS",
    "PRUNUS SIEBOLDII",
    "PRUNUS OJOCHIN",
    "PRUNUS VERECUNDA",
    "PRUNUS MICROCARPA",
    "PRUNUS DIELSIANA",
    "PRUNUS MAACKII",
    "PRUNUS ROYAL BURGUNDY",
    "PRUNUS AVIUM",
    "PRUNUS CERASUS",
    "PRUNUS SEROTINA",
    "PRUNUS VIRGINIANA",
    "PRUNUS PADUS",
    "PRUNUS EMARGINATA",
    "PRUNUS TOMENTOSA",
    "PRUNUS JAPONICA",
    "PRUNUS YEODENSIS",
  ];
  let upperSci = sci.replace(/\s+/g, " ").replace(/[`'"]/g, "");
  upperSci = upperSci.replace(/^PRUNUS X /, "PRUNUS ");
  upperSci = upperSci.replace(/SHIRO -FUGEN/, "SHIRO-FUGEN");
  const matched = CHERRY_PREFIXES.some((prefix) => upperSci.startsWith(prefix) || upperSci.includes(prefix.replace("PRUNUS ", "")));
  const NON_CHERRY_PRUNUS = [
    "PRUNUS LAUROCERASUS",
    "PRUNUS LUSITANICA",
    "PRUNUS ARMENIACA",
    "PRUNUS DOMESTICA",
    "PRUNUS CERASIFERA",
    "PRUNUS PERSICA",
    "PRUNUS CAROLINIANA",
    "PRUNUS DULCIS",
    "PRUNUS AMYGDALUS",
    "PRUNUS BLIREIANA",
    "PRUNUS BLIREANA",
    "PRUNUS BILREIANA",
    "PRUNUS AMERICANA",
    "PRUNUS SALICINA",
    "PRUNUS CERRASIFERA",
    "PRUNUS GLANDULOSA",
    "PRUNUS BRIGANTINA",
    "PRUNUS HUMILIS",
    "PRUNUS TRILOBA",
    "PRUNUS ILICIFOLIA",
    "PRUNUS NEWPORT",
    "PRUNUS SUBCORDATA"
  ];
  if (!matched && upperSci.startsWith("PRUNUS") && upperSci !== "PRUNUS" && upperSci !== "PRUNUS SP" && upperSci !== "PRUNUS SP." && upperSci !== "PRUNUS SPECIES") {
    const isKnownNonCherry = NON_CHERRY_PRUNUS.some((prefix) => upperSci.startsWith(prefix) || upperSci.includes(prefix.replace("PRUNUS ", "")));
    if (!isKnownNonCherry) {
      warnOnce(`[isFloweringCherry] Prunus variety not in CHERRY_PREFIXES (might be correct if not a cherry): ${scientific}`);
    }
  }
  return matched;
}
export const BLOOMING_PERIODS = {
  // Zone 9a Jan - Apr
  "PRUNUS MUME": "early",
  "PRUNUS CAMPANULATA": "early",
  "PRUNUS CERASIFERA": "early",
  "PRUNUS X OKAME": "early",
  "PRUNUS OKAME": "early",
  "PRUNUS INCAM": "early",
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
  "PRUNUS SARGENTII": "early",
  "PRUNUS GLANDULOSA": "early",
  "PRUNUS INCISA": "early",
  "PRUNUS TRILOBA": "early",
  "PRUNUS SNOW GOOSE": "early",
  "PRUNUS AMYGDALUS": "early",
  "PRUNUS BILREIANA": "early",
  "PRUNUS CERRASIFERA": "early",
  "PRUNUS MUGUS": "early",
  "PRUNUS DIELSIANA": "early",
  "PRUNUS SUBCORDATA": "early",
  // Zone 9a Mar - May
  "PRUNUS SPECIOSA": "mid",
  "PRUNUS NIPPONICA": "mid",
  "PRUNUS JAMASAKURA": "mid",
  "PRUNUS PERSICA": "mid",
  "PRUNUS AVIUM": "mid",
  "PRUNUS CERASUS": "mid",
  "PRUNUS AMANOGAWA": "mid",
  "PRUNUS SPIRE": "mid",
  "PRUNUS CASCADE SNOW": "mid",
  "PRUNUS SNOW FOUNTAIN": "mid",
  "PRUNUS DREAM CATCHER": "mid",
  "PRUNUS JAPONICA": "mid",
  "PRUNUS JUDDII": "mid",
  "PRUNUS NEWPORT": "mid",
  "PRUNUS BENI-TAMANISHIKI": "mid",
  "PRUNUS AMERICANA": "mid",
  "PRUNUS SERRULA": "mid",
  "PRUNUS DOMESTICA": "mid",
  "PRUNUS PUGETENSIS": "mid",
  "PRUNUS YEODENSIS": "mid",
  "PRUNUS YEDEOENSIS": "mid", // maybe early
  "PRUNUS SHIROTAE": "mid",
  "PRUNUS SEROTINA": "mid",
  "PRUNUS PADUS": "mid",
  "PRUNUS LAUROCERASUS": "mid",
  "PRUNUS ILICIFOLIA": "mid",
  "PRUNUS HOKUSAI": "mid",
  "PRUNUS SATO-ZAKURA": "mid",
  "PRUNUS CHOSHU-HIZAKURA": "mid",
  "PRUNUS OSHOKUN": "mid",
  "PRUNUS UKON": "mid",
  "PRUNUS SIEBOLDII": "mid",
  "PRUNUS OJOCHIN": "mid",
  "PRUNUS VERECUNDA": "mid",
  "PRUNUS BRIGANTINA": "mid",
  "PRUNUS HUMILIS": "mid",
  "PRUNUS MICROCARPA": "mid",
  "PRUNUS MAACKII": "mid",
  // Zone 9a Apr - June
  "PRUNUS SHIRO-FUGEN": "late",
  "PRUNUS SHOGETSU": "late",
  "PRUNUS VIRGINIANA": "late",
  "PRUNUS EMARGINATA": "late",
  "PRUNUS LUSITANICA": "late",
  "PRUNUS CORNUTA": "late",
  "PRUNUS SERRULATA": "late",
  "PRUNUS ROYAL BURGUNDY": "late",
  "PRUNUS KWANZAN": "late",
  "PRUNUS SEKIYAMA": "late",
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
  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP" && upper !== "PRUNUS SP." && upper !== "PRUNUS SPECIES") {
    warnOnce(`[getBloomingPeriod] Unmatched Prunus variety: ${scientific}`);
  }
  return null;
}
