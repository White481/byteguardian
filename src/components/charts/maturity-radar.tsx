"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { FunctionScore } from "@/lib/types";

/** Current vs Target tier by NIST CSF function */
export function MaturityRadar({ data, maxTier = 4 }: { data: FunctionScore[]; maxTier?: number }) {
  const rows = data.map((d) => ({ ...d, label: `${d.name} (${d.function})` }));
  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart data={rows} outerRadius="72%">
        <PolarGrid stroke="var(--color-line)" />
        <PolarAngleAxis dataKey="label" tick={{ fill: "var(--color-fg-soft)", fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, maxTier]} tickCount={maxTier + 1} tick={false} axisLine={false} />
        <Radar
          name="Target"
          dataKey="target"
          stroke="var(--color-violet)"
          strokeDasharray="5 4"
          fill="var(--color-violet)"
          fillOpacity={0.12}
        />
        <Radar
          name="Current"
          dataKey="current"
          stroke="var(--color-accent)"
          fill="var(--color-accent)"
          fillOpacity={0.25}
        />
        <Tooltip
          contentStyle={{ background: "var(--color-surface-2)", border: "1px solid var(--color-line)", borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
