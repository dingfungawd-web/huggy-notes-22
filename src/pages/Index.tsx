import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Loader2, Building2, AlertCircle, LayoutGrid, BarChart3, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchOrders, groupByEstate, type OrderRecord } from "@/lib/api";
import { EstateCard } from "@/components/EstateCard";
import { EstateMetaSummary } from "@/components/EstateMetaSummary";

const Index = () => {
  const [urlParams] = useSearchParams();
  const initialSearch = urlParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);
  const [showCombined, setShowCombined] = useState(false);
  const qc = useQueryClient();

  // Fetch search count
  const { data: searchCount } = useQuery({
    queryKey: ["searchCount"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_stats")
        .select("count")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data.count as number;
    },
    staleTime: 30_000,
  });

  // Increment search count
  const incrementCount = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("increment_search_count");
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["searchCount"] }),
  });

  // Instant search: debounce input to trigger query
  useEffect(() => {
    const trimmed = searchTerm.trim();
    const timer = setTimeout(() => {
      setSubmittedSearch(trimmed);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setShowCombined(false);
  }, [submittedSearch]);

  const normalizedSearch = submittedSearch.toLowerCase().replace(/\s/g, "");

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["orders", normalizedSearch],
    queryFn: ({ signal }) => fetchOrders(submittedSearch || undefined, signal),
    enabled: normalizedSearch.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  const grouped = orders ? groupByEstate(orders) : new Map<string, OrderRecord[]>();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSubmittedSearch(searchTerm.trim());
      setShowCombined(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-7 w-7 text-primary shrink-0" />
              <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">屋苑數據分析系統</h1>
            </div>
            <Link to="/estates">
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <LayoutGrid className="h-4 w-4" />
                屋苑總覽
              </Button>
            </Link>
          </div>
          <div className="flex gap-2 mt-3">
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
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!submittedSearch && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">搜尋屋苑訂單資料</h2>
            <p className="text-muted-foreground max-w-md">
              輸入屋苑或大廈名稱，即可查看該屋苑的所有訂單紀錄及分析數據。
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">正在載入資料...</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">載入失敗</h2>
            <p className="text-muted-foreground">請檢查網路連線後重試。</p>
          </div>
        )}

        {orders && !isLoading && (
          <>
            <div className="mb-6">
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
              <>
                {/* Quick-nav with combined view toggle */}
                {grouped.size > 1 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    <Button
                      variant={showCombined ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowCombined(!showCombined)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      全部屋苑總數據
                      <Badge variant={showCombined ? "outline" : "secondary"} className="ml-1 text-xs">
                        {grouped.size}個
                      </Badge>
                    </Button>
                    {Array.from(grouped.entries()).map(([estate, estateOrders]) => (
                      <Button
                        key={estate}
                        variant={showCombined ? "ghost" : "outline"}
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          if (showCombined) {
                            setShowCombined(false);
                            setTimeout(() => {
                              document.getElementById(`estate-${estate}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 100);
                          } else {
                            document.getElementById(`estate-${estate}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                      >
                        {estate}
                        <Badge variant="secondary" className="ml-1 text-xs">{estateOrders.length}</Badge>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Combined view: all estates merged */}
                {showCombined && grouped.size > 1 ? (
                  <>
                    <EstateMetaSummary estateNames={Array.from(grouped.keys())} />
                    <EstateCard
                      estateName={`全部屋苑合計（${grouped.size}個）`}
                      orders={orders}
                      hideMeta
                    />
                  </>
                ) : (
                  <>
                    {/* Aggregated meta summary */}
                    {grouped.size > 1 && (
                      <EstateMetaSummary estateNames={Array.from(grouped.keys())} />
                    )}

                    <div className="grid gap-6">
                      {Array.from(grouped.entries()).map(([estate, estateOrders]) => (
                        <div key={estate} id={`estate-${estate}`} className="scroll-mt-24">
                          <EstateCard
                            estateName={estate}
                            orders={estateOrders}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
