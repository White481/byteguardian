"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FunctionScore } from "@/lib/types";

/** Grouped bars: current vs target tier per function */
export function FunctionBars({ data, maxTier = 4 }: { data: FunctionScore[]; maxTier?: number }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid vertical={false} stroke="var(--color-line)" />
        <XAxis dataKey="function" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, maxTier]} tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          cursor={{ fill: "rgb(255 255 255 / 0.04)" }}
          contentStyle={{ background: "var(--color-surface-2)", border: "1px solid var(--color-line)", borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar name="Current" dataKey="current" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
        <Bar name="Target" dataKey="target" fill="var(--color-violet)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
