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
  if (!search) {
    return [];
  }

  const term = search.replace(/\s/g, "");
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
      .ilike("package_note", `%${term}%`)
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
