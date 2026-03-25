import { OrderRecord } from "@/lib/api";
import { generateEstateProfile, type TypeAnalysis, type Distribution, type BucketDistribution, type ExceedRecord, isSpecialColor } from "@/lib/orderAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EstateCardProps {
  estateName: string;
  orders: OrderRecord[];
  onExportPDF: () => void;
}

export function EstateCard({ estateName, orders, onExportPDF }: EstateCardProps) {
  const profile = generateEstateProfile(estateName, orders);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{estateName}</CardTitle>
          <Button size="sm" onClick={onExportPDF} className="gap-1.5">
            <FileDown className="h-4 w-4" />
            匯出 PDF
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>總訂貨數量：{profile.totalOrders}件</strong>（門：{profile.doorAnalysis.total}件 ｜ 窗：{profile.windowAnalysis.total}件）｜ 客戶數：{profile.customerCount}
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-5 text-sm">
        {/* 門 Section */}
        {profile.doorAnalysis.total > 0 && (
          <TypeSection label="門（回捲式）" analysis={profile.doorAnalysis} />
        )}

        {/* 窗 Section */}
        {profile.windowAnalysis.total > 0 && (
          <TypeSection label="窗（回捲式）" analysis={profile.windowAnalysis} />
        )}

        <Separator />

        {/* 框色分佈 */}
        <div>
          <h4 className="font-semibold mb-2">框色分佈</h4>
          <DistTable
            items={profile.frameColorDistribution}
            extraRow={(item) => (
              <span className={isSpecialColor(item.label) ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                {isSpecialColor(item.label) ? "特別色 ⚠️" : "標準色"}
              </span>
            )}
          />
        </div>

        {/* 網材分佈 */}
        <div>
          <h4 className="font-semibold mb-2">網材分佈</h4>
          <DistTable items={profile.fabricDistribution} />
        </div>

        <Separator />

        {/* 開向及安裝方式 */}
        <div>
          <h4 className="font-semibold mb-2">開向及安裝方式</h4>
          <p>
            <strong>開向：</strong>
            {profile.pullTypeDistribution.map((d, i) => (
              <span key={d.label}>
                {i > 0 && " ｜ "}
                {d.label} {d.count}件（{d.percentage}%）
              </span>
            ))}
          </p>
          <p>
            <strong>安裝：</strong>
            {profile.installTypeDistribution.map((d, i) => (
              <span key={d.label}>
                {i > 0 && " ｜ "}
                {d.label} {d.count}件（{d.percentage}%）
              </span>
            ))}
          </p>
        </div>

        <Separator />

        {/* 備註 */}
        <div>
          <h4 className="font-semibold mb-1">備註</h4>
          <p className="text-muted-foreground italic">（待度尺同事補充）</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Sub-components =====

function TypeSection({ label, analysis }: { label: string; analysis: TypeAnalysis }) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-base">{label}</h4>

      {analysis.allWithinStandard ? (
        <p className="text-green-700 dark:text-green-400 font-medium">尺寸：全部在標準範圍內 ✅</p>
      ) : (
        <>
          <div>
            <p className="font-medium mb-1.5">超標準尺寸記錄：</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="whitespace-nowrap">位置</TableHead>
                    <TableHead className="whitespace-nowrap text-right">寬(mm)</TableHead>
                    <TableHead className="whitespace-nowrap text-right">高(mm)</TableHead>
                    <TableHead className="whitespace-nowrap">開向</TableHead>
                    <TableHead className="whitespace-nowrap">內/外安</TableHead>
                    <TableHead className="whitespace-nowrap">超高</TableHead>
                    <TableHead className="whitespace-nowrap">超闊</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.exceedRecords.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.位置}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.寬}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.高}</TableCell>
                      <TableCell>{r.開向}</TableCell>
                      <TableCell>{r.安裝}</TableCell>
                      <TableCell className={r.超高 !== "-" ? "text-orange-600 font-medium" : "text-muted-foreground"}>{r.超高}</TableCell>
                      <TableCell className={r.超闊 !== "-" ? "text-orange-600 font-medium" : "text-muted-foreground"}>{r.超闊}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Height distribution */}
          {analysis.heightDistribution.length > 0 && (
            <BucketTable label="高度分佈" buckets={analysis.heightDistribution} />
          )}

          {/* Width distribution */}
          {analysis.widthDistribution.length > 0 && (
            <BucketTable label="闊度分佈" buckets={analysis.widthDistribution} />
          )}
        </>
      )}
    </div>
  );
}

function BucketTable({ label, buckets }: { label: string; buckets: BucketDistribution[] }) {
  return (
    <div>
      <p className="font-medium mb-1">{label}：</p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16"></TableHead>
              {buckets.map((b) => (
                <TableHead key={b.label} className="whitespace-nowrap text-center">{b.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">數量</TableCell>
              {buckets.map((b) => (
                <TableCell key={b.label} className="text-center tabular-nums">{b.count}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">佔比</TableCell>
              {buckets.map((b) => (
                <TableCell key={b.label} className="text-center tabular-nums">{b.percentage}%</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DistTable({ items, extraRow }: { items: Distribution[]; extraRow?: (item: Distribution) => React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16"></TableHead>
            {items.map((item) => (
              <TableHead key={item.label} className="whitespace-nowrap text-center">{item.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">數量</TableCell>
            {items.map((item) => (
              <TableCell key={item.label} className="text-center tabular-nums">{item.count}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">佔比</TableCell>
            {items.map((item) => (
              <TableCell key={item.label} className="text-center tabular-nums">{item.percentage}%</TableCell>
            ))}
          </TableRow>
          {extraRow && (
            <TableRow>
              <TableCell className="font-medium">分類</TableCell>
              {items.map((item) => (
                <TableCell key={item.label} className="text-center">{extraRow(item)}</TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
