import { OrderRecord } from "@/lib/api";
import { generateEstateProfile, type EstateProfile, type Distribution, type SizeAnalysis, type AlertItem } from "@/lib/orderAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, DoorOpen, Grid3X3, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EstateCardProps {
  estateName: string;
  orders: OrderRecord[];
  onExportPDF: () => void;
}

export function EstateCard({ estateName, orders, onExportPDF }: EstateCardProps) {
  const profile = generateEstateProfile(estateName, orders);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {/* Header */}
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{estateName}</CardTitle>
          <Button size="sm" onClick={onExportPDF} className="gap-1.5">
            <FileDown className="h-4 w-4" />
            匯出 PDF
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          共 {profile.totalOrders} 項訂單紀錄
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Alerts */}
        <AlertSection alerts={profile.alerts} />

        {/* Door & Window Summary */}
        <div className="grid grid-cols-2 gap-3">
          <SizeCard label="門" icon={<DoorOpen className="h-4 w-4" />} analysis={profile.doorAnalysis} />
          <SizeCard label="窗" icon={<Grid3X3 className="h-4 w-4" />} analysis={profile.windowAnalysis} />
        </div>

        {/* Size Exceedance Detail */}
        {(profile.doorAnalysis.exceedHeight.length > 0 || profile.doorAnalysis.exceedWidth.length > 0 ||
          profile.windowAnalysis.exceedHeight.length > 0 || profile.windowAnalysis.exceedWidth.length > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">超標尺寸分佈</h4>
            {profile.doorAnalysis.total > 0 && <ExceedDetail label="門" analysis={profile.doorAnalysis} />}
            {profile.windowAnalysis.total > 0 && <ExceedDetail label="窗" analysis={profile.windowAnalysis} />}
          </div>
        )}

        {/* Distributions */}
        <div className="space-y-2">
          <DistributionRow label="款式" items={profile.modelDistribution} />
          <DistributionRow label="框色" items={profile.frameColorDistribution} />
          <DistributionRow label="網材" items={profile.fabricDistribution} />
          <DistributionRow label="拉式" items={profile.pullTypeDistribution} />
          <DistributionRow label="安裝" items={profile.installTypeDistribution} />
        </div>
      </CardContent>
    </Card>
  );
}

function AlertSection({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="space-y-1.5">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
            alert.level === "red"
              ? "bg-destructive/10 text-destructive"
              : alert.level === "yellow"
              ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
              : "bg-green-500/10 text-green-700 dark:text-green-400"
          }`}
        >
          {alert.level === "green" ? (
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}

function SizeCard({ label, icon, analysis }: { label: string; icon: React.ReactNode; analysis: SizeAnalysis }) {
  const exceedCount = analysis.total - analysis.withinStandard;
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-lg font-bold ml-auto">{analysis.total}</span>
      </div>
      <div className="flex gap-2 text-xs">
        <span className="text-green-600">✅ 標準內 {analysis.withinStandardPct}%</span>
        {exceedCount > 0 && (
          <span className="text-orange-600">⚠️ 超標 {Math.round((exceedCount / Math.max(analysis.total, 1)) * 100)}%</span>
        )}
      </div>
    </div>
  );
}

function ExceedDetail({ label, analysis }: { label: string; analysis: SizeAnalysis }) {
  if (analysis.exceedHeight.length === 0 && analysis.exceedWidth.length === 0) return null;
  return (
    <div className="rounded-md border px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
          標準內 {analysis.withinStandardPct}% ({analysis.withinStandard})
        </Badge>
        {analysis.exceedHeight.map((e) => (
          <Badge key={e.label} variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
            {e.label} {e.percentage}% ({e.count})
          </Badge>
        ))}
        {analysis.exceedWidth.map((e) => (
          <Badge key={e.label} variant="outline" className="text-red-700 border-red-300 bg-red-50">
            {e.label} {e.percentage}% ({e.count})
          </Badge>
        ))}
      </div>
    </div>
  );
}

function DistributionRow({ label, items }: { label: string; items: Distribution[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground shrink-0 w-10">{label}</span>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span
            key={item.label}
            className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {item.label} {item.percentage}%
          </span>
        ))}
      </div>
    </div>
  );
}
