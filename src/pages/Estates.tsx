import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Search, Loader2, Plus, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchOrders, groupByEstate, stripSpaces, type OrderRecord } from "@/lib/api";
import { postEstateMeta } from "@/lib/estateMetaApi";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Estates = () => {
  const [filter, setFilter] = useState("");
  const [selectedEstate, setSelectedEstate] = useState<string | null>(null);
  const [alias, setAlias] = useState("");
  const [doorWindowColor, setDoorWindowColor] = useState("");
  const [note, setNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all orders to build estate list
  const { data: orders, isLoading } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => fetchOrders("*"),
  });

  const grouped = orders ? groupByEstate(orders) : new Map<string, OrderRecord[]>();
  const estateList = Array.from(grouped.entries())
    .map(([name, items]) => ({ name, count: items.length }))
    .sort((a, b) => b.count - a.count);

  const filtered = filter.trim()
    ? estateList.filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()))
    : estateList;

  const mutation = useMutation({
    mutationFn: postEstateMeta,
    onSuccess: () => {
      toast({ title: "已儲存", description: "屋苑資料已成功更新" });
      setAlias("");
      setDoorWindowColor("");
      setNote("");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
    onError: () => {
      toast({ title: "儲存失敗", description: "請稍後重試", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!selectedEstate) return;
    if (!alias && !doorWindowColor && !note) {
      toast({ title: "請輸入資料", description: "至少填寫一項內容", variant: "destructive" });
      return;
    }
    mutation.mutate({
      estateName: selectedEstate,
      alias: alias || undefined,
      doorWindowColor: doorWindowColor || undefined,
      note: note || undefined,
    });
  };

  const openDialog = (estate: string) => {
    setSelectedEstate(estate);
    setAlias("");
    setDoorWindowColor("");
    setNote("");
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Building2 className="h-7 w-7 text-primary shrink-0" />
          <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">屋苑總覽</h1>
          <div className="flex flex-1 max-w-md ml-auto gap-2">
            <Input
              placeholder="篩選屋苑名稱..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-background"
            />
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Search className="h-4 w-4" />
              屋苑搜尋
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">正在載入屋苑列表...</span>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                共 <span className="font-semibold text-foreground">{estateList.length}</span> 個屋苑
                {filter && (
                  <>，篩選顯示 <span className="font-semibold text-foreground">{filtered.length}</span> 個</>
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((estate) => (
                <Card key={estate.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/?search=${encodeURIComponent(estate.name)}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {estate.name}
                      </Link>
                      <Badge variant="secondary" className="mt-1">
                        {estate.count} 件訂單
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(estate.name)}
                        title="補充資料"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Link to={`/?search=${encodeURIComponent(estate.name)}`}>
                        <Button variant="ghost" size="icon" title="查看小檔案">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">找不到「{filter}」的相關屋苑</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Metadata Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>補充屋苑資料 — {selectedEstate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>地區</Label>
              <Input
                placeholder="例如：屯門、將軍澳..."
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                加入後可用此地區名稱搜尋該屋苑
              </p>
            </div>
            <div className="space-y-2">
              <Label>門窗顏色</Label>
              <Input
                placeholder="例如：咖啡色、深灰色..."
                value={doorWindowColor}
                onChange={(e) => setDoorWindowColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Textarea
                placeholder="例如：此屋苑門高度普遍超過2.4米，需加收超高費..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                備註可持續新增，每次儲存為一條新記錄
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estates;
