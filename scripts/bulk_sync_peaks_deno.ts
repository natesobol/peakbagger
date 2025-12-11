// Pure-Deno bulk sync script using Supabase PostgREST endpoints (no supabase-js).
// Usage (PowerShell):
// $env:SUPABASE_URL='https://<project>.supabase.co'; $env:SUPABASE_SERVICE_ROLE_KEY='<KEY>'
// deno run --allow-net --allow-env scripts/bulk_sync_peaks_deno.ts

const DATA_URLS: Record<string, string> = {
  "nh-48":               "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/nh48.json",
  "adk-46":              "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/ADK46.json",
  "az-2020-peaks":       "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/AZ2020Peaks.json",
  "ca-14ers":            "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/CA14ers.json",
  "co-14ers":            "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/CO14.json",
  "catskill-3500":       "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/Catskill3500.json",
  "colorado-centennials":"https://raw.githubusercontent.com/natesobol/nh48-api/main/data/ColoradoCentennials.json",
  "me-4000":             "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/ME4000.json",
  "montana-53":          "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/Montana53.json",
  "ne-115":              "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/NE115.json",
  "ne-67":               "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/NE67.json",
  "nh-200":              "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/NH200.json",
  "nh-300":              "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/NH300.json",
  "nh-500":              "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/NH500.json",
  "nh-52wav":            "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/NH52WAV.json",
  "southern-sixers":     "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/SouthernSixers.json",
  "us-state-highpoints": "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/USStateHighpoints.json",
  "ultras":              "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/Ultras.json",
  "vt-4000":             "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/VT4000.json",
  "wa-bulgers":          "https://raw.githubusercontent.com/natesobol/nh48-api/main/data/WABulgers.json",
};

const LIST_NAMES: Record<string, string> = {
  "nh-48":               "NH 48",
  "adk-46":              "ADK 46",
  "az-2020-peaks":       "AZ 2020 Peaks",
  "ca-14ers":            "CA 14ers",
  "co-14ers":            "CO 14ers",
  "catskill-3500":       "Catskill 3500",
  "colorado-centennials":"Colorado Centennials",
  "me-4000":             "ME 4000",
  "montana-53":          "Montana 53",
  "ne-115":              "NE 115",
  "ne-67":               "NE 67",
  "nh-200":              "NH 200",
  "nh-300":              "NH 300",
  "nh-500":              "NH 500",
  "nh-52wav":            "NH 52 WAV",
  "southern-sixers":     "Southern Sixers",
  "us-state-highpoints": "US State Highpoints",
  "ultras":              "Ultras",
  "vt-4000":             "VT 4000",
  "wa-bulgers":          "WA Bulgers",
};

function parseFeet(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (raw == null) return null;
  const digits = String(raw).match(/\d+/g);
  if (!digits) return null;
  const n = Number.parseInt(digits.join(""), 10);
  return Number.isNaN(n) ? null : n;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  Deno.exit(1);
}

const headersBase = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function upsertRow(table: string, body: unknown, on_conflict?: string) {
  const qs = on_conflict ? `?on_conflict=${encodeURIComponent(on_conflict)}` : "";
  const url = `${SUPABASE_URL}/rest/v1/${table}${qs}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      ...headersBase,
      // Ask PostgREST to merge duplicates on conflict and return representation
      "Prefer": "return=representation,resolution=merge-duplicates",
    },
    body: Array.isArray(body) ? JSON.stringify(body) : JSON.stringify([body]),
  });
  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!resp.ok) {
    return { error: { status: resp.status, body: data } };
  }
  // PostgREST returns an array of rows when return=representation is used
  return { data };
}

async function main() {
  const slugs = Object.keys(DATA_URLS);
  for (const listSlug of slugs) {
    console.log(`=== Syncing ${listSlug}`);
    const dataUrl = DATA_URLS[listSlug];
    const r = await fetch(dataUrl);
    if (!r.ok) { console.error(`Failed fetching ${dataUrl}: ${r.status}`); continue; }
    const json = await r.json() as Record<string, any>;

    // Upsert list
    const { data: listData, error: listErr } = await upsertRow("lists", { slug: listSlug, name: LIST_NAMES[listSlug] }, "slug");
    if (listErr) { console.error("List upsert failed:", listErr); continue; }
    const list = Array.isArray(listData) ? listData[0] : listData[0];
    if (!list || !list.id) { console.error("List upsert returned no id for", listSlug); continue; }

    let peakCount = 0;
    for (const [slug, peak] of Object.entries(json)) {
      const name       = peak.peakName || peak["Peak Name"] || slug;
      const elevation  = parseFeet(peak["Elevation (ft)"]);
      const prominence = parseFeet(peak["Prominence (ft)"]);
      const range      = peak["Range / Subrange"] ?? null;
      const coords     = peak["Coordinates"] ?? null;

      const knownKeys = new Set([
        "peakName", "Peak Name", "slug",
        "Elevation (ft)", "Prominence (ft)",
        "Range / Subrange", "Coordinates",
        "photos",
      ]);
      const metadata: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(peak)) {
        if (!knownKeys.has(k)) metadata[k] = v;
      }

      const peakBody = { slug, name, elevation_ft: elevation, prominence_ft: prominence, range, coords_text: coords, metadata };
      const { data: peakData, error: peakErr } = await upsertRow("peaks", peakBody, "slug");
      if (peakErr) { console.error(`Peak upsert failed for ${slug}:`, peakErr); continue; }
      const peakRow = Array.isArray(peakData) ? peakData[0] : peakData[0];
      if (!peakRow || !peakRow.id) { console.error(`Peak upsert returned no id for ${slug}`); continue; }

      // Link in list_peaks, assuming a unique constraint exists on (list_id, peak_id)
      const lpBody = { list_id: list.id, peak_id: peakRow.id };
      const { data: lpData, error: lpErr } = await upsertRow("list_peaks", lpBody, "list_id,peak_id");
      if (lpErr) { console.error(`list_peaks upsert failed for ${slug}:`, lpErr); continue; }

      peakCount += 1;

      // Small delay to be gentle with API
      await new Promise((res) => setTimeout(res, 50));
    }

    console.log(`Synced ${listSlug}: ${peakCount} peaks`);
  }
}

main().then(() => console.log("Done")).catch((err) => { console.error(err); Deno.exit(1); });
