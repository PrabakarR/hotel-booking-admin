"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { RevenuePoint } from "@/types";

interface RevenueChartProps {
  data: RevenuePoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `₹${Math.round(Number(value) / 1000)}k`}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E2E8F0",
              boxShadow: "none",
            }}
          />
          <Bar dataKey="revenue" fill="#2563EB" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
