const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8yTdoO6X-QOBEDyA4-2PYh_e_-G4pJsJQOfMnrAY8L0MfTJ_D2t63m1v6qCBo3a6x/exec";

export interface EstateMeta {
  屋苑名稱: string;
  別名: string;
  門窗顏色: string;
  備註: string;
  建立時間: string;
}

// GAS may return English or Chinese keys depending on sheet headers
interface RawMetaRecord {
  [key: string]: string;
}

function normalizeMetaRecord(raw: RawMetaRecord): EstateMeta {
  return {
    屋苑名稱: raw["屋苑名稱"] || raw["estate"] || "",
    別名: raw["別名"] || raw["地區"] || raw["type"] || "",
    門窗顏色: raw["門窗顏色"] || raw["value"] || "",
    備註: raw["備註"] || raw["timestamp"] || "",
    建立時間: raw["建立時間"] || raw["created"] || "",
  };
}

export async function fetchAllEstates(): Promise<string[]> {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set("action", "listEstates");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("無法取得屋苑列表");
  return res.json();
}

export async function fetchEstateMeta(estateName: string): Promise<EstateMeta[]> {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set("action", "getEstateMeta");
  url.searchParams.set("estate", estateName);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("無法取得屋苑備註");
  const raw: RawMetaRecord[] = await res.json();
  return raw.map(normalizeMetaRecord);
}

export async function postEstateMeta(data: {
  estateName: string;
  alias?: string;
  doorWindowColor?: string;
  note?: string;
}): Promise<{ success: boolean }> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      action: "addEstateMeta",
      ...data,
    }),
  });
  if (!res.ok) throw new Error("無法儲存資料");
  return res.json();
}
