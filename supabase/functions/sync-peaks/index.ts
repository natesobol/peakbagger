import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Map list slugs to raw GitHub JSON files (all in `data/` folder).
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

// Human-friendly names for the lists above.
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

// Safely parse elevation / prominence that might be strings with extra junk.
function parseFeet(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (raw == null) return null;
  const digits = String(raw).match(/\d+/g);
  if (!digits) return null;
  const n = Number.parseInt(digits.join(""), 10);
  return Number.isNaN(n) ? null : n;
}

serve(async (req) => {
  try {
    const url      = new URL(req.url);
    const listSlug = url.searchParams.get("list") ?? "";
    const dataUrl  = DATA_URLS[listSlug];
    if (!dataUrl) {
      return new Response(`Unknown list: ${listSlug}`, { status: 400 });
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });

    // 1) Fetch JSON from GitHub
    const resp = await fetch(dataUrl);
    if (!resp.ok) {
      return new Response(`Failed to fetch data: ${resp.statusText}`, { status: 500 });
    }
    const jsonData = await resp.json() as Record<string, any>;

    // 2) Upsert the list
    const { data: list, error: listErr } = await supabase.from("lists")
      .upsert(
        { slug: listSlug, name: LIST_NAMES[listSlug] },
        { onConflict: "slug", returning: "representation" },
      )
      .single();
    if (listErr) {
      console.error("List upsert error:", listErr);
      return new Response(`List upsert error: ${listErr.message}`, { status: 500 });
    }
    if (!list) {
      console.error("List upsert returned no data for slug:", listSlug);
      return new Response(`List upsert returned no data for slug: ${listSlug}`, { status: 500 });
    }

    // 3) For each peak in the JSON: upsert into peaks, then link in list_peaks
    let peakCount = 0;
    for (const [slug, peak] of Object.entries(jsonData)) {
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

      const { data: peakRow, error: peakErr } = await supabase.from("peaks")
        .upsert(
          {
            slug,
            name,
            elevation_ft: elevation,
            prominence_ft: prominence,
            range,
            coords_text: coords,    // matches your peaks table
            metadata,
          },
          { onConflict: "slug", returning: "representation" },
        )
        .single();
      if (peakErr) {
        console.error(`Peak upsert failed for slug=${slug}:`, peakErr);
        continue; // skip linking if peak insert failed
      }
      if (!peakRow) {
        console.error(`Peak upsert returned no data for slug=${slug}`);
        continue;
      }

      const { error: lpErr } = await supabase.from("list_peaks")
        .upsert(
          { list_id: list.id, peak_id: peakRow.id },
          { onConflict: "list_id,peak_id" },
        );
      if (lpErr) {
        console.error(`list_peaks upsert failed for slug=${slug}:`, lpErr);
        continue;
      }

      peakCount += 1;
    }

    return new Response(`List ${listSlug} synced (${peakCount} peaks)`, { status: 200 });
  } catch (err) {
    console.error("Unhandled error in sync-peaks:", err);
    return new Response("Internal error in sync-peaks", { status: 500 });
  }
});
