import { OrderRecord } from "./api";

// ===== 標準尺寸定義 =====
const STANDARD_SIZES = {
  門: { height: 2400, width: 1100 },
  窗N: { height: 1600, width: 650 },  // 新式私樓（有露台）
  窗O: { height: 1100, width: 650 },  // 舊式私樓/公屋/居屋
};

// ===== 包裝備註解析 =====
export interface ParsedNote {
  estate: string;   // 屋苑名
  block: string;    // 座數
  unit: string;     // 室號
  installDate: string; // 安裝日期 e.g. "0414" → "4月14日"
  raw: string;
}

export function parsePackageNote(note: string): ParsedNote {
  const raw = note || "";
  // Extract estate name (before any digits/hyphens)
  const estateMatch = raw.match(/^([^\d\-]+)/);
  const estate = estateMatch ? estateMatch[1].trim() : raw;

  // Try to extract block/unit/date from remaining
  const remaining = raw.slice(estate.length).trim();
  const parts = remaining.split(/[-\s]+/).filter(Boolean);

  return {
    estate,
    block: parts[0] || "",
    unit: parts[1] || "",
    installDate: parts[parts.length - 1] || "",
    raw,
  };
}

// ===== 位置解析 =====
export function parseLocation(loc: string): string {
  if (!loc) return "未知";
  const first = loc.charAt(0).toUpperCase();
  const map: Record<string, string> = {
    L: "客廳",
    T: "廁所",
    K: "廚房",
    R: "房間",
  };
  return map[first] || loc;
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
  if (f.includes("pvc") || f.includes("寵物") || f.includes("防抓") || f.includes("防貓")) return "寵物網(PVC)";
  if (f.includes("48") || f.includes("4k") || f.includes("高清")) return "48目功能網";
  return "標配玻纖網";
}

// ===== 特別顏色判斷 =====
const SPECIAL_COLORS = ["星際黑", "星河咖", "月光灰絲", "星空灰絲", "鉑灰絲"];
export function isSpecialColor(color: string): boolean {
  if (!color) return false;
  return SPECIAL_COLORS.some((sc) => color.includes(sc));
}

// ===== 超標尺寸分析 =====
export interface SizeExceedance {
  label: string;        // e.g. "超高20cm", "超高40cm"
  count: number;
  percentage: number;
}

export interface SizeAnalysis {
  total: number;
  withinStandard: number;
  withinStandardPct: number;
  exceedHeight: SizeExceedance[];
  exceedWidth: SizeExceedance[];
}

function analyzeSizeExceedance(
  orders: OrderRecord[],
  standardHeight: number,
  standardWidth: number
): SizeAnalysis {
  const total = orders.length;
  if (total === 0) return { total: 0, withinStandard: 0, withinStandardPct: 0, exceedHeight: [], exceedWidth: [] };

  const heightBuckets = new Map<number, number>(); // increments of 20cm over
  const widthBuckets = new Map<number, number>();
  let withinStandard = 0;

  for (const o of orders) {
    const h = o["高(mm)"] || 0;
    const w = o["寬(mm)"] || 0;
    const overH = Math.max(0, h - standardHeight);
    const overW = Math.max(0, w - standardWidth);

    if (overH <= 0 && overW <= 0) {
      withinStandard++;
    }

    if (overH > 0) {
      const bucket = Math.ceil(overH / 200); // every 20cm = 200mm
      heightBuckets.set(bucket, (heightBuckets.get(bucket) || 0) + 1);
    }
    if (overW > 0) {
      const bucket = Math.ceil(overW / 200);
      widthBuckets.set(bucket, (widthBuckets.get(bucket) || 0) + 1);
    }
  }

  const toExceedance = (buckets: Map<number, number>, prefix: string): SizeExceedance[] =>
    Array.from(buckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([bucket, count]) => ({
        label: `${prefix}${bucket * 20}cm`,
        count,
        percentage: Math.round((count / total) * 100),
      }));

  return {
    total,
    withinStandard,
    withinStandardPct: Math.round((withinStandard / total) * 100),
    exceedHeight: toExceedance(heightBuckets, "超高"),
    exceedWidth: toExceedance(widthBuckets, "超闊"),
  };
}

