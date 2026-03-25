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
      <CardContent className="space-y-3 text-sm">
        {allDistricts.length > 0 && (
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="font-medium">地區：</span>
              {allDistricts.map((d, i) => (
                <Badge key={i} variant="outline" className="mr-1 mb-1">
                  {d.estate}：{d.value}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {allColors.length > 0 && (
          <div className="flex items-start gap-2">
            <Palette className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="font-medium">門窗顏色：</span>
              {allColors.map((c, i) => (
                <Badge key={i} variant="secondary" className="mr-1 mb-1">
                  {c.estate}：{c.value}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {allNotes.length > 0 && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-medium">備註：</span>
              {allNotes.map((n, i) => (
                <p key={i} className="text-muted-foreground">
                  <span className="font-medium text-foreground">{n.estate}：</span>{n.value}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
