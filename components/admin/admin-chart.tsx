"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data
const data = [
  { name: "May 1", views: 4000, shares: 240, comments: 180 },
  { name: "May 5", views: 3000, shares: 198, comments: 120 },
  { name: "May 10", views: 2000, shares: 980, comments: 290 },
  { name: "May 15", views: 2780, shares: 390, comments: 190 },
  { name: "May 20", views: 1890, shares: 480, comments: 210 },
  { name: "May 25", views: 2390, shares: 380, comments: 150 },
  { name: "May 30", views: 3490, shares: 430, comments: 220 },
];

const timeRanges = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "1 Year", value: "1y" },
];

export function AdminChart() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {timeRanges.map((range) => (
          <Button
            key={range.value}
            variant="outline"
            size="sm"
            onClick={() => setTimeRange(range.value)}
            className={cn(timeRange === range.value && "bg-muted")}
          >
            {range.label}
          </Button>
        ))}
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" fill="#ef4444" name="Views" />
            <Bar dataKey="shares" fill="#3b82f6" name="Shares" />
            <Bar dataKey="comments" fill="#10b981" name="Comments" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
