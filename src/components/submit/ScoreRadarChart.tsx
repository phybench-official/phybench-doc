"use client";

import React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

interface RadarChartData {
  category: string;
  eed: number;
  acc: number;
}

interface ScoreRadarChartProps {
  data: RadarChartData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  eed: {
    label: "EED分数",
    color: "hsl(var(--chart-1))",
  },
  acc: {
    label: "准确率",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ScoreRadarChart({ data, title = "评测结果", description = "各类别题目的得分情况" }: ScoreRadarChartProps) {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px] py-8"
        >
          <RadarChart data={data}>
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              dataKey="eed"
              fill="var(--color-eed)"
              fillOpacity={0.3}
              stroke="var(--color-eed)"
              strokeWidth={2}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
            <Radar
              dataKey="acc"
              fill="var(--color-acc)"
              fillOpacity={0.3}
              stroke="var(--color-acc)"
              strokeWidth={2}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}