import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, Bar } from "recharts";
import { Project } from "@/types/project";
import { useMemo } from "react";

interface ProjectProgressChartProps {
  data: { name: string; completed: number; inProgress: number; pending: number }[];
  projects?: Project[];
}

export function ProjectProgressChart({ data, projects = [] }: ProjectProgressChartProps) {
  const enhancedData = useMemo(() => {
    // If we have projects, create more detailed monthly data
    if (projects.length > 0) {
      const monthlyData: Record<string, { 
        completed: number; 
        inProgress: number; 
        pending: number; 
        total: number;
        completionRate: number;
        avgProjectValue: number;
      }> = {};

      // Initialize last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = { 
          completed: 0, 
          inProgress: 0, 
          pending: 0, 
          total: 0,
          completionRate: 0,
          avgProjectValue: 0
        };
      }

      // Process projects by creation month
      projects.forEach(project => {
        const monthKey = new Date(project.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey][project.status === 'done' ? 'completed' : 
            project.status === 'in-work' ? 'inProgress' : 'pending']++;
          monthlyData[monthKey].total++;
        }
      });

      // Calculate completion rates and average project values
      return Object.entries(monthlyData)
        .map(([name, data]) => ({
          name,
          ...data,
          completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
          avgProjectValue: data.total > 0 ? 
            projects
              .filter(p => new Date(p.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' }) === name)
              .reduce((sum, p) => sum + (p.financials.profits - p.financials.expenses), 0) / data.total : 0
        }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }

    // Fallback to original data with enhancements
    return data.map(item => ({
      ...item,
      total: item.completed + item.inProgress + item.pending,
      completionRate: (item.completed / (item.completed + item.inProgress + item.pending)) * 100
    }));
  }, [data, projects]);

  const totalProjects = enhancedData.reduce((sum, item) => sum + item.total, 0);
  const avgCompletionRate = enhancedData.length > 0 ? 
    enhancedData.reduce((sum, item) => sum + item.completionRate, 0) / enhancedData.length : 0;

  return (
    <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Progress Over Time</CardTitle>
          <div className="text-sm text-muted-foreground">
            Avg Completion: {avgCompletionRate.toFixed(1)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={enhancedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="inProgressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ffc658" stopOpacity={0.1}/>
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
                value, 
                name === 'completed' ? 'Completed' : 
                name === 'inProgress' ? 'In Progress' :
                name === 'pending' ? 'Pending' :
                name === 'total' ? 'Total Projects' :
                name === 'completionRate' ? 'Completion Rate (%)' : name
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
            
            {/* Stacked Areas for Project Status */}
            <Area
              type="monotone"
              dataKey="completed"
              stackId="1"
              stroke="#82ca9d"
              fill="url(#completedGradient)"
              name="Completed"
            />
            <Area
              type="monotone"
              dataKey="inProgress"
              stackId="1"
              stroke="#8884d8"
              fill="url(#inProgressGradient)"
              name="In Progress"
            />
            <Area
              type="monotone"
              dataKey="pending"
              stackId="1"
              stroke="#ffc658"
              fill="url(#pendingGradient)"
              name="Pending"
            />
            
            {/* Line for completion rate */}
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#ff6b6b"
              strokeWidth={3}
              dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
              name="Completion Rate (%)"
              yAxisId="right"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}