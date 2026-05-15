import { DashboardKPI } from "@/lib/mock-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, UserCheck, TrendingUp } from "lucide-react";

export default function KPICard({ kpi, index }: { kpi: DashboardKPI; index: number }) {
  const icons = [DollarSign, UserCheck, Users, TrendingUp];
  const Icon = icons[index];
  const isPositive = kpi.trend > 0;

  return (
    <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="p-1.5 bg-zinc-100/80 rounded-lg">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{kpi.title}</span>
        </div>
        
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">{kpi.value}</h2>
            <Badge variant="secondary" className={`rounded-full px-2 py-0.5 text-[11px] font-medium border-0 ${isPositive ? 'bg-zinc-900 text-white' : 'bg-red-50 text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {kpi.trendLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{kpi.subtext}</p>
        </div>
      </CardContent>
    </Card>
  );
}