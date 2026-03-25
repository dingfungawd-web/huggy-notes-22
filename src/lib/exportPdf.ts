import { OrderRecord } from "./api";
import { generateEstateProfile, parseLocation, classifyFabric, isSpecialColor } from "./orderAnalysis";
import type { TypeAnalysis, BucketDistribution, Distribution } from "./orderAnalysis";

export function exportEstateAsPDF(estateName: string, orders: OrderRecord[]) {
  const profile = generateEstateProfile(estateName, orders);

  const bucketTableHtml = (label: string, buckets: BucketDistribution[]) => {
    if (buckets.length === 0) return "";
    const headers = buckets.map((b) => `<th style="text-align:center;padding:4px 10px;">${b.label}</th>`).join("");
    const counts = buckets.map((b) => `<td style="text-align:center;">${b.count}</td>`).join("");
    const pcts = buckets.map((b) => `<td style="text-align:center;">${b.percentage}%</td>`).join("");
    return `<p style="font-weight:600;margin:8px 0 4px;">${label}：</p>
      <table><thead><tr><th style="width:50px;"></th>${headers}</tr></thead>
      <tbody><tr><td><strong>數量</strong></td>${counts}</tr><tr><td><strong>佔比</strong></td>${pcts}</tr></tbody></table>`;
  };

  const typeSection = (label: string, analysis: TypeAnalysis) => {
    if (analysis.total === 0) return "";
    let content = `<h3 style="margin:12px 0 6px;">${label}</h3>`;
    if (analysis.allWithinStandard) {
      content += `<p style="color:#15803d;font-weight:600;">尺寸：全部在標準範圍內 ✅</p>`;
    } else {
      content += `<p style="font-weight:600;">超標準尺寸記錄：</p>`;
      content += `<table><thead><tr><th>位置</th><th>寬(mm)</th><th>高(mm)</th><th>開向</th><th>內/外安</th><th>超高</th><th>超闊</th></tr></thead><tbody>`;
      for (const r of analysis.exceedRecords) {
        content += `<tr><td>${r.位置}</td><td style="text-align:right">${r.寬}</td><td style="text-align:right">${r.高}</td><td>${r.開向}</td><td>${r.安裝}</td><td style="color:${r.超高 !== "-" ? "#c2410c" : "#999"}">${r.超高}</td><td style="color:${r.超闊 !== "-" ? "#c2410c" : "#999"}">${r.超闊}</td></tr>`;
      }
      content += `</tbody></table>`;
      content += bucketTableHtml("高度分佈", analysis.heightDistribution);
      content += bucketTableHtml("闊度分佈", analysis.widthDistribution);
    }
    return content;
  };

  const distTableHtml = (label: string, items: Distribution[], showClass = false) => {
    if (items.length === 0) return "";
    const headers = items.map((i) => `<th style="text-align:center;padding:4px 10px;">${i.label}</th>`).join("");
    const counts = items.map((i) => `<td style="text-align:center;">${i.count}</td>`).join("");
    const pcts = items.map((i) => `<td style="text-align:center;">${i.percentage}%</td>`).join("");
    let classRow = "";
    if (showClass) {
      classRow = `<tr><td><strong>分類</strong></td>${items.map((i) =>
        `<td style="text-align:center;color:${isSpecialColor(i.label) ? "#c2410c" : "#666"}">${isSpecialColor(i.label) ? "特別色 ⚠️" : "標準色"}</td>`
      ).join("")}</tr>`;
    }
    return `<h3 style="margin:12px 0 6px;">${label}</h3>
      <table><thead><tr><th style="width:50px;"></th>${headers}</tr></thead>
      <tbody><tr><td><strong>數量</strong></td>${counts}</tr><tr><td><strong>佔比</strong></td>${pcts}</tr>${classRow}</tbody></table>`;
  };

  const pullText = profile.pullTypeDistribution.map((d) => `${d.label} ${d.count}件（${d.percentage}%）`).join(" ｜ ");
  const installText = profile.installTypeDistribution.map((d) => `${d.label} ${d.count}件（${d.percentage}%）`).join(" ｜ ");

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
    h3 { font-size: 14px; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
    th { background: #1e3a5f; color: white; padding: 6px 8px; text-align: left; font-weight: 600; }
    td { padding: 4px 8px; border-bottom: 1px solid #e0e0e0; }
    tr:nth-child(even) { background: #f8f9fa; }
    hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
    @media print { body { padding: 15px; } @page { size: landscape; margin: 10mm; } }
  </style>
</head>
<body>
  <h1>📋 ${estateName} — 屋苑小檔案</h1>
  <p class="subtitle">
    <strong>總訂貨數量：${profile.totalOrders}件</strong>（門：${profile.doorAnalysis.total}件 ｜ 窗：${profile.windowAnalysis.total}件）｜ 客戶數：${profile.customerCount}<br>
    列印日期：${new Date().toLocaleDateString("zh-Hant")}
  </p>

  ${typeSection("門（回捲式）", profile.doorAnalysis)}
  ${typeSection("窗（回捲式）", profile.windowAnalysis)}

  <hr>
  ${distTableHtml("框色分佈", profile.frameColorDistribution, true)}
  ${distTableHtml("網材分佈", profile.fabricDistribution)}

  <hr>
  <h3 style="margin:12px 0 6px;">開向及安裝方式</h3>
  <p><strong>開向：</strong>${pullText}</p>
  <p><strong>安裝：</strong>${installText}</p>

  <hr>
  <h3 style="margin:12px 0 6px;">備註</h3>
  <p style="color:#999;font-style:italic;">（待度尺同事補充）</p>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
