"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OccupancyPoint } from "@/types";

interface OccupancyChartProps {
  data: OccupancyPoint[];
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Occupancy"]}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E2E8F0",
              boxShadow: "none",
            }}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#2563EB"
            strokeWidth={2}
            fill="url(#occupancyFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
