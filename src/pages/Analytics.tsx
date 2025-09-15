import {
  BarChart3,
  FolderOpen,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { useProjects } from "@/hooks/useProjects";
import { ProjectStatusPieChart } from "@/components/ProjectStatusPieChart";
import { ProjectProgressChart } from "@/components/ProjectProgressChart";
import { DetailedProjectsTable } from "@/components/DetailedProjectsTable";

const Analytics = () => {
  const { projects, stats, projectHistory, loading, error } = useProjects();

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics Overview
        </h2>
        <p className="text-muted-foreground">
          Detailed insights into your project performance.
        </p>
      </div>

      {/* Statistics Cards */}
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
          icon={BarChart3}
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

      {/* Charts and Graphs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectProgressChart data={projectHistory} />
        <ProjectStatusPieChart stats={stats} />
      </div>

      {/* Detailed Project Metrics */}
      <DetailedProjectsTable projects={projects} />
    </div>
  );
};

export default Analytics;
