import { supabase } from "@/integrations/supabase/client";
import { fetchAliasMap, type AliasMapping } from "@/lib/estateMetaApi";

export interface OrderRecord {
  包裝備註: string;
  款式: string;
  "門/窗": string;
  框色: string;
  網材: string;
  位置: string;
  "寬(mm)": number;
  "高(mm)": number;
  "單拉/對拉": string;
  "內安/外安": string;
  "四框/三框": string;
}

// Map DB row back to the OrderRecord interface used everywhere in the frontend
function mapRowToOrder(row: Record<string, unknown>): OrderRecord {
  return {
    包裝備註: (row.package_note as string) || "",
    款式: (row.model as string) || "",
    "門/窗": (row.door_window as string) || "",
    框色: (row.frame_color as string) || "",
    網材: (row.fabric_color as string) || "",
    位置: (row.location as string) || "",
    "寬(mm)": (row.width_mm as number) || 0,
    "高(mm)": (row.height_mm as number) || 0,
    "單拉/對拉": (row.pull_type as string) || "",
    "內安/外安": (row.install_type as string) || "",
    "四框/三框": (row.frame_type as string) || "",
  };
}

// Cache alias map from Google Sheets (異常屋苑名稱正確歸類)
let aliasCache: { data: AliasMapping[] | null; fetchedAt: number } = {
  data: null,
  fetchedAt: 0,
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getCachedAliasMap(): Promise<AliasMapping[]> {
  if (aliasCache.data && Date.now() - aliasCache.fetchedAt < CACHE_TTL) {
    return aliasCache.data;
  }
  try {
    const data = await fetchAliasMap();
    aliasCache = { data, fetchedAt: Date.now() };
    return data;
  } catch {
    return aliasCache.data || [];
  }
}

// Expand search terms using 異常屋苑名稱正確歸類 from Google Sheets
async function getExpandedSearchTerms(normalizedTerm: string): Promise<string[]> {
  const terms = [normalizedTerm];

  const aliasMap = await getCachedAliasMap();

  for (const { estateName, correctClassification } of aliasMap) {
    if (!correctClassification) continue;

    const normEstate = estateName.toLowerCase().replace(/\s/g, "");
    const normClassification = correctClassification.toLowerCase().replace(/\s/g, "");

    // Search matches the correct classification → also search the estate name
    if (
      normClassification.includes(normalizedTerm) ||
      normalizedTerm.includes(normClassification)
    ) {
      if (!terms.includes(normEstate)) {
        terms.push(normEstate);
      }
    }

    // Search matches the estate name → also search the correct classification
    if (
      normEstate.includes(normalizedTerm) ||
      normalizedTerm.includes(normEstate)
    ) {
      if (!terms.includes(normClassification)) {
        terms.push(normClassification);
      }
    }
  }

  return terms;
}

export async function fetchOrders(search?: string, signal?: AbortSignal): Promise<OrderRecord[]> {
  if (!search) {
    return [];
  }

  const baseTerm = search.replace(/\s/g, "").toLowerCase();

  // Expand search with 異常屋苑名稱正確歸類
  const searchTerms = await getExpandedSearchTerms(baseTerm);

  // Build OR filter for all terms – include both space-stripped AND original forms
  const patterns = new Set<string>();
  for (const t of searchTerms) {
    patterns.add(t); // space-stripped version
  }
  // Also add the original search term (lowercased, spaces preserved) so that
  // e.g. "Park YOHO" matches package_notes containing "Park YOHO" with spaces.
  const originalLower = search.trim().toLowerCase();
  if (originalLower && !patterns.has(originalLower)) {
    patterns.add(originalLower);
  }

  const orFilter = Array.from(patterns)
    .map((t) => `package_note.ilike.%${t}%`)
    .join(",");

  // Fetch all matching rows (bypass 1000-row default limit)
  const allRows: Record<string, unknown>[] = [];
  const pageSize = 1000;
  let from = 0;
  let keepGoing = true;

  while (keepGoing) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const { data, error } = await supabase
      .from("orders")
      .select("package_note, model, door_window, frame_color, fabric_color, location, width_mm, height_mm, pull_type, install_type, frame_type")
      .or(orFilter)
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`查詢失敗: ${error.message}`);
    if (data) allRows.push(...data);
    keepGoing = (data?.length ?? 0) === pageSize;
    from += pageSize;
  }

  return allRows.map(mapRowToOrder);
}

export function groupByEstate(orders: OrderRecord[]): Map<string, OrderRecord[]> {
  const map = new Map<string, OrderRecord[]>();
  const canonMap = new Map<string, string>();
  for (const order of orders) {
    const estate = extractEstateName(order.包裝備註);
    const key = estate.toLowerCase();
    if (!canonMap.has(key)) {
      canonMap.set(key, estate);
      map.set(estate, []);
    }
    const canonical = canonMap.get(key)!;
    map.get(canonical)!.push(order);
  }
  return map;
}

export function extractEstateName(note: string): string {
  const match = note.match(/^([^\d-]+)/);
  return match ? match[1].trim() : note;
}
