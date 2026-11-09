/**
 * Generic GSC pull script (Node ESM).
 * Placeholders to fill: {GSC_PROPERTY}, {KEY_FILE_ENV}, {OUTPUT_DIR}.
 * Usage: node gsc_pull_template.mjs
 */
import { google } from "googleapis";
import fs from "node:fs";
import path from "node:path";

const PROPERTY = process.env.GSC_PROPERTY || "{GSC_PROPERTY}"; // e.g. sc-domain:example.com or https://example.com/
const KEY_FILE = process.env.GSC_SERVICE_ACCOUNT || path.resolve(process.env.KEY_FILE_ENV || "./service-account.json");
const OUT_DIR = process.env.GSC_OUT_DIR || "{OUTPUT_DIR}";
const DAYS = parseInt(process.env.GSC_DAYS || "7", 10);

const auth = new google.auth.JWT({
  keyFile: KEY_FILE,
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

const webmasters = google.webmasters({ version: "v3", auth });

async function main() {
  const sites = await webmasters.sites.list();
  console.log("Sites:", sites.data.siteEntry?.map((s) => s.siteUrl).join(", "));

  const end = new Date();
  const start = new Date(end.getTime() - DAYS * 86400000);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const res = await webmasters.searchanalytics.query({
    siteUrl: PROPERTY,
    requestBody: {
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions: ["query", "page"],
      rowLimit: 250,
      type: "web",
    },
  });

  const rows = res.data.rows || [];
  console.log(`Rows: ${rows.length}`);
  if (rows.length === 0) return; // empty is ok - log, do not fail

  const lines = ["date,keyword,page,clicks,impressions,ctr,position"];
  let d = new Date(start);
  while (d <= end) {
    for (const r of rows) {
      const [keyword, page] = r.keys || ["", ""];
      lines.push([fmt(d), `"${keyword.replaceAll('"', '""')}"`, page, r.clicks, r.impressions, (r.ctr || 0).toFixed(4), (r.position || 0).toFixed(1)].join(","));
    }
    d.setDate(d.getDate() + 1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `gsc_export_${fmt(end)}.csv`);
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log("Wrote", out);
}

main().catch((err) => {
  console.error("GSC pull failed:", err.message);
  process.exit(1);
});
