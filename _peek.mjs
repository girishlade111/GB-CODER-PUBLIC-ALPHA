const mod = await import("./src/services/templates/react/dashboard.ts");
const f = mod.default.files.find(x => x.path === "data/mockData.js");
for (const name of ["REVENUE", "DAILY"]) {
  const m = f.content.match(new RegExp("export const " + name + "[^=]*=\\s*\\[[\\s\\S]*?\\n\\];"));
  if (!m) { console.log(name + ": NOT FOUND"); continue; }
  const body = m[0];
  const bad = body.match(/[^0-9,\-\.\s\[\]{}a-zA-Z_'":$]/g);
  console.log("--- " + name + " length=" + body.length + " suspicious chars: " + JSON.stringify([...new Set(bad||[])]));
  console.log(body.slice(0, 420).replace(/\n\s*/g, " "));
  console.log("");
}
