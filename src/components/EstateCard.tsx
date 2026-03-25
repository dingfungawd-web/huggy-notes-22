import { OrderRecord } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, DoorOpen, Grid3X3 } from "lucide-react";

interface EstateCardProps {
  estateName: string;
  orders: OrderRecord[];
  onExportPDF: () => void;
}

export function EstateCard({ estateName, orders, onExportPDF }: EstateCardProps) {
  // Summarize data
  const models = [...new Set(orders.map((o) => o.款式))];
  const frameColors = [...new Set(orders.map((o) => o.框色))];
  const fabrics = [...new Set(orders.map((o) => o.網材))];
  const doorCount = orders.filter((o) => o["門/窗"] === "门" || o["門/窗"] === "門").length;
  const windowCount = orders.filter((o) => o["門/窗"] === "窗").length;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{estateName}</CardTitle>
          <Button size="sm" onClick={onExportPDF} className="gap-1.5">
            <FileDown className="h-4 w-4" />
            匯出 PDF
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          共 {orders.length} 項訂單
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="門" value={`${doorCount} 項`} icon={<DoorOpen className="h-4 w-4" />} />
          <InfoItem label="窗" value={`${windowCount} 項`} icon={<Grid3X3 className="h-4 w-4" />} />
        </div>
        <div className="space-y-2">
          <DetailRow label="款式" values={models} />
          <DetailRow label="框色" values={frameColors} />
          <DetailRow label="網材" values={fabrics} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground shrink-0 w-10">{label}</span>
      <div className="flex flex-wrap gap-1">
        {values.map((v) => (
          <span key={v} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
