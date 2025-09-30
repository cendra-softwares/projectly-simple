import { FolderOpen, Clock, CheckCircle, Loader2, RefreshCcw, DollarSign, TrendingUp, Filter } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useProjects } from "@/hooks/useProjects";
import { ProjectStatusPieChart } from "@/components/ProjectStatusPieChart";
import { ProjectProgressChart } from "@/components/ProjectProgressChart";
import { AnalyticsTable } from "@/components/AnalyticsTable";
import { FinancialSummary } from "@/components/FinancialSummary";
import { FinancialsDonutChart } from "@/components/FinancialsDonutChart";
import { NetProfitTrendChart } from "@/components/NetProfitTrendChart";
import { ProjectVelocityChart } from "@/components/ProjectVelocityChart";
import { RevenueBreakdownChart } from "@/components/RevenueBreakdownChart";
import { ProjectPerformanceMetrics } from "@/components/ProjectPerformanceMetrics";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { Project } from "@/types/project";

const Analytics = () => {
  const { projects, stats, projectHistory, loading, error, searchProjects, refetch } =
    useProjects();
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [includeRingCharts, setIncludeRingCharts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in-work" | "done">("all");
  const [financialFilter, setFinancialFilter] = useState<"all" | "profit" | "loss">("all");
  const [minProfit, setMinProfit] = useState<number | "">("");
  const [maxProfit, setMaxProfit] = useState<number | "">("");

  const filteredProjects = useMemo(() => {
    let base: Project[] = searchTerm.trim()
      ? searchProjects
        ? searchProjects(searchTerm)
        : projects
      : projects;

    if (statusFilter !== "all") {
      base = base.filter((p) => p.status === statusFilter);
    }
    if (financialFilter !== "all") {
      base = base.filter((p) => {
        const profit = p.financials.profits - p.financials.expenses;
        return financialFilter === "profit" ? profit > 0 : profit < 0;
      });
    }
    if (minProfit !== "") {
      base = base.filter(
        (p) => p.financials.profits - p.financials.expenses >= (minProfit as number)
      );
    }
    if (maxProfit !== "") {
      base = base.filter(
        (p) => p.financials.profits - p.financials.expenses <= (maxProfit as number)
      );
    }
    return base;
  }, [projects, searchProjects, searchTerm, statusFilter, financialFilter, minProfit, maxProfit]);

  const derivedStats = useMemo(() => {
    return {
      total: filteredProjects.length,
      pending: filteredProjects.filter((p) => p.status === "pending").length,
      inWork: filteredProjects.filter((p) => p.status === "in-work").length,
      done: filteredProjects.filter((p) => p.status === "done").length,
    };
  }, [filteredProjects]);

  const totals = useMemo(() => {
    const totalRevenue = filteredProjects.reduce((sum, p) => sum + p.financials.profits, 0);
    const totalNet = filteredProjects.reduce(
      (sum, p) => sum + (p.financials.profits - p.financials.expenses),
      0
    );
    return { totalRevenue, totalNet };
  }, [filteredProjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
            <p className="text-muted-foreground">
              Comprehensive insights into your project performance and financial reports.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={loading}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Page-level Filters */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-work">In Work</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Financial</Label>
            <Select value={financialFilter} onValueChange={(v) => setFinancialFilter(v as any)}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All financials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="min-profit">Min Profit</Label>
              <Input
                id="min-profit"
                type="number"
                value={minProfit}
                onChange={(e) => setMinProfit(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-profit">Max Profit</Label>
              <Input
                id="max-profit"
                type="number"
                value={maxProfit}
                onChange={(e) => setMaxProfit(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Project Status Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={derivedStats.total}
          icon={FolderOpen}
          className="animate-fade-in"
        />
        <StatCard
          title="In Progress"
          value={derivedStats.inWork}
          icon={Clock}
          variant="in-work"
          className="animate-fade-in"
        />
        <StatCard
          title="Pending"
          value={derivedStats.pending}
          icon={Clock}
          variant="pending"
          className="animate-fade-in"
        />
        <StatCard
          title="Completed"
          value={derivedStats.done}
          icon={CheckCircle}
          variant="done"
          className="animate-fade-in"
        />
        <StatCard
          title="Total Revenue"
          value={totals.totalRevenue}
          icon={DollarSign}
          className="animate-fade-in"
        />
        <StatCard
          title="Net Profit"
          value={totals.totalNet}
          icon={TrendingUp}
          className="animate-fade-in"
        />
      </div>

      <Separator />

      {/* Main Analytics Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="data">Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Overview and Trend */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <FinancialSummary projects={filteredProjects} />
            </div>
            <div className="lg:col-span-2">
              <NetProfitTrendChart projects={filteredProjects} />
            </div>
          </div>

          {/* Project Progress, Status Breakdown, and Financial Distribution */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ProjectProgressChart data={projectHistory} projects={filteredProjects} />
            <ProjectStatusPieChart stats={derivedStats} />
            <FinancialsDonutChart projects={filteredProjects} />
          </div>

          {/* Revenue Breakdown */}
          <RevenueBreakdownChart projects={filteredProjects} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Project Velocity and Trends */}
          <ProjectVelocityChart projects={filteredProjects} />
          
          {/* Enhanced Trend Charts */}
          <div className="grid gap-6">
            <NetProfitTrendChart projects={filteredProjects} />
            <ProjectProgressChart data={projectHistory} projects={filteredProjects} />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <ProjectPerformanceMetrics projects={filteredProjects} />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <AnalyticsTable
            data={filteredProjects}
            searchProjects={searchProjects}
            onSelectedRecordsChange={setSelectedProjects}
            selectedProjects={selectedProjects}
            includeRingCharts={includeRingCharts}
            onIncludeRingChartsChange={setIncludeRingCharts}
          />
          {selectedProjects.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedProjects.length} projects selected.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
