const mod = await import("./src/services/templates/nextjs/blog.ts");
const f = mod.default.files.find(x => x.path === "lib/router.js");
const lines = f.content.split("\n");
lines.forEach((l,i) => { if (/return\s*\(|<[a-z]|<[A-Z]/.test(l) && /</.test(l)) console.log((i+1)+": "+l); });
