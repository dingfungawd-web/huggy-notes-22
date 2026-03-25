import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Distribution } from "@/lib/orderAnalysis";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(220 70% 55%)",
  "hsl(160 60% 45%)",
  "hsl(35 90% 55%)",
  "hsl(340 70% 55%)",
  "hsl(270 60% 55%)",
  "hsl(190 70% 45%)",
];

interface PieChartSectionProps {
  title: string;
  data: Distribution[];
}

export function PieChartSection({ title, data }: PieChartSectionProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    name: d.label,
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">{title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value}件（${props.payload.percentage}%）`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1 mt-1">
        {chartData.map((d, idx) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="truncate">{d.name}</span>
            </div>
            <span className="tabular-nums text-muted-foreground shrink-0 ml-2">
              {d.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
