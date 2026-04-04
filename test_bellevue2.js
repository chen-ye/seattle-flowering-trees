async function run() {
  const url = "https://gis-web.bellevuewa.gov/gisext/rest/services/Parks/StreetTrees/MapServer/0/query";
  const params = new URLSearchParams({
    where: "UPPER(SpeciesDesc) LIKE '%PRUNUS%'",
    outFields: "SpeciesDesc",
    returnGeometry: "false",
    f: "json",
    resultRecordCount: 10
  });
  const res = await fetch(`${url}?${params}`);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
