const fs = require('fs');

let content = fs.readFileSync('src/constants.js', 'utf8');

const bellevueSource = `
  {
    id: "bellevue",
    label: "Bellevue",
    color: "#f39c12",
    base: "https://gis-web.bellevuewa.gov/gisext/rest/services/Parks/StreetTrees/MapServer/0",
    combinedField: "SpeciesDesc",
    condField: "TreeStatus",
    extractSpecies: (desc) => {
      let sci = desc;
      let com = "";
      if (desc.includes("(")) {
        const parts = desc.split("(");
        sci = parts[0].trim();
        com = parts[1].replace(")", "").trim();
      }
      if (sci.includes(" - ")) {
        sci = sci.split(" - ")[0].trim();
      }
      return { sci, com };
    }
  },`;

content = content.replace(/export const SOURCES = \[/, `export const SOURCES = [${bellevueSource}`);

fs.writeFileSync('src/constants.js', content);
