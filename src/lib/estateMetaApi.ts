const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8yTdoO6X-QOBEDyA4-2PYh_e_-G4pJsJQOfMnrAY8L0MfTJ_D2t63m1v6qCBo3a6x/exec";

export interface EstateMeta {
  屋苑名稱: string;
  別名: string;
  門窗顏色: string;
  備註: string;
  建立時間: string;
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
  return res.json();
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
