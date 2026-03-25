import { supabase } from "@/integrations/supabase/client";

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

export async function fetchOrders(search?: string, signal?: AbortSignal): Promise<OrderRecord[]> {
  let query = supabase.from("orders").select("package_note, model, door_window, frame_color, fabric_color, location, width_mm, height_mm, pull_type, install_type, frame_type");

  if (search) {
    const term = search.replace(/\s/g, "");
    // Search in package_note which contains the estate/building info
    query = query.ilike("package_note", `%${term}%`);
  }

  // Handle abort signal
  if (signal) {
    signal.addEventListener("abort", () => {
      // supabase-js doesn't natively support abort, but we can still throw
    });
  }

  const { data, error } = await query;

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  if (error) {
    throw new Error(`查詢失敗: ${error.message}`);
  }

  return (data || []).map(mapRowToOrder);
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
