import { useQueries } from "@tanstack/react-query";
import { fetchEstateMeta } from "@/lib/estateMetaApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Palette, MessageSquare } from "lucide-react";

interface EstateMetaSummaryProps {
  estateNames: string[];
}

export function EstateMetaSummary({ estateNames }: EstateMetaSummaryProps) {
  const queries = useQueries({
    queries: estateNames.map((name) => ({
      queryKey: ["estateMeta", name],
      queryFn: () => fetchEstateMeta(name),
    })),
  });

  // Aggregate all meta across estates
  const allDistricts: { estate: string; value: string }[] = [];
  const allColors: { estate: string; value: string }[] = [];
  const allNotes: { estate: string; value: string }[] = [];

  queries.forEach((q, i) => {
    const estate = estateNames[i];
    q.data?.forEach((m) => {
      if (m.地區) allDistricts.push({ estate, value: m.地區 });
      if (m.門窗顏色) allColors.push({ estate, value: m.門窗顏色 });
      if (m.備註) allNotes.push({ estate, value: m.備註 });
    });
  });

  if (allDistricts.length === 0 && allColors.length === 0 && allNotes.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">搜尋結果補充資料總覽</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-base">
        {allDistricts.length > 0 && (
          <div className="flex items-start gap-2">
            <Tag className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">地區：</span>
              {allDistricts.map((d, i) => (
                <span key={i} className="font-bold text-foreground mr-2">
                  {d.estate}：{d.value}
                </span>
              ))}
            </div>
          </div>
        )}
        {allColors.length > 0 && (
          <div className="flex items-start gap-2">
            <Palette className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-green-600">門窗顏色：</span>
              {allColors.map((c, i) => (
                <span key={i} className="font-bold text-green-600 mr-2">
                  {c.estate}：{c.value}
                </span>
              ))}
            </div>
          </div>
        )}
        {allNotes.length > 0 && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-red-600">備註：</span>
              {allNotes.map((n, i) => (
                <p key={i} className="font-bold text-red-600">
                  <span className="text-red-600 mr-1">❗</span>
                  <span className="font-bold text-foreground">{n.estate}：</span>{n.value}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
