import { OrderRecord } from "./api";
import { generateEstateProfile } from "./orderAnalysis";

export function exportEstateAsPDF(estateName: string, orders: OrderRecord[]) {
  const profile = generateEstateProfile(estateName, orders);

  const alertsHtml = profile.alerts
    .map((a) => {
      const bg = a.level === "red" ? "#fef2f2" : a.level === "yellow" ? "#fefce8" : "#f0fdf4";
      const color = a.level === "red" ? "#dc2626" : a.level === "yellow" ? "#a16207" : "#15803d";
      return `<div style="background:${bg};color:${color};padding:8px 12px;border-radius:6px;margin-bottom:4px;font-size:13px;">${a.message}</div>`;
    })
    .join("");

  const distRow = (label: string, items: { label: string; percentage: number }[]) => {
    if (items.length === 0) return "";
    const badges = items
      .map((i) => `<span style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:11px;margin-right:4px;">${i.label} ${i.percentage}%</span>`)
      .join("");
    return `<tr><td style="color:#666;width:60px;vertical-align:top;padding:4px 0;">${label}</td><td style="padding:4px 0;">${badges}</td></tr>`;
  };

  const exceedBadges = (analysis: typeof profile.doorAnalysis, label: string) => {
    if (analysis.exceedHeight.length === 0 && analysis.exceedWidth.length === 0) return "";
    const badges = [
      `<span style="background:#f0fdf4;color:#15803d;padding:2px 8px;border-radius:4px;font-size:11px;">標準內 ${analysis.withinStandardPct}%</span>`,
      ...analysis.exceedHeight.map((e) => `<span style="background:#fff7ed;color:#c2410c;padding:2px 8px;border-radius:4px;font-size:11px;">${e.label} ${e.percentage}% (${e.count})</span>`),
      ...analysis.exceedWidth.map((e) => `<span style="background:#fef2f2;color:#dc2626;padding:2px 8px;border-radius:4px;font-size:11px;">${e.label} ${e.percentage}% (${e.count})</span>`),
    ].join(" ");
    return `<div style="margin-bottom:8px;"><strong style="font-size:12px;">${label}：</strong>${badges}</div>`;
  };

  const rows = orders
    .map(
      (o) => `<tr>
        <td>${o.包裝備註}</td>
        <td>${o["門/窗"]}</td>
        <td style="text-align:right">${o["寬(mm)"]}</td>
        <td style="text-align:right">${o["高(mm)"]}</td>
        <td>${o["單拉/對拉"]}</td>
        <td>${o["內安/外安"]}</td>
        <td>${o.框色}</td>
        <td>${o.網材}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <title>${estateName} - 屋苑小檔案</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans TC', sans-serif; padding: 30px; color: #1a1a2e; font-size: 13px; }
    h1 { font-size: 22px; margin-bottom: 2px; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 16px; }
    .section { margin-bottom: 16px; }
    .section-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #1e3a5f; padding-bottom: 4px; }
    .stats { display: flex; gap: 16px; margin-bottom: 12px; }
    .stat-box { background: #f8f9fa; border-radius: 8px; padding: 10px 16px; flex: 1; }
    .stat-box .num { font-size: 24px; font-weight: 700; }
    .stat-box .label { font-size: 11px; color: #666; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #1e3a5f; color: white; padding: 6px 8px; text-align: left; font-weight: 600; }
    td { padding: 4px 8px; border-bottom: 1px solid #e0e0e0; }
    tr:nth-child(even) { background: #f8f9fa; }
    @media print {
      body { padding: 15px; }
      @page { size: landscape; margin: 10mm; }
    }
  </style>
</head>
<body>
  <h1>📋 ${estateName} — 屋苑小檔案</h1>
  <p class="subtitle">共 ${profile.totalOrders} 項訂單 ｜ 列印日期：${new Date().toLocaleDateString("zh-Hant")}</p>

  <div class="section">
    <div class="section-title">⚠️ 報價提醒</div>
    ${alertsHtml}
  </div>

  <div class="stats">
    <div class="stat-box">
      <div class="num">${profile.doorAnalysis.total}</div>
      <div class="label">門訂單</div>
      <div style="font-size:11px;color:#666;">標準內 ${profile.doorAnalysis.withinStandardPct}%</div>
    </div>
    <div class="stat-box">
      <div class="num">${profile.windowAnalysis.total}</div>
      <div class="label">窗訂單</div>
      <div style="font-size:11px;color:#666;">標準內 ${profile.windowAnalysis.withinStandardPct}%</div>
    </div>
    <div class="stat-box">
      <div class="num">${profile.totalOrders}</div>
      <div class="label">總訂單</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📐 超標尺寸分佈</div>
    ${exceedBadges(profile.doorAnalysis, "門")}
    ${exceedBadges(profile.windowAnalysis, "窗")}
  </div>

  <div class="section">
    <div class="section-title">📊 訂單分佈</div>
    <table style="width:auto;">
      ${distRow("款式", profile.modelDistribution)}
      ${distRow("框色", profile.frameColorDistribution)}
      ${distRow("網材", profile.fabricDistribution)}
      ${distRow("拉式", profile.pullTypeDistribution)}
      ${distRow("安裝", profile.installTypeDistribution)}
    </table>
  </div>

  <div class="section">
    <div class="section-title">📝 訂單明細</div>
    <table>
      <thead>
        <tr>
          <th>包裝備註</th><th>門/窗</th><th>寬(mm)</th><th>高(mm)</th>
          <th>單拉/對拉</th><th>內安/外安</th><th>框色</th><th>網材</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
