import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Loader2, Building2, AlertCircle, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchOrders, groupByEstate, type OrderRecord } from "@/lib/api";
import { OrderTable } from "@/components/OrderTable";
import { EstateCard } from "@/components/EstateCard";
import { exportEstateAsPDF } from "@/lib/exportPdf";

const Index = () => {
  const [urlParams] = useSearchParams();
  const initialSearch = urlParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["orders", submittedSearch],
    queryFn: () => fetchOrders(submittedSearch || undefined),
    enabled: submittedSearch.length > 0,
  });

  const grouped = orders ? groupByEstate(orders) : new Map<string, OrderRecord[]>();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSubmittedSearch(searchTerm.trim());
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Building2 className="h-7 w-7 text-primary shrink-0" />
          <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">屋苑訂單查詢系統</h1>
          <div className="flex flex-1 max-w-xl ml-auto gap-2">
            <Input
              placeholder="輸入屋苑或大廈名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-background"
            />
            <Button onClick={handleSearch} className="gap-1.5 shrink-0">
              <Search className="h-4 w-4" />
              搜尋
            </Button>
          </div>
          <Link to="/estates">
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <LayoutGrid className="h-4 w-4" />
              屋苑總覽
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Empty state */}
        {!submittedSearch && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">搜尋屋苑訂單資料</h2>
            <p className="text-muted-foreground max-w-md">
              輸入屋苑或大廈名稱，即可查看該屋苑的所有訂單紀錄，並可匯出 PDF 小檔案用於報價及測量準備。
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">正在載入資料...</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">載入失敗</h2>
            <p className="text-muted-foreground">請檢查網路連線後重試。</p>
          </div>
        )}

        {/* Results */}
        {orders && !isLoading && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                找到 <span className="font-semibold text-foreground">{orders.length}</span> 項結果，
                涵蓋 <span className="font-semibold text-foreground">{grouped.size}</span> 個屋苑
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">找不到「{submittedSearch}」的相關訂單</p>
              </div>
            ) : (
              <Tabs defaultValue="cards" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="cards">卡片檢視</TabsTrigger>
                  <TabsTrigger value="table">表格檢視</TabsTrigger>
                </TabsList>

                <TabsContent value="cards" className="space-y-0">
                  <div className="grid gap-6">
                    {Array.from(grouped.entries()).map(([estate, estateOrders]) => (
                      <EstateCard
                        key={estate}
                        estateName={estate}
                        orders={estateOrders}
                        onExportPDF={() => exportEstateAsPDF(estate, estateOrders)}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="table" className="space-y-6">
                  {Array.from(grouped.entries()).map(([estate, estateOrders]) => (
                    <OrderTable key={estate} estateName={estate} orders={estateOrders} />
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
