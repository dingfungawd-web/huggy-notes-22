import { OrderRecord } from "./api";

export function exportEstateAsPDF(estateName: string, orders: OrderRecord[]) {
  // Create a printable HTML and open in new window for printing/saving as PDF
  const rows = orders
    .map(
      (o) => `
    <tr>
      <td>${o.包裝備註}</td>
      <td>${o.款式}</td>
      <td>${o["門/窗"]}</td>
      <td>${o.框色}</td>
      <td>${o.網材}</td>
      <td>${o.位置}</td>
      <td style="text-align:right">${o["寬(mm)"]}</td>
      <td style="text-align:right">${o["高(mm)"]}</td>
      <td>${o["單拉/對拉"]}</td>
      <td>${o["內安/外安"]}</td>
      <td>${o["四框/三框"]}</td>
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
    body { font-family: 'Noto Sans TC', sans-serif; padding: 40px; color: #1a1a2e; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1e3a5f; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
    td { padding: 6px 10px; border-bottom: 1px solid #e0e0e0; }
    tr:nth-child(even) { background: #f8f9fa; }
    @media print {
      body { padding: 20px; }
      @page { size: landscape; margin: 15mm; }
    }
  </style>
</head>
<body>
  <h1>${estateName}</h1>
  <p class="subtitle">共 ${orders.length} 項訂單 ｜ 列印日期：${new Date().toLocaleDateString("zh-Hant")}</p>
  <table>
    <thead>
      <tr>
        <th>包裝備註</th><th>款式</th><th>門/窗</th><th>框色</th>
        <th>網材</th><th>位置</th><th>寬(mm)</th><th>高(mm)</th>
        <th>單拉/對拉</th><th>內安/外安</th><th>四框/三框</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
