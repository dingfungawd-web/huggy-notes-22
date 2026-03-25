import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Distribution } from "@/lib/orderAnalysis";

const COLORS = [
  "hsl(210 80% 50%)",   // blue
  "hsl(25 90% 55%)",    // orange
  "hsl(150 60% 42%)",   // green
  "hsl(340 75% 55%)",   // rose
  "hsl(270 65% 58%)",   // purple
  "hsl(45 95% 50%)",    // amber
  "hsl(190 75% 45%)",   // teal
  "hsl(0 70% 55%)",     // red
  "hsl(300 50% 50%)",   // magenta
  "hsl(120 45% 52%)",   // lime
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
              {d.value}件　{d.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
