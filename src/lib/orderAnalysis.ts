import { OrderRecord } from "./api";

// ===== 標準尺寸定義 =====
const STANDARD_SIZES = {
  門: { height: 2400, width: 1100 },
  窗: { height: 1600, width: 650 },
};

// ===== 位置解析 =====
export function parseLocation(loc: string): string {
  if (!loc) return "未知";
  const first = loc.charAt(0).toUpperCase();
  const map: Record<string, string> = { L: "客廳", T: "廁所", K: "廚房", R: "房間" };
  const label = map[first] || "";
  return label ? `${loc}(${label})` : loc;
}

// ===== 款式簡化 =====
export function simplifyModel(model: string): string {
  if (!model) return "未知";
  const m = model.toLowerCase();
  if (m.includes("回捲") || m.includes("回卷") || m.includes("r2") || m.includes("漢江")) return "回捲式";
  if (m.includes("平趟") || m.includes("平推")) return "平趟式";
  if (m.includes("掩合")) return "掩合式";
  if (m.includes("百摺") || m.includes("百折")) return "百摺式";
  if (m.includes("風琴")) return "風琴式";
  if (m.includes("窗花") || m.includes("ff") || m.includes("fe")) return "透明窗花";
  if (m.includes("h18") || m.includes("三合一")) return "三合一";
  return model;
}

// ===== 網材分類 =====
export function classifyFabric(fabric: string): string {
  if (!fabric) return "標配玻纖網";
  const f = fabric.toLowerCase();
  if (f.includes("pvc") || f.includes("寵物") || f.includes("防抓") || f.includes("防貓")) return "寵物網";
  if (f.includes("48") || f.includes("4k") || f.includes("高清")) return "48目功能網";
  return "標配玻纖網";
}

// ===== 特別顏色判斷 =====
const SPECIAL_COLORS = ["星際黑", "星河咖", "月光灰絲", "星空灰絲", "鉑灰絲"];
export function isSpecialColor(color: string): boolean {
  if (!color) return false;
  return SPECIAL_COLORS.some((sc) => color.includes(sc));
}

// ===== 超標記錄 =====
export interface ExceedRecord {
  位置: string;
  寬: number;
  高: number;
  開向: string;
  安裝: string;
  超高: string; // e.g. "超20cm" or "-"
  超闊: string;
}

// ===== 分佈 =====
export interface Distribution {
  label: string;
  count: number;
  percentage: number;
}

export interface BucketDistribution {
  label: string; // e.g. "標準內", "超20cm", "超40cm"
  count: number;
  percentage: number;
}

function getDistribution(items: string[]): Distribution[] {
  const total = items.length;
  if (total === 0) return [];
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item || "未知";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

function calcBuckets(values: number[], standard: number): BucketDistribution[] {
  const total = values.length;
  if (total === 0) return [];
  const buckets = new Map<string, number>();
  buckets.set("標準內", 0);

  for (const v of values) {
    const over = v - standard;
    if (over <= 0) {
      buckets.set("標準內", (buckets.get("標準內") || 0) + 1);
    } else {
      const steps = Math.ceil(over / 200); // per 20cm = 200mm
      const label = `超${steps * 20}cm`;
      buckets.set(label, (buckets.get(label) || 0) + 1);
    }
  }

  return Array.from(buckets.entries())
    .filter(([, count]) => count > 0)
    .map(([label, count]) => ({ label, count, percentage: Math.round((count / total) * 100) }));
}

// ===== 門/窗分析結果 =====
export interface TypeAnalysis {
  total: number;
  allWithinStandard: boolean;
  exceedRecords: ExceedRecord[];
  heightDistribution: BucketDistribution[];
  widthDistribution: BucketDistribution[];
}

function analyzeType(orders: OrderRecord[], stdH: number, stdW: number): TypeAnalysis {
  const total = orders.length;
  if (total === 0) return { total: 0, allWithinStandard: true, exceedRecords: [], heightDistribution: [], widthDistribution: [] };

  const exceedRecords: ExceedRecord[] = [];
  for (const o of orders) {
    const h = o["高(mm)"] || 0;
    const w = o["寬(mm)"] || 0;
    const overH = h - stdH;
    const overW = w - stdW;
    if (overH > 0 || overW > 0) {
      exceedRecords.push({
        位置: parseLocation(o.位置),
        寬: w,
        高: h,
        開向: o["單拉/對拉"] || "",
        安裝: o["內安/外安"] || "",
        超高: overH > 0 ? `超${Math.ceil(overH / 200) * 20}cm` : "-",
        超闊: overW > 0 ? `超${Math.ceil(overW / 200) * 20}cm` : "-",
      });
    }
  }

  const heights = orders.map((o) => o["高(mm)"] || 0);
  const widths = orders.map((o) => o["寬(mm)"] || 0);
  const heightDist = calcBuckets(heights, stdH);
  const widthDist = calcBuckets(widths, stdW);

  return {
    total,
    allWithinStandard: exceedRecords.length === 0,
    exceedRecords,
    heightDistribution: heightDist,
    widthDistribution: widthDist,
  };
}

// ===== 屋苑小檔案 =====
export interface EstateProfile {
  estateName: string;
  totalOrders: number;
  customerCount: number;

  doorAnalysis: TypeAnalysis;
  windowAnalysis: TypeAnalysis;

  frameColorDistribution: Distribution[];
  fabricDistribution: Distribution[];
  pullTypeDistribution: Distribution[];
  installTypeDistribution: Distribution[];
}

export function extractEstateName(note: string): string {
  const match = (note || "").match(/^([^\d\-]+)/);
  return match ? match[1].trim() : note;
}

export function generateEstateProfile(estateName: string, orders: OrderRecord[]): EstateProfile {
  const doors = orders.filter((o) => {
    const t = o["門/窗"] || "";
    return t.includes("門") || t.includes("门");
  });
  const windows = orders.filter((o) => (o["門/窗"] || "").includes("窗"));

  // Estimate customer count from unique address patterns (block+unit)
  const uniqueAddresses = new Set(orders.map((o) => {
    const note = o.包裝備註 || "";
    // Remove estate name and date, keep block+unit
    const afterEstate = note.replace(extractEstateName(note), "").trim();
    return afterEstate.replace(/\d{4}$/, "").trim();
  }));
  const customerCount = Math.max(1, uniqueAddresses.size);

  const frameColorDist = getDistribution(orders.map((o) => o.框色 || "未知"));
  // Add 標準色/特別色 classification info
  const frameWithClass = frameColorDist.map((d) => ({
    ...d,
    isSpecial: isSpecialColor(d.label),
  }));

  return {
    estateName,
    totalOrders: orders.length,
    customerCount,
    doorAnalysis: analyzeType(doors, STANDARD_SIZES.門.height, STANDARD_SIZES.門.width),
    windowAnalysis: analyzeType(windows, STANDARD_SIZES.窗.height, STANDARD_SIZES.窗.width),
    frameColorDistribution: frameWithClass,
    fabricDistribution: getDistribution(orders.map((o) => classifyFabric(o.網材))),
    pullTypeDistribution: getDistribution(orders.map((o) => o["單拉/對拉"] || "未知")),
    installTypeDistribution: getDistribution(orders.map((o) => o["內安/外安"] || "未知")),
  };
}
