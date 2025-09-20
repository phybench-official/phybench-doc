"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={className}
      {...props}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: Object.entries(config)
            .map(
              ([key, keyConfig]) => `
                [data-chart="${chartId}"] {
                  --color-${key}: ${keyConfig.color};
                }
              `
            )
            .join("\n"),
        }}
      />
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={className}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-lg border bg-background p-2 shadow-sm ${className}`}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
>

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
}