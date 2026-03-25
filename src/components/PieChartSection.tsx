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

// Semantic colors for size exceed charts: standard = green, then escalating warm tones
const EXCEED_COLOR_MAP: Record<string, string> = {
  "標準內": "hsl(150 60% 45%)",   // green — safe
  "超20cm": "hsl(45 90% 50%)",    // amber — mild warning
  "超40cm": "hsl(25 90% 55%)",    // orange — moderate
  "超60cm": "hsl(10 80% 55%)",    // red-orange — serious
  "超80cm": "hsl(0 75% 50%)",     // red — critical
  "超100cm": "hsl(340 80% 45%)",  // dark red
};

function getExceedColor(label: string): string {
  if (EXCEED_COLOR_MAP[label]) return EXCEED_COLOR_MAP[label];
  // For any exceed beyond mapped values, use darkest red
  if (label.startsWith("超")) return "hsl(0 70% 40%)";
  return "hsl(150 60% 45%)";
}

interface PieChartSectionProps {
  title: string;
  data: Distribution[];
  /** Use semantic warning colors for size-exceed charts */
  exceedMode?: boolean;
}

export function PieChartSection({ title, data, exceedMode = false }: PieChartSectionProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    name: d.label,
    value: d.count,
    percentage: d.percentage,
  }));

  const getColor = (idx: number, name: string) =>
    exceedMode ? getExceedColor(name) : COLORS[idx % COLORS.length];

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
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={getColor(idx, entry.name)} />
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
                style={{ backgroundColor: getColor(idx, d.name) }}
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