// ===== 百分比分佈計算 =====
export interface Distribution {
  label: string;
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
    .map(([label, count]) => ({
      label,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// ===== 完整屋苑小檔案 =====
export interface EstateProfile {
  estateName: string;
  totalOrders: number;

  // 門窗分類
  doorAnalysis: SizeAnalysis;
  windowAnalysis: SizeAnalysis;

  // 款式分佈
  modelDistribution: Distribution[];

  // 框色分佈
  frameColorDistribution: Distribution[];
  hasSpecialColors: boolean;
  specialColorOrders: number;

  // 網材分佈
  fabricDistribution: Distribution[];

  // 單拉/對拉
  pullTypeDistribution: Distribution[];

  // 內安/外安
  installTypeDistribution: Distribution[];

  // 位置分佈
  locationDistribution: Distribution[];

  // 警告提醒
  alerts: AlertItem[];
}

export interface AlertItem {
  level: "red" | "yellow" | "green";
  message: string;
}

export function generateEstateProfile(
  estateName: string,
  orders: OrderRecord[]
): EstateProfile {
  // Separate doors and windows
  const doors = orders.filter((o) => {
    const t = o["門/窗"] || "";
    return t.includes("門") || t.includes("门");
  });
  const windows = orders.filter((o) => {
    const t = o["門/窗"] || "";
    return t.includes("窗");
  });

  // Size analysis - use N standard for windows (1600mm height) as default
  // This is conservative; O type (1100mm) would flag more
  const doorAnalysis = analyzeSizeExceedance(doors, STANDARD_SIZES.門.height, STANDARD_SIZES.門.width);
  const windowAnalysis = analyzeSizeExceedance(windows, STANDARD_SIZES.窗N.height, STANDARD_SIZES.窗N.width);

  // Model distribution (simplified)
  const modelDistribution = getDistribution(orders.map((o) => simplifyModel(o.款式)));

  // Frame color distribution
  const frameColorDistribution = getDistribution(orders.map((o) => o.框色 || "未知"));
  const specialColorOrders = orders.filter((o) => isSpecialColor(o.框色)).length;

  // Fabric distribution (classified)
  const fabricDistribution = getDistribution(orders.map((o) => classifyFabric(o.網材)));

  // Pull type
  const pullTypeDistribution = getDistribution(orders.map((o) => o["單拉/對拉"] || "未知"));

  // Install type
  const installTypeDistribution = getDistribution(orders.map((o) => o["內安/外安"] || "未知"));

  // Location
  const locationDistribution = getDistribution(orders.map((o) => parseLocation(o.位置)));

  // Generate alerts
  const alerts: AlertItem[] = [];

  // Door height alerts
  if (doorAnalysis.exceedHeight.length > 0) {
    const totalExceed = doorAnalysis.exceedHeight.reduce((s, e) => s + e.count, 0);
    const pct = Math.round((totalExceed / Math.max(doorAnalysis.total, 1)) * 100);
    alerts.push({
      level: pct > 50 ? "red" : "yellow",
      message: `⚠️ 門超高：${totalExceed}/${doorAnalysis.total} 項 (${pct}%) 超過標準 ${STANDARD_SIZES.門.height}mm`,
    });
  }

  // Door width alerts
  if (doorAnalysis.exceedWidth.length > 0) {
    const totalExceed = doorAnalysis.exceedWidth.reduce((s, e) => s + e.count, 0);
    const pct = Math.round((totalExceed / Math.max(doorAnalysis.total, 1)) * 100);
    alerts.push({
      level: pct > 50 ? "red" : "yellow",
      message: `⚠️ 門超闊：${totalExceed}/${doorAnalysis.total} 項 (${pct}%) 超過標準 ${STANDARD_SIZES.門.width}mm`,
    });
  }

  // Window height alerts
  if (windowAnalysis.exceedHeight.length > 0) {
    const totalExceed = windowAnalysis.exceedHeight.reduce((s, e) => s + e.count, 0);
    const pct = Math.round((totalExceed / Math.max(windowAnalysis.total, 1)) * 100);
    alerts.push({
      level: pct > 50 ? "red" : "yellow",
      message: `⚠️ 窗超高：${totalExceed}/${windowAnalysis.total} 項 (${pct}%) 超過標準 ${STANDARD_SIZES.窗N.height}mm`,
    });
  }

  // Window width alerts
  if (windowAnalysis.exceedWidth.length > 0) {
    const totalExceed = windowAnalysis.exceedWidth.reduce((s, e) => s + e.count, 0);
    const pct = Math.round((totalExceed / Math.max(windowAnalysis.total, 1)) * 100);
    alerts.push({
      level: pct > 50 ? "red" : "yellow",
      message: `⚠️ 窗超闊：${totalExceed}/${windowAnalysis.total} 項 (${pct}%) 超過標準 ${STANDARD_SIZES.窗N.width}mm`,
    });
  }

  // Special color alert
  if (specialColorOrders > 0) {
    alerts.push({
      level: "yellow",
      message: `🎨 特別瓷泳色：${specialColorOrders} 項需額外收費`,
    });
  }

  // No alerts = green
  if (alerts.length === 0) {
    alerts.push({
      level: "green",
      message: "✅ 此屋苑歷史訂單均在標準範圍內",
    });
  }

  return {
    estateName,
    totalOrders: orders.length,
    doorAnalysis,
    windowAnalysis,
    modelDistribution,
    frameColorDistribution,
    hasSpecialColors: specialColorOrders > 0,
    specialColorOrders,
    fabricDistribution,
    pullTypeDistribution,
    installTypeDistribution,
    locationDistribution,
    alerts,
  };
}
