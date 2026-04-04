export const SOURCES = [
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
    base: "https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SPR_Tree_View_OD/FeatureServer/0",
  },
  {
    id: "ufs",
    label: "SPR Food Systems",
    color: "#e67e22",
    base: "https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SPR_Urban_Food_Systems_Fruit_Trees_OD/FeatureServer/0",
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
  const upper = scientific.trim().toUpperCase();
  for (const prefix of FLOWER_COLOR_KEYS) {
    if (upper.startsWith(prefix)) return FLOWER_COLORS[prefix];
  }
  return null;
}

export function formatSciLabel(sci) {
  if (!sci) return "Other Prunus";
  const parts = sci.split(" ");
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
  ];
  return CHERRY_PREFIXES.some((prefix) => sci.startsWith(prefix));
}
