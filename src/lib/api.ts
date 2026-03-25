const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8yTdoO6X-QOBEDyA4-2PYh_e_-G4pJsJQOfMnrAY8L0MfTJ_D2t63m1v6qCBo3a6x/exec";

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

/** Strip all whitespace from a string for fuzzy comparison */
export function stripSpaces(s: string): string {
  return s.replace(/\s+/g, "");
}

export async function fetchOrders(search?: string): Promise<OrderRecord[]> {
  const url = new URL(APPS_SCRIPT_URL);
  if (search) {
    // Send the longest single word to the server for broad matching,
    // then we do precise space-insensitive filtering client-side.
    const words = search.trim().split(/\s+/);
    const longestWord = words.reduce((a, b) => (a.length >= b.length ? a : b), "");
    url.searchParams.set("search", longestWord);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("無法取得資料");
  }
  const allResults: OrderRecord[] = await response.json();

  // Client-side space-insensitive & case-insensitive filter
  if (search) {
    const needle = stripSpaces(search).toLowerCase();
    return allResults.filter((o) =>
      stripSpaces(o.包裝備註 || "").toLowerCase().includes(needle)
    );
  }
  return allResults;
}

export function groupByEstate(orders: OrderRecord[]): Map<string, OrderRecord[]> {
  const map = new Map<string, OrderRecord[]>();
  // Use a lowercase key map to merge case variants under one canonical name
  const canonMap = new Map<string, string>(); // lowercase -> first-seen name
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
  // Extract estate name (before any numbers/unit info)
  const match = note.match(/^([^\d-]+)/);
  return match ? match[1].trim() : note;
}
