import { useQuery } from "@tanstack/react-query";
import { OrderRecord } from "@/lib/api";
import { generateEstateProfile, type TypeAnalysis, type Distribution, type ExceedRecord, isSpecialColor } from "@/lib/orderAnalysis";
import { fetchEstateMeta } from "@/lib/estateMetaApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PieChartSection } from "@/components/PieChartSection";
import { ExceedTable } from "@/components/ExceedTable";
import { Info, Tag, Palette, MessageSquare, Link2 } from "lucide-react";
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
  hideMeta?: boolean;
}

export function EstateCard({ estateName, orders, hideMeta = false }: EstateCardProps) {
  const profile = generateEstateProfile(estateName, orders);

  const { data: metaRecords } = useQuery({
    queryKey: ["estateMeta", estateName],
    queryFn: () => fetchEstateMeta(estateName),
    enabled: !hideMeta,
  });

  const districts = hideMeta ? [] : (metaRecords?.filter((m) => m.地區).map((m) => m.地區) || []);
  const colors = hideMeta ? [] : (metaRecords?.filter((m) => m.門窗顏色).map((m) => m.門窗顏色) || []);
  const correctEstates = hideMeta ? [] : (metaRecords?.filter((m) => m.異常屋苑名稱正確歸類).map((m) => m.異常屋苑名稱正確歸類) || []);
  const notes = hideMeta ? [] : (metaRecords?.filter((m) => m.備註).map((m) => m.備註) || []);

  return (
    <Card className="overflow-hidden">
      {/* ===== Section 1: 基本資料 + 備註/別名/門窗顏色 ===== */}
      <CardHeader className="bg-primary/5 pb-3">
        <CardTitle className="text-xl">{estateName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          <strong>總訂貨數量：{profile.totalOrders}件</strong>（門：{profile.doorAnalysis.total}件 ｜ 窗：{profile.windowAnalysis.total}件）｜ 客戶數：{profile.customerCount}
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-5 text-sm">
        {/* Meta info from web input */}
        {(districts.length > 0 || colors.length > 0 || correctEstates.length > 0 || notes.length > 0) && (
          <div className="space-y-3 text-base">
            {districts.length > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">地區：</span>
                  {districts.map((a, i) => (
                    <span key={i} className="font-bold text-foreground mr-2">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {colors.length > 0 && (
              <div className="flex items-start gap-2">
                <Palette className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-green-600">門窗顏色：</span>
                  {colors.map((c, i) => (
                    <span key={i} className="font-bold text-green-600 mr-2">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {correctEstates.length > 0 && (
              <div className="flex items-start gap-2">
                <Link2 className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">異常屋苑名稱正確歸類為：</span>
                  {correctEstates.map((c, i) => (
                    <span key={i} className="font-bold text-foreground mr-2">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {notes.length > 0 && (
              <div className="flex items-start gap-2">
                <MessageSquare className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-red-600">備註：</span>
                  {notes.map((n, i) => (
                    <p key={i} className="font-bold text-red-600">
                      <span className="text-red-600 mr-1">❗</span>{n}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(districts.length > 0 || colors.length > 0 || correctEstates.length > 0 || notes.length > 0) && <Separator />}

        {/* ===== Section 2: 圓形圖分佈 ===== */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-primary" />
            數據分佈
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PieChartSection title="框色分佈" data={profile.frameColorDistribution} />
            <PieChartSection title="網材分佈" data={profile.fabricDistribution} />
            <PieChartSection title="開向分佈" data={profile.pullTypeDistribution} />
            <PieChartSection title="安裝方式" data={profile.installTypeDistribution} />
          </div>
        </div>

        <Separator />

        {/* ===== Section 3: 超標準尺寸記錄 ===== */}
        <div className="space-y-4">
          {profile.doorAnalysis.total > 0 && (
            <ExceedTable label="門（回捲式）" analysis={profile.doorAnalysis} />
          )}
          {profile.windowAnalysis.total > 0 && (
            <ExceedTable label="窗（回捲式）" analysis={profile.windowAnalysis} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
