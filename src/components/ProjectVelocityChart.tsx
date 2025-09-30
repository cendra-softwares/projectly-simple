import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart } from "recharts";
import { Project } from '@/types/project';
import { formatCurrency } from '@/lib/utils';
import { Zap, Clock, Target } from 'lucide-react';

interface ProjectVelocityChartProps {
  projects: Project[];
}

export const ProjectVelocityChart: React.FC<ProjectVelocityChartProps> = ({ projects }) => {
  const velocityData = useMemo(() => {
    const monthlyData: Record<string, {
      projectsCreated: number;
      projectsCompleted: number;
      avgProjectValue: number;
      totalValue: number;
      velocity: number; // projects completed per month
    }> = {};

    // Initialize last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = {
        projectsCreated: 0,
        projectsCompleted: 0,
        avgProjectValue: 0,
        totalValue: 0,
        velocity: 0
      };
    }

    // Process projects
    projects.forEach(project => {
      const createdMonth = new Date(project.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      const projectValue = project.financials.profits - project.financials.expenses;
      
      if (monthlyData[createdMonth]) {
        monthlyData[createdMonth].projectsCreated++;
        monthlyData[createdMonth].totalValue += projectValue;
        
        // If project is completed, count it as completed in the same month for simplicity
        if (project.status === 'done') {
          monthlyData[createdMonth].projectsCompleted++;
        }
      }
    });

    // Calculate averages and velocity
    return Object.entries(monthlyData)
      .map(([name, data]) => ({
        name,
        ...data,
        avgProjectValue: data.projectsCreated > 0 ? data.totalValue / data.projectsCreated : 0,
        velocity: data.projectsCompleted, // Simplified velocity metric
        completionRate: data.projectsCreated > 0 ? (data.projectsCompleted / data.projectsCreated) * 100 : 0
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [projects]);

  const avgVelocity = velocityData.length > 0 ? 
    velocityData.reduce((sum, item) => sum + item.velocity, 0) / velocityData.length : 0;
  const totalValue = velocityData.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Project Velocity
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Avg: {avgVelocity.toFixed(1)} projects/month
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={velocityData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              domain={[0, 100]}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'projectsCreated' ? value : 
                name === 'projectsCompleted' ? value :
                name === 'avgProjectValue' ? formatCurrency(value) :
                name === 'completionRate' ? `${value.toFixed(1)}%` : value,
                name === 'projectsCreated' ? 'Projects Created' : 
                name === 'projectsCompleted' ? 'Projects Completed' :
                name === 'avgProjectValue' ? 'Avg Project Value' :
                name === 'completionRate' ? 'Completion Rate' : name
              ]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            
            <Bar
              dataKey="projectsCreated"
              fill="url(#createdGradient)"
              name="Projects Created"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="projectsCompleted"
              fill="url(#completedGradient)"
              name="Projects Completed"
              radius={[2, 2, 0, 0]}
            />
            
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="Completion Rate (%)"
              yAxisId="right"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
