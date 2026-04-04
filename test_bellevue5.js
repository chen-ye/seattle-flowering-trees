async function run() {
  const url = "https://gis-web.bellevuewa.gov/gisext/rest/services/Parks/StreetTrees/MapServer/0/query";
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    returnGeometry: "false",
    f: "json",
    resultRecordCount: 2000
  });
  const res = await fetch(`${url}?${params}`);
  const data = await res.json();
  const prunus = data.features?.filter(f => f.attributes.SpeciesDesc?.toLowerCase().includes('prunus'));
  console.log("Found Prunus:", prunus?.length);
  if (prunus?.length) console.log(JSON.stringify(prunus.slice(0,5), null, 2));
}
run();
