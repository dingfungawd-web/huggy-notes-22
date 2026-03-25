import { OrderRecord } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderTableProps {
  orders: OrderRecord[];
  estateName: string;
}

export function OrderTable({ orders, estateName }: OrderTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="bg-primary px-6 py-3">
        <h2 className="text-lg font-semibold text-primary-foreground">
          {estateName}
          <span className="ml-2 text-sm font-normal opacity-80">
            共 {orders.length} 項
          </span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="whitespace-nowrap">包裝備註</TableHead>
              <TableHead className="whitespace-nowrap">款式</TableHead>
              <TableHead className="whitespace-nowrap">門/窗</TableHead>
              <TableHead className="whitespace-nowrap">框色</TableHead>
              <TableHead className="whitespace-nowrap">網材</TableHead>
              <TableHead className="whitespace-nowrap">位置</TableHead>
              <TableHead className="whitespace-nowrap text-right">寬(mm)</TableHead>
              <TableHead className="whitespace-nowrap text-right">高(mm)</TableHead>
              <TableHead className="whitespace-nowrap">單拉/對拉</TableHead>
              <TableHead className="whitespace-nowrap">內安/外安</TableHead>
              <TableHead className="whitespace-nowrap">四框/三框</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
                <TableCell className="font-medium">{order.包裝備註}</TableCell>
                <TableCell>{order.款式}</TableCell>
                <TableCell>{order["門/窗"]}</TableCell>
                <TableCell>{order.框色}</TableCell>
                <TableCell>{order.網材}</TableCell>
                <TableCell>{order.位置}</TableCell>
                <TableCell className="text-right tabular-nums">{order["寬(mm)"]}</TableCell>
                <TableCell className="text-right tabular-nums">{order["高(mm)"]}</TableCell>
                <TableCell>{order["單拉/對拉"]}</TableCell>
                <TableCell>{order["內安/外安"]}</TableCell>
                <TableCell>{order["四框/三框"]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
