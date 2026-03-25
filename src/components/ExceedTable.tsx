import type { TypeAnalysis, BucketDistribution } from "@/lib/orderAnalysis";
import { PieChartSection } from "@/components/PieChartSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExceedTableProps {
  label: string;
  analysis: TypeAnalysis;
}

export function ExceedTable({ label, analysis }: ExceedTableProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-base">{label}</h4>

      {analysis.allWithinStandard ? (
        <p className="text-green-700 dark:text-green-400 font-medium">
          尺寸：全部在標準範圍內 ✅
        </p>
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

          {analysis.heightDistribution.length > 0 && (
            <BucketTable label="高度分佈" buckets={analysis.heightDistribution} />
          )}
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
