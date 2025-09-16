import { FolderOpen, Clock, CheckCircle, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useProjects } from "@/hooks/useProjects";
import { ProjectStatusPieChart } from "@/components/ProjectStatusPieChart";
import { ProjectProgressChart } from "@/components/ProjectProgressChart";
import { AnalyticsTable } from "@/components/AnalyticsTable";
import { FinancialSummary } from "@/components/FinancialSummary";
import { FinancialsDonutChart } from "@/components/FinancialsDonutChart";
import { NetProfitTrendChart } from "@/components/NetProfitTrendChart";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Project } from "@/types/project";

const Analytics = () => {
  const { projects, stats, projectHistory, loading, error, searchProjects } =
    useProjects();
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [includeRingCharts, setIncludeRingCharts] = useState(true);

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
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics & Reports
        </h2>
        <p className="text-muted-foreground">
          Comprehensive insights into your project performance and financial
          reports.
        </p>
      </div>

      {/* Project Status Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.total}
          icon={FolderOpen}
          className="animate-fade-in"
        />
        <StatCard
          title="In Progress"
          value={stats.inWork}
          icon={Clock}
          variant="in-work"
          className="animate-fade-in"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          variant="pending"
          className="animate-fade-in"
        />
        <StatCard
          title="Completed"
          value={stats.done}
          icon={CheckCircle}
          variant="done"
          className="animate-fade-in"
        />
      </div>

      <Separator />

      {/* Financial Overview and Trend */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <FinancialSummary projects={projects} />
        </div>
        <div className="lg:col-span-2">
          <NetProfitTrendChart projects={projects} />
        </div>
      </div>

      {/* Project Progress, Status Breakdown, and Financial Distribution */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectProgressChart data={projectHistory} />
        <ProjectStatusPieChart stats={stats} />
        <FinancialsDonutChart projects={projects} />
      </div>

      <Separator />

      {/* Analytics Table */}
      <section className="space-y-4">
        <h3 className="text-2xl font-bold tracking-tight">Project Data</h3>
        <AnalyticsTable
          data={projects}
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
      </section>
    </div>
  );
};

export default Analytics;
