const speciesDesc = [
  "Acer rubrum - Red Sunset (Red Sunset maple)",
  "Prunus serrulata - Kwanzan Cherry (Kwanzan cherry)",
  "Prunus cerasifera - Newport (Newport flowering plum)",
  "Unknown species",
  "Prunus (cherry/plum)",
  "Prunus yedoensis (Yoshino cherry)"
];

for (const desc of speciesDesc) {
  let sci = desc;
  let com = "";

  if (desc.includes("(")) {
    const parts = desc.split("(");
    sci = parts[0].trim();
    com = parts[1].replace(")", "").trim();
  }

  // Clean up scientific name if it has a hyphen (variety)
  if (sci.includes(" - ")) {
     sci = sci.split(" - ")[0].trim();
  }

  console.log(`Desc: ${desc}\n  Sci: ${sci}\n  Com: ${com}\n`);
}
