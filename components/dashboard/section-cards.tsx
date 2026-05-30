"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardKPI } from "@/types"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"

export function SectionCards({
  kpis,
  isLoading = false
}: {
  kpis: DashboardKPI[];
  isLoading?: boolean;
}) {
  const GridWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      {children}
    </div>
  );

  if (isLoading || !kpis || kpis.length === 0) {
    return (
      <GridWrapper>
        {[1, 2, 3].map((i) => (
          <Card className="@container/card" key={`skeleton-${i}`}>
            <CardHeader>
              <CardDescription>
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardDescription>
              <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl mt-1">
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardTitle>
              <CardAction>
                <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2 text-sm mt-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-40 bg-muted animate-pulse rounded" />
            </CardFooter>
          </Card>
        ))}
      </GridWrapper>
    )
  }

  return (
    <GridWrapper>
      {kpis.map((kpi) => {
        return (
          <Card className="@container/card" key={kpi.title}>
            <CardHeader>
              <CardDescription>{kpi.title}</CardDescription>
              <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
                {kpi.title.includes("Revenue")
                  ? `$${Number(kpi.value).toLocaleString('en-US')}`
                  : (Number(kpi.value).toLocaleString('en-US'))}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  {kpi.trend >= 0 ? (
                    <IconTrendingUp />
                  ) : (
                    <IconTrendingDown />
                  )}
                  <span>{kpi.trend}%</span>
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {kpi.trend >= 0 ? `${kpi.trend}% increase` : `${Math.abs(kpi.trend)}% decrease`}{" "}
                {kpi.trend >= 0 ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
              </div>
              <div className="text-muted-foreground">
                Compared to previous day
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </GridWrapper>
  )
}