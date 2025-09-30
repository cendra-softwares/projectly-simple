import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Project } from '@/types/project';
import { formatCurrency } from '@/lib/utils';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar,
  Award,
  Zap
} from 'lucide-react';

interface ProjectPerformanceMetricsProps {
  projects: Project[];
}

export const ProjectPerformanceMetrics: React.FC<ProjectPerformanceMetricsProps> = ({ projects }) => {
  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'done').length;
    const inProgressProjects = projects.filter(p => p.status === 'in-work').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;

    // Calculate completion rate
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    // Calculate average project duration (simplified - using creation to now)
    const now = new Date();
    const avgProjectDuration = totalProjects > 0 ? 
      projects.reduce((sum, project) => {
        const duration = now.getTime() - project.createdAt.getTime();
        return sum + (duration / (1000 * 60 * 60 * 24)); // Convert to days
      }, 0) / totalProjects : 0;

    // Calculate financial metrics
    const totalRevenue = projects.reduce((sum, p) => sum + p.financials.profits, 0);
    const totalExpenses = projects.reduce((sum, p) => sum + p.financials.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const avgProjectValue = totalProjects > 0 ? netProfit / totalProjects : 0;

    // Calculate profit margin
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate project velocity (projects per month)
    const projectVelocity = projects.length > 0 ? 
      projects.length / Math.max(1, (now.getTime() - Math.min(...projects.map(p => p.createdAt.getTime()))) / (1000 * 60 * 60 * 24 * 30)) : 0;

    // Calculate success rate (profitable projects)
    const profitableProjects = projects.filter(p => (p.financials.profits - p.financials.expenses) > 0).length;
    const successRate = totalProjects > 0 ? (profitableProjects / totalProjects) * 100 : 0;

    // Calculate average project size by revenue
    const avgProjectRevenue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

    // Calculate project distribution by value
    const highValueProjects = projects.filter(p => p.financials.profits > avgProjectRevenue * 1.5).length;
    const mediumValueProjects = projects.filter(p => 
      p.financials.profits <= avgProjectRevenue * 1.5 && p.financials.profits >= avgProjectRevenue * 0.5
    ).length;
    const lowValueProjects = projects.filter(p => p.financials.profits < avgProjectRevenue * 0.5).length;

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      pendingProjects,
      completionRate,
      avgProjectDuration,
      totalRevenue,
      totalExpenses,
      netProfit,
      avgProjectValue,
      profitMargin,
      projectVelocity,
      successRate,
      avgProjectRevenue,
      highValueProjects,
      mediumValueProjects,
      lowValueProjects
    };
  }, [projects]);

  const getPerformanceGrade = (rate: number) => {
    if (rate >= 90) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (rate >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (rate >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (rate >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (rate >= 50) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const completionGrade = getPerformanceGrade(metrics.completionRate);
  const successGrade = getPerformanceGrade(metrics.successRate);

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={metrics.completionRate} className="flex-1" />
              <Badge className={`${completionGrade.bgColor} ${completionGrade.color}`}>
                {completionGrade.grade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={metrics.successRate} className="flex-1" />
              <Badge className={`${successGrade.bgColor} ${successGrade.color}`}>
                {successGrade.grade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Velocity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.projectVelocity.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">projects/month</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Project Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.avgProjectValue)}</div>
            <p className="text-xs text-muted-foreground">net profit per project</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Distribution and Timeline */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Project Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(metrics.completedProjects / metrics.totalProjects) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{metrics.completedProjects}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(metrics.inProgressProjects / metrics.totalProjects) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{metrics.inProgressProjects}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(metrics.pendingProjects / metrics.totalProjects) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{metrics.pendingProjects}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Project Value Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">High Value</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(metrics.highValueProjects / metrics.totalProjects) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{metrics.highValueProjects}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Medium Value</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(metrics.mediumValueProjects / metrics.totalProjects) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{metrics.mediumValueProjects}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Low Value</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(metrics.lowValueProjects / metrics.totalProjects) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{metrics.lowValueProjects}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Performance Summary */}
      <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Financial Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.netProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${metrics.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.profitMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Profit Margin</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
